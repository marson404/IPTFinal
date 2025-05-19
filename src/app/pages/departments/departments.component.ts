import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DepartmentService, Department } from '../../services/department.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css']
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private departmentService: DepartmentService
  ) {
    console.log('DepartmentsComponent initialized');
  }

  ngOnInit(): void {
    console.log('DepartmentsComponent ngOnInit');
    this.loadDepartments();
  }

  loadDepartments() {
    console.log('Loading departments...');
    this.loading = true;
    this.error = '';
    
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        console.log('Departments loaded successfully:', departments);
        this.departments = departments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.error = error.message || 'Error loading departments';
        this.loading = false;
        
        // If we get a 404, the server might not be running
        if (error.status === 404) {
          this.error = 'Could not connect to the server. Please ensure the backend server is running.';
        }
      }
    });
  }

  editDepartment(id: number) {
    console.log('Navigating to edit department:', id);
    this.router.navigate(['/departments/edit', id]);
  }

  addDepartment() {
    console.log('Navigating to add department');
    this.router.navigate(['/departments/add']);
  }

  deleteDepartment(id: number) {
    console.log('Attempting to delete department:', id);
    if (confirm('Are you sure you want to delete this department?')) {
      this.loading = true;
      this.error = '';
      
      this.departmentService.delete(id).subscribe({
        next: () => {
          console.log('Department deleted successfully:', id);
          this.loadDepartments();
        },
        error: (error) => {
          console.error('Error deleting department:', error);
          this.error = error.message || 'Error deleting department';
          this.loading = false;
          
          // If we get a 404, the server might not be running
          if (error.status === 404) {
            this.error = 'Could not connect to the server. Please ensure the backend server is running.';
          }
        }
      });
    }
  }
}
