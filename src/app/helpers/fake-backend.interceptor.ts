import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';
import { Account } from '../models/account.model';
import { Employee } from '../services/employee.service';
import { Request } from '../services/request.service';
import { Workflow } from '../services/workflow.service';

// array in local storage for accounts and employees
const accountsKey = 'accounts';
const employeesKey = 'employees-data';
const requestsKey = 'requests-data';
const workflowsKey = 'workflows-data';
const departmentsKey = 'departments';

let accounts: Account[] = JSON.parse(localStorage.getItem(accountsKey) || '[]') || [];
let employees: Employee[] = JSON.parse(localStorage.getItem(employeesKey) || '[]') || [];
let workflows: Workflow[] = JSON.parse(localStorage.getItem(workflowsKey) || '[]') || [];

// if no accounts exist, add some default ones
if (accounts.length === 0) {
    accounts = [
        {
            id: 1,
            title: 'Mr',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Admin',
            status: 'Active'
        },
        {
            id: 2,
            title: 'Mrs',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: 'User',
            status: 'Inactive'
        }
    ];
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

// if no employees exist, add some default ones
if (employees.length === 0) {
    employees = [
        {
            id: 1,
            email: 'john.doe@example.com',
            position: 'Software Engineer',
            department: 'IT',
            hire_date: '2022-03-15',
            status: 'Active'
        },
        {
            id: 2,
            email: 'jane.smith@example.com',
            position: 'HR Manager',
            department: 'Human Resources',
            hire_date: '2021-06-20',
            status: 'Active'
        },
        {
            id: 3,
            email: 'mike.wilson@example.com',
            position: 'Project Manager',
            department: 'Operations',
            hire_date: '2023-01-10',
            status: 'Active'
        }
    ];
    localStorage.setItem(employeesKey, JSON.stringify(employees));
}

// Initialize some default workflows if none exist
if (workflows.length === 0) {
    workflows = [
        {
            id: 1,
            request_id: 1,
            employee_id: 1,
            current_step: 'Department Head Review',
            status: 'Pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            request_type: 'Leave',
            request_items: 'Annual Leave - 5 days'
        },
        {
            id: 2,
            request_id: 2,
            employee_id: 1,
            current_step: 'HR Review',
            status: 'Approved',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            request_type: 'Equipment',
            request_items: 'Laptop, Monitor'
        }
    ];
    localStorage.setItem(workflowsKey, JSON.stringify(workflows));
}

// helper functions
function getWorkflowsData(): Workflow[] {
  return JSON.parse(localStorage.getItem(workflowsKey) || '[]');
}

interface Department {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // Extract the path part of the URL (remove origin if present)
        const path = url.replace(/^https?:\/\/[^\/]+/, '').replace(/^\//, '');

        return handleRoute();

        function handleRoute() {
            switch (true) {
                case url.match(/\/?api\/workflows\/employee\/\d+$/) && method === 'GET':
                    return getWorkflowsByEmployeeId();
                case url.match(/\/?api\/workflows\/\d+$/) && method === 'GET':
                    return getWorkflowById();
                case url.endsWith('/api/workflows') || url.endsWith('/workflows') && method === 'POST':
                    return createWorkflow();
                case url.match(/\/?api\/workflows\/\d+$/) && method === 'PUT':
                    return updateWorkflow();
                case url.match(/\/?api\/workflows\/\d+$/) && method === 'DELETE':
                    return deleteWorkflow();
                case url.match(/\/?api\/workflows\/\d+\/status$/) && method === 'PATCH':
                    return updateWorkflowStatus();
                case path.endsWith('api/accounts') && method === 'GET':
                    return getAccounts();
                case path.match(/api\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case path.endsWith('api/accounts') && method === 'POST':
                    return createAccount();
                case path.match(/api\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case path.match(/api\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                case path.endsWith('api/employees') && method === 'GET':
                    return getEmployees();
                case path.match(/api\/employees\/\d+$/) && method === 'GET':
                    return getEmployeeById();
                case path.endsWith('api/employees') && method === 'POST':
                    return createEmployee();
                case path.match(/api\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee();
                case path.match(/api\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee();
                case path.endsWith('api/departments') && method === 'GET':
                    return getDepartments();
                case path.match(/api\/departments\/\d+$/) && method === 'GET':
                    return getDepartmentById();
                case path.endsWith('api/departments') && method === 'POST':
                    return createDepartment();
                case path.match(/api\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case path.match(/api\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                case path.endsWith('api/requests') && method === 'GET':
                    return getRequests();
                case path.match(/api\/requests\/\d+$/) && method === 'GET':
                    return getRequestById();
                case path.match(/api\/requests\/employee\/\d+$/) && method === 'GET':
                    return getRequestsByEmployeeId();
                case path.endsWith('api/requests') && method === 'POST':
                    return createRequest();
                case path.match(/api\/requests\/\d+$/) && method === 'PUT':
                    return updateRequest();
                case path.match(/api\/requests\/\d+$/) && method === 'DELETE':
                    return deleteRequest();
                default:
                    return next.handle(request);
            }
        }

        // Account route functions
        function getAccounts() {
            return ok(accounts);
        }

        function getAccountById() {
            const account = accounts.find(x => x.id === idFromUrl());
            return ok(basicDetails(account));
        }

        function createAccount() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                return error(`Account with email ${account.email} already exists`);
            }

            account.id = accounts.length ? Math.max(...accounts.map(x => x.id!)) + 1 : 1;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());

            if (!account) {
                return error('Account not found');
            }

            if (!params.id) {
                params.id = idFromUrl();
            }

            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function deleteAccount() {
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        // Employee route functions
        function getEmployees() {
            return ok(employees);
        }

        function getEmployeeById() {
            const employee = employees.find(x => x.id === idFromUrl());
            if (!employee) return error('Employee not found');
            return ok(employee);
        }

        function createEmployee() {
            const employee = body;

            if (employees.find(x => x.email === employee.email)) {
                return error(`Employee with email ${employee.email} already exists`);
            }

            employee.id = employees.length ? Math.max(...employees.map(x => x.id)) + 1 : 1;
            employees.push(employee);
            localStorage.setItem(employeesKey, JSON.stringify(employees));

            return ok(employee);
        }

        function updateEmployee() {
            let params = body;
            let employee = employees.find(x => x.id === idFromUrl());

            if (!employee) {
                return error('Employee not found');
            }

            Object.assign(employee, params);
            localStorage.setItem(employeesKey, JSON.stringify(employees));

            return ok();
        }

        function deleteEmployee() {
            employees = employees.filter(x => x.id !== idFromUrl());
            localStorage.setItem(employeesKey, JSON.stringify(employees));
            return ok();
        }

        // Department route functions
        function getDepartments() {
            return ok(getDepartmentsData());
        }

        function getDepartmentById() {
            const department = getDepartmentsData().find((x: Department) => x.id === idFromUrl());
            return ok(department);
        }

        function createDepartment() {
            const departments = getDepartmentsData();
            const department: Department = {
                id: departments.length ? Math.max(...departments.map((x: Department) => x.id)) + 1 : 1,
                name: body.name,
                description: body.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            departments.push(department);
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            return ok(department);
        }

        function updateDepartment() {
            let departments = getDepartmentsData();
            const departmentIndex = departments.findIndex((x: Department) => x.id === idFromUrl());
            departments[departmentIndex] = {
                ...departments[departmentIndex],
                ...body,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            return ok(departments[departmentIndex]);
        }

        function deleteDepartment() {
            let departments = getDepartmentsData();
            departments = departments.filter((x: Department) => x.id !== idFromUrl());
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            return ok();
        }

        // Request helper functions
        function getRequests() {
            const requests = getRequestsData();
            return ok(requests);
        }

        function getRequestById() {
            const request = getRequestsData().find((x: Request) => x.id === idFromUrl());
            return ok(request);
        }

        function getRequestsByEmployeeId() {
            const employeeId = parseInt(path.split('/').pop() || '0', 10);
            const requests = getRequestsData().filter((x: Request) => x.employeeId === employeeId);
            return ok(requests);
        }

        function createRequest() {
            const requests = getRequestsData();
            const request: Request = {
                id: requests.length ? Math.max(...requests.map((x: Request) => x.id)) + 1 : 1,
                type: body.type,
                employeeId: body.employeeId,
                employeeEmail: body.employeeEmail,
                items: body.items,
                status: 'Pending' as const,
                submissionDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            requests.push(request);
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            return ok(request);
        }

        function updateRequest() {
            let requests = getRequestsData();
            const id = idFromUrl();
            const index = requests.findIndex((x: Request) => x.id === id);
            requests[index] = {
                ...requests[index],
                ...body,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            return ok(requests[index]);
        }

        function deleteRequest() {
            let requests = getRequestsData();
            requests = requests.filter((x: Request) => x.id !== idFromUrl());
            localStorage.setItem(requestsKey, JSON.stringify(requests));
            return ok();
        }

        // Workflow helper functions
        function getWorkflowsByEmployeeId() {
            const urlParts = url.split('/');
            const employeeId = parseInt(urlParts[urlParts.length - 1]);
            
            if (isNaN(employeeId)) {
                return error('Invalid employee ID');
            }

            const employeeWorkflows = workflows.filter(w => w.employee_id === employeeId);
            if (!employeeWorkflows.length) {
                return ok([]); // Return empty array if no workflows found
            }
            return ok(employeeWorkflows);
        }

        function getWorkflowById() {
            const workflow = workflows.find(w => w.id === idFromUrl());
            return ok(workflow);
        }

        function createWorkflow() {
            const workflow = body;
            workflow.id = workflows.length ? Math.max(...workflows.map(x => x.id)) + 1 : 1;
            workflow.created_at = new Date().toISOString();
            workflow.updated_at = new Date().toISOString();
            
            workflows.push(workflow);
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));
            
            return ok(workflow);
        }

        function updateWorkflow() {
            let params = body;
            let workflow = workflows.find(x => x.id === idFromUrl());

            if (!workflow) {
                return error('Workflow not found');
            }

            workflow = { ...workflow, ...params, updated_at: new Date().toISOString() };
            workflows = workflows.map(w => w.id === idFromUrl() ? workflow : w);
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));

            return ok(workflow);
        }

        function updateWorkflowStatus() {
            const id = parseInt(url.split('/')[url.split('/').length - 2]);
            const workflow = workflows.find(x => x.id === id);

            if (!workflow) {
                return error('Workflow not found');
            }

            const updatedWorkflow = {
                ...workflow,
                status: body.status,
                updated_at: new Date().toISOString()
            };

            workflows = workflows.map(w => w.id === id ? updatedWorkflow : w);
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));

            return ok(updatedWorkflow);
        }

        function deleteWorkflow() {
            workflows = workflows.filter(x => x.id !== idFromUrl());
            localStorage.setItem(workflowsKey, JSON.stringify(workflows));
            return ok();
        }

        // Helper functions
        function ok(body?: any) {
            return of(new HttpResponse({ 
                status: 200, 
                body,
                headers: new HttpHeaders().set('Content-Type', 'application/json')
            }))
            .pipe(delay(500));
        }

        function error(message: string) {
            return throwError(() => ({ error: { message } }))
                .pipe(materialize(), delay(500), dematerialize());
        }

        function idFromUrl() {
            const urlParts = path.split('/');
            return parseInt(urlParts[urlParts.length - 1], 10);
        }

        function basicDetails(account: Account | undefined) {
            if (!account) return null;
            const { id, title, firstName, lastName, email, role, status } = account;
            return { id, title, firstName, lastName, email, role, status };
        }

        function getRequestsData(): Request[] {
            let requests = JSON.parse(localStorage.getItem(requestsKey) || '[]');
            if (!requests) {
                requests = [];
                localStorage.setItem(requestsKey, JSON.stringify(requests));
            }
            return requests;
        }

        function getDepartmentsData() {
            return JSON.parse(localStorage.getItem(departmentsKey) || '[]');
        }
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
}; 