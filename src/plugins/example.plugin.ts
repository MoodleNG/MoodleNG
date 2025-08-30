import { Component } from '@angular/core';

export const meta = {
  name: 'Example Plugin',
  route: '/example',
  navbar: 'Example',
  state: false
};

@Component({
  selector: 'app-example-plugin-page',
  standalone: true,
  template: `
    <section>
      <h1>{{ title }}</h1>
      <p>This page was mounted by a plugin.</p>
      <button (click)="notify()">Run plugin setup action</button>
    </section>
  `
})
export class ExamplePluginPage {
  title = meta.name;
  notify() { alert('Hello from Example Plugin!'); }
}

export const PluginComponent = ExamplePluginPage;

@Component({
  selector: 'example-profile-card',
  standalone: true,
  template: `
    <div style="margin:12px 0;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
      <strong>Example Plugin</strong>
      <p>This block was injected into the profile page by a plugin.</p>
    </div>
  `
})
class ExampleProfileCard {}

export const dom = [
  {
    selector: 'app-profile h1',
    insert: 'afterend' as InsertPosition,
    component: ExampleProfileCard,
    when: (url: string) => /\/profile$/.test(url)
  }
];

export async function setup() {
  console.log('[Example Plugin] setup called');
}
