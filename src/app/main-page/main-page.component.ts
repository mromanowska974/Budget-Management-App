import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';
import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
import { DataService } from '../services/data.service';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    CategoriesMenuComponent,

    RouterModule,
    CommonModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  router = inject(Router);
  dataService = inject(DataService);
  localStorageService = inject(LocalStorageService);

  profileId = this.localStorageService.getItem('profileId');

  loggedUser: User | null = null;
  activeProfile: Profile;
  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.profileId)!
        
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
          console.log(this.activeProfile);
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onLogout(){
    this.localStorageService.clear();
    this.authService.logout();
    this.router.navigate(["login"]);
  }

  onAddProfile(){
    this.router.navigate(["add-profile"]);
  }

  onSettings(){
    this.router.navigate(["settings"]);
  }
}
