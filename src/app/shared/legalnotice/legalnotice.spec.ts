import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Legalnotice } from './legalnotice';

describe('Legalnotice', () => {
  let component: Legalnotice;
  let fixture: ComponentFixture<Legalnotice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Legalnotice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Legalnotice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
