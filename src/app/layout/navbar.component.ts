import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApiState } from '../api/state.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <header class="nav">
      @let s = store.core_webservice_get_site_info;
      @if (s) {
        <a routerLink="/" class="brand">{{ s?.sitename || 'MoodleNG' }}</a>
      } @else {
        <a routerLink="/" class="brand">MoodleNG</a>
      }
      <nav class="links">
        <a routerLink="/profile" routerLinkActive="active">Profile</a>
      </nav>
      <button class="logout" (click)="auth.logout()">Logout</button>
    </header>
  `,
  styles: [`
    .nav { display:flex; align-items:center; gap:16px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    .brand { font-weight: 700; text-decoration: none; color: inherit; }
    .links { display:flex; gap:12px; margin-left: auto; }
    .links a { text-decoration: none; color: #374151; padding: 6px 8px; border-radius: 6px; }
    .links a.active { background: #eef2ff; color:#1d4ed8; }
    .logout { margin-left: 12px; }
  `]
})
export class NavbarComponent {
  store = inject(ApiState).data;
  auth = inject(AuthService);
}
