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

  /**
   * Gets the number of tasks in the "To Do" status
   * @returns The count of todo tasks
   */
  get todoCount(): number {
    return this.dataService.todo.length;
  }


  /**
   * Gets the number of tasks in the "In Progress" status
   * @returns The count of in-progress tasks
   */
  get inProgressCount(): number {
    return this.dataService.inProgress.length;
  }


  /**
   * Gets the number of tasks in the "Awaiting Feedback" status
   * @returns The count of tasks awaiting feedback
   */
  get awaitingFeedbackCount(): number {
    return this.dataService.awaitFeedback.length;
  }


  /**
   * Gets the number of tasks in the "Done" status
   * @returns The count of completed tasks
   */
  get doneCount(): number {
    return this.dataService.done.length;
  }


  /**
   * Gets the total number of all tasks across all statuses
   * @returns The sum of todo, in-progress, awaiting feedback, and done tasks
   */
  get allTasksCount(): number {
    return (
      this.dataService.todo.length +
      this.dataService.inProgress.length +
      this.dataService.awaitFeedback.length +
      this.dataService.done.length
    );
  }


  /**
   * Gets all open tasks (tasks that are not done)
   * Combines todo, in-progress, and awaiting feedback tasks
   * @returns Array of all open tasks
   */
  private get openTasks(): Task[] {
    return [
      ...this.dataService.todo,
      ...this.dataService.inProgress,
      ...this.dataService.awaitFeedback,
    ];
  }


  /**
   * Gets the number of urgent open tasks
   * @returns The count of tasks with urgent priority that are not done
   */
  get urgentCount(): number {
    return this.openTasks.filter((t) => t.priority === 'urgent').length;
  }


  /**
   * Gets the next upcoming deadline from open tasks
   * Filters tasks with due dates, excludes invalid and past dates, and returns the earliest future deadline
   * @returns The next deadline date, or null if no upcoming deadlines exist
   */
  get nextDeadline(): Date | null {
    const now = new Date();

    const upcoming = this.openTasks
      .filter((t) => !!t.dueDate)
      .map((t) => new Date(t.dueDate))
      .filter((d) => !isNaN(d.getTime()) && d >= now)
      .sort((a, b) => a.getTime() - b.getTime());

    return upcoming[0] ?? null;
  }


  /**
   * Gets the appropriate greeting text based on the current time of day
   * @returns "Good morning," (before 12pm), "Good afternoon," (12pm-6pm), or "Good evening," (after 6pm)
   */
  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }


  /**
   * Gets the current user's display name
   * Returns "Guest User" for guest users, the user's display name if available,
   * or the part before @ in the email address as fallback
   * @returns The user's display name
   */
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


  /**
   * Angular lifecycle hook that initializes the component
   * Handles greeting screen navigation logic for mobile devices:
   * - On mobile: Shows greeting screen on first visit, then redirects to summary
   * - On desktop: Skips greeting screen
   * Uses sessionStorage to track if greeting has been shown
   */
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
