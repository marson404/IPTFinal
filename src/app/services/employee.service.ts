import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Employee {
  id: number;
  email: string;
  position: string;
  department_id?: number;
  department: string;
  hire_date: string;
  status: 'Active' | 'Inactive';
  user_id?: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmployeeDto {
  user_id: number;
  department_id: number;
  position: string;
  hire_date: string;
  status: 'Active' | 'Inactive';
}

interface CreateEmployeeResponse {
  employee: Employee;
  request_id: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/employees`;

  constructor(private http: HttpClient) {
    console.log('Employee service initialized with URL:', this.apiUrl);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error.message || error.error.error || error.message;
    }
    console.error('Employee service error:', error);
    return throwError(() => errorMessage);
  }

  getAllEmployees(): Observable<Employee[]> {
    console.log('Fetching all employees from:', this.apiUrl);
    return this.http.get<Employee[]>(this.apiUrl).pipe(
      tap(employees => console.log('Fetched employees:', employees)),
      catchError(this.handleError)
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching employee by id from:', url);
    return this.http.get<Employee>(url).pipe(
      tap(employee => console.log('Fetched employee:', employee)),
      catchError(this.handleError)
    );
  }

  createEmployee(employee: CreateEmployeeDto): Observable<Employee> {
    console.log('Creating employee at:', this.apiUrl);
    console.log('Employee data:', employee);
    return this.http.post<CreateEmployeeResponse>(this.apiUrl, employee).pipe(
      map(response => response.employee),
      tap(newEmployee => console.log('Created employee:', newEmployee)),
      catchError(this.handleError)
    );
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Updating employee at:', url);
    console.log('Update data:', employee);
    return this.http.put<Employee>(url, employee).pipe(
      tap(updatedEmployee => console.log('Updated employee:', updatedEmployee)),
      catchError(this.handleError)
    );
  }

  deleteEmployee(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting employee at:', url);
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('Deleted employee:', id)),
      catchError(this.handleError)
    );
  }
} 