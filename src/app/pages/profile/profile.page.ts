import { Component, inject } from '@angular/core';
import { ApiState } from '../../api/state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <h1>Profile</h1>
    @if (store.auth) {
      @let s = store.core_webservice_get_site_info;
      <p><strong>Name:</strong> {{ s?.fullname }}</p>
      <p><strong>User ID:</strong> {{ s?.userid }}</p>
      <p><strong>Site:</strong> {{ s?.sitename }}</p>
      @if (s?.userpictureurl) {
        <img [src]="s.userpictureurl" alt="Profile picture" style="width:80px;height:80px;border-radius:50%;margin:8px 0;" />
      }
      <p><strong>Username:</strong> {{ s?.username }}</p>
      <p><strong>First name:</strong> {{ s?.firstname }}</p>
      <p><strong>Last name:</strong> {{ s?.lastname }}</p>
      <p><strong>Language:</strong> {{ s?.lang }}</p>
      <p><strong>Site URL:</strong> <a [href]="s?.siteurl" target="_blank" rel="noopener">{{ s?.siteurl }}</a></p>
      <p><strong>Release:</strong> {{ s?.release }}</p>
      <p><strong>Version:</strong> {{ s?.version }}</p>
      <p><strong>Can manage own files:</strong> {{ s?.usercanmanageownfiles }}</p>
      <p><strong>User quota:</strong> {{ s?.userquota }}</p>
      <p><strong>Max upload size:</strong> {{ s?.usermaxuploadfilesize }}</p>
      <p><strong>Site ID:</strong> {{ s?.siteid }}</p>
    } @else {
      <p>Please login to view your profile.</p>
    }
  `
})
export class ProfilePage {
  store = inject(ApiState).data;
}
