import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Account, UpdateAccountDto } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>Edit Account</h2>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="loading" class="loading-spinner">
        Loading...
      </div>

      <form *ngIf="!loading" (ngSubmit)="onSubmit()" #accountForm="ngForm" class="card-body">
        <div class="form-group">
          <label for="title">Title</label>
          <select
            id="title"
            name="title"
            [(ngModel)]="account.title"
            required
            class="form-control">
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>

        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            [(ngModel)]="account.first_name"
            required
            class="form-control"
            placeholder="Enter first name"
          >
        </div>

        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            [(ngModel)]="account.last_name"
            required
            class="form-control"
            placeholder="Enter last name"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            [(ngModel)]="account.email"
            required
            class="form-control"
            placeholder="Enter email"
          >
        </div>

        <div class="form-group">
          <label for="role">Role</label>
          <select
            id="role"
            name="role"
            [(ngModel)]="account.role"
            required
            class="form-control">
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select
            id="status"
            name="status"
            [(ngModel)]="account.status"
            required
            class="form-control">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div class="form-group">
          <label for="password">New Password (leave empty to keep current)</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="newPassword"
            class="form-control"
            placeholder="Enter new password"
            minlength="6"
          >
          <small class="form-text text-muted" *ngIf="newPassword">
            Password must be at least 6 characters long
          </small>
        </div>

        <div class="form-group" *ngIf="newPassword">
          <label for="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            [(ngModel)]="confirmPassword"
            class="form-control"
            placeholder="Confirm new password"
            [required]="newPassword.length > 0"
          >
          <small class="form-text text-danger" *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword">
            Passwords do not match
          </small>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            [disabled]="!accountForm.form.valid || submitting || (newPassword && newPassword !== confirmPassword)" 
            class="btn btn-primary">
            {{ submitting ? 'Saving...' : 'Save Changes' }}
          </button>
          <button type="button" (click)="cancel()" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin: 1rem;
    }

    .card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
    }

    .card-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
    }

    .card-body {
      padding: 1.5rem;
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
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
    }

    .loading-spinner {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .form-text {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .text-muted {
      color: #6c757d;
    }

    .text-danger {
      color: #dc3545;
    }
  `]
})
export class AccountEditComponent implements OnInit {
  account: Account = {
    id: 0,
    title: 'Mr',
    first_name: '',
    last_name: '',
    email: '',
    role: 'User',
    status: 'Active'
  };
  
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (id) {
      this.accountService.getById(id).subscribe({
        next: (account) => {
          this.account = account;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
    } else {
      this.error = 'No account ID provided';
      this.loading = false;
    }
  }

  onSubmit() {
    if (!this.account.id) {
      this.error = 'Invalid account ID';
      return;
    }

    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.newPassword && this.newPassword.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.submitting = true;
    this.error = '';

    console.log('Submitting update for account:', this.account.id);
    
    // Create update data with only the fields the backend expects
    const updateData: UpdateAccountDto = {
      title: this.account.title,
      first_name: this.account.first_name,
      last_name: this.account.last_name,
      role: this.account.role,
      status: this.account.status,
      email: this.account.email
    };
    
    if (this.newPassword) {
      updateData.password = this.newPassword;
    }

    console.log('Update data:', updateData);

    this.accountService.update(this.account.id, updateData).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        this.router.navigate(['/accounts']);
      },
      error: (error) => {
        console.error('Update failed:', error);
        this.error = error.message || 'Failed to update account';
        this.submitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
