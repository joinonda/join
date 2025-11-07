import { Component, signal } from '@angular/core';
import { BoardHeader } from './board-header/board-header';
import { BoardTasks } from './board-tasks/board-tasks';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [BoardHeader, BoardTasks],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  searchTerm = signal<string>('');

  onSearchTermChange(term: string) {
    this.searchTerm.set(term);
  }
}
