import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="logo">
          <mat-icon>restaurant</mat-icon>
          <span>BitePlate</span>
        </div>
        <mat-divider />
        <mat-nav-list>
          @for (item of visibleNav(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active-link">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <div class="sidenav-footer">
          <mat-divider />
          <div class="user-info">
            <mat-icon>account_circle</mat-icon>
            <div>
              <div class="user-name">{{ auth.currentUser()?.fullName }}</div>
              <div class="user-role">{{ auth.currentUser()?.roles?.[0] }}</div>
            </div>
          </div>
          <button mat-button color="warn" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <span class="spacer"></span>
          <span>Smart Restaurant Management</span>
          <span class="spacer"></span>
        </mat-toolbar>
        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; display: flex; flex-direction: column; background: #1a237e; color: white; }
    .logo { display: flex; align-items: center; gap: 12px; padding: 20px 16px; font-size: 20px; font-weight: 700; }
    .logo mat-icon { font-size: 32px; width: 32px; height: 32px; }
    mat-nav-list { flex: 1; }
    a[mat-list-item] { color: rgba(255,255,255,0.8); margin: 2px 8px; border-radius: 8px; }
    a[mat-list-item]:hover, .active-link { background: rgba(255,255,255,0.15) !important; color: white !important; }
    .sidenav-footer { padding: 16px; }
    .user-info { display: flex; align-items: center; gap: 10px; padding: 12px 0; color: white; }
    .user-name { font-weight: 600; font-size: 14px; }
    .user-role { font-size: 12px; opacity: 0.7; }
    .content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }
    .spacer { flex: 1; }
  `]
})
export class ShellComponent {
  private readonly navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',    route: '/dashboard' },
    { label: 'Tables',     icon: 'table_bar',    route: '/tables' },
    { label: 'Menu',       icon: 'menu_book',    route: '/menu' },
    { label: 'Orders',     icon: 'receipt_long', route: '/orders' },
    { label: 'Kitchen',    icon: 'kitchen',      route: '/kitchen',  roles: ['Chef', 'Manager'] },
    { label: 'Bills',      icon: 'payments',     route: '/bills',    roles: ['Cashier', 'Manager'] },
  ];

  visibleNav = computed(() => {
    const user = this.auth.currentUser();
    return this.navItems.filter(n =>
      !n.roles || n.roles.some(r => user?.roles.includes(r))
    );
  });

  constructor(public auth: AuthService) {}
}
