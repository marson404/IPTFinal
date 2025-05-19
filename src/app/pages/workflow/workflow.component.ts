import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { WorkflowService, Workflow } from '../../services/workflow.service';

@Component({
  selector: 'app-workflow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit {
  employeeName: string = '';
  employeeId: number = 0;
  error: string = '';
  loading: boolean = false;
  workflows: Workflow[] = [];
  statusOptions = ['Pending', 'Approved', 'Rejected'];
  @Output() statusUpdated = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private workflowService: WorkflowService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.employeeName = state['employeeName'];
      this.employeeId = state['employeeId'];
    }
  }

  ngOnInit() {
      this.loadWorkflows();
  }

  loadWorkflows() {
    this.loading = true;
    this.workflowService.getWorkflowsByEmployeeId(this.employeeId).subscribe({
      next: (data: Workflow[]) => {
        this.workflows = data;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  updateStatus(workflow: Workflow) {
    this.workflowService.updateWorkflowStatus(workflow.id, workflow.status).subscribe({
      next: () => {
        // Workflow updated successfully
        this.loadWorkflows(); // Reload the workflows to get the latest data
        this.statusUpdated.emit();
      },
      error: (error: Error) => {
        this.error = error.message;
        // Revert the status change in the UI
        this.loadWorkflows();
      }
    });
  }

  goBack() {
    this.router.navigate(['/employees']);
  }

  getRequestItems(requestItemsJson: string) {
    try {
      return JSON.parse(requestItemsJson);
    } catch (e) {
      console.error('Error parsing request items:', e);
      return null;
    }
  }
}
