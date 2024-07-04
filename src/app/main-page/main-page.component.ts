import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProfileAuthService } from '../services/profile-auth.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,

    RouterModule,
    CommonModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  router = inject(Router)
  profileAuth = inject(ProfileAuthService);

  loggedUser: User | null = null;
  activeProfile: Profile | null = null
  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user

        this.profileAuth.getActiveProfile().subscribe(profile => {
          this.activeProfile = profile;
          //this.isLoaded = true;
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onLogout(){
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
