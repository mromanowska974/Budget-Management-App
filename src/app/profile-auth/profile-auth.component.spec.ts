import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAuthComponent } from './profile-auth.component';

describe('ProfileAuthComponent', () => {
  let component: ProfileAuthComponent;
  let fixture: ComponentFixture<ProfileAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileAuthComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
