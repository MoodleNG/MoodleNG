import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { endpoints, EndpointKey } from './models';

/**
 * Exposes latest API responses as properties named after endpoint keys.
 * Usage in a component:
 *   store = inject(ApiState).data;
 *   // template: {{ store.core_webservice_get_site_info?.sitename }}
 */
@Injectable({ providedIn: 'root' })
export class ApiState {
  readonly data: any = {};

  constructor(private api: ApiService) {
    for (const key of Object.keys(endpoints) as EndpointKey[]) {
      Object.defineProperty(this.data, key, {
        get: () => this.api.state(key)(),
        enumerable: true
      });
    }
  }
}
