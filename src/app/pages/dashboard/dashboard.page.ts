import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Courses</h1>
    <p>Course list will appear here, fetched from API.</p>
  `
})
export class DashboardPage {}
