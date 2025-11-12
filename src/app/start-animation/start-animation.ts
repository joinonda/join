import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../auth/login/login';

@Component({
  selector: 'app-start-animation',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './start-animation.html',
  styleUrl: './start-animation.scss'
})
export class StartAnimation implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login'], { skipLocationChange: false });
    }, 1800);
  }
}
