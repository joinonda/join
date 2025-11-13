import { Routes } from '@angular/router';
import { Contacts } from './contacts/contacts';
import { Board } from './board/board';
import { Addtask } from './add-task/add-task';
import { Summary } from './summary/summary';
import { LoginComponent } from './auth/login/login';
import { SignupComponent } from './auth/signup/signup';
import { Legalnotice } from './shared/legalnotice/legalnotice';
import { Privacy } from './shared/privacy/privacy';
import { Help } from './shared/header/help/help';
import { StartAnimation } from './start-animation/start-animation';
import { GreetingScreen } from './greeting-screen/greeting-screen';

export const routes: Routes = [
  { path: '', component: StartAnimation },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'greeting', component: GreetingScreen },
  { path: 'summary', component: Summary },
  { path: 'contact', component: Contacts },
  { path: 'board', component: Board },
  { path: 'add-task', component: Addtask },
  { path: 'legal-notice', component: Legalnotice },
  { path: 'privacy-policy', component: Privacy },
  { path: 'help', component: Help },
];
