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
import { LocalStorageService } from '../services/local-storage.service';
import { ContainerDirective } from '../directives/container.directive';


@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,
    ContainerDirective,

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
  localStorageService = inject(LocalStorageService);
  profileAuth = inject(ProfileAuthService);

  sub: Subscription
  profileId = this.localStorageService.getItem('profileId');

  isLoaded = false;
  action: string;
  loggedUser: User;
  activeProfile: Profile;
  errorMsg: string = '';
  settingMsg: string = '';
  labelMsg: string = '';

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        
        if(this.loggedUser.profiles.length === 1){
          this.activeProfile = this.loggedUser.profiles[0]
          this.isLoaded = true;
        }
        else {
          this.activeProfile = this.loggedUser?.profiles.find(profile => profile.id === this.profileId)!
          this.isLoaded = true;
        }
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe()
  }

  onSubscription(){
    this.router.navigate(['subscription'])
  }

  onGoBack(){
    this.router.navigate(['main-page'])
  }

  onChangePinCode(template){
    this.action = 'changePinCode';
    if(this.activeProfile.PIN === null) this.settingMsg = 'Ustaw kod PIN';
    else this.settingMsg = 'Zmień kod PIN';

    this.labelMsg = 'Nowy kod PIN'
    this.modalService.openModal(this.modalView, template)
  }

  private changePinCode(data: any){
    if(this.activeProfile?.PIN === null){
      this.dataService.updateProfile(this.loggedUser.uid, this.activeProfile.id, 'PIN', data).then(() => {
        this.dataService.getProfiles(this.loggedUser.uid).then(data => {
          this.authService.changeUser('profiles', data, this.loggedUser)
        })
      })
      this.activeProfile.PIN = data;
      this.onCloseModal()
    }
    else{
      if(data[1] === this.activeProfile.PIN){
        if(data[1]===data[0] || data[0] === ''){
          this.errorMsg = 'Proszę podać nowy kod PIN.'
        }
        else {
          this.dataService.updateProfile(this.loggedUser.uid, this.activeProfile.id, 'PIN', data[0]).then(() => {
            this.dataService.getProfiles(this.loggedUser.uid).then(data => {
              this.authService.changeUser('profiles', data, this.loggedUser)
            })
          })
          this.onCloseModal()
        }
      }
      else {
        this.errorMsg = 'Stary kod PIN jest niepoprawny.'
      }
    }
  }

  onChangeName(template){
    this.action = 'changeName'
    this.settingMsg = 'Zmień nazwę profilu';
    this.labelMsg = 'Nowa nazwa profilu';
    this.modalService.openModal(this.modalView, template)
  }

  private changeName(data: string){
    if(this.activeProfile.name === data){
      this.errorMsg = 'Proszę podać nową nazwę.'
    }   
    else if(this.loggedUser?.profiles.find(profile => profile.name === data)){
      this.errorMsg = 'Profil o podanej nazwie już istnieje'
    }
    else {
      this.dataService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'name', data).then(() => {
        this.dataService.getProfiles(this.loggedUser.uid).then(data => {
          this.authService.changeUser('profiles', data, this.loggedUser)
        })
      })
      this.onCloseModal();
    }
  }

  onSetMonthlyLimit(template){
    this.action = 'setMonthlyLimit'
    this.settingMsg = 'Ustaw limit miesięczny'
    this.labelMsg = 'Kwota PLN'
    this.modalService.openModal(this.modalView, template)
  }

  private setMonthlyLimit(data: number){
    if(this.activeProfile.monthlyLimit == data){
      this.errorMsg = 'Proszę podać nową wartość.'
    }
    else {
      this.dataService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'monthlyLimit', data).then(() => {
        this.dataService.getProfiles(this.loggedUser.uid).then(data => {
          this.authService.changeUser('profiles', data, this.loggedUser)
        })
      })
      this.onCloseModal();
    }
  }

  onSetNotificationTime(template){
    this.action = 'setNotificationTime'
    this.settingMsg = 'Ustaw czas powiadomień'
    this.labelMsg = 'Liczba dni przed nadejściem daty realizacji wydatku'
    this.modalService.openModal(this.modalView, template)
  }

  private setNotificationTime(data: number){
    if(this.activeProfile.notificationTime == data){
      this.errorMsg = 'Proszę podać nową wartość.'
    }
    else {
      this.dataService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'notificationTime', data).then(() => {
        this.dataService.getProfiles(this.loggedUser.uid).then(data => {
          this.authService.changeUser('profiles', data, this.loggedUser)
        })
      })
      this.onCloseModal();
    }
  }

  onCloseModal(){
    this.errorMsg = ''
    this.profileAuth.getActiveProfile().subscribe(newProfile => {
      if(newProfile !== null){
        console.log(newProfile, this.activeProfile)
        this.activeProfile = newProfile!
      }
    })
    this.modalService.closeModal(this.modalView)
  }

  onEditProfiles(){
    this.router.navigate(['edit-profiles'])
  }

  onSubmitModal(data: any){
    this.errorMsg = ''
    switch(this.action){
      case 'changePinCode':
        this.changePinCode(data);
        break;
      case 'changeName':
        this.changeName(data);
        break;
      case 'setMonthlyLimit':
        this.setMonthlyLimit(data);
        break;
      case 'setNotificationTime':
        this.setNotificationTime(data);
        break;
    }
  }
}
