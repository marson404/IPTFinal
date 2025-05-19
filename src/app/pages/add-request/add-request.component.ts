import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService, CreateRequestDto } from '../../services/request.service';
import { EmployeeService, Employee } from '../../services/employee.service';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-add-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-request.component.html',
  styleUrls: ['./add-request.component.css']
})
export class AddRequestComponent implements OnInit {
  requestType: 'Leave' | 'Equipment' | 'Resources' | 'Onboarding' | 'Department Transfer' = 'Leave';
  selectedEmployee: string = '';
  items: { name: string; quantity: number }[] = [
    { name: '', quantity: 1 }
  ];
  error: string | null = null;
  loading = false;
  activeEmployees: Employee[] = [];
  newDepartment: string = '';

  constructor(
    private router: Router,
    private requestService: RequestService,
    private employeeService: EmployeeService,
    private workflowService: WorkflowService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { employeeId: number; employeeEmail: string };
    
    if (state?.employeeId && state?.employeeEmail) {
      this.selectedEmployee = state.employeeEmail;
    }
  }

  ngOnInit() {
    this.loadActiveEmployees();
  }

  loadActiveEmployees() {
    this.loading = true;
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.activeEmployees = employees.filter(emp => emp.status === 'Active');
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading employees: ' + error.message;
        this.loading = false;
      }
    });
  }

  addItem() {
    this.items.push({ name: '', quantity: 1 });
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  getWorkflowType(requestType: string): 'Request Equipment Approval' | 'Request Leave Approval' | 'Request Resources Approval' {
    switch (requestType) {
      case 'Equipment':
        return 'Request Equipment Approval';
      case 'Leave':
        return 'Request Leave Approval';
      case 'Resources':
        return 'Request Resources Approval';
      default:
        return 'Request Equipment Approval';
    }
  }

  save() {
    if (!this.requestType || !this.selectedEmployee || this.items.some(item => !item.name)) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const employee = this.activeEmployees.find(emp => emp.email === this.selectedEmployee);
    
    if (!employee) {
      this.error = 'Selected employee not found';
      return;
    }

    const requestData: CreateRequestDto = {
      type: this.requestType,
      employeeId: employee.id,
      employeeEmail: employee.email,
      items: this.items.map(item => `${item.name} (${item.quantity})`).join(', '),
      status: 'Pending'
    };

    this.loading = true;
    this.requestService.createRequest(requestData).subscribe({
      next: (response) => {
        // Create workflow for the request
        let currentStep = '';
        
        // Set appropriate current step based on request type
        if (this.requestType === 'Department Transfer') {
          currentStep = `Transfer from ${employee.department} to ${this.newDepartment}`;
        } else if (this.requestType === 'Equipment' || this.requestType === 'Resources') {
          currentStep = `Requesting ${this.requestType} Approval`;
        } else if (this.requestType === 'Leave') {
          currentStep = 'Leave Request Approval';
        } else {
          currentStep = `${this.requestType} Process`;
        }

        this.workflowService.createWorkflow({
          employee_id: employee.id,
          request_id: response.id,
          current_step: currentStep,
          status: 'Pending',
          request_type: this.requestType,
          request_items: requestData.items
        }).subscribe({
          next: () => {
            this.router.navigate(['/requests']);
          },
          error: (error) => {
            this.error = 'Error creating workflow: ' + error.message;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        this.error = 'Error saving request: ' + error.message;
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/requests']);
  }
}