import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register</h2>
        <div *ngIf="error" class="alert alert-danger">
          {{ error }}
        </div>
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              [(ngModel)]="firstName"
              required
              class="form-control"
              placeholder="Enter your first name"
            >
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              [(ngModel)]="lastName"
              required
              class="form-control"
              placeholder="Enter your last name"
            >
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              class="form-control"
              placeholder="Enter your email"
            >
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="password"
              required
              minlength="6"
              class="form-control"
              placeholder="Enter your password"
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              required
              class="form-control"
              placeholder="Confirm your password"
            >
          </div>
          <div class="form-actions">
            <button type="submit" [disabled]="!registerForm.form.valid || loading">
              {{ loading ? 'Registering...' : 'Register' }}
            </button>
            <p>Already have an account? <a routerLink="/login">Login</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      margin: 0 0 1.5rem;
      color: #333;
      text-align: center;
      font-size: 1.75rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-actions {
      margin-top: 1.5rem;
      text-align: center;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    button:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .alert {
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      border-radius: 6px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    p {
      margin: 1rem 0 0;
      color: #666;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register({
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        // After successful registration, log the user in
        this.authService.login(this.email, this.password).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.error = error.message || 'Failed to login after registration';
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.error = error.message || 'Failed to register';
        this.loading = false;
      }
    });
  }
} 