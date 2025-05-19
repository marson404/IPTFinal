import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService, Request } from '../../services/request.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {
  requests: Request[] = [];
  loading = false;
  error = '';
  employeeId: number | null = null;
  employeeEmail: string | null = null;

  constructor(
    private router: Router,
    private requestService: RequestService
  ) {
    // Get employee info from navigation state if available
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      employeeId: number;
      employeeEmail: string;
    };

    if (state?.employeeId && state?.employeeEmail) {
      this.employeeId = state.employeeId;
      this.employeeEmail = state.employeeEmail;
    }
  }

  formatDetails(request: Request): string {
    if (request.type === 'Department Transfer') {
      // For department transfer, just show "Department Transfer Request"
      return 'Department Transfer Request';
    } else if (request.type === 'Onboarding') {
      return 'Newly hire';
    } else {
      // For other types, show the items as is
      return request.items;
    }
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;

    // If employeeId is set, load only that employee's requests
    if (this.employeeId) {
      this.requestService.getRequestsByEmployeeId(this.employeeId).subscribe({
        next: (requests) => {
          this.requests = requests.filter(request => 
            ['Resources', 'Equipment', 'Leave'].includes(request.type)
          );
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading requests: ' + error.message;
          this.loading = false;
        }
      });
    } else {
      // Load all requests
      this.requestService.getAllRequests().subscribe({
        next: (requests) => {
          this.requests = requests.filter(request => 
            ['Resources', 'Equipment', 'Leave'].includes(request.type)
          );
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error loading requests: ' + error.message;
          this.loading = false;
        }
      });
    }
  }

  editRequest(id: number) {
    this.router.navigate(['/requests/edit', id]);
  }

  addRequest() {
    if (this.employeeId && this.employeeEmail) {
      // If viewing employee-specific requests, pass the employee info
      this.router.navigate(['/requests/add'], {
        state: {
          employeeId: this.employeeId,
          employeeEmail: this.employeeEmail
        }
      });
    } else {
      this.router.navigate(['/requests/add']);
    }
  }

  viewAllRequests() {
    // Clear the current state and reload all requests
    this.employeeId = null;
    this.employeeEmail = null;
    
    // Navigate to requests page with skipLocationChange to avoid URL change
    this.router.navigate(['/requests'], {
      skipLocationChange: false,
      replaceUrl: true
    }).then(() => {
      // Force reload the component
      this.loadRequests();
    });
  }
}
