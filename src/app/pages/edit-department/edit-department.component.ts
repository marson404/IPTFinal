import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DepartmentService, Department } from '../../services/department.service';

@Component({
  selector: 'app-edit-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-department.component.html',
  styleUrls: ['./edit-department.component.css']
})
export class EditDepartmentComponent implements OnInit {
  department: Department = {
    name: '',
    description: '',
    employeeCount: 0
  };
  
  loading = false;
  error = '';
  formSubmitted = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loading = true;
      this.error = '';
      this.departmentService.getById(id).subscribe({
        next: (department) => {
          this.department = department;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to load department';
          this.loading = false;
          if (error.status === 404) {
            this.router.navigate(['/departments']);
          }
        }
      });
    } else {
      this.router.navigate(['/departments']);
    }
  }

  save() {
    this.formSubmitted = true;
    this.error = '';

    if (!this.department.name?.trim() || !this.department.description?.trim()) {
      this.error = 'Name and description are required';
      return;
    }

    this.loading = true;
    this.departmentService.update(this.department.id!, {
      name: this.department.name.trim(),
      description: this.department.description.trim()
    }).subscribe({
      next: () => {
        this.router.navigate(['/departments']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to update department';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/departments']);
  }
}
