import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'tables',
        loadComponent: () => import('./features/tables/list/tables-list.component').then(m => m.TablesListComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./features/menu/list/menu-list.component').then(m => m.MenuListComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/list/orders-list.component').then(m => m.OrdersListComponent)
      },
      {
        path: 'orders/create',
        loadComponent: () => import('./features/orders/create/create-order.component').then(m => m.CreateOrderComponent)
      },
      {
        path: 'kitchen',
        canActivate: [roleGuard(['Chef', 'Manager'])],
        loadComponent: () => import('./features/kitchen/kitchen.component').then(m => m.KitchenComponent)
      },
      {
        path: 'bills',
        canActivate: [roleGuard(['Cashier', 'Manager'])],
        loadComponent: () => import('./features/bills/bills.component').then(m => m.BillsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
