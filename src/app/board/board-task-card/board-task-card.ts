import { Component, input, output, inject, computed, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task } from '../../interfaces/task-interface';
import { DataService } from '../../services/data.service';
import { getContactColor, getInitialsFromName, findContactByName } from '../../utilities/contact.helpfunctions';

/**
 * Interface representing a status option for task movement.
 */
interface StatusOption {
  /** The status value. */
  value: Task['status'];
  /** The display label for the status. */
  label: string;
  /** The icon character for the status. */
  icon: string;
}

/**
 * Component for displaying a task card on the board.
 * Handles task display, status movement, and interaction events.
 */
@Component({
  selector: 'app-board-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-task-card.html',
  styleUrl: './board-task-card.scss',
})
export class TaskBoardCard implements OnInit {
  /** Required input signal for the task data. */
  task = input.required<Task>();
  /** Output event emitter for card click events. */
  cardClick = output<Task>();
  /** Output event emitter for task status movement. */
  moveTask = output<{ task: Task; newStatus: Task['status'] }>();
  
  /** Signal containing the list of contacts from the data service. */
  contacts = toSignal(inject(DataService).getContacts(), { initialValue: [] });
  /** Signal indicating if the move menu is currently visible. */
  showMoveMenu = signal(false);
  /** Signal indicating if the current viewport is mobile (width <= 1024px). */
  isMobile = signal(window.innerWidth <= 1024);
  /** Flag to prevent click events during menu toggle animation. */
  private isTogglingMenu = false;

  /**
   * Initializes the component.
   */
  constructor() {
  }

  /**
   * Handles window resize events.
   * Updates mobile state and closes move menu on desktop.
   */
  @HostListener('window:resize')
  onResize() {
    const isMobileNow = window.innerWidth <= 1024;
    this.isMobile.set(isMobileNow);
    if (!isMobileNow) {
      this.showMoveMenu.set(false);
    }
  }

  /**
   * Initializes the component and sets the initial mobile state.
   */
  ngOnInit() {
    const mobile = window.innerWidth <= 1024;
    this.isMobile.set(mobile);
  }

  /**
   * Handles document click events to close the move menu when clicking outside.
   * @param event - The mouse event from the document click.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.shouldIgnoreClick()) return;
    if (!this.showMoveMenu()) return;
    if (this.isClickInsideMenu(event)) return;
    this.closeMoveMenu();
  }

  /**
   * Checks if click events should be ignored during menu toggle.
   * @returns True if clicks should be ignored, false otherwise.
   */
  private shouldIgnoreClick(): boolean {
    return this.isTogglingMenu;
  }

  /**
   * Checks if the click event occurred inside the move menu area.
   * @param event - The mouse event to check.
   * @returns True if click is inside menu area, false otherwise.
   */
  private isClickInsideMenu(event: MouseEvent): boolean {
    const target = event.target as HTMLElement;
    return !!(
      target.closest('.move-to-btn') ||
      target.closest('.move-menu') ||
      target.closest('.move-to-btn-wrapper') ||
      target.closest('.board-task-card-section')
    );
  }

  /**
   * Closes the move menu.
   */
  private closeMoveMenu(): void {
    this.showMoveMenu.set(false);
  }

  /**
   * Computed signal returning available status options excluding the current task status.
   * @returns Array of status options that the task can be moved to.
   */
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

  /**
   * Computed signal returning the count of completed subtasks.
   * @returns Number of completed subtasks.
   */
  completedSubtasksCount = computed(() => 
    this.task()?.subtasks?.filter(s => s.completed).length ?? 0
  );

  /**
   * Computed signal returning assigned contacts with their initials and colors.
   * @returns Array of contact objects with initials and color properties.
   */
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

  /**
   * Computed signal returning the first 4 assigned contacts for display.
   * @returns Array of up to 4 contact objects.
   */
  displayedContacts = computed(() => this.assignedContacts().slice(0, 4));
  
  /**
   * Computed signal returning the count of contacts beyond the first 4.
   * @returns Number of remaining contacts not displayed.
   */
  remainingContactsCount = computed(() => Math.max(0, this.assignedContacts().length - 4));

  /**
   * Computed signal returning the icon source path for the task priority.
   * @returns Path to the priority icon image.
   */
  priorityIconSrc = computed(() => {
    const base = 'imgs/addtask';
    const priority = this.task().priority;
    if (priority === 'urgent') return `${base}/urgent-normal.png`;
    if (priority === 'low') return `${base}/low-normal.png`;
    return `${base}/medium-normal.png`;
  });

  /**
   * Computed signal returning the truncated description (max 43 characters).
   * @returns Truncated description with ellipsis if longer than 43 characters.
   */
  truncatedDescription = computed(() => {
    const description = this.task()?.description ?? '';
    if (description.length <= 43) {
      return description;
    }
    return description.substring(0, 43) + '...';
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

  /** Timestamp of the last menu toggle to implement throttling. */
  private lastToggleTime = 0;

  /**
   * Handles the move button click event.
   * Throttles rapid clicks and toggles the move menu.
   * @param event - The click event from the move button.
   */
  onMoveButtonClick(event: Event | MouseEvent) {
    if (this.isThrottled()) return;
    this.updateLastToggleTime();
    this.stopEventPropagation(event);
    this.toggleMoveMenu(event);
  }

  /**
   * Checks if the menu toggle is currently throttled (within 100ms of last toggle).
   * @returns True if throttled, false otherwise.
   */
  private isThrottled(): boolean {
    const now = Date.now();
    return now - this.lastToggleTime < 100;
  }

  /**
   * Updates the timestamp of the last menu toggle.
   */
  private updateLastToggleTime(): void {
    this.lastToggleTime = Date.now();
  }

  /**
   * Stops event propagation and prevents default behavior.
   * @param event - The event to stop propagation for.
   */
  private stopEventPropagation(event: Event | MouseEvent): void {
    if (!event) return;
    event.stopPropagation();
    event.preventDefault();
    if ('stopImmediatePropagation' in event) {
      event.stopImmediatePropagation();
    }
  }

  /**
   * Toggles the visibility of the move menu.
   * @param event - The event that triggered the toggle.
   */
  toggleMoveMenu(event: Event) {
    this.stopEvent(event);
    const newValue = !this.showMoveMenu();
    this.showMoveMenu.set(newValue);
    if (newValue) {
      this.setTogglingMenuFlag();
    }
  }

  /**
   * Stops event propagation and prevents default behavior for a standard Event.
   * @param event - The event to stop.
   */
  private stopEvent(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Sets the toggling menu flag and resets it after 200ms.
   * Prevents click events from closing the menu immediately after opening.
   */
  private setTogglingMenuFlag(): void {
    this.isTogglingMenu = true;
    setTimeout(() => {
      this.isTogglingMenu = false;
    }, 200);
  }

  /**
   * Moves the task to a new status and emits the moveTask event.
   * @param newStatus - The new status to move the task to.
   * @param event - The click event from the status selection.
   */
  moveToStatus(newStatus: Task['status'], event: Event) {
    this.stopEvent(event);
    this.moveTask.emit({ task: this.task(), newStatus });
    this.closeMoveMenu();
  }

  /**
   * Handles card click events.
   * Emits cardClick event unless the click was on the move button.
   * @param event - The click event from the card.
   */
  onCardClick(event: Event) {
    if (this.isMoveButtonClick(event)) {
      this.stopEvent(event);
      return;
    }
    this.cardClick.emit(this.task());
  }

  /**
   * Checks if the click event occurred on the move button or menu.
   * @param event - The click event to check.
   * @returns True if click was on move button/menu, false otherwise.
   */
  private isMoveButtonClick(event: Event): boolean {
    const target = event.target as HTMLElement;
    return !!(
      target.closest('.move-to-btn') ||
      target.closest('.move-menu') ||
      target.closest('button.move-to-btn') ||
      (target.tagName === 'BUTTON' && target.classList.contains('move-to-btn')) ||
      target.classList.contains('move-to-btn') ||
      (target.tagName === 'IMG' && target.closest('.move-to-btn'))
    );
  }
}
