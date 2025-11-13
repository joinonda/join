import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { Task } from '../interfaces/task-interface';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  get todoCount(): number {
    return this.dataService.todo.length;
  }

  get inProgressCount(): number {
    return this.dataService.inProgress.length;
  }

  get awaitingFeedbackCount(): number {
    return this.dataService.awaitFeedback.length;
  }

  get doneCount(): number {
    return this.dataService.done.length;
  }

  get allTasksCount(): number {
    return (
      this.dataService.todo.length +
      this.dataService.inProgress.length +
      this.dataService.awaitFeedback.length +
      this.dataService.done.length
    );
  }

  private get openTasks(): Task[] {
    return [
      ...this.dataService.todo,
      ...this.dataService.inProgress,
      ...this.dataService.awaitFeedback,
    ];
  }

  get urgentCount(): number {
    return this.openTasks.filter((t) => t.priority === 'urgent').length;
  }

  get nextDeadline(): Date | null {
    const now = new Date();

    const upcoming = this.openTasks
      .filter((t) => !!t.dueDate)
      .map((t) => new Date(t.dueDate))
      .filter((d) => !isNaN(d.getTime()) && d >= now)
      .sort((a, b) => a.getTime() - b.getTime());

    return upcoming[0] ?? null;
  }

  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }

  get userName(): string {
    if (this.authService.isGuest()) {
      return 'Guest User';
    }

    const user = this.authService.getCurrentUser();
    if (user?.displayName) {
      return user.displayName;
    }

    if (user?.email) {
      return user.email.split('@')[0];
    }

    return 'Guest User';
  }

  ngOnInit(): void {
    const isDesktop = window.innerWidth > 1024;
    
    if (!isDesktop) {
      const greetingShown = sessionStorage.getItem('greetingShown');
      const fromGreeting = this.route.snapshot.queryParams['fromGreeting'];
      
      if (!greetingShown && !fromGreeting) {
        this.router.navigate(['/greeting']);
      } else if (fromGreeting) {
        sessionStorage.setItem('greetingShown', 'true');
        this.router.navigate(['/summary'], { replaceUrl: true });
      }
    } else if (this.route.snapshot.queryParams['fromGreeting']) {
      this.router.navigate(['/summary'], { replaceUrl: true });
    }
  }
}
