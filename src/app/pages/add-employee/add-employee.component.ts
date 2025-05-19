import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EmployeeService, Employee, CreateEmployeeDto } from '../../services/employee.service';
import { DepartmentService, Department } from '../../services/department.service';
import { WorkflowService } from '../../services/workflow.service';
import { Router } from '@angular/router';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';
import { RequestService, CreateRequestDto } from '../../services/request.service';
import { forkJoin } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

interface ActiveUser {
  id: number;
  email: string;
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  @ViewChild('employeeForm') employeeForm!: NgForm;
  formSubmitted = false;
  departments: Department[] = [];
  activeAccountEmails: { id: number; email: string }[] = [];
  error = '';
  isSubmitting = false;

  employee: Employee = {
    id: 0,
    email: '',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    status: 'Active' as const
  };

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private workflowService: WorkflowService,
    private accountService: AccountService,
    private router: Router,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    forkJoin({
      departments: this.departmentService.getAll(),
      users: this.accountService.getAllActiveUsers()
    }).subscribe({
      next: (result) => {
        this.departments = result.departments;
        this.activeAccountEmails = result.users.map(user => ({
          id: user.id,
          email: user.email
        }));
        console.log('Active users loaded:', this.activeAccountEmails);
      },
      error: (error) => {
        this.error = 'Error loading data: ' + error;
        console.error('Error loading data:', error);
      }
    });
  }

  onSubmit() {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.formSubmitted = true;
    this.error = '';
    
    if (this.employeeForm.form.valid) {
      const selectedUser = this.activeAccountEmails.find(u => u.email === this.employee.email);
      const selectedDepartment = this.departments.find(d => d.name === this.employee.department);

      if (!selectedUser || !selectedDepartment) {
        this.error = !selectedUser ? 'Selected email not found' : 'Selected department not found';
        this.isSubmitting = false;
        return;
      }

      const employeeData: CreateEmployeeDto = {
        user_id: selectedUser.id,
        department_id: selectedDepartment.id!,
        position: this.employee.position,
        hire_date: this.employee.hire_date,
        status: this.employee.status
      };

      this.employeeService.createEmployee(employeeData)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe({
          next: (createdEmployee) => {
            console.log('Employee created:', createdEmployee);
            this.navigateToEmployees();
          },
          error: (error) => {
            console.error('Employee creation failed:', error);
            this.error = 'Error creating employee: ' + (error.error?.message || error.message);
            this.isSubmitting = false;
          }
        });
    } else {
      this.isSubmitting = false;
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  private navigateToEmployees() {
    this.router.navigate(['/employees'])
      .then(() => console.log('Navigation successful'))
      .catch(() => window.location.href = '/employees');
  }

  cancel() {
    this.navigateToEmployees();
  }
}
