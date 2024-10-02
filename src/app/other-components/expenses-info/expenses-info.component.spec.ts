import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesInfoComponent } from './expenses-info.component';

describe('ExpensesInfoComponent', () => {
  let component: ExpensesInfoComponent;
  let fixture: ComponentFixture<ExpensesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpensesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
