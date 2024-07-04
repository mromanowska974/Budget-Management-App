import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Profile } from '../models/profile.interface';
import { ModalService } from '../services/modal.service';
import { InputDirDirective } from '../directives/input-dir.directive';
import { DataService } from '../services/data.service';
import { ProfileAuthService } from '../services/profile-auth.service';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,

    CommonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit, OnDestroy{
  @ViewChild('modalView', { read: ViewContainerRef }) modalView: ViewContainerRef
  @ViewChild('oldPIN') oldPIN: ElementRef;

  router = inject(Router)
  authService = inject(AuthService);
  modalService = inject(ModalService);
  dataService = inject(DataService);
  profileAuth = inject(ProfileAuthService);

  sub: Subscription

  isLoaded = false;
  action: string;
  loggedUser: User | null = null;
  activeProfile: Profile | null = null;
  errorMsg: string = '';

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user
        
        if(this.loggedUser?.profiles.length === 1){
          this.activeProfile = this.loggedUser.profiles[0]
          this.isLoaded = true;
        }
        else {
          this.profileAuth.getActiveProfile().subscribe(profile => {
            this.activeProfile = profile;
            this.isLoaded = true;
          })
        }
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe()
  }

  onGoBack(){
    //this.profileAuth.setActiveProfile(this.activeProfile!)
    this.router.navigate(['main-page'])
  }

  onChangePinCode(template){
    this.action = 'changePinCode'
    this.modalService.openModal(this.modalView, template)
  }

  onCloseModal(){
    this.errorMsg = ''
    this.profileAuth.getActiveProfile().subscribe(newProfile => {
      this.activeProfile = newProfile
      this.modalService.closeModal(this.modalView)
    })
  }

  onSubmitModal(data: any){
    this.errorMsg = ''
    switch(this.action){
      case 'changePinCode':
        if(this.activeProfile?.PIN === null){
          this.dataService.updateProfile(this.loggedUser?.uid!, 'PIN', data, this.activeProfile).subscribe(() => console.log('udało się'))
          this.onCloseModal()
        }
        else{
          if(data[1] === this.activeProfile?.PIN){
            this.dataService.updateProfile(this.loggedUser?.uid!, 'PIN', data[0], this.activeProfile!).subscribe(() => console.log('udało się'))
            this.onCloseModal()
          }
          else {
            this.errorMsg = 'Stary kod PIN jest niepoprawny.'
          }
        }
        break;

    }
  }
}
