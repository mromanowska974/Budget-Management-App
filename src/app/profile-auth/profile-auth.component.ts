import { AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { ProfileAuthService } from '../services/profile-auth.service';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { LocalStorageService } from '../services/local-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-auth',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,
    CommonModule
  ],
  templateUrl: './profile-auth.component.html',
  styleUrl: './profile-auth.component.css'
})
export class ProfileAuthComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  router = inject(Router);
  localStorageService = inject(LocalStorageService);

  profileId = this.localStorageService.getItem('profileId');
  sub: Subscription;

  loggedUser: User | null = null
  activeProfile: Profile;
  isLoaded: boolean = false;
  @ViewChild('pinCode') pinCodeInput: ElementRef;
  errorMsg: string = '';

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user;
        this.activeProfile = this.loggedUser!.profiles.find(profile => profile.id === this.profileId)!
        this.isLoaded = true
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe()
  }

  onSubmit(){
    this.errorMsg = '';
    let pinCode: string = this.pinCodeInput.nativeElement.value
    if(pinCode === this.activeProfile?.PIN){
      this.router.navigate(['main-page']);
    }
    else {
      this.errorMsg = 'Niepoprawny PIN'
    }
  }
}
