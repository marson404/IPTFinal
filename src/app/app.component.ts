// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav *ngIf="authService.isLoggedIn()" style="background-color: #1976d2; padding: 1rem; color: white; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <a routerLink="/dashboard" routerLinkActive="active" style="margin-right: 1rem; color: white; text-decoration: none;">Dashboard</a>
        <a routerLink="/accounts" routerLinkActive="active" style="margin-right: 1rem; color: white; text-decoration: none;">Accounts</a>
        <a routerLink="/employees" routerLinkActive="active" style="margin-right: 1rem; color: white; text-decoration: none;">Employees</a>
        <a routerLink="/departments" routerLinkActive="active" style="margin-right: 1rem; color: white; text-decoration: none;">Departments</a>
        <a routerLink="/requests" routerLinkActive="active" style="color: white; text-decoration: none;">Requests</a>
      </div>
      <button (click)="logout()" style="background: none; border: 1px solid white; color: white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
        Logout
      </button>
    </nav>

    <div style="padding: 1rem;">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
