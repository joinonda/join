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
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: StartAnimation },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'greeting', component: GreetingScreen, canActivate: [authGuard] },
  { path: 'summary', component: Summary, canActivate: [authGuard] },
  { path: 'contact', component: Contacts, canActivate: [authGuard] },
  { path: 'board', component: Board, canActivate: [authGuard] },
  { path: 'add-task', component: Addtask, canActivate: [authGuard] },
  { path: 'legal-notice', component: Legalnotice },
  { path: 'privacy-policy', component: Privacy },
  { path: 'help', component: Help },
];
