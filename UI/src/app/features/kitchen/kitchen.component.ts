import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription, interval } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../shared/models';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [
    DatePipe, MatCardModule, MatButtonModule, MatIconModule,
    MatBadgeModule, MatProgressSpinnerModule, MatSnackBarModule, MatDividerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>kitchen</mat-icon> Kitchen Queue</h2>
        <div class="auto-refresh">
          <mat-icon [class.spinning]="loading()">refresh</mat-icon>
          Auto-refresh every 15s
        </div>
      </div>

      @if (loading() && pending().length === 0 && preparing().length === 0) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <div class="kitchen-layout">
          <!-- PENDING COLUMN -->
          <div class="kitchen-column">
            <div class="column-header pending-header">
              <mat-icon>pending</mat-icon>
              <span>Pending</span>
              <span class="badge">{{ pending().length }}</span>
            </div>
            @for (order of pending(); track order.id) {
              <mat-card class="order-card pending-card">
                <mat-card-header>
                  <mat-card-title>Order #{{ order.id }} — {{ order.tableNumber }}</mat-card-title>
                  <mat-card-subtitle>{{ order.createdAt | date:'HH:mm' }} · {{ order.waiterName }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  @for (item of order.items; track item.id) {
                    <div class="order-item">
                      <span class="item-qty">{{ item.quantity }}×</span>
                      <span>{{ item.menuItemName }}</span>
                      @if (item.notes) { <span class="item-note">📝 {{ item.notes }}</span> }
                    </div>
                  }
                  @if (order.notes) {
                    <mat-divider class="my-8" />
                    <div class="order-note">⚠️ {{ order.notes }}</div>
                  }
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="primary" (click)="startPreparing(order)">
                    <mat-icon>cooking</mat-icon> Start Preparing
                  </button>
                </mat-card-actions>
              </mat-card>
            }
            @if (pending().length === 0) {
              <div class="empty-col"><mat-icon>check_circle</mat-icon><p>No pending orders</p></div>
            }
          </div>

          <!-- PREPARING COLUMN -->
          <div class="kitchen-column">
            <div class="column-header preparing-header">
              <mat-icon>local_fire_department</mat-icon>
              <span>Preparing</span>
              <span class="badge">{{ preparing().length }}</span>
            </div>
            @for (order of preparing(); track order.id) {
              <mat-card class="order-card preparing-card">
                <mat-card-header>
                  <mat-card-title>Order #{{ order.id }} — {{ order.tableNumber }}</mat-card-title>
                  <mat-card-subtitle>{{ order.createdAt | date:'HH:mm' }} · {{ order.waiterName }}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  @for (item of order.items; track item.id) {
                    <div class="order-item">
                      <span class="item-qty">{{ item.quantity }}×</span>
                      <span>{{ item.menuItemName }}</span>
                    </div>
                  }
                </mat-card-content>
                <mat-card-actions>
                  <button mat-raised-button color="accent" (click)="markReady(order)">
                    <mat-icon>check_circle</mat-icon> Mark Ready
                  </button>
                </mat-card-actions>
              </mat-card>
            }
            @if (preparing().length === 0) {
              <div class="empty-col"><mat-icon>hourglass_empty</mat-icon><p>Nothing preparing</p></div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .auto-refresh { display: flex; align-items: center; gap: 6px; color: #666; font-size: 13px; }
    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .kitchen-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .kitchen-column { display: flex; flex-direction: column; gap: 12px; }
    .column-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px;
      border-radius: 8px; font-weight: 700; font-size: 16px; color: white; margin-bottom: 4px; }
    .pending-header   { background: #e65100; }
    .preparing-header { background: #1565c0; }
    .badge { margin-left: auto; background: rgba(255,255,255,.3); padding: 2px 10px; border-radius: 12px; }
    .order-card { border-radius: 12px !important; }
    .pending-card   { border-left: 4px solid #e65100; }
    .preparing-card { border-left: 4px solid #1565c0; }
    .order-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .item-qty  { font-weight: 700; color: #1a237e; min-width: 28px; }
    .item-note { font-size: 11px; color: #888; margin-left: auto; }
    .order-note { font-size: 13px; color: #666; font-style: italic; padding: 4px 0; }
    .empty-col { display: flex; flex-direction: column; align-items: center; color: #bbb; padding: 48px; }
    .empty-col mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .my-8 { margin: 8px 0; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class KitchenComponent implements OnInit, OnDestroy {
  pending   = signal<Order[]>([]);
  preparing = signal<Order[]>([]);
  loading   = signal(true);
  private sub?: Subscription;

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); this.sub = interval(15000).subscribe(() => this.load()); }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  load() {
    this.api.getKitchenQueue().subscribe({
      next: ({ pending, preparing }) => {
        this.pending.set(pending); this.preparing.set(preparing); this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startPreparing(order: Order) {
    this.api.startPreparing(order.id).subscribe({
      next: () => { this.snack.open('Started preparing!', 'OK', { duration: 2000 }); this.load(); }
    });
  }

  markReady(order: Order) {
    this.api.markReady(order.id).subscribe({
      next: () => { this.snack.open('Order ready!', 'OK', { duration: 2000 }); this.load(); }
    });
  }
}
