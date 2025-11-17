import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addtask } from '../../../add-task/add-task';
import { Task } from '../../../interfaces/task-interface';

@Component({
  selector: 'app-board-add-task-dialog',
  standalone: true,
  imports: [CommonModule, Addtask],
  templateUrl: './board-add-task-dialog.html',
  styleUrls: ['./board-add-task-dialog.scss', './board-add-task-dialog-mobile.scss']
})
export class BoardAddTaskDialog {
  closed = output<void>();
  initialStatus = input<Task['status']>('todo');
}

