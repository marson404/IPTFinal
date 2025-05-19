import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentService, Department } from '../../services/department.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.css']
})
export class AddDepartmentComponent {
  department: Pick<Department, 'name' | 'description'> = {
    name: '',
    description: ''
  };
  
  loading = false;
  error = '';
  formSubmitted = false;

  constructor(
    private router: Router,
    private departmentService: DepartmentService
  ) {}

  validateDepartment(): string | null {
    if (!this.department.name || !this.department.description) {
      return 'Name and description are required';
    }

    if (this.department.name.trim().length < 2) {
      return 'Department name must be at least 2 characters long';
    }

    if (this.department.description.trim().length < 10) {
      return 'Description must be at least 10 characters long';
    }

    return null;
  }

  onSubmit(form: NgForm) {
    this.formSubmitted = true;
    this.error = '';
    
    if (!form.valid) {
      return;
    }

    const validationError = this.validateDepartment();
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.loading = true;
    const departmentData = {
      name: this.department.name.trim(),
      description: this.department.description.trim()
    };

    console.log('Submitting department:', departmentData);

    this.departmentService.create(departmentData)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          console.log('Department created successfully');
          this.router.navigate(['/departments']);
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.error = error.message || 'Failed to create department. Please try again.';
        }
      });
  }

  cancel() {
    this.router.navigate(['/departments']);
  }
}
