import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Course</h1>
    <p>Course ID: {{ id }}</p>
    <p>Course contents will load here.</p>
  `
})
export class CoursePage {
  id: string | null;
  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id');
  }
}
