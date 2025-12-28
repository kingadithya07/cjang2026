
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'articles',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'articles',
    loadComponent: () => import('./features/articles/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./features/articles/article-detail.component').then(m => m.ArticleDetailComponent)
  },
  // Admin Routes (Admin & Editor)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'editor'] },
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'admin/articles',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'editor'] },
    loadComponent: () => import('./features/admin/articles/admin-article-list.component').then(m => m.AdminArticleListComponent)
  },
  {
    path: 'admin/articles/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'editor'] },
    loadComponent: () => import('./features/articles/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: 'admin/articles/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'editor'] },
    loadComponent: () => import('./features/articles/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  // E-Paper (Admin Only)
  {
    path: 'epaper',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/epaper/epaper-dashboard.component').then(m => m.EPaperDashboardComponent)
  },
  // Wildcard Route
  {
    path: '**',
    redirectTo: 'articles'
  }
];
