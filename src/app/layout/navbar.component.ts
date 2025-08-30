import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiState } from '../api/state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="nav">
      <ng-container *ngIf="store.core_webservice_get_site_info as s; else brand">
        <a routerLink="/" class="brand">{{ s?.sitename || 'MoodleNG' }}</a>
      </ng-container>
      <ng-template #brand>
        <a routerLink="/" class="brand">MoodleNG</a>
      </ng-template>
      <nav class="links">
        <a routerLink="/profile" routerLinkActive="active">Profile</a>
      </nav>
      <button class="logout" (click)="logout.emit()">Logout</button>
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
  @Output() logout = new EventEmitter<void>();
  store = inject(ApiState).data;
}
