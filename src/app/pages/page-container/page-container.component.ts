import { Component, inject } from '@angular/core';
import { RouterModule,  } from '@angular/router';

import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
import { ContainerDirective } from '../../directives/container.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Profile } from '../../models/profile.interface';
import { User } from '../../models/user.interface';
import { CategoryService } from '../../services/category.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [
    ContainerDirective,
    RouterModule,
    CommonModule,
    CategoriesMenuComponent
  ],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.css'
})
export class PageContainerComponent {
  authService = inject(AuthService);
  categoryService = inject(CategoryService);
  profileService = inject(ProfileService);
  modalService = inject(ModalService);

  menuToggled = false;
  loggedUser: User | null = null;
  activeProfile: Profile;
  previewMode = false;
  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.activeProfile || (this.loggedUser.profiles.find(profile => profile.id === localStorage.getItem('profileId'))!)
        
        this.categoryService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
        })
      })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe();
  }

  onToggleMenu(){
    this.menuToggled = !this.menuToggled
  }

  onActivate(){
    const profileId = localStorage.getItem('previewedProfileId')
    if(profileId){
      this.profileService.getProfile(localStorage.getItem('uid'), profileId).then(profile => {
        this.activeProfile = profile
      }).then(() => {
        this.categoryService.getCategories(localStorage.getItem('uid')!, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;

          if(this.activeProfile.id !== localStorage.getItem('profileId')) this.previewMode = true
        })
      })
    }
  }
}
