import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account, CreateAccountDto } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-add-account',
  templateUrl: './add-account.component.html',
  styleUrls: ['./add-account.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class AddAccountComponent {
  account: Omit<Account, 'id'> = {
    title: 'Mr',
    first_name: '',
    last_name: '',
    email: '',
    role: 'User',
    status: 'Active'
  };

  password: string = '';
  showPassword: boolean = false;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  onSubmit() {
    if (this.isFormValid()) {
      this.loading = true;
      
      const createAccountData: CreateAccountDto = {
        ...this.account,
        password: this.password
      };
      
      this.accountService.create(createAccountData)
        .subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/accounts']);
          },
          error: (error) => {
            this.loading = false;
            this.error = error.error?.message || 'Failed to create account';
          }
        });
    }
  }

  private isFormValid(): boolean {
    return !!(
      this.account.title &&
      this.account.first_name &&
      this.account.last_name &&
      this.account.email &&
      this.account.role &&
      this.account.status &&
      this.password &&
      this.password.length >= 6
    );
  }

  cancel() {
    this.router.navigate(['/accounts']);
  }
}
