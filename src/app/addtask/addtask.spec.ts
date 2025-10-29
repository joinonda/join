import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addtask } from './addtask';

describe('Addtask', () => {
  let component: Addtask;
  let fixture: ComponentFixture<Addtask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addtask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addtask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
