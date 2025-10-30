import { Component } from '@angular/core';
import { TaskBoardCard } from '../board-task-card/board-task-card';

@Component({
  selector: 'app-board-tasks',
  standalone: true,
  imports: [TaskBoardCard],
  templateUrl: './board-tasks.html',
  styleUrl: './board-tasks.scss',
})
export class BoardTasks {}
