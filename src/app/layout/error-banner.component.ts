import { Component, inject } from '@angular/core';
import { ApiService } from '../api/api.service';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  template: `
    @let err = api.error();
    @if (err) {
      <div class="err">
        <div class="row">
          <span class="title">{{ err }}</span>
          <button class="btn" (click)="show = !show">{{ show ? 'Hide' : 'Details' }}</button>
        </div>
        @if (show && api.debug()) {
          <pre class="debug">{{ api.debug() }}</pre>
        }
      </div>
    }
  `,
  styles: [`
    .err { background: #fef2f2; color: #7f1d1d; border: 1px solid #fecaca; padding: 10px 12px; border-radius: 8px; margin: 12px 16px; }
    .row { display:flex; align-items:center; justify-content: space-between; gap: 12px; }
    .title { font-weight: 600; }
    .btn { background: transparent; border: 1px solid #fecaca; color: #7f1d1d; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
    .btn:hover { background: #fee2e2; }
    .debug { white-space: pre-wrap; margin: 8px 0 0; font-size: 12px; color: #7f1d1d; }
  `]
})
export class ErrorBannerComponent {
  api = inject(ApiService);
  show = false;
}
