import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestService, Request, CreateRequestDto } from '../../services/request.service';
import { EmployeeService, Employee } from '../../services/employee.service';
import { WorkflowService } from '../../services/workflow.service';

@Component({
  selector: 'app-edit-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css'],
})
export class EditRequestComponent implements OnInit {
  request = {
    type: '' as 'Leave' | 'Equipment' | 'Resources' | 'Onboarding' | 'Department Transfer',
    employee: '',
    items: [{ name: '', quantity: 1 }],
  };
  loading = false;
  error = '';
  activeEmployees: Employee[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private employeeService: EmployeeService,
    private workflowService: WorkflowService
  ) {}

  ngOnInit() {
    this.loadActiveEmployees();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadRequest(id);
    }
  }

  loadActiveEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.activeEmployees = employees.filter(emp => emp.status === 'Active');
      },
      error: (error) => {
        this.error = 'Error loading employees: ' + error.message;
      }
    });
  }

  loadRequest(id: number) {
    this.loading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (request) => {
        this.request = {
          type: request.type,
          employee: request.employee_email,
          items: request.items.split(',').map(item => {
            const match = item.match(/(.+)\s*\((\d+)\)/);
            return {
              name: match ? match[1].trim() : item.trim(),
              quantity: match ? parseInt(match[2]) : 1
            };
          })
        };
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading request: ' + error.message;
        this.loading = false;
      }
    });
  }

  addItem() {
    this.request.items.push({ name: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.request.items.splice(index, 1);
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
    if (!this.request.type || !this.request.employee || this.request.items.some(item => !item.name)) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const id = this.route.snapshot.params['id'];
    const employee = this.activeEmployees.find(emp => emp.email === this.request.employee);
    
    if (!employee) {
      this.error = 'Selected employee not found';
      return;
    }

    const requestData: CreateRequestDto = {
      type: this.request.type,
      employeeId: employee.id,
      employeeEmail: this.request.employee,
      items: this.request.items.map(item => `${item.name} (${item.quantity})`).join(', '),
      status: 'Pending' as const
    };

    const saveOperation = id 
      ? this.requestService.updateRequest(id, {
          type: requestData.type,
          employee_id: requestData.employeeId,
          employee_email: requestData.employeeEmail,
          items: requestData.items,
          status: requestData.status
        })
      : this.requestService.createRequest(requestData);

    saveOperation.subscribe({
      next: (response) => {
        // Get existing workflow for this request
        this.workflowService.getWorkflowsByEmployeeId(employee.id).subscribe({
          next: (workflows) => {
            const existingWorkflow = workflows.find(w => w.request_id === response.id);
            
            let currentStep = '';
            if (this.request.type === 'Department Transfer') {
              currentStep = `Transfer from ${employee.department} to new department`;
            } else if (this.request.type === 'Equipment' || this.request.type === 'Resources') {
              currentStep = `Requesting ${this.request.type} Approval`;
            } else if (this.request.type === 'Leave') {
              currentStep = 'Leave Request Approval';
            } else {
              currentStep = `${this.request.type} Process`;
            }

            const workflowData = {
              employee_id: employee.id,
              request_id: response.id,
              current_step: currentStep,
              status: 'Pending',
              request_type: this.request.type,
              request_items: requestData.items
            };

            if (existingWorkflow) {
              // Update existing workflow
              this.workflowService.updateWorkflow(existingWorkflow.id, workflowData).subscribe({
                next: () => {
                  this.router.navigate(['/requests']);
                },
                error: (error) => {
                  this.error = 'Error updating workflow: ' + error.message;
                }
              });
            } else {
              // Create new workflow if none exists
              this.workflowService.createWorkflow(workflowData).subscribe({
                next: () => {
                  this.router.navigate(['/requests']);
                },
                error: (error) => {
                  this.error = 'Error creating workflow: ' + error.message;
                }
              });
            }
          },
          error: (error) => {
            this.error = 'Error checking existing workflows: ' + error.message;
          }
        });
      },
      error: (error) => {
        this.error = 'Error saving request: ' + error.message;
      }
    });
  }

  cancel() {
    this.router.navigate(['/requests']);
  }
}
