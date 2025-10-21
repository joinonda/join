import { Routes } from '@angular/router';
import { Contacts } from './contacts/contacts';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'contact', component: Contacts }
];
