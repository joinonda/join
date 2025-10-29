import { Component } from '@angular/core';
import { BoardHeader } from './board-header/board-header';
import { BoardTasks } from './board-tasks/board-tasks';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [BoardHeader, BoardTasks],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {}
