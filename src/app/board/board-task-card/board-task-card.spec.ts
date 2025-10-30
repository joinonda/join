import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBoardCard } from './board-task-card';

describe('TaskBoardCard', () => {
  let component: TaskBoardCard;
  let fixture: ComponentFixture<TaskBoardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBoardCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskBoardCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
