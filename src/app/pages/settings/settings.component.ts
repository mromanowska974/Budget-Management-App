import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { ContainerDirective } from '../../directives/container.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { ProfileService } from '../../services/profile.service';


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
  styleUrls: [
    './settings.component.css',
    './settings.modal.component.css'
  ]
})
export class SettingsComponent implements OnInit, OnDestroy{
  @ViewChild('modalView', { read: ViewContainerRef }) modalView: ViewContainerRef
  @ViewChild('oldPIN') oldPIN: ElementRef;

  router = inject(Router)
  authService = inject(AuthService);
  modalService = inject(ModalService);
  profileService = inject(ProfileService);

  sub: Subscription
  profileId = localStorage.getItem('profileId');

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
      if(this.sub) this.sub.unsubscribe()
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
      if(data === ''){
        this.errorMsg = 'Proszę podać nowy kod PIN.'
      }
      else if(data.length < 4 || data.length > 8){
        this.errorMsg = 'Kod PIN musi mieć długość od 4 do 8 cyfr.'
      }
      else {
        this.profileService.updateProfile(this.loggedUser.uid, this.activeProfile.id, 'PIN', data).subscribe(() => {
          this.profileService.getProfiles(this.loggedUser.uid).subscribe(data => {
            this.authService.changeUser('profiles', data, this.loggedUser)
          })
        })
        this.activeProfile.PIN = data;
        this.onCloseModal()
      }
    }
    else{
      if(data[1] === this.activeProfile.PIN){
        if(data[1]===data[0] || data[0] === ''){
          this.errorMsg = 'Proszę podać nowy kod PIN.'
        }
        else if(data[0].length < 4 || data[0].length > 8){
          this.errorMsg = 'Kod PIN musi mieć długość od 4 do 8 cyfr.'
        }
        else {
          this.profileService.updateProfile(this.loggedUser.uid, this.activeProfile.id, 'PIN', data[0]).subscribe(() => {
            this.profileService.getProfiles(this.loggedUser.uid).subscribe(data => {
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
    if(this.activeProfile.name === data || data === ''){
      this.errorMsg = 'Proszę podać nową nazwę.'
    }   
    else if(this.loggedUser?.profiles.find(profile => profile.name === data)){
      this.errorMsg = 'Profil o podanej nazwie już istnieje'
    }
    else {
      this.profileService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'name', data).subscribe(() => {
        this.profileService.getProfiles(this.loggedUser.uid).subscribe(data => {
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
    if(this.activeProfile.monthlyLimit == data || data.toString() === ''){
      this.errorMsg = 'Proszę podać nową wartość.'
    }
    else {
      this.profileService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'monthlyLimit', data).subscribe(() => {
        this.profileService.getProfiles(this.loggedUser.uid).subscribe(data => {
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
    if(this.activeProfile.notificationTime == data || data.toString() === ''){
      this.errorMsg = 'Proszę podać nową wartość.'
    }
    else {
      this.profileService.updateProfile(this.loggedUser?.uid!, this.activeProfile.id, 'notificationTime', data).subscribe(() => {
        this.profileService.getProfiles(this.loggedUser.uid).subscribe(data => {
          this.authService.changeUser('profiles', data, this.loggedUser)
        })
      })
      this.onCloseModal();
    }
  }

  onCloseModal(){
    this.errorMsg = ''
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
