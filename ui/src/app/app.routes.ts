import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/accounts',
    pathMatch: 'full',
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.accountsRoutes),
  },
  {
    path: 'ledger',
    loadChildren: () =>
      import('./features/ledger/ledger.routes').then((m) => m.ledgerRoutes),
  },
  {
    path: 'invoices',
    loadChildren: () =>
      import('./features/invoices/invoices.routes').then((m) => m.invoicesRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
