import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { LocalStorageService } from '../services/local-storage.service';
import { Subscription } from 'rxjs';
import { ContainerDirective } from '../directives/container.directive';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    WidgetDirective,
    ContainerDirective,
    
    CommonModule
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css'
})
export class ProfilesComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  localStorageService = inject(LocalStorageService);
  router = inject(Router);

  sub: Subscription;

  currentUser: User | null = null;
  profiles: Profile[] = [];
  isLoaded: boolean; 

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.currentUser = user
        this.profiles = this.currentUser!.profiles;

        this.isLoaded = true;
      });
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onSelectProfile(name: string){
    let selectedProfile = this.currentUser?.profiles.find(profile => profile.name === name)
    this.localStorageService.setItem('profileId', selectedProfile?.id!)
    this.router.navigate(['profile-auth'])
  }
}
