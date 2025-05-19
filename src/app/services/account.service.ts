import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export type Title = 'Mr' | 'Mrs' | 'Ms' | 'Dr';
export type AccountStatus = 'Active' | 'Inactive';

export interface Account {
    id: number;
    title: Title;
    first_name: string;
    last_name: string;
    email: string;
    role: 'Admin' | 'User';
    status: AccountStatus;
    password?: string;
}

export interface CreateAccountDto {
    title: Title;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: 'Admin' | 'User';
    status: AccountStatus;
}

export interface UpdateAccountDto {
    title?: Title;
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    role?: 'Admin' | 'User';
    status?: AccountStatus;
}

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    private apiUrl = `${environment.apiUrl}/accounts`;

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = error.error.message || error.error.error || error.message;
        }
        console.error('Account service error:', error);
        return throwError(() => errorMessage);
    }

    // Get all accounts
    getAll(): Observable<Account[]> {
        return this.http.get<Account[]>(this.apiUrl).pipe(
            catchError(this.handleError)
        );
    }

    // Get account by ID
    getById(id: number): Observable<Account> {
        return this.http.get<Account>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Create new account
    create(account: CreateAccountDto): Observable<Account> {
        return this.http.post<Account>(this.apiUrl, account).pipe(
            catchError(this.handleError)
        );
    }

    // Update account
    update(id: number, account: UpdateAccountDto): Observable<Account> {
        return this.http.put<Account>(`${this.apiUrl}/${id}`, account).pipe(
            catchError(this.handleError)
        );
    }

    // Delete account
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    // Get all active users
    getAllActiveUsers(): Observable<Account[]> {
        return this.http.get<Account[]>(`${this.apiUrl}?status=Active`).pipe(
            catchError(this.handleError)
        );
    }

    // These are the new method names, kept for backward compatibility
    getAccounts(): Observable<Account[]> {
        return this.getAll();
    }

    getAccount(id: number): Observable<Account> {
        return this.getById(id);
    }

    createAccount(account: CreateAccountDto): Observable<Account> {
        return this.create(account);
    }

    updateAccount(id: number, account: UpdateAccountDto): Observable<Account> {
        return this.update(id, account);
    }

    deleteAccount(id: number): Observable<void> {
        return this.delete(id);
    }
} 