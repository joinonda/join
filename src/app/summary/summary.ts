import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

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
}
