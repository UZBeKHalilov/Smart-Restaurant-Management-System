import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Table, MenuItem, Category, OrderItemRequest } from '../../../shared/models';

interface CartItem { menuItem: MenuItem; quantity: number; notes: string; }

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    FormsModule, CurrencyPipe,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatTableModule, MatDividerModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTabsModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>add_shopping_cart</mat-icon> New Order</h2>
        <button mat-button (click)="router.navigate(['/orders'])">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <div class="order-layout">
          <!-- Left: Table & Menu -->
          <div class="left-panel">
            <mat-card>
              <mat-card-header><mat-card-title>Select Table</mat-card-title></mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Available Table</mat-label>
                  <mat-select [(ngModel)]="selectedTableId">
                    @for (t of availableTables(); track t.id) {
                      <mat-option [value]="t.id">{{ t.number }} (Cap: {{ t.capacity }})</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Order Notes</mat-label>
                  <textarea matInput [(ngModel)]="orderNotes" rows="2"></textarea>
                </mat-form-field>
              </mat-card-content>
            </mat-card>

            <mat-card class="menu-panel">
              <mat-card-header><mat-card-title>Menu</mat-card-title></mat-card-header>
              <mat-card-content>
                <mat-tab-group>
                  @for (cat of categories(); track cat.id) {
                    <mat-tab [label]="cat.name">
                      <div class="menu-items">
                        @for (item of itemsByCategory(cat.id); track item.id) {
                          <div class="menu-item-row" (click)="addToCart(item)">
                            <div class="item-info">
                              <span class="item-name">{{ item.name }}</span>
                              <span class="item-desc">{{ item.description }}</span>
                            </div>
                            <div class="item-actions">
                              <span class="item-price">{{ item.price | currency }}</span>
                              <button mat-mini-fab color="primary" (click)="$event.stopPropagation(); addToCart(item)">
                                <mat-icon>add</mat-icon>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </mat-tab>
                  }
                </mat-tab-group>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Right: Cart -->
          <div class="right-panel">
            <mat-card class="cart-card">
              <mat-card-header><mat-card-title>Order Cart</mat-card-title></mat-card-header>
              <mat-card-content>
                @if (cart().length === 0) {
                  <div class="empty-cart">
                    <mat-icon>shopping_cart</mat-icon>
                    <p>Add items from the menu</p>
                  </div>
                } @else {
                  @for (item of cart(); track item.menuItem.id) {
                    <div class="cart-row">
                      <div class="cart-item-name">{{ item.menuItem.name }}</div>
                      <div class="cart-controls">
                        <button mat-icon-button (click)="decrement(item)"><mat-icon>remove</mat-icon></button>
                        <span class="qty">{{ item.quantity }}</span>
                        <button mat-icon-button (click)="increment(item)"><mat-icon>add</mat-icon></button>
                        <button mat-icon-button color="warn" (click)="removeFromCart(item)"><mat-icon>delete</mat-icon></button>
                      </div>
                      <div class="cart-subtotal">{{ (item.menuItem.price * item.quantity) | currency }}</div>
                    </div>
                  }
                  <mat-divider class="my-16" />
                  <div class="cart-total">
                    <span>Total</span>
                    <span class="total-amount">{{ cartTotal() | currency }}</span>
                  </div>
                }
              </mat-card-content>
              <mat-card-actions>
                <button mat-raised-button color="primary" class="full-width submit-btn"
                        [disabled]="cart().length === 0 || !selectedTableId || submitting"
                        (click)="placeOrder()">
                  @if (submitting) {
                    <ng-container><mat-spinner diameter="20" /></ng-container>
                  } @else {
                    <ng-container><mat-icon>send</mat-icon> Place Order</ng-container>
                  }
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .order-layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    .left-panel { display: flex; flex-direction: column; gap: 16px; }
    .menu-panel { flex: 1; }
    .menu-items { padding: 8px 0; }
    .menu-item-row { display: flex; justify-content: space-between; align-items: center;
      padding: 12px 8px; border-bottom: 1px solid #eee; cursor: pointer; border-radius: 8px;
      transition: background .15s; }
    .menu-item-row:hover { background: #f5f5f5; }
    .item-info { flex: 1; }
    .item-name { font-weight: 500; display: block; }
    .item-desc { font-size: 12px; color: #888; display: block; }
    .item-actions { display: flex; align-items: center; gap: 8px; }
    .item-price { font-weight: 600; color: #1a237e; min-width: 60px; text-align: right; }
    .cart-card { position: sticky; top: 24px; }
    .empty-cart { display: flex; flex-direction: column; align-items: center; padding: 32px; color: #bbb; }
    .empty-cart mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .cart-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .cart-item-name { flex: 1; font-weight: 500; min-width: 120px; }
    .cart-controls { display: flex; align-items: center; }
    .qty { min-width: 28px; text-align: center; font-weight: 600; }
    .cart-subtotal { font-weight: 600; color: #1a237e; margin-left: auto; }
    .cart-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; padding: 8px 0; }
    .total-amount { color: #1a237e; }
    .my-16 { margin: 16px 0; }
    .submit-btn { height: 48px; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class CreateOrderComponent implements OnInit {
  tables     = signal<Table[]>([]);
  menuItems  = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  cart       = signal<CartItem[]>([]);
  loading    = signal(true);

  selectedTableId?: number;
  orderNotes = '';
  submitting = false;

  availableTables = computed(() => this.tables().filter(t => t.status === 'Available'));
  cartTotal = computed(() => this.cart().reduce((s, i) => s + i.menuItem.price * i.quantity, 0));

  constructor(private api: ApiService, private snack: MatSnackBar, public router: Router) {}

  ngOnInit() {
    forkJoin({ tables: this.api.getTables(), items: this.api.getMenuItems(), cats: this.api.getCategories() })
      .subscribe({
        next: ({ tables, items, cats }) => {
          this.tables.set(tables); this.menuItems.set(items); this.categories.set(cats);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  itemsByCategory(catId: number) { return this.menuItems().filter(i => i.categoryId === catId && i.isAvailable); }

  addToCart(item: MenuItem) {
    const existing = this.cart().find(c => c.menuItem.id === item.id);
    if (existing) {
      this.cart.update(c => c.map(x => x.menuItem.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
    } else {
      this.cart.update(c => [...c, { menuItem: item, quantity: 1, notes: '' }]);
    }
  }

  increment(item: CartItem) { this.cart.update(c => c.map(x => x.menuItem.id === item.menuItem.id ? { ...x, quantity: x.quantity + 1 } : x)); }
  decrement(item: CartItem) {
    if (item.quantity === 1) { this.removeFromCart(item); return; }
    this.cart.update(c => c.map(x => x.menuItem.id === item.menuItem.id ? { ...x, quantity: x.quantity - 1 } : x));
  }
  removeFromCart(item: CartItem) { this.cart.update(c => c.filter(x => x.menuItem.id !== item.menuItem.id)); }

  placeOrder() {
    if (!this.selectedTableId || this.cart().length === 0) return;
    this.submitting = true;
    const items: OrderItemRequest[] = this.cart().map(c => ({ menuItemId: c.menuItem.id, quantity: c.quantity }));
    this.api.createOrder({ tableId: this.selectedTableId, items, notes: this.orderNotes }).subscribe({
      next: () => {
        this.snack.open('Order placed!', 'OK', { duration: 2000 });
        this.router.navigate(['/orders']);
      },
      error: () => { this.snack.open('Failed to place order', 'OK', { duration: 3000 }); this.submitting = false; }
    });
  }
}
