import { Component } from '@angular/core';
import { Boardheader } from '../board/boardheader/boardheader';
import { BoardTasks } from '../board/boardtasks/boardtasks';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [Boardheader, BoardTasks],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {}
