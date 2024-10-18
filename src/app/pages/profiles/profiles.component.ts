import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WidgetDirective } from '../../directives/widget.directive';
import { ContainerDirective } from '../../directives/container.directive';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { ButtonDirDirective } from '../../directives/button-dir.directive';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    WidgetDirective,
    ContainerDirective,
    ButtonDirDirective,
    
    CommonModule
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css'
})
export class ProfilesComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  router = inject(Router);

  sub: Subscription;

  currentUser: User | null = null;
  profiles: Profile[] = [];
  isLoaded: boolean; 

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.currentUser = user
        this.profiles = this.currentUser!.profiles;
        localStorage.setItem('isProfileAuthorized', 'false')

        this.isLoaded = true;
      });
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe();
  }

  onSelectProfile(name: string){
    let selectedProfile = this.currentUser?.profiles.find(profile => profile.name === name)
    localStorage.setItem('profileId', selectedProfile?.id!)
    this.router.navigate(['profile-auth'])
  }

  onGoBackToLogin(){
    this.authService.logout().subscribe(() => {
      localStorage.clear();
      this.router.navigate(['login']);
    });
  }
}
