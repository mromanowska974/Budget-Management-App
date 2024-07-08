import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfilesComponent } from './edit-profiles.component';

describe('EditProfilesComponent', () => {
  let component: EditProfilesComponent;
  let fixture: ComponentFixture<EditProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfilesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
