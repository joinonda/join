import { Component, output, inject, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { Contact } from '../../interfaces/contacts-interfaces';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';
import { BoardTaskDialogEdit } from './board-task-dialog-edit/board-task-dialog-edit';

/**
 * Component for displaying and managing task details in a dialog.
 * Handles task viewing, editing, subtask toggling, and task deletion.
 */
@Component({
  selector: 'app-board-task-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, BoardTaskDialogEdit],
  templateUrl: './board-task-dialog.html',
  styleUrl: './board-task-dialog.scss'
})
export class BoardTaskDialog {
  /** Required input signal for the task to display. */
  task = input.required<Task>();
  /** Output event emitter for when the dialog is closed. */
  closed = output<void>();
  /** Output event emitter for when the task is deleted. */
  deleted = output<Task>();
  /** Output event emitter for when the task is updated. */
  updated = output<Task>();
  
  /** Signal indicating if the dialog is in edit mode. */
  editMode = signal(false);
  /** DataService for saving tasks and retrieving contacts. */
  private dataService = inject(DataService);
  /** Signal containing the list of contacts from the data service. */
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });

  /**
   * Computed signal returning assigned contacts with their display information.
   * @returns Array of contact objects with name, initials, and color properties.
   */
  assignedContacts = computed(() => {
    const contacts = this.contacts() ?? [];
    const assignedTo = this.task()?.assignedTo ?? [];
    if (!assignedTo.length || !contacts.length) return [];
    
    return assignedTo.map(name => {
      const contact = findContactByName(name, contacts);
      return {
        name,
        initials: getInitialsFromName(name),
        color: contact ? getContactColor(contact) : '#f5f5f5'
      };
    });
  });

  /**
   * Computed signal returning the icon source path for the task priority.
   * @returns Path to the priority icon image.
   */
  priorityIcon = computed(() => {
    const base = 'imgs/addtask';
    const priority = this.task().priority;
    if (priority === 'urgent') return `${base}/urgent-normal.png`;
    if (priority === 'low') return `${base}/low-normal.png`;
    return `${base}/medium-normal.png`;
  });

  /**
   * Computed signal returning the capitalized priority text.
   * @returns Capitalized priority string (e.g., "Urgent", "Medium", "Low").
   */
  priorityText = computed(() => {
    const priority = this.task().priority;
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  });

  /**
   * Computed signal returning the color code for the task category.
   * @returns Hex color code for the category.
   */
  categoryColor = computed(() => {
    const category = this.task()?.category;
    if (category === 'Technical Task') {
      return '#1FD7C1';
    }
    if (category === 'User Story') {
      return '#0038FF';
    }
    return '#005dff';
  });

  /**
   * Activates edit mode for the task.
   */
  editTask() {
    this.editMode.set(true);
  }

  /**
   * Handles the saved event from the edit component.
   * Emits the updated task and exits edit mode.
   * @param updatedTask - The updated task from the edit component.
   */
  onEditSaved(updatedTask: Task) {
    this.updated.emit(updatedTask);
    this.editMode.set(false);
  }

  /**
   * Handles the cancelled event from the edit component.
   * Exits edit mode without saving changes.
   */
  onEditCancelled() {
    this.editMode.set(false);
  }

  /**
   * Toggles the completion status of a subtask.
   * Saves the change to the database and emits the updated task.
   * @param subtaskId - The ID of the subtask to toggle.
   */
  async toggleSubtask(subtaskId: string) {
    const t = this.task();
    if (!t?.id) return;

    const updatedSubtasks = this.toggleSubtaskCompletion(t.subtasks, subtaskId);
    await this.saveSubtasks(t.id, updatedSubtasks);
    this.emitUpdatedTask(t, updatedSubtasks);
  }

  /**
   * Toggles the completion status of a specific subtask in the array.
   * @param subtasks - Array of subtasks to search.
   * @param subtaskId - The ID of the subtask to toggle.
   * @returns Array with the toggled subtask's completion status updated.
   */
  private toggleSubtaskCompletion(subtasks: any[], subtaskId: string) {
    return subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
  }

  /**
   * Saves the updated subtasks to the database.
   * @param taskId - The ID of the task to update.
   * @param subtasks - The updated subtasks array.
   */
  private async saveSubtasks(taskId: string, subtasks: any[]) {
    await this.dataService.saveTask(taskId, { subtasks });
  }

  /**
   * Creates an updated task object and emits it via the updated output.
   * @param originalTask - The original task object.
   * @param updatedSubtasks - The updated subtasks array.
   */
  private emitUpdatedTask(originalTask: Task, updatedSubtasks: any[]) {
    const updatedTask: Task = {
      ...originalTask,
      subtasks: updatedSubtasks,
    };
    this.updated.emit(updatedTask);
  }
}
