import { APP_INITIALIZER, EnvironmentProviders, Injector, Provider, inject, makeEnvironmentProviders, runInInjectionContext, signal, ApplicationRef, EnvironmentInjector, createComponent } from '@angular/core';
import { Router, Routes, NavigationEnd } from '@angular/router';

export interface PluginMeta {
  name: string;
  route?: string;
  navbar?: string | { label: string; route?: string };
  state?: boolean; // true: enabled (default), false: disabled
}

export type PluginModule = {
  meta?: PluginMeta;
  setup?: (ctx: { injector: Injector; router: Router }) => void | Promise<void>;
  dom?: DomMountSpec[];
  [k: string]: unknown;
};

export type NavLink = { label: string; route: string };
export const navLinksSignal = signal<NavLink[]>([]);

export type DomMountSpec = {
  selector: string;
  insert: InsertPosition;
  component?: any;
  loadComponent?: () => Promise<any>;
  when?: (url: string) => boolean;
  inputs?: Record<string, any>;
};

const discoveredPluginLoaders = (() => {
  try {
    return ((import.meta as any).glob('../plugins/**/*.plugin.ts', { eager: false }) || {}) as Record<string, () => Promise<PluginModule>>;
  } catch {
    return {} as Record<string, () => Promise<PluginModule>>;
  }
})();

function normalizeRoute(route?: string): string | undefined {
  if (!route) return undefined;
  const r = route.startsWith('/') ? route.slice(1) : route;
  return r.replace(/^\/+|\/+$/g, '');
}

function currentUrl(): string {
  return window.location.pathname + window.location.search + window.location.hash;
}

function getPluginComponent(mod: unknown): any {
  const m = mod as any;
  return m?.PluginComponent ?? m?.Component ?? m?.component ?? m?.Page ?? m?.page ?? m?.default;
}

function buildNavbarLinks(meta?: PluginMeta): NavLink[] {
  if (!meta?.navbar) return [];
  if (typeof meta.navbar === 'string') {
    const route = '/' + (normalizeRoute(meta.route) ?? normalizeRoute(meta.navbar) ?? '');
    return route === '/' ? [] : [{ label: meta.navbar, route }];
  }
  const label = meta.navbar.label;
  const route = '/' + (normalizeRoute(meta.navbar.route) ?? normalizeRoute(meta.route) ?? '');
  return route === '/' ? [] : [{ label, route }];
}

async function enumerateLoaders(): Promise<Record<string, () => Promise<PluginModule>>> {
  let loaders = discoveredPluginLoaders;
  if (!loaders || Object.keys(loaders).length === 0) {
    loaders = {
      '../plugins/example.plugin': () => import('../plugins/example.plugin') as Promise<PluginModule>
    } as Record<string, () => Promise<PluginModule>>;
  }
  return loaders;
}

async function loadAllPlugins(): Promise<{ routes: Routes; links: NavLink[]; setups: ((ctx: { injector: Injector; router: Router }) => void | Promise<void>)[]; dom: DomMountSpec[] }> {
  const routes: Routes = [];
  const linkMap = new Map<string, NavLink>();
  const setups: ((ctx: { injector: Injector; router: Router }) => void | Promise<void>)[] = [];
  const dom: DomMountSpec[] = [];

  const entries = Object.entries(await enumerateLoaders());

  for (const [path, loader] of entries) {
    try {
      const mod = await loader();
      const meta = (mod as any).meta as PluginMeta | undefined;

      if (meta?.state === false) {
        continue; // disabled by metadata
      }

      const comp = getPluginComponent(mod);
      const routePath = normalizeRoute(meta?.route);
      if (comp && routePath) routes.push({ path: routePath, loadComponent: () => Promise.resolve(comp) });

      for (const l of buildNavbarLinks(meta)) linkMap.set(l.route, l);

      if (typeof (mod as any).setup === 'function') setups.push(((mod as any).setup as any).bind(mod));
      if (Array.isArray((mod as any).dom)) dom.push(...((mod as any).dom as DomMountSpec[]));
    } catch (e) {
      console.error('[plugin] load failed:', path, e);
    }
  }

  return { routes, links: Array.from(linkMap.values()), setups, dom };
}

function setupDomInjector(router: Router, appRef: ApplicationRef, env: EnvironmentInjector, domSpecs: DomMountSpec[]) {
  const processedBySpec: Array<WeakSet<Element>> = domSpecs.map(() => new WeakSet<Element>());

  async function apply(url: string) {
    for (let i = 0; i < domSpecs.length; i++) {
      const spec = domSpecs[i];
      if (spec.when && !spec.when(url)) continue;
      const nodes = document.querySelectorAll(spec.selector);
      if (!nodes.length) continue;
      const Comp = spec.component ?? (spec.loadComponent ? await spec.loadComponent() : undefined);
      if (!Comp) continue;
      nodes.forEach(node => {
        const el = node as Element;
        if (processedBySpec[i].has(el)) return;
        const anchor = document.createElement('span');
        el.insertAdjacentElement(spec.insert, anchor);
        const ref = createComponent(Comp, { environmentInjector: env, hostElement: anchor });
        Object.assign(ref.instance as any, spec.inputs ?? {});
        appRef.attachView(ref.hostView);
        processedBySpec[i].add(el);
      });
    }
  }

  function scheduleApply(url: string) {
    setTimeout(() => apply(url), 0);
    setTimeout(() => apply(url), 50);
  }

  router.events.subscribe(ev => {
    if (ev instanceof NavigationEnd) scheduleApply(ev.urlAfterRedirects || ev.url);
  });

  const sub = appRef.isStable.subscribe(stable => {
    if (stable) {
      scheduleApply(currentUrl());
      sub.unsubscribe();
    }
  });
}

export function providePlugins(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const injector = inject(Injector);
        const router = inject(Router);
        const appRef = inject(ApplicationRef);
        const env = inject(EnvironmentInjector);
        return async () => {
          const { routes, links, setups, dom } = await loadAllPlugins();

          if (dom.length) setupDomInjector(router, appRef, env, dom);

          if (routes.length) {
            const cfg = router.config.slice();
            const shellIdx = cfg.findIndex(r => r.path === '' && (r.component || r.loadComponent));
            if (shellIdx !== -1) {
              const shell = { ...cfg[shellIdx] } as any;
              shell.children = [...(shell.children ?? []), ...routes];
              cfg[shellIdx] = shell;
              router.resetConfig(cfg);
            } else {
              router.resetConfig([...cfg, ...routes]);
            }
            await router.navigateByUrl(currentUrl() || '/', { replaceUrl: true });
          }

          if (links.length) navLinksSignal.set(links);

          for (const setup of setups) {
            try {
              await runInInjectionContext(injector, () => setup({ injector, router }));
            } catch (e) {
              console.error('[plugin] setup failed:', e);
            }
          }
        };
      }
    } as Provider
  ]);
}
