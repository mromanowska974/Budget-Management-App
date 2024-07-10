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
  localStorageService = inject(LocalStorageService);

  menuToggled = false;
  loggedUser: User | null = null;
  activeProfile: Profile;
  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!
        
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
          console.log(this.activeProfile);
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onToggleMenu(){
    this.menuToggled = !this.menuToggled
  }
}
