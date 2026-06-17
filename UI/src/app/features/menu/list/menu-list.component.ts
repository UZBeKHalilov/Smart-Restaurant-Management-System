import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { MenuItem, Category } from '../../../shared/models';
import { AuthService } from '../../../core/auth/auth.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatCardModule, MatTabsModule,
    MatButtonModule, MatIconModule, MatTableModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatDialogModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatChipsModule, CurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>menu_book</mat-icon> Menu Management</h2>
        @if (auth.hasRole('Manager')) {
          <button mat-raised-button color="primary" (click)="showForm = !showForm">
            <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
            {{ showForm ? 'Cancel' : 'Add Item' }}
          </button>
        }
      </div>

      @if (showForm && auth.hasRole('Manager')) {
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>New Menu Item</mat-card-title></mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="saveItem()" class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="categoryId">
                  @for (c of categories(); track c.id) {
                    <mat-option [value]="c.id">{{ c.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Price ($)</mat-label>
                <input matInput type="number" formControlName="price">
              </mat-form-field>
              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="2"></textarea>
              </mat-form-field>
              <div class="form-actions span-2">
                <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                  <mat-icon>save</mat-icon> Save
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <mat-tab-group>
          <mat-tab label="All Items">
            <div class="menu-grid">
              @for (item of items(); track item.id) {
                <mat-card class="menu-card" [class.unavailable]="!item.isAvailable">
                  <mat-card-header>
                    <mat-card-title>{{ item.name }}</mat-card-title>
                    <mat-card-subtitle>{{ item.categoryName }}</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <p class="description">{{ item.description }}</p>
                    <div class="price-row">
                      <span class="price">{{ item.price | currency }}</span>
                      <span class="status-chip" [class]="item.isAvailable ? 'available' : 'cancelled'">
                        {{ item.isAvailable ? 'Available' : 'Unavailable' }}
                      </span>
                    </div>
                  </mat-card-content>
                  @if (auth.hasRole('Manager')) {
                    <mat-card-actions>
                      <button mat-icon-button color="warn" (click)="deleteItem(item)">
                        <mat-icon>delete</mat-icon>
                      </button>
                      <button mat-icon-button (click)="toggleAvailability(item)">
                        <mat-icon>{{ item.isAvailable ? 'visibility_off' : 'visibility' }}</mat-icon>
                      </button>
                    </mat-card-actions>
                  }
                </mat-card>
              }
            </div>
          </mat-tab>

          @for (cat of categories(); track cat.id) {
            <mat-tab [label]="cat.name">
              <div class="menu-grid">
                @for (item of itemsByCategory(cat.id); track item.id) {
                  <mat-card class="menu-card" [class.unavailable]="!item.isAvailable">
                    <mat-card-header>
                      <mat-card-title>{{ item.name }}</mat-card-title>
                    </mat-card-header>
                    <mat-card-content>
                      <p class="description">{{ item.description }}</p>
                      <div class="price-row">
                        <span class="price">{{ item.price | currency }}</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            </mat-tab>
          }
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .form-card { margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .span-2 { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; }
    .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; padding: 16px 0; }
    .menu-card.unavailable { opacity: 0.55; }
    .description { color: #666; font-size: 13px; min-height: 40px; }
    .price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .price { font-size: 20px; font-weight: 700; color: #1a237e; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class MenuListComponent implements OnInit {
  items      = signal<MenuItem[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(true);
  showForm   = false;

  form = this.fb.group({
    name:        ['', Validators.required],
    description: ['', Validators.required],
    price:       [0, [Validators.required, Validators.min(0.01)]],
    categoryId:  [null, Validators.required]
  });

  constructor(
    private api: ApiService, public auth: AuthService,
    private snack: MatSnackBar, private fb: FormBuilder
  ) {}

  ngOnInit() { this.load(); }

  load() {
    forkJoin({ items: this.api.getMenuItems(), cats: this.api.getCategories() }).subscribe({
      next: ({ items, cats }) => {
        this.items.set(items); this.categories.set(cats); this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  itemsByCategory(catId: number) { return this.items().filter(i => i.categoryId === catId); }

  saveItem() {
    if (this.form.invalid) return;
    this.api.createMenuItem(this.form.value as any).subscribe({
      next: () => {
        this.snack.open('Item added!', 'OK', { duration: 2000 });
        this.showForm = false; this.form.reset(); this.load();
      },
      error: () => this.snack.open('Failed to add item', 'OK', { duration: 3000 })
    });
  }

  deleteItem(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    this.api.deleteMenuItem(item.id).subscribe({
      next: () => { this.snack.open('Deleted', 'OK', { duration: 2000 }); this.load(); }
    });
  }

  toggleAvailability(item: MenuItem) {
    this.api.updateMenuItem(item.id, { ...item, isAvailable: !item.isAvailable }).subscribe({
      next: () => this.load()
    });
  }
}
