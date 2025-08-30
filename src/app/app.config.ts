import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';

// runtime config from window.__APP_CONFIG__
declare global {
  interface Window { __APP_CONFIG__?: { API_BASE_URL?: string } }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};

export const environment = {
  apiBaseUrl: (window.__APP_CONFIG__?.API_BASE_URL || 'http://127.0.0.1:8080')
};