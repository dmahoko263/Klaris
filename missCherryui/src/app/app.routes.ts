import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { VerifyBatch } from './pages/verify-batch/verify-batch';

export const routes: Routes = [
  // PUBLIC VERIFY ROUTE (no login required)
  {
    path: 'verify/:batchId',
    component: VerifyBatch,
  },

  // AUTH FIRST
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full',
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./modules/auth/auth-module').then(
            (m) => m.AuthModule
          ),
      },
    ],
  },

  // DASHBOARD AFTER LOGIN
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./modules/dashboard/dashboard-module').then(
            (m) => m.DashboardModule
          ),
      },
    ],
  },

  // FALLBACK
  {
    path: '**',
    redirectTo: 'auth',
  },
];