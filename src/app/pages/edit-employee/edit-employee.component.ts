import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Employee, EmployeeService } from '../../services/employee.service';
import { DepartmentService, Department } from '../../services/department.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit {
  employee: Employee = {
    id: 0,
    email: '',
    position: '',
    department: '',
    department_id: 0,
    hire_date: '',
    status: 'Active'
  };
  
  departments: Department[] = [];
  activeAccountEmails: string[] = [];
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.loading = true;
    
    // Load departments with full information
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error: Error) => {
        this.error = 'Error loading departments: ' + error.message;
      }
    });

    // Load active account emails using AccountService
    this.accountService.getAllActiveUsers().subscribe({
      next: (accounts) => {
        this.activeAccountEmails = accounts.map(account => account.email);
      },
      error: (error) => {
        this.error = 'Error loading account emails: ' + error.message;
      }
    });

    // Get id from route parameters
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.employeeService.getEmployeeById(id).subscribe({
        next: (employee: Employee) => {
          this.employee = employee;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Error loading employee: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      this.error = 'No employee ID provided';
      this.loading = false;
    }
  }

  onDepartmentChange(departmentId: number) {
    const selectedDepartment = this.departments.find(d => d.id === departmentId);
    if (selectedDepartment) {
      this.employee.department_id = departmentId;
      this.employee.department = selectedDepartment.name;
    }
  }

  onSubmit() {
    this.loading = true;
    this.employeeService.updateEmployee(this.employee.id, this.employee).subscribe({
      next: () => {
        this.router.navigate(['/employees']);
      },
      error: (error: Error) => {
        this.error = 'Error updating employee: ' + error.message;
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/employees']);
  }
}
