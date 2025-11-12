import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { Task } from '../interfaces/task-interface';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  private dataService = inject(DataService);

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
    return 'Guest User';
  }
}
