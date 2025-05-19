import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestService, CreateRequestDto } from '../../services/request.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h2>New Request</h2>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form #requestForm="ngForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="type">Request Type *</label>
            <select
              id="type"
              name="type"
              [(ngModel)]="request.type"
              required
              #typeField="ngModel"
              class="form-control"
              [class.is-invalid]="typeField.invalid && typeField.touched"
            >
              <option value="">Select type</option>
              <option value="Leave">Leave</option>
              <option value="Equipment">Equipment</option>
              <option value="Resources">Resources</option>
            </select>
            <div class="invalid-feedback" *ngIf="typeField.invalid && typeField.touched">
              Request type is required
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="items">Details *</label>
            <textarea
              id="items"
              name="items"
              [(ngModel)]="request.items"
              required
              #itemsField="ngModel"
              class="form-control"
              [class.is-invalid]="itemsField.invalid && itemsField.touched"
              rows="4"
            ></textarea>
            <div class="invalid-feedback" *ngIf="itemsField.invalid && itemsField.touched">
              Request details are required
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!requestForm.form.valid">Submit Request</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-control {
      display: block;
      width: 100%;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .form-control.is-invalid {
      border-color: #dc3545;
      padding-right: calc(1.5em + 0.75rem);
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
  `]
})
export class RequestFormComponent implements OnInit {
  request: CreateRequestDto = {
    type: '' as any,
    employeeId: 0,
    employeeEmail: '',
    items: ''
  };

  error = '';

  constructor(
    private router: Router,
    private requestService: RequestService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { employeeId: number; employeeEmail: string };
    
    if (state) {
      this.request.employeeId = state.employeeId;
      this.request.employeeEmail = state.employeeEmail;
    }
  }

  ngOnInit(): void {
    if (!this.request.employeeId || !this.request.employeeEmail) {
      this.error = 'No employee information provided';
    }
  }

  onSubmit() {
    if (!this.request.employeeId || !this.request.employeeEmail) {
      this.error = 'No employee information provided';
      return;
    }

    this.requestService.createRequest(this.request).subscribe({
      next: () => {
        this.router.navigate(['/requests']);
      },
      error: (error: Error) => {
        this.error = error.message;
      }
    });
  }

  cancel() {
    this.router.navigate(['/employees']);
  }
} 