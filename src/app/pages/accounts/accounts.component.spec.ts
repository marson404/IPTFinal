import { Component } from '@angular/core';

interface Account {
  title: 'Mr' | 'Mrs';
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-accounts',
  standalone: true,
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent {
  accounts: Account[] = [
    {
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active'
    },
    {
      title: 'Mrs',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'Inactive'
    },
    // add more mock accounts as needed
  ];

  editAccount(account: Account) {
    alert(`Edit clicked for ${account.firstName} ${account.lastName}`);
  }
}
