import { Component, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ProfileAuthService } from '../services/profile-auth.service';
import { Router } from '@angular/router';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';

@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
    WidgetDirective,
    CommonModule
  ],
  templateUrl: './profiles.component.html',
  styleUrl: './profiles.component.css'
})
export class ProfilesComponent implements OnInit{
  authService = inject(AuthService);
  profileAuthService = inject(ProfileAuthService);
  router = inject(Router);

  currentUser: User | null = null;
  profiles: Profile[] = [];
  isLoaded: boolean; 

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.currentUser = user
        this.profiles = this.currentUser!.profiles;

        this.isLoaded = true;
      });
  }

  onSelectProfile(name: string){
    let selectedProfile = this.currentUser?.profiles.find(profile => profile.name === name)
    console.log(selectedProfile)
    this.profileAuthService.setActiveProfile(selectedProfile!);
    this.router.navigate(['profile-auth'])
  }
}
