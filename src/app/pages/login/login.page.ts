import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-card">
      <h1>Sign in</h1>
      <form (ngSubmit)="login()" #f="ngForm">
        <input name="username" [(ngModel)]="username" placeholder="Username" required />
        <input name="password" [(ngModel)]="password" placeholder="Password" type="password" required />
        <button type="submit" [disabled]="loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
      </form>
      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
      @if (debug()) {
        <pre>{{ debug() }}</pre>
      }
    </div>
  `,
  styles: [`
    .login-card { max-width: 400px; margin: 80px auto; padding: 24px; border:1px solid #e5e7eb; border-radius: 12px; }
    input { display:block; width:100%; margin: 8px 0; padding: 8px 10px; }
    button { margin-top: 8px; width: 100%; padding: 10px; }
    .error { color: #dc2626; white-space: pre-wrap; }
  `]
})
export class LoginPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = '';
  password = '';
  loading = false;

  get error() { return this.api.error; }
  get debug() { return this.api.debug; }

  async login() {
    this.loading = true;
    try {
      const res = await this.api.request('auth', { username: this.username, password: this.password });
      const token = res?.token as string | undefined;
      if (!token) return;

      const queryRedirect = this.route.snapshot.queryParamMap.get('redirect');
      const target = queryRedirect && queryRedirect.startsWith('/') ? queryRedirect : '/';
      await this.router.navigateByUrl(target, { replaceUrl: true });
    } finally {
      this.loading = false;
    }
  }
}
