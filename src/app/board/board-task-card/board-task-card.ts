import { Component, input, output, inject, computed, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';

interface StatusOption {
  value: Task['status'];
  label: string;
  icon: string;
}

@Component({
  selector: 'app-board-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-task-card.html',
  styleUrl: './board-task-card.scss',
})
export class TaskBoardCard implements OnInit {
  task = input.required<Task>();
  cardClick = output<Task>();
  moveTask = output<{ task: Task; newStatus: Task['status'] }>();
  
  contacts = toSignal(inject(DataService).getContacts(), { initialValue: [] });
  showMoveMenu = signal(false);
  isMobile = signal(window.innerWidth <= 1024);
  private isTogglingMenu = false;

  constructor() {
  }

  @HostListener('window:resize')
  onResize() {
    const isMobileNow = window.innerWidth <= 1024;
    this.isMobile.set(isMobileNow);
    if (!isMobileNow) {
      this.showMoveMenu.set(false);
    }
  }

  ngOnInit() {
    const mobile = window.innerWidth <= 1024;
    this.isMobile.set(mobile);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.isTogglingMenu) {
      return;
    }
    if (!this.showMoveMenu()) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest('.move-to-btn') || 
        target.closest('.move-menu') || 
        target.closest('.move-to-btn-wrapper') ||
        target.closest('.board-task-card-section')) {
      return;
    }
    this.showMoveMenu.set(false);
  }

  availableStatuses = computed<StatusOption[]>(() => {
    const currentStatus = this.task().status;
    const allStatuses: StatusOption[] = [
      { value: 'todo', label: 'To-do', icon: '↑' },
      { value: 'inprogress', label: 'Progress', icon: '↓' },
      { value: 'awaitfeedback', label: 'Feedback', icon: '↓' },
      { value: 'done', label: 'Done', icon: '✓' }
    ];
    return allStatuses.filter(s => s.value !== currentStatus);
  });

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
    const base = 'imgs/addtask';
    const priority = this.task().priority;
    if (priority === 'urgent') return `${base}/urgent-normal.png`;
    if (priority === 'low') return `${base}/low-normal.png`;
    return `${base}/medium-normal.png`;
  });

  truncatedDescription = computed(() => {
    const description = this.task()?.description ?? '';
    if (description.length <= 43) {
      return description;
    }
    return description.substring(0, 43) + '...';
  });

  private lastToggleTime = 0;

  onMoveButtonClick(event: Event | MouseEvent) {
    const now = Date.now();
    if (now - this.lastToggleTime < 100) {
      return;
    }
    this.lastToggleTime = now;
    
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      if ('stopImmediatePropagation' in event) {
        event.stopImmediatePropagation();
      }
    }
    this.toggleMoveMenu(event);
  }

  toggleMoveMenu(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    
    const currentValue = this.showMoveMenu();
    const newValue = !currentValue;
    
    this.showMoveMenu.set(newValue);

    if (newValue) {
      this.isTogglingMenu = true;
      setTimeout(() => {
        this.isTogglingMenu = false;
      }, 200);
    }
  }

  moveToStatus(newStatus: Task['status'], event: Event) {
    event.stopPropagation();
    this.moveTask.emit({ task: this.task(), newStatus });
    this.showMoveMenu.set(false);
  }

  onCardClick(event: Event) {
    const target = event.target as HTMLElement;
    const button = target.closest('.move-to-btn');
    const menu = target.closest('.move-menu');
    const buttonParent = target.closest('button.move-to-btn');
    const isButton = target.tagName === 'BUTTON' && target.classList.contains('move-to-btn');

    if (button || buttonParent || menu || isButton || target.classList.contains('move-to-btn') || (target.tagName === 'IMG' && target.closest('.move-to-btn'))) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    this.cardClick.emit(this.task());
  }
}
