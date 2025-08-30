import { Injectable, inject, signal, WritableSignal, effect } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../app.config';
import { endpoints, EndpointKey, EndpointMethod, EndpointSendIn, EndpointParams } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl.replace(/\/$/, '');

  private store = new Map<EndpointKey, WritableSignal<any | null>>();

  readonly error = signal<string | null>(null);
  readonly debug = signal<string | null>(null);

  private readonly persistPrefix = 'api:';

  constructor() {
    const keys = Object.keys(endpoints) as EndpointKey[];

    for (const key of keys) {
      const s = this.state(key);
      const saved = localStorage.getItem(this.persistPrefix + key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!s()) s.set(parsed);
        } catch {}
      }
      effect(() => {
        const val = s();
        if (val !== null && val !== undefined) localStorage.setItem(this.persistPrefix + key, JSON.stringify(val));
        else localStorage.removeItem(this.persistPrefix + key);
      });
    }
  }

  state<K extends EndpointKey>(key: K): WritableSignal<any | null> {
    let s = this.store.get(key);
    if (!s) {
      s = signal<any | null>(null);
      this.store.set(key, s);
    }
    return s;
  }

  async request<K extends EndpointKey>(key: K, payload?: EndpointParams<K>, pathSuffix: string = ''): Promise<any | null> {
    this.error.set(null);
    this.debug.set(null);

    const method = (endpoints[key] as any).method as EndpointMethod<K>;
    const sendIn = ((endpoints[key] as any).sendIn as EndpointSendIn<K>) ?? (method === 'get' ? 'query' : 'body');

    const url = `${this.base}/${String(key)}${pathSuffix}`;

    const paramsInQuery = sendIn === 'query';
    const httpParams = this.#toParams(paramsInQuery ? (payload as any) : undefined);

    try {
      let response: any;
      if (method === 'get') {
        response = await firstValueFrom(this.http.get<any>(url, { params: httpParams }));
      } else {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = paramsInQuery ? {} : (payload ?? {});
        if (method === 'post') response = await firstValueFrom(this.http.post<any>(url, body, { params: httpParams, headers }));
        else if (method === 'put') response = await firstValueFrom(this.http.put<any>(url, body, { params: httpParams, headers }));
        else if (method === 'patch') response = await firstValueFrom(this.http.patch<any>(url, body, { params: httpParams, headers }));
        else response = await firstValueFrom(this.http.delete<any>(url, { params: httpParams }));
      }
      this.state(key).set(response);
      return response;
    } catch (e: unknown) {
      const he = e as HttpErrorResponse;
      const status = he?.status ?? 0;
      const statusText = he?.statusText ?? 'Unknown Error';
      const failingUrl = he?.url ?? url;
      const body = he?.error as unknown;
      let bodyStr = '';
      if (typeof body === 'string') bodyStr = body;
      else if (body && typeof body === 'object') {
        try { bodyStr = JSON.stringify(body, null, 2); } catch { bodyStr = String(body); }
      } else if (body != null) {
        bodyStr = String(body);
      }
      this.error.set(status === 0 ? 'Network/CORS error (status 0)' : `${status} ${statusText}`);
      this.debug.set(`${failingUrl}\nBody:\n${bodyStr}`);
      console.error(e);
      return null;
    }
  }

  clear<K extends EndpointKey>(key: K): void {
    const s = this.store.get(key);
    if (s) s.set(null);
    localStorage.removeItem(this.persistPrefix + key);
  }

  clearAll(): void {
    for (const [key, s] of this.store.entries()) {
      s.set(null);
      localStorage.removeItem(this.persistPrefix + key);
    }
    this.error.set(null);
    this.debug.set(null);
  }

  #toParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) return undefined;
    const fromObject: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) fromObject[k] = String(v);
    return new HttpParams({ fromObject });
  }
}
