import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Request {
  id: number;
  type: 'Leave' | 'Equipment' | 'Resources' | 'Onboarding' | 'Department Transfer';
  employee_id: number;
  employee_email: string;
  items: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submission_date: string;
  last_updated: string;
}

export interface CreateRequestDto {
  type: Request['type'];
  employeeId: number;
  employeeEmail: string;
  items: string;
  status: Request['status'];
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `${environment.apiUrl}/api/requests`;

  constructor(private http: HttpClient) { }

  getAllRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(this.apiUrl);
  }

  getRequestById(id: number): Observable<Request> {
    return this.http.get<Request>(`${this.apiUrl}/${id}`);
  }

  getRequestsByEmployeeId(employeeId: number): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/employee/${employeeId}`);
  }

  createRequest(request: CreateRequestDto): Observable<Request> {
    return this.http.post<Request>(this.apiUrl, request);
  }

  updateRequest(id: number, request: Partial<Request>): Observable<Request> {
    return this.http.put<Request>(`${this.apiUrl}/${id}`, request);
  }

  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 