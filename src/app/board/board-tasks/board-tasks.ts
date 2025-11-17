import { Component, OnDestroy, inject, signal, HostListener, input, computed, effect } from '@angular/core';
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

/**
 * Component for displaying and managing tasks organized by status columns.
 * Handles task filtering, drag-and-drop, task editing, and status management.
 */
@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [CommonModule, TaskBoardCard, BoardTaskDialog, BoardAddTaskDialog, DragDropModule],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks implements OnDestroy {
  /** DataService for retrieving and managing tasks. */
  private dataService = inject(DataService);
  /** Router service for navigation. */
  private router = inject(Router);
  /** Subscription to the tasks observable for cleanup. */
  private sub?: Subscription;

  /** Input signal for the search term to filter tasks. */
  searchTerm = input<string>('');

  /** Array containing all tasks from the data service. */
  allTasks: Task[] = [];
  /** Array of tasks with 'todo' status. */
  todo: Task[] = [];
  /** Array of tasks with 'inprogress' status. */
  inProgress: Task[] = [];
  /** Array of tasks with 'awaitfeedback' status. */
  awaitFeedback: Task[] = [];
  /** Array of tasks with 'done' status. */
  done: Task[] = [];
  /** Signal indicating if the add task dialog is open. */
  isAddTaskDialogOpen = signal(false);
  /** Signal containing the initial status for new tasks. */
  initialStatus = signal<Task['status']>('todo');
  /** Signal indicating if the current viewport is mobile (width <= 1024px). */
  isMobile = signal(window.innerWidth <= 1024);
  
  /**
   * Initializes the component and sets up effects and subscriptions.
   * Updates tasks when search term changes or when tasks are loaded.
   */
  constructor() {
    effect(() => {
      this.searchTerm();
      if (this.allTasks.length > 0) {
        this.updateTasks();
      }
    });

    this.sub = this.dataService.getTasks().subscribe((ts) => {
      this.allTasks = ts;
      this.updateTasks();
    });
  }

  /**
   * Updates the task arrays by resetting, filtering, and categorizing tasks.
   */
  private updateTasks() {
    this.resetTaskArrays();
    const filteredTasks = this.getFilteredTasks();
    this.categorizeTasks(filteredTasks);
  }

  /**
   * Resets all task status arrays to empty.
   */
  private resetTaskArrays(): void {
    this.todo = [];
    this.inProgress = [];
    this.awaitFeedback = [];
    this.done = [];
  }

  /**
   * Filters tasks based on the current search term.
   * @returns Array of tasks matching the search term, or all tasks if no search term.
   */
  private getFilteredTasks(): Task[] {
    const searchTerm = this.searchTerm().toLowerCase().trim();
    return searchTerm
      ? this.allTasks.filter(task => this.taskMatchesSearch(task, searchTerm))
      : this.allTasks;
  }

  /**
   * Categorizes tasks into their respective status arrays.
   * @param tasks - Array of tasks to categorize.
   */
  private categorizeTasks(tasks: Task[]): void {
    tasks.forEach((t) => {
      if (t.status === 'todo') this.todo.push(t);
      else if (t.status === 'inprogress') this.inProgress.push(t);
      else if (t.status === 'awaitfeedback') this.awaitFeedback.push(t);
      else this.done.push(t);
    });
  }

  /**
   * Checks if a task matches the search term in any of its fields.
   * @param task - The task to check.
   * @param searchTerm - The search term to match against.
   * @returns True if the task matches the search term, false otherwise.
   */
  private taskMatchesSearch(task: Task, searchTerm: string): boolean {
    const titleMatch = task.title?.toLowerCase().includes(searchTerm) ?? false;
    const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) ?? false;
    const categoryMatch = task.category?.toLowerCase().includes(searchTerm) ?? false;
    const subtaskMatch = task.subtasks?.some(subtask => 
      subtask.title?.toLowerCase().includes(searchTerm)
    ) ?? false;
    
    return titleMatch || descriptionMatch || categoryMatch || subtaskMatch;
  }

  /**
   * Handles window resize events.
   * Updates mobile state and closes add task dialog on mobile if open.
   */
  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth <= 1024);
    if (this.isMobile() && this.isAddTaskDialogOpen()) {
      this.isAddTaskDialogOpen.set(false);
    }
  }

  /**
   * Returns the task array for a given status.
   * @param status - The task status to get tasks for.
   * @returns Array of tasks with the specified status.
   */
  tasksByStatus(status: Task['status']): Task[] {
    if (status === 'todo') return this.todo;
    if (status === 'inprogress') return this.inProgress;
    if (status === 'awaitfeedback') return this.awaitFeedback;
    return this.done;
  }

  /** Currently selected task for display in the dialog. */
  selectedTask: Task | null = null;

  /**
   * Opens the task dialog for the specified task.
   * @param task - The task to display in the dialog.
   */
  openTask(task: Task) {
    this.selectedTask = task;
  }

  /**
   * Closes the task dialog by clearing the selected task.
   */
  closeDialog() {
    this.selectedTask = null;
  }

  /**
   * Updates the selected task and all task arrays with the updated task data.
   * @param updatedTask - The updated task object.
   */
  updateSelectedTask(updatedTask: Task) {
    this.updateSelectedTaskIfMatch(updatedTask);
    this.updateTaskInAllArrays(updatedTask);
  }

  /**
   * Updates the selected task if it matches the updated task ID.
   * @param updatedTask - The updated task object.
   */
  private updateSelectedTaskIfMatch(updatedTask: Task): void {
    if (this.selectedTask?.id === updatedTask.id) {
      this.selectedTask = updatedTask;
    }
  }

  /**
   * Updates the task in all status arrays.
   * @param updatedTask - The updated task object.
   */
  private updateTaskInAllArrays(updatedTask: Task): void {
    this.updateTaskInArray(this.todo, updatedTask);
    this.updateTaskInArray(this.inProgress, updatedTask);
    this.updateTaskInArray(this.awaitFeedback, updatedTask);
    this.updateTaskInArray(this.done, updatedTask);
  }

  /**
   * Updates a task in a specific array if it exists.
   * @param arr - The task array to update.
   * @param updatedTask - The updated task object.
   */
  private updateTaskInArray(arr: Task[], updatedTask: Task): void {
    const index = arr.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      arr[index] = updatedTask;
    }
  }

  /**
   * Deletes a task from the database and closes the dialog.
   * @param task - The task to delete.
   */
  async deleteTask(task: Task) {
    if (!task.id) {
      this.selectedTask = null;
      return;
    }
    await this.dataService.deleteTask(task.id);
    this.selectedTask = null;
  }

  /**
   * Cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  /**
   * Handles drag and drop events for tasks.
   * Moves tasks within the same container or transfers between containers.
   * @param event - The drag and drop event.
   * @param targetStatus - The target status for the moved task.
   */
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

  /**
   * Opens the add task dialog or navigates to the add task page.
   * @param status - The initial status for the new task.
   */
  openAddTaskDialog(status: Task['status']) {
    if (this.isMobile()) {
      this.router.navigate(['/add-task'], { queryParams: { status } });
    } else {
      this.initialStatus.set(status);
      this.isAddTaskDialogOpen.set(true);
    }
  }

  /**
   * Closes the add task dialog.
   */
  onDialogClosed() {
    this.isAddTaskDialogOpen.set(false);
  }

  /**
   * Moves a task to a new status.
   * Removes it from all arrays, adds it to the target status array, and saves the change.
   * @param event - Event object containing the task and new status.
   */
  async moveTaskToStatus(event: { task: Task; newStatus: Task['status'] }) {
    const { task, newStatus } = event;
    this.removeTaskFromAllArrays(task);
    this.addTaskToStatusArray(task, newStatus);
    await this.saveTaskStatus(task, newStatus);
  }

  /**
   * Removes a task from all status arrays.
   * @param task - The task to remove.
   */
  private removeTaskFromAllArrays(task: Task): void {
    this.removeTaskFromArray(this.todo, task);
    this.removeTaskFromArray(this.inProgress, task);
    this.removeTaskFromArray(this.awaitFeedback, task);
    this.removeTaskFromArray(this.done, task);
  }

  /**
   * Removes a task from a specific array.
   * @param arr - The array to remove the task from.
   * @param task - The task to remove.
   */
  private removeTaskFromArray(arr: Task[], task: Task): void {
    const index = arr.findIndex(t => t.id === task.id);
    if (index !== -1) {
      arr.splice(index, 1);
    }
  }

  /**
   * Adds a task to the appropriate status array based on its status.
   * @param task - The task to add.
   * @param status - The status to assign to the task.
   */
  private addTaskToStatusArray(task: Task, status: Task['status']): void {
    task.status = status;
    if (status === 'todo') this.todo.push(task);
    else if (status === 'inprogress') this.inProgress.push(task);
    else if (status === 'awaitfeedback') this.awaitFeedback.push(task);
    else this.done.push(task);
  }

  /**
   * Saves the task status change to the database.
   * @param task - The task to update.
   * @param status - The new status to save.
   */
  private async saveTaskStatus(task: Task, status: Task['status']): Promise<void> {
    if (task.id) {
      await this.dataService.saveTask(task.id, { status });
    }
  }
}
