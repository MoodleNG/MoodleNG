import { Injectable, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private api = inject(ApiService);

  // Live views over ApiService endpoint states
  private authResponse = computed(() => this.api.state('auth')());
  siteInfo = computed(() => this.api.state('core_webservice_get_site_info')());

  token = computed(() => this.authResponse()?.token as string | undefined);
  privateToken = computed(() => this.authResponse()?.privatetoken as string | undefined);
  user = computed(() => {
    const s = this.siteInfo();
    return s ? { id: s.userid as number, fullname: s.fullname as string, email: s.useremail as string | undefined } : undefined;
  });

  isLoggedIn() { return !!this.token(); }

  constructor() {
    // Restore last auth response from storage into ApiService state at startup
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!this.api.state('auth')()) this.api.state('auth').set(parsed);
      } catch {}
    }

    // Persist auth response automatically whenever it changes
    effect(() => {
      const a = this.authResponse();
      if (a) localStorage.setItem('auth', JSON.stringify(a));
      else localStorage.removeItem('auth');
    });

    // When we have a token but no site info (e.g., page refresh), fetch it
    effect(() => {
      const t = this.token();
      const s = this.siteInfo();
      if (t && !s) {
        this.api.request('core_webservice_get_site_info', { wstoken: t })
          .then(res => this.api.state('core_webservice_get_site_info').set(res))
          .catch(() => {/* ignore */});
      }
    });
  }

  logout() {
    this.api.state('auth').set(null);
    this.router.navigate(['/login']);
  }
}
