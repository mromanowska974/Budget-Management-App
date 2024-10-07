import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { ContainerDirective } from '../../directives/container.directive';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../models/profile.interface';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-profile-auth',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,
    ContainerDirective,
    
    CommonModule
  ],
  templateUrl: './profile-auth.component.html',
  styleUrl: './profile-auth.component.css'
})
export class ProfileAuthComponent implements OnInit, OnDestroy{
  authService = inject(AuthService);
  router = inject(Router);

  profileId = localStorage.getItem('profileId');
  sub: Subscription;

  loggedUser: User | null = null
  activeProfile: Profile;
  isLoaded: boolean = false;
  errorMsg: string = '';
  
  @ViewChild('pinCode') pinCodeInput: ElementRef;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user;
        this.activeProfile = this.loggedUser!.profiles.find(profile => profile.id === this.profileId)!
        this.isLoaded = true
      })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe()
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
