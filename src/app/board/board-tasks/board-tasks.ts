import { Component, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskBoardCard } from '../board-task-card/board-task-card';
import { BoardTaskDialog } from '../board-task-dialog/board-task-dialog';
import { BoardAddTaskDialog } from '../board-header/board-add-task-dialog/board-add-task-dialog';
import { DataService } from '../../services/data.service';
import { Task } from '../../interfaces/task-interface';
import { Subscription } from 'rxjs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [CommonModule, TaskBoardCard, BoardTaskDialog, BoardAddTaskDialog, DragDropModule],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks implements OnDestroy {
  private dataService = inject(DataService);
  private router = inject(Router);
  private sub?: Subscription;

  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];
  isAddTaskDialogOpen = signal(false);
  initialStatus = signal<Task['status']>('inprogress');
  isMobile = signal(window.innerWidth <= 1024);
  
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

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 1024);
    if (this.isMobile() && this.isAddTaskDialogOpen()) {
      this.isAddTaskDialogOpen.set(false);
    }
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

  openAddTaskDialog(status: Task['status']) {
    if (this.isMobile()) {
      this.router.navigate(['/add-task'], { queryParams: { status } });
    } else {
      this.initialStatus.set(status);
      this.isAddTaskDialogOpen.set(true);
    }
  }

  onDialogClosed() {
    this.isAddTaskDialogOpen.set(false);
  }

  async moveTaskToStatus(event: { task: Task; newStatus: Task['status'] }) {
    const { task, newStatus } = event;
    
    const removeFromArray = (arr: Task[]) => {
      const index = arr.findIndex(t => t.id === task.id);
      if (index !== -1) {
        arr.splice(index, 1);
      }
    };
    
    removeFromArray(this.todo);
    removeFromArray(this.inProgress);
    removeFromArray(this.awaitFeedback);
    removeFromArray(this.done);

    task.status = newStatus;
    if (newStatus === 'todo') this.todo.push(task);
    else if (newStatus === 'inprogress') this.inProgress.push(task);
    else if (newStatus === 'awaitfeedback') this.awaitFeedback.push(task);
    else this.done.push(task);

    if (task.id) {
      await this.dataService.saveTask(task.id, { status: newStatus });
    }
  }
}
