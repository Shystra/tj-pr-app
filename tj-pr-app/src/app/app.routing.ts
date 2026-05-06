import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  {
    path: 'home',
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
    redirectTo: ''
  }
];
