import { Routes } from '@angular/router';
import { STRING_EMPTY } from './shared/constants/string-consts';

export const APP_ROUTES: Routes = [
    {
        path: STRING_EMPTY,
        pathMatch: 'full',
        redirectTo: ''
    },
    {
        path: '',
        loadComponent: () =>
            import('./features/overview/overview.component').then(m => m.OverviewComponent)
    }

];
