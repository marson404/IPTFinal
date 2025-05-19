import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Department {
  id?: number;
  name: string;
  description: string;
  employeeCount?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/api/departments`;

  constructor(private http: HttpClient) {
    console.log('Department service initialized with URL:', this.apiUrl);
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
    console.error('Department service error:', error);
    return throwError(() => errorMessage);
  }

  getAll(): Observable<Department[]> {
    console.log('Fetching all departments from:', this.apiUrl);
    return this.http.get<Department[]>(this.apiUrl).pipe(
      tap(departments => console.log('Fetched departments:', departments)),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Department> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Fetching department by id from:', url);
    return this.http.get<Department>(url).pipe(
      tap(department => console.log('Fetched department:', department)),
      catchError(this.handleError)
    );
  }

  create(department: Omit<Department, 'id' | 'created_at' | 'updated_at' | 'employeeCount'>): Observable<Department> {
    console.log('Creating department at:', this.apiUrl);
    console.log('Department data:', department);
    return this.http.post<Department>(this.apiUrl, department).pipe(
      tap(newDepartment => console.log('Created department:', newDepartment)),
      catchError(this.handleError)
    );
  }

  update(id: number, department: Partial<Department>): Observable<Department> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Updating department at:', url);
    console.log('Update data:', department);
    return this.http.put<Department>(url, department).pipe(
      tap(updatedDepartment => console.log('Updated department:', updatedDepartment)),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting department at:', url);
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('Deleted department:', id)),
      catchError(this.handleError)
    );
  }

  getDepartmentNames(): Observable<string[]> {
    console.log('Fetching department names from:', this.apiUrl);
    return this.http.get<Department[]>(this.apiUrl).pipe(
      tap(departments => console.log('Fetched departments for names:', departments)),
      map(departments => departments.map(d => d.name)),
      catchError(this.handleError)
    );
  }
} 