import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Addtask } from '../../../add-task/add-task';

@Component({
  selector: 'app-board-add-task-dialog',
  standalone: true,
  imports: [CommonModule, Addtask],
  templateUrl: './board-add-task-dialog.html',
  styleUrl: './board-add-task-dialog.scss'
})
export class BoardAddTaskDialog {
  closed = output<void>();
}

