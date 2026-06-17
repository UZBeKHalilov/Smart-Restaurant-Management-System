import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';

interface StatCard { label: string; value: number; icon: string; color: string; route: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <h2>Welcome back, {{ auth.currentUser()?.fullName }} 👋</h2>
      <p class="subtitle">Here's what's happening at BitePlate today.</p>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <div class="stats-grid">
          @for (card of stats(); track card.label) {
            <mat-card class="stat-card" [routerLink]="card.route">
              <mat-card-content>
                <div class="stat-icon" [style.background]="card.color">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ card.value }}</div>
                  <div class="stat-label">{{ card.label }}</div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <div class="quick-actions">
          <h3>Quick Actions</h3>
          <div class="action-grid">
            <button mat-raised-button color="primary" routerLink="/orders/create">
              <mat-icon>add</mat-icon> New Order
            </button>
            <button mat-raised-button color="accent" routerLink="/tables">
              <mat-icon>table_bar</mat-icon> View Tables
            </button>
            @if (auth.hasRole('Chef') || auth.hasRole('Manager')) {
              <button mat-raised-button routerLink="/kitchen">
                <mat-icon>kitchen</mat-icon> Kitchen Queue
              </button>
            }
            @if (auth.hasRole('Cashier') || auth.hasRole('Manager')) {
              <button mat-raised-button routerLink="/bills">
                <mat-icon>payments</mat-icon> Bills
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .subtitle { color: #666; margin-bottom: 32px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { cursor: pointer; transition: transform .2s, box-shadow .2s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
    mat-card-content { display: flex; align-items: center; gap: 16px; padding: 20px !important; }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    .stat-icon mat-icon { color: white; font-size: 28px; width: 28px; height: 28px; }
    .stat-value { font-size: 32px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    .quick-actions h3 { margin-bottom: 16px; }
    .action-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .action-grid button { height: 48px; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  stats   = signal<StatCard[]>([]);

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    forkJoin({
      tables: this.api.getTables(),
      orders: this.api.getOrders(),
      menu:   this.api.getMenuItems()
    }).subscribe({
      next: ({ tables, orders, menu }) => {
        const occupied  = tables.filter(t => t.status === 'Occupied').length;
        const pending   = orders.filter(o => o.status === 1).length;
        const preparing = orders.filter(o => o.status === 2).length;
        const ready     = orders.filter(o => o.status === 3).length;

        this.stats.set([
          { label: 'Total Tables',     value: tables.length, icon: 'table_bar',    color: '#1a237e', route: '/tables' },
          { label: 'Occupied Tables',  value: occupied,       icon: 'event_seat',  color: '#d32f2f', route: '/tables' },
          { label: 'Pending Orders',   value: pending,        icon: 'pending',     color: '#f57c00', route: '/orders' },
          { label: 'Preparing',        value: preparing,      icon: 'cooking',     color: '#1565c0', route: '/kitchen' },
          { label: 'Ready to Serve',   value: ready,          icon: 'check_circle',color: '#2e7d32', route: '/orders' },
          { label: 'Menu Items',       value: menu.length,    icon: 'menu_book',   color: '#6a1b9a', route: '/menu' },
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
