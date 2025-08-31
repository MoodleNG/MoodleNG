import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptorFn } from './api/models';
import { providePlugins } from './plugin-manager';

declare global {
  interface Window { __APP_CONFIG__?: { API_BASE_URL?: string } }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withFetch(), withInterceptors([authInterceptorFn])),
    providePlugins()
  ]
};

export const environment = {
  apiBaseUrl: (window.__APP_CONFIG__?.API_BASE_URL || 'http://127.0.0.1:8080')
};