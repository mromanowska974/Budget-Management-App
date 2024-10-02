import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { Router } from '@angular/router';
import { User } from '../../models/user.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Profile } from '../../models/profile.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonDirDirective, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy{
  router = inject(Router);
  authService = inject(AuthService);
  
  loggedUser: User | null;
  activeProfile: Profile;

  sub: Subscription;

  ngOnInit(): void {
    this.sub = this.authService.user.subscribe(user => {
      this.loggedUser = user;

      if(this.loggedUser){
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === localStorage.getItem('profileId'))!;
      }
    })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe();
  }

  //For not logged in users

  onLogin(){
    this.router.navigate(['login']);
  }

  onGoToAboutPage() {
    this.router.navigate(['about']);
  }

  onGoToMainPage() {
    this.router.navigate(['']);
  }

  //For logged in users

  onLogout(){
    localStorage.clear();
    this.authService.logout();
    this.router.navigate([""]);
  }

  onAddProfile(){
    this.router.navigate(["add-profile"]);
  }

  onAddExpense(){
    this.router.navigate(['add-expense'])
  }

  onSettings(){
    this.router.navigate(["settings"]);
  }

  onNotifications(){
    this.router.navigate(['notifications']);
  }
}
