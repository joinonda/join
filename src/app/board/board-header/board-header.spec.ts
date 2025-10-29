import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Boardheader } from './board-header';

describe('Boardheader', () => {
  let component: Boardheader;
  let fixture: ComponentFixture<Boardheader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Boardheader],
    }).compileComponents();

    fixture = TestBed.createComponent(Boardheader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
