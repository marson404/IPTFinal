import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface OnboardingStep {
  step_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_department: string;
  due_date?: string;
  comments?: string;
}

export interface Workflow {
  id: number;
  request_id: number;
  employee_id: number;
  current_step: string;
  status: string;
  created_at: string;
  updated_at: string;
  request_type: string;
  request_items: string;
  onboarding_steps?: OnboardingStep[];
  required_documents?: string[];
  orientation_date?: string;
  department_orientation_completed?: boolean;
  it_setup_completed?: boolean;
  hr_documentation_completed?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private apiUrl = `${environment.apiUrl}/api/workflows`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error.message || error.error.error || error.message;
    }
    console.error('Workflow service error:', error);
    return throwError(() => errorMessage);
  }

  getWorkflowsByEmployeeId(employeeId: number): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(`${this.apiUrl}/employee/${employeeId}`).pipe(
      tap(workflows => console.log('Fetched workflows:', workflows)),
      catchError(this.handleError)
    );
  }

  getWorkflowById(id: number): Observable<Workflow> {
    return this.http.get<Workflow>(`${this.apiUrl}/${id}`).pipe(
      tap(workflow => console.log('Fetched workflow:', workflow)),
      catchError(this.handleError)
    );
  }

  createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Observable<Workflow> {
    return this.http.post<Workflow>(this.apiUrl, workflow).pipe(
      tap(newWorkflow => console.log('Created workflow:', newWorkflow)),
      catchError(this.handleError)
    );
  }

  updateWorkflow(id: number, workflow: Partial<Workflow>): Observable<Workflow> {
    return this.http.put<Workflow>(`${this.apiUrl}/${id}`, workflow).pipe(
      tap(updatedWorkflow => console.log('Updated workflow:', updatedWorkflow)),
      catchError(this.handleError)
    );
  }

  deleteWorkflow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('Deleted workflow:', id)),
      catchError(this.handleError)
    );
  }

  updateWorkflowStatus(id: number, status: string): Observable<Workflow> {
    return this.http.patch<Workflow>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(workflow => console.log('Updated workflow status:', workflow)),
      catchError(this.handleError)
    );
  }

  updateWorkflowStep(id: number, step: string): Observable<Workflow> {
    return this.http.patch<Workflow>(`${this.apiUrl}/${id}/step`, { current_step: step }).pipe(
      tap(workflow => console.log('Updated workflow step:', workflow)),
      catchError(this.handleError)
    );
  }

  createOnboardingWorkflow(employeeId: number, requestId: number): Observable<Workflow> {
    const defaultOnboardingSteps: OnboardingStep[] = [
      {
        step_name: 'HR Documentation',
        status: 'pending',
        assigned_department: 'HR',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 1 day from now
      },
      {
        step_name: 'IT Setup',
        status: 'pending',
        assigned_department: 'IT',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
      },
      {
        step_name: 'Department Orientation',
        status: 'pending',
        assigned_department: 'Department Head',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      }
    ];

    const workflow = {
      employee_id: employeeId,
      request_id: requestId,
      current_step: 'HR Documentation',
      status: 'pending',
      request_type: 'Newly Hired',
      request_items: JSON.stringify({
        required_documents: [
          'Government ID',
          'SSS/TIN',
          'Employment Contract',
          'Confidentiality Agreement'
        ]
      }),
      onboarding_steps: defaultOnboardingSteps,
      orientation_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      department_orientation_completed: false,
      it_setup_completed: false,
      hr_documentation_completed: false
    };

    return this.createWorkflow(workflow);
  }
} 