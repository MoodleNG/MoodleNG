import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar (logout)="onLogout()"></app-navbar>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .container { padding: 16px; max-width: 1200px; margin: 0 auto; }
  `]
})
export class ShellComponent {
  private auth = inject(AuthService);
  user = computed(() => this.auth.user());

  onLogout() {
    this.auth.logout();
  }
}
