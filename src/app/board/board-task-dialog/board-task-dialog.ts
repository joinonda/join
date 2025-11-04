import { Component, output, inject, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { Contact } from '../../interfaces/contacts-interfaces';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';
import { BoardTaskDialogEdit } from './board-task-dialog-edit/board-task-dialog-edit';

@Component({
  selector: 'app-board-task-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, BoardTaskDialogEdit],
  templateUrl: './board-task-dialog.html',
  styleUrl: './board-task-dialog.scss'
})
export class BoardTaskDialog {
  task = input.required<Task>();
  closed = output<void>();
  deleted = output<Task>();
  updated = output<Task>();
  
  editMode = false;
  private dataService = inject(DataService);
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });

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

  priorityIcon = computed(() => {
    const base = '/imgs/addtask';
    const priority = this.task().priority;
    if (priority === 'urgent') return `${base}/urgent-normal.png`;
    if (priority === 'low') return `${base}/low-normal.png`;
    return `${base}/medium-normal.png`;
  });

  priorityText = computed(() => {
    const priority = this.task().priority;
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  });

  editTask() {
    this.editMode = true;
  }

  onEditSaved(updatedTask: Task) {
    this.updated.emit(updatedTask);
    this.editMode = false;
  }

  onEditCancelled() {
    this.editMode = false;
  }

  async toggleSubtask(subtaskId: string) {
    const t = this.task();
    if (!t?.id) return;
    
    const updatedSubtasks = t.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    
    await this.dataService.saveTask(t.id, { subtasks: updatedSubtasks });
    
    const updatedTask: Task = {
      ...t,
      subtasks: updatedSubtasks,
    };
    this.updated.emit(updatedTask);
  }
}
