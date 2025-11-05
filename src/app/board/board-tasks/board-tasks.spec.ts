import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardTasks } from './board-tasks';

describe('Boardtasks', () => {
  let component: BoardTasks;
  let fixture: ComponentFixture<BoardTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
