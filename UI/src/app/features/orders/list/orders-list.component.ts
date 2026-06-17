import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../shared/models';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    RouterLink, DatePipe, CurrencyPipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatChipsModule, MatSelectModule, MatFormFieldModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>receipt_long</mat-icon> Orders</h2>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="filter">
            <mat-label>Filter by status</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (ngModelChange)="load()">
              <mat-option [value]="undefined">All</mat-option>
              <mat-option [value]="1">Pending</mat-option>
              <mat-option [value]="2">Preparing</mat-option>
              <mat-option [value]="3">Ready</mat-option>
              <mat-option [value]="4">Served</mat-option>
              <mat-option [value]="5">Cancelled</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" routerLink="/orders/create">
            <mat-icon>add</mat-icon> New Order
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="orders()" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let o">{{ o.id }}</td>
            </ng-container>
            <ng-container matColumnDef="table">
              <th mat-header-cell *matHeaderCellDef>Table</th>
              <td mat-cell *matCellDef="let o">{{ o.tableNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="waiter">
              <th mat-header-cell *matHeaderCellDef>Waiter</th>
              <td mat-cell *matCellDef="let o">{{ o.waiterName }}</td>
            </ng-container>
            <ng-container matColumnDef="items">
              <th mat-header-cell *matHeaderCellDef>Items</th>
              <td mat-cell *matCellDef="let o">{{ o.items.length }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total</th>
              <td mat-cell *matCellDef="let o">{{ o.totalAmount | currency }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let o">
                <span class="status-chip {{ o.statusName.toLowerCase() }}">{{ o.statusName }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="created">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let o">
                @if (o.status === 3 && (auth.hasRole('Cashier') || auth.hasRole('Manager'))) {
                  <button mat-icon-button color="primary" title="Generate Bill" (click)="generateBill(o)">
                    <mat-icon>receipt</mat-icon>
                  </button>
                }
                @if (o.status === 1 || o.status === 2) {
                  <button mat-icon-button color="warn" title="Cancel" (click)="cancel(o)">
                    <mat-icon>cancel</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>

          @if (orders().length === 0) {
            <div class="empty"><mat-icon>inbox</mat-icon><p>No orders found.</p></div>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .filter { width: 180px; }
    table { width: 100%; }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 48px; color: #999; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class OrdersListComponent implements OnInit {
  orders         = signal<Order[]>([]);
  loading        = signal(true);
  selectedStatus?: number;
  cols = ['id','table','waiter','items','total','status','created','actions'];

  constructor(
    private api: ApiService, public auth: AuthService, private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.getOrders(this.selectedStatus).subscribe({
      next: o => { this.orders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  generateBill(order: Order) {
    this.api.generateBill(order.id).subscribe({
      next: () => { this.snack.open('Bill generated!', 'OK', { duration: 2500 }); this.load(); },
      error: (e) => this.snack.open(e?.error?.error ?? 'Error', 'OK', { duration: 3000 })
    });
  }

  cancel(order: Order) {
    if (!confirm('Cancel this order?')) return;
    this.api.cancelOrder(order.id).subscribe({
      next: () => { this.snack.open('Order cancelled', 'OK', { duration: 2000 }); this.load(); }
    });
  }
}
