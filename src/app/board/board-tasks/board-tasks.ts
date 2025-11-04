import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskBoardCard } from '../board-task-card/board-task-card';
import { BoardTaskDialog } from '../board-task-dialog/board-task-dialog';
import { DataService } from '../../services/data.service';
import { Task } from '../../interfaces/task-interface';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [CommonModule, TaskBoardCard, BoardTaskDialog, DragDropModule],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks implements OnDestroy {
  private dataService = inject(DataService);
  private sub?: Subscription;

  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];
  constructor() {
    this.sub = this.dataService.getTasks().subscribe((ts) => {
      this.todo = [];
      this.inProgress = [];
      this.awaitFeedback = [];
      this.done = [];
      ts.forEach((t) => {
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

  updateSelectedTask(updatedTask: Task) {
    if (this.selectedTask?.id === updatedTask.id) {
      this.selectedTask = updatedTask;
    }
    
    const updateInArray = (arr: Task[]) => {
      const index = arr.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        arr[index] = updatedTask;
      }
    };
    
    updateInArray(this.todo);
    updateInArray(this.inProgress);
    updateInArray(this.awaitFeedback);
    updateInArray(this.done);
  }

  async deleteTask(task: Task) {
    if (!task.id) {
      this.selectedTask = null;
      return;
    }
    await this.dataService.deleteTask(task.id);
    this.selectedTask = null;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async drop(event: CdkDragDrop<Task[]>, targetStatus: Task['status']) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedTask = event.container.data[event.currentIndex];
    if (!movedTask) return;

    movedTask.status = targetStatus;

    if (movedTask.id) {
      await this.dataService.saveTask(movedTask.id, { status: targetStatus });
    }
  }
}
