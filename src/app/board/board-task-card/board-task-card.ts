import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';

@Component({
  selector: 'app-board-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-task-card.html',
  styleUrl: './board-task-card.scss',
})
export class TaskBoardCard {
  task = input.required<Task>();
  cardClick = output<Task>();
  
  contacts = toSignal(inject(DataService).getContacts(), { initialValue: [] });

  completedSubtasksCount = computed(() => 
    this.task()?.subtasks?.filter(s => s.completed).length ?? 0
  );

  assignedContacts = computed(() => {
    const contacts = this.contacts() ?? [];
    const assignedTo = this.task()?.assignedTo ?? [];
    if (!assignedTo.length || !contacts.length) return [];
    
    return assignedTo.map(name => {
      const contact = findContactByName(name, contacts);
      return {
        initials: getInitialsFromName(name),
        color: contact ? getContactColor(contact) : '#f5f5f5'
      };
    });
  });

  displayedContacts = computed(() => this.assignedContacts().slice(0, 4));
  remainingContactsCount = computed(() => Math.max(0, this.assignedContacts().length - 4));

  priorityIconSrc = computed(() => {
    const base = '/imgs/addtask';
    const priority = this.task().priority;
    if (priority === 'urgent') return `${base}/urgent-normal.png`;
    if (priority === 'low') return `${base}/low-normal.png`;
    return `${base}/medium-normal.png`;
  });
}
