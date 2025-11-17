import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../auth/login/login';

/**
 * Start animation component displaying an initial animation before redirecting to login.
 * Automatically navigates to the login page after 1.8 seconds.
 */
@Component({
  selector: 'app-start-animation',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './start-animation.html',
  styleUrl: './start-animation.scss'
})
export class StartAnimation implements OnInit {
  /** Router instance for navigation to login page. */
  private router = inject(Router);

  /**
   * Initializes the component and schedules navigation to login page after 1.8 seconds.
   */
  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login'], { skipLocationChange: false });
    }, 1800);
  }
}
