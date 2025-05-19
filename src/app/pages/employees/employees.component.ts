import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Employee, EmployeeService } from '../../services/employee.service';
import { RequestService } from '../../services/request.service';
import { DepartmentService } from '../../services/department.service';
import { WorkflowService } from '../../services/workflow.service';
import { CreateRequestDto } from '../../services/request.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  error = '';
  showTransferModal = false;
  selectedEmployee: Employee | null = null;
  newDepartment = '';
  departments: string[] = [];

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private requestService: RequestService,
    private departmentService: DepartmentService,
    private workflowService: WorkflowService
  ) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees() {
    this.loading = true;
    this.error = '';
    
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        console.log('Loaded employees:', employees);
        this.employees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.error = error;
        this.loading = false;
      }
    });
  }

  loadDepartments() {
    this.departmentService.getDepartmentNames().subscribe({
      next: (departments) => {
        console.log('Loaded departments:', departments);
        this.departments = departments;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = 'Error loading departments: ' + error;
      }
    });
  }

  addEmployee() {
    this.router.navigate(['/employees/add']);
  }

  editEmployee(id: number) {
    this.router.navigate(['/employees/edit', id]);
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          console.log('Employee deleted successfully');
          this.employees = this.employees.filter(e => e.id !== id);
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.error = 'Failed to delete employee: ' + error;
        }
      });
    }
  }

  requestAction(employee: Employee) {
    this.router.navigate(['/requests/add'], {
      state: {
        employeeId: employee.id,
        employeeEmail: employee.email
      }
    });
  }

  workflowAction(id: number) {
    this.router.navigate(['/workflow'], {
      state: { employeeId: id }
    });
  }

  openTransferModal(employee: Employee) {
    this.selectedEmployee = employee;
    this.newDepartment = employee.department || '';
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedEmployee = null;
    this.newDepartment = '';
  }

  transferEmployee() {
    if (!this.selectedEmployee || !this.newDepartment) return;

    // Find the department ID from the department name
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        const department = departments.find(d => d.name === this.newDepartment);
        if (!department) {
          this.error = 'Department not found';
          return;
        }

        const updatedEmployee = {
          ...this.selectedEmployee,
          department_id: department.id
        };

        this.employeeService.updateEmployee(this.selectedEmployee!.id!, updatedEmployee)
          .subscribe({
            next: (employee) => {
              console.log('Employee transferred successfully:', employee);
              // Update the employee in the list
              const index = this.employees.findIndex(e => e.id === employee.id);
              if (index !== -1) {
                this.employees[index] = employee;
              }

              // Create a request for the department transfer
              const requestData: CreateRequestDto = {
                type: 'Department Transfer',
                employeeId: employee.id,
                employeeEmail: employee.email,
                items: `Department transfer from ${this.selectedEmployee?.department} to ${this.newDepartment}`,
                status: 'Pending'
              };

              this.requestService.createRequest(requestData).subscribe({
                next: (request) => {
                  // Create a workflow for the department transfer
                  const workflowData = {
                    request_id: request.id,
                    employee_id: employee.id,
                    current_step: `Transfer from ${this.selectedEmployee?.department} to ${this.newDepartment}`,
                    status: 'Pending',
                    request_type: 'Department Transfer',
                    request_items: `Department transfer from ${this.selectedEmployee?.department} to ${this.newDepartment}`
                  };

                  this.workflowService.createWorkflow(workflowData).subscribe({
                    next: (workflow) => {
                      console.log('Workflow created successfully:', workflow);
                      this.closeTransferModal();
                    },
                    error: (error) => {
                      console.error('Error creating workflow:', error);
                      this.error = 'Failed to create workflow: ' + error;
                    }
                  });
                },
                error: (error) => {
                  console.error('Error creating request:', error);
                  this.error = 'Failed to create request: ' + error;
                }
              });
            },
            error: (error) => {
              console.error('Error transferring employee:', error);
              this.error = 'Failed to transfer employee: ' + error;
            }
          });
      },
      error: (error) => {
        console.error('Error getting departments:', error);
        this.error = 'Failed to get departments: ' + error;
      }
    });
  }

  viewWorkflow(employee: Employee) {
    this.router.navigate(['/workflow'], {
      state: {
        employeeId: employee.id,
        employeeName: `${employee.first_name} ${employee.last_name}`
      }
    });
  }

  viewRequests(employee: Employee) {
    // Navigate to requests component with employee info
    this.router.navigate(['/requests'], {
      state: {
        employeeId: employee.id,
        employeeEmail: employee.email
      }
    });
  }
}
