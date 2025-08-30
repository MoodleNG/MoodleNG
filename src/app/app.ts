import { Component, signal, type WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from './app.config';
import { ApiService } from './api/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  apiBaseUrl: string = environment.apiBaseUrl;

  username = '';
  password = '';

  auth!: WritableSignal<any | null>;
  siteInfo!: WritableSignal<any | null>;

  constructor(private api: ApiService) {
    this.auth = this.api.state('auth');
    this.siteInfo = this.api.state('core_webservice_get_site_info');
  }

  get error() { return this.api.error; }
  get debug() { return this.api.debug; }

  async login() {
    const authRes = await this.api.request('auth', { username: this.username, password: this.password });
    const t = this.auth()?.token as string | undefined;
    if (!authRes || !t) return;
    await this.api.request('core_webservice_get_site_info', { wstoken: t });
  }
}
