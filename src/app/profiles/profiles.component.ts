import { Component, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ProfileAuthService } from '../services/profile-auth.service';
import { Router } from '@angular/router';

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
export class ProfilesComponent {
  authService = inject(AuthService);
  profileAuthService = inject(ProfileAuthService);
  router = inject(Router);

  currentUser = this.authService.currentUserSig();
  profiles = this.currentUser?.profiles;

  onSelectProfile(name: string){
    let selectedProfile = this.currentUser?.profiles.find(profile => profile.name === name)
    console.log(selectedProfile)
    this.profileAuthService.setActiveProfile(selectedProfile!);
    this.router.navigate(['profile-auth'])
  }
}
