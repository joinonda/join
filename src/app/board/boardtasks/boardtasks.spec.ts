import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Boardtasks } from './boardtasks';

describe('Boardtasks', () => {
  let component: Boardtasks;
  let fixture: ComponentFixture<Boardtasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boardtasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Boardtasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
