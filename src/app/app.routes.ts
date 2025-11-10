import { Routes } from '@angular/router';
import { Contacts } from './contacts/contacts';
import { Board } from './board/board';
import { Addtask } from './add-task/add-task';
import { Summary } from './summary/summary';
// import { Login } from './auth/login/login';
// import { Signup } from './auth/signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: '/contact', pathMatch: 'full' },
  //   { path: 'login', component: Login },
  //   { path: 'signup', component: Signup },
  { path: 'summary', component: Summary },
  { path: 'contact', component: Contacts },
  { path: 'board', component: Board },
  { path: 'add-task', component: Addtask },
];
