import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Welcome{{ user()?.fullname ? ', ' + user()?.fullname : '' }}</h1>
    <p>This is your dashboard.</p>
  `
})
export class DashboardPage {
  private auth = inject(AuthService);
  user = computed(() => this.auth.user());
}
