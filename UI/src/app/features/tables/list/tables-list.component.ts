import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { Table } from '../../../shared/models';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-tables-list',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatDialogModule, MatMenuModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><mat-icon>table_bar</mat-icon> Tables</h2>
        @if (auth.hasRole('Manager')) {
          <button mat-raised-button color="primary" (click)="addTable()">
            <mat-icon>add</mat-icon> Add Table
          </button>
        }
      </div>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else {
        <div class="tables-grid">
          @for (table of tables(); track table.id) {
            <mat-card class="table-card" [class]="table.status.toLowerCase()">
              <mat-card-header>
                <mat-icon mat-card-avatar>table_bar</mat-icon>
                <mat-card-title>Table {{ table.number }}</mat-card-title>
                <mat-card-subtitle>Capacity: {{ table.capacity }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <span class="status-chip {{ table.status.toLowerCase() }}">{{ table.status }}</span>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button [matMenuTriggerFor]="statusMenu">
                  Change Status <mat-icon>arrow_drop_down</mat-icon>
                </button>
                <mat-menu #statusMenu>
                  <button mat-menu-item (click)="changeStatus(table, 1)"><mat-icon>check_circle</mat-icon> Available</button>
                  <button mat-menu-item (click)="changeStatus(table, 2)"><mat-icon>event_seat</mat-icon> Occupied</button>
                  <button mat-menu-item (click)="changeStatus(table, 3)"><mat-icon>bookmark</mat-icon> Reserved</button>
                  <button mat-menu-item (click)="changeStatus(table, 4)"><mat-icon>cleaning_services</mat-icon> Cleaning</button>
                </mat-menu>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .table-card { transition: transform .2s; cursor: default; }
    .table-card:hover { transform: translateY(-2px); }
    .table-card.available { border-left: 4px solid #4caf50; }
    .table-card.occupied  { border-left: 4px solid #f44336; }
    .table-card.reserved  { border-left: 4px solid #ff9800; }
    .table-card.cleaning  { border-left: 4px solid #2196f3; }
    .center { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class TablesListComponent implements OnInit {
  tables  = signal<Table[]>([]);
  loading = signal(true);

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getTables().subscribe({
      next: t => { this.tables.set(t); this.loading.set(false); },
      error: ()  => this.loading.set(false)
    });
  }

  changeStatus(table: Table, status: number) {
    this.api.updateTableStatus(table.id, status).subscribe({
      next: () => { this.snack.open('Table status updated', 'OK', { duration: 2000 }); this.load(); },
      error: () => this.snack.open('Failed to update status', 'OK', { duration: 3000 })
    });
  }

  addTable() {
    const number   = prompt('Table number (e.g. T11):');
    const capacity = prompt('Capacity:');
    if (!number || !capacity) return;
    this.api.createTable({ number, capacity: +capacity }).subscribe({
      next: () => { this.snack.open('Table added!', 'OK', { duration: 2000 }); this.load(); }
    });
  }
}
