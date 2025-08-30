import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="nf">
      <h1>404 - Page not found</h1>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <a routerLink="/">Go to Dashboard</a>
    </section>
  `,
  styles: [`
    .nf { max-width: 640px; margin: 64px auto; padding: 24px; text-align:center; }
    a { color: #1d4ed8; }
  `]
})
export class NotFoundPage {}
