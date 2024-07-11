import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';
import { LocalStorageService } from '../services/local-storage.service';
import { CommonModule } from '@angular/common';
import { ContainerDirective } from '../directives/container.directive';
import { ModalService } from '../services/modal.service';

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
  dataService = inject(DataService);
  modalService = inject(ModalService);
  localStorageService = inject(LocalStorageService);

  menuToggled = false;
  loggedUser: User | null = null;
  activeProfile: Profile;
  previewMode = false;
  sub: Subscription;

  ngOnInit(): void {
    console.log('weszło')
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.activeProfile || (this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!)
        
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onToggleMenu(){
    this.menuToggled = !this.menuToggled
  }

  onActivate(){
    const profileId = this.localStorageService.getItem('previewedProfileId')
    if(profileId){
      console.log(profileId, this.loggedUser)
      this.dataService.getProfile(this.localStorageService.getItem('uid'), profileId).then(profile => {
        this.activeProfile = profile
        console.log(this.activeProfile)
      }).then(() => {
        this.dataService.getCategories(this.localStorageService.getItem('uid')!, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;

          if(this.activeProfile.id !== this.localStorageService.getItem('profileId')) this.previewMode = true
        })
      })
    }
  }
}
