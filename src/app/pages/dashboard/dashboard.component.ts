import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Account } from '../../services/account.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="welcome-card">
        <h1>Welcome, {{ firstName }}!</h1>
        <p class="role-badge">{{ role }}</p>
        
        <div class="quick-stats">
          <div class="stat-card">
            <h3>Employees</h3>
            <i class="fas fa-users"></i>
            <a routerLink="/employees" class="btn-link">View Employees</a>
          </div>
          
          <div class="stat-card">
            <h3>Departments</h3>
            <i class="fas fa-building"></i>
            <a routerLink="/departments" class="btn-link">View Departments</a>
          </div>
          
          <div class="stat-card">
            <h3>Requests</h3>
            <i class="fas fa-clipboard-list"></i>
            <a routerLink="/requests" class="btn-link">View Requests</a>
          </div>

          <div class="stat-card">
            <h3>Accounts</h3>
            <i class="fas fa-user-circle"></i>
            <a routerLink="/accounts" class="btn-link">Manage Accounts</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #3498db;
      color: white;
      border-radius: 20px;
      font-weight: 500;
      margin-bottom: 2rem;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .stat-card i {
      font-size: 2rem;
      color: #3498db;
      margin-bottom: 1rem;
      display: block;
    }

    .btn-link {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .btn-link:hover {
      background-color: #2980b9;
    }
  `]
})
export class DashboardComponent implements OnInit {
  firstName: string = '';
  role: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      this.firstName = user.firstName;
      this.role = user.role;
    }
  }
} 