import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.accountService.getAll()
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  editAccount(id: number) {
    this.router.navigate(['/accounts/edit', id]);
  }

  addAccount() {
    this.router.navigate(['/accounts/add']);
  }
}
