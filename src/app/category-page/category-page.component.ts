import { Component, inject, OnInit } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { LocalStorageService } from '../services/local-storage.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    ContainerDirective,
    WidgetDirective,
    ButtonDirDirective,

    CommonModule
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit{
  localStorageService = inject(LocalStorageService);
  authService = inject(AuthService);
  dataService = inject(DataService);

  loggedUser: User;
  activeProfile: Profile;
  activeCategory: {id, content: string, color: string};

  isLoaded = false;

  ngOnInit(): void {
    const catId = this.localStorageService.getItem('categoryId');
    const pid = this.localStorageService.getItem('profileId');
    const uid = this.localStorageService.getItem('uid');

    this.dataService.getUser(uid!).then(user => {
      this.dataService.getProfiles(uid).then(profiles => {
        this.loggedUser = {
          uid: uid!,
          accountStatus: user!['accountStatus'],
          email: user!['email'],
          profiles: profiles 
        }
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === pid)!;
        this.dataService.getCategories(uid!, pid!).then(categories => {
          this.activeProfile.categories = categories;
          this.activeCategory = this.activeProfile.categories!.find(category => category.id === catId)!
          this.isLoaded = true
        })
      })
    })
  }
}
