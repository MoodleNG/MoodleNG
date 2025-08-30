import { Injectable, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

  private authResponse = computed(() => this.api.state('auth')());
  token = computed(() => this.authResponse()?.token as string | undefined);

  isLoggedIn() { return !!this.token(); }

  constructor() {
    effect(() => {
      const token = this.token();
      const hasSiteInfo = !!this.api.state('core_webservice_get_site_info')();
      if (token && !hasSiteInfo) {
        void this.api.request('core_webservice_get_site_info');
      }
    });
  }

  logout() {
    this.api.clearAll();
    this.router.navigate(['/login']);
  }
}
