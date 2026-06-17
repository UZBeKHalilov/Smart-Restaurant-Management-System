import { Component, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../shared/models';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    DatePipe, CurrencyPipe, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatDialogModule, MatSelectModule, MatFormFieldModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>payments</mat-icon> Bills & Payments</h2>
      </div>

      <mat-card class="section-card">
        <mat-card-header><mat-card-title>Ready to Bill (Status: Ready)</mat-card-title></mat-card-header>
        <mat-card-content>
          @if (loading()) {
            <div class="center"><mat-spinner /></div>
          } @else if (readyOrders().length === 0) {
            <div class="empty"><mat-icon>check_circle</mat-icon><p>No orders ready for billing</p></div>
          } @else {
            <table mat-table [dataSource]="readyOrders()" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>Order #</th>
                <td mat-cell *matCellDef="let o">{{ o.id }}</td>
              </ng-container>
              <ng-container matColumnDef="table">
                <th mat-header-cell *matHeaderCellDef>Table</th>
                <td mat-cell *matCellDef="let o">{{ o.tableNumber }}</td>
              </ng-container>
              <ng-container matColumnDef="items">
                <th mat-header-cell *matHeaderCellDef>Items</th>
                <td mat-cell *matCellDef="let o">{{ o.items.length }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Subtotal</th>
                <td mat-cell *matCellDef="let o">{{ o.totalAmount | currency }}</td>
              </ng-container>
              <ng-container matColumnDef="time">
                <th mat-header-cell *matHeaderCellDef>Time</th>
                <td mat-cell *matCellDef="let o">{{ o.createdAt | date:'HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let o">
                  <button mat-raised-button color="primary" (click)="generateBill(o)">
                    <mat-icon>receipt</mat-icon> Generate Bill
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cols"></tr>
              <tr mat-row *matRowDef="let row; columns: cols;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>

      @if (generatedBill()) {
        <mat-card class="bill-receipt">
          <mat-card-header>
            <mat-card-title>🧾 Bill Receipt — Order #{{ generatedBill()!.orderId }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="receipt-row"><span>Table</span><span>{{ generatedBill()!.tableNumber }}</span></div>
            <div class="receipt-row"><span>Subtotal</span><span>{{ generatedBill()!.subTotal | currency }}</span></div>
            <div class="receipt-row"><span>Tax ({{ generatedBill()!.taxRate * 100 }}%)</span><span>{{ generatedBill()!.taxAmount | currency }}</span></div>
            <div class="receipt-row total-row"><span>TOTAL</span><span>{{ generatedBill()!.totalAmount | currency }}</span></div>

            @if (!generatedBill()!.isPaid) {
              <div class="pay-section">
                <mat-form-field appearance="outline">
                  <mat-label>Payment Method</mat-label>
                  <mat-select [(ngModel)]="paymentMethod">
                    <mat-option value="Cash">Cash</mat-option>
                    <mat-option value="Card">Card</mat-option>
                    <mat-option value="QR">QR Pay</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="accent" (click)="payBill()">
                  <mat-icon>done</mat-icon> Confirm Payment
                </button>
              </div>
            } @else {
              <div class="paid-badge">✅ PAID via {{ generatedBill()!.paymentMethod }}</div>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .section-card { margin-bottom: 24px; }
    table { width: 100%; }
    .empty { display: flex; flex-direction: column; align-items: center; padding: 32px; color: #bbb; }
    .empty mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .bill-receipt { max-width: 480px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .total-row { font-size: 20px; font-weight: 700; color: #1a237e; border-bottom: none; padding-top: 16px; }
    .pay-section { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
    .paid-badge { margin-top: 20px; font-size: 18px; font-weight: 700; color: #2e7d32; }
    .center { display: flex; justify-content: center; padding: 48px; }
  `]
})
export class BillsComponent implements OnInit {
  readyOrders   = signal<Order[]>([]);
  generatedBill = signal<any>(null);
  loading       = signal(true);
  paymentMethod = 'Cash';
  cols = ['id','table','items','total','time','actions'];

  constructor(private api: ApiService, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getOrders(3).subscribe({
      next: o => { this.readyOrders.set(o); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  generateBill(order: Order) {
    this.api.generateBill(order.id).subscribe({
      next: bill => {
        this.generatedBill.set(bill);
        this.snack.open('Bill generated!', 'OK', { duration: 2000 });
        this.load();
      },
      error: e => this.snack.open(e?.error?.error ?? 'Error generating bill', 'OK', { duration: 3000 })
    });
  }

  payBill() {
    const bill = this.generatedBill();
    if (!bill) return;
    this.api.payBill(bill.id, this.paymentMethod).subscribe({
      next: () => {
        this.generatedBill.set({ ...bill, isPaid: true, paymentMethod: this.paymentMethod });
        this.snack.open('Payment confirmed! 🎉', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Payment failed', 'OK', { duration: 3000 })
    });
  }
}
