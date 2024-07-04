import { AfterContentInit, AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { InputDirDirective } from '../directives/input-dir.directive';
import { ProfileAuthService } from '../services/profile-auth.service';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
export class ProfileAuthComponent implements OnInit{
  profileAuthService = inject(ProfileAuthService);
  router = inject(Router)

  activeProfile: Profile | null = null;
  isLoaded: boolean;
  @ViewChild('pinCode') pinCodeInput: ElementRef;
  errorMsg: string = '';

  ngOnInit(): void {
      this.profileAuthService.getActiveProfile().subscribe(profile => {
        console.log(profile)
        this.activeProfile = profile
        this.isLoaded = true
      })
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
