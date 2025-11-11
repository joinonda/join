import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  router = inject(Router);
  
  isAuthPage = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => 
        event.urlAfterRedirects.includes('/login') || 
        event.urlAfterRedirects.includes('/signup')
      ),
      startWith(this.router.url.includes('/login') || this.router.url.includes('/signup'))
    )
  );
}
