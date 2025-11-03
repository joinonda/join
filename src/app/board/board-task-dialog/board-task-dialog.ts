import { Component, output, inject, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';

@Component({
  selector: 'app-board-task-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board-task-dialog.html',
  styleUrl: './board-task-dialog.scss'
})
export class BoardTaskDialog {
  task = input.required<Task>();
  closed = output<void>();
  deleted = output<Task>();
  
  editMode = false;
  model = { title: '', description: '', dueDate: '' };
  private dataService = inject(DataService);
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });

  constructor() {
    effect(() => {
      const t = this.task();
      if (t) {
        this.model.title = t.title;
        this.model.description = t.description;
        const d = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
        this.model.dueDate = new Date(d).toISOString().slice(0, 10);
      }
    });
  }

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

  editTask() { this.editMode = true; }

  async saveTask() {
    const t = this.task();
    if (!t?.id) return;
    await this.dataService.saveTask(t.id, {
      title: this.model.title,
      description: this.model.description,
      dueDate: new Date(this.model.dueDate),
    });
    this.editMode = false;
  }

  async toggleSubtask(subtaskId: string) {
    const t = this.task();
    if (!t?.id) return;
    
    const updatedSubtasks = t.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    
    await this.dataService.saveTask(t.id, { subtasks: updatedSubtasks });
  }
}
