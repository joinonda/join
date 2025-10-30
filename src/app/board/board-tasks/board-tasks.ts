import { Component } from '@angular/core';
import { TaskBoardCard } from '../board-task-card/board-task-card';
import { BoardTaskDialog } from '../board-task-dialog/board-task-dialog';

@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [TaskBoardCard, BoardTaskDialog],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks {}
