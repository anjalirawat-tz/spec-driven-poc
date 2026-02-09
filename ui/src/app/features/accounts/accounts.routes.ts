import { Routes } from '@angular/router';

export const accountsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/account-list/account-list.component').then(
        (m) => m.AccountListComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/account-detail/account-detail.component').then(
        (m) => m.AccountDetailComponent
      ),
  },
];
