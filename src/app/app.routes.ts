// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
      },
      {
        path: 'accounts/add',
        loadComponent: () => import('./pages/add-account/add-account.component').then(m => m.AddAccountComponent)
      },
      {
        path: 'accounts/edit/:id',
        loadComponent: () => import('./pages/account-edit/account-edit.component').then(m => m.AccountEditComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./pages/departments/departments.component').then(m => m.DepartmentsComponent)
      },
      {
        path: 'departments/add',
        loadComponent: () => import('./pages/add-department/add-department.component').then(m => m.AddDepartmentComponent)
      },
      {
        path: 'departments/edit/:id',
        loadComponent: () => import('./pages/edit-department/edit-department.component').then(m => m.EditDepartmentComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent)
      },
      {
        path: 'employees/add',
        loadComponent: () => import('./pages/add-employee/add-employee.component').then(m => m.AddEmployeeComponent)
      },
      {
        path: 'employees/edit/:id',
        loadComponent: () => import('./pages/edit-employee/edit-employee.component').then(m => m.EditEmployeeComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./pages/requests/requests.component').then(m => m.RequestsComponent)
      },
      {
        path: 'requests/add',
        loadComponent: () => import('./pages/add-request/add-request.component').then(m => m.AddRequestComponent)
      },
      {
        path: 'requests/edit/:id',
        loadComponent: () => import('./pages/edit-request/edit-request.component').then(m => m.EditRequestComponent)
      },
      {
        path: 'workflow',
        loadComponent: () => import('./pages/workflow/workflow.component').then(m => m.WorkflowComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
