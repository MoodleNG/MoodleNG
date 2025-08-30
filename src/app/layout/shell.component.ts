import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ErrorBannerComponent } from './error-banner.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule, NavbarComponent, ErrorBannerComponent],
  template: `
    <app-navbar></app-navbar>
    <app-error-banner></app-error-banner>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .container { padding: 16px; max-width: 1200px; margin: 0 auto; }
  `]
})
export class ShellComponent {}
