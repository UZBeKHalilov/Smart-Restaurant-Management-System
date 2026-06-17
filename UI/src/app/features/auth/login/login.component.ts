import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-bg">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-logo">
            <mat-icon>restaurant</mat-icon>
            <h1>BitePlate</h1>
            <p>Smart Restaurant Management</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="manager@biteplate.com">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePass ? 'password' : 'text'" formControlName="password">
              <button mat-icon-button matSuffix type="button" (click)="hidePass = !hidePass">
                <mat-icon>{{ hidePass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            @if (error) {
              <p class="error-msg">{{ error }}</p>
            }

            <button mat-raised-button color="primary" class="full-width login-btn"
                    type="submit" [disabled]="loading || form.invalid">
              @if (loading) { <mat-spinner diameter="20" /> }
              @else { Login }
            </button>
          </form>

          <div class="hint">
            <small>Default: manager&#64;biteplate.com / Manager&#64;123</small>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh; display: flex; align-items: center;
      justify-content: center; background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
    }
    .login-card { width: 400px; padding: 16px; }
    .login-logo { text-align: center; width: 100%; padding: 16px 0; }
    .login-logo mat-icon { font-size: 48px; width: 48px; height: 48px; color: #1a237e; }
    .login-logo h1 { margin: 8px 0 4px; font-size: 28px; color: #1a237e; }
    .login-logo p  { margin: 0; color: #666; font-size: 14px; }
    .login-btn { height: 48px; font-size: 16px; margin-top: 8px; }
    .error-msg { color: #d32f2f; font-size: 14px; text-align: center; }
    .hint { text-align: center; margin-top: 16px; color: #888; }
    mat-card-header { justify-content: center; }
  `]
})
export class LoginComponent {
  form = this.fb.group({
    email:    ['manager@biteplate.com', [Validators.required, Validators.email]],
    password: ['Manager@123', Validators.required]
  });
  hidePass = true;
  loading  = false;
  error    = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => { this.error = 'Invalid credentials.'; this.loading = false; }
    });
  }
}
