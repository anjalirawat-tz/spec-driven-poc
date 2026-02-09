import { Routes } from '@angular/router';

export const ledgerRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/ledger-list/ledger-list.component').then(
        (m) => m.LedgerListComponent
      ),
  },
];
