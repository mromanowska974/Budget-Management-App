import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastExpensesTableComponent } from './last-expenses-table.component';

describe('LastExpensesTableComponent', () => {
  let component: LastExpensesTableComponent;
  let fixture: ComponentFixture<LastExpensesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastExpensesTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LastExpensesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
