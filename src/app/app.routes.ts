import { Routes } from '@angular/router';
import { authGuard, guestOnlyGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage) },
      { path: 'course/:id', loadComponent: () => import('./pages/course/course.page').then(m => m.CoursePage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) }
    ]
  },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.page').then(m => m.NotFoundPage) }
];
