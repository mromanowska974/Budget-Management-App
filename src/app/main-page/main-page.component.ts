import { Component, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';

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
export class MainPageComponent implements OnInit{
  authService = inject(AuthService);
  router = inject(Router)

  loggedUser: User | null = null;
  activeProfile: Profile | null = null

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.loggedUser = user

        console.log(this.loggedUser)

        if(this.loggedUser?.profiles.length === 1){
          this.activeProfile = this.loggedUser.profiles[0];
        }

        console.log(this.activeProfile)
      })
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
