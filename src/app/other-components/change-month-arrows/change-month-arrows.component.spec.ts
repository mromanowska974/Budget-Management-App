import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMonthArrowsComponent } from './change-month-arrows.component';

describe('ChangeMonthArrowsComponent', () => {
  let component: ChangeMonthArrowsComponent;
  let fixture: ComponentFixture<ChangeMonthArrowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeMonthArrowsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeMonthArrowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
