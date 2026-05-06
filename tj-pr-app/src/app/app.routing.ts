import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  {
    path: 'home',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./layout/components/layout/layout.component')
        .then(m => m.LayoutComponent),

    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/overview/overview.component')
            .then(m => m.OverviewComponent)
      },
      {
        path: 'control',
        loadComponent: () =>
          import('./features/control/control.component')
            .then(m => m.ControlComponent)
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./features/monitoring/monitoring.component')
            .then(m => m.MonitoringComponent)
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'home'
  }
];
