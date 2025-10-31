import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskBoardCard } from '../board-task-card/board-task-card';
import { BoardTaskDialog } from '../board-task-dialog/board-task-dialog';
import { DataService } from '../../services/data.service';
import { Task } from '../../interfaces/task-interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [CommonModule, TaskBoardCard, BoardTaskDialog],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks implements OnDestroy {
  private dataService = inject(DataService);
  private sub?: Subscription;

  todo: Task[] = []; inProgress: Task[] = []; awaitFeedback: Task[] = []; done: Task[] = [];
  constructor() {
    this.sub = this.dataService.getTasks().subscribe(ts => {
      this.todo = []; this.inProgress = []; this.awaitFeedback = []; this.done = [];
      ts.forEach(t => {
        if (t.status === 'todo') this.todo.push(t);
        else if (t.status === 'inprogress') this.inProgress.push(t);
        else if (t.status === 'awaitfeedback') this.awaitFeedback.push(t);
        else this.done.push(t);
      });
    });
  }

  tasksByStatus(status: Task['status']): Task[] {
    if (status === 'todo') return this.todo;
    if (status === 'inprogress') return this.inProgress;
    if (status === 'awaitfeedback') return this.awaitFeedback;
    return this.done;
  }

  selectedTask: Task | null = null;

  openTask(task: Task) { 
    this.selectedTask = task; 
  }

  closeDialog() { 
    this.selectedTask = null; 
  }
  
  async deleteTask(task: Task) {
    if (!task.id) { this.selectedTask = null; return; }
    await this.dataService.deleteTask(task.id);
    this.selectedTask = null;
  }

  ngOnDestroy() { 
    this.sub?.unsubscribe(); 
  }
}
