import { Component, inject } from '@angular/core';
import { RouterModule,  } from '@angular/router';

import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CategoriesMenuComponent } from '../../other-components/categories-menu/categories-menu.component';
import { ContainerDirective } from '../../directives/container.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Profile } from '../../models/profile.interface';
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
  activeProfile: Profile;
  previewMode = false;

  authSub: Subscription;
  categoriesSub: Subscription;
  editSub: Subscription;
  switchSub: Subscription;

  ngOnInit(): void {
      this.previewMode = localStorage.getItem('previewedProfileId') ? true : false;
      
      const profileId = localStorage.getItem(this.previewMode ? 'previewedProfileId' : 'profileId');

      this.authSub = this.authService.user.subscribe(user => {
        this.activeProfile = user!.profiles.find(profile => profile.id === profileId)!;        
        this.getCategories(profileId);
      })

      this.editSub = this.categoryService.categoryWasEdited.subscribe(() => this.getCategories(profileId));
      this.switchSub = this.profileService.profileIsSwitched$.subscribe((id) => {
        this.getCategories(id);
        this.previewMode = localStorage.getItem('previewedProfileId') ? true : false;
        console.log(this.previewMode)
      });
  }

  ngOnDestroy(): void {
      if(this.authSub) this.authSub.unsubscribe();
      if(this.categoriesSub) this.categoriesSub.unsubscribe();
      if(this.editSub) this.editSub.unsubscribe();
      if(this.switchSub) this.switchSub.unsubscribe();
  }

  private getCategories(profileId){
    this.categoriesSub = this.categoryService.getCategories(localStorage.getItem('uid')!, profileId).subscribe(data => {
      this.activeProfile.categories = data;
    })
  }

  onToggleMenu(){
    this.menuToggled = !this.menuToggled;
  }
}
