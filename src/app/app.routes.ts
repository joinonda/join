import { Routes } from '@angular/router';
import { Contacts } from './contacts/contacts';
import { Board } from './board/board';
import { Addtask } from './add-task/add-task';
import { Summary } from './summary/summary';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: '/contact', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'summary', component: Summary },
  { path: 'contact', component: Contacts },
  { path: 'board', component: Board },
  { path: 'add-task', component: Addtask },
];
