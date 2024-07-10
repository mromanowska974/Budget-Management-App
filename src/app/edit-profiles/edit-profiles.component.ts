import { Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { ModalService } from '../services/modal.service';
import { InputDirDirective } from '../directives/input-dir.directive';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { Profile } from '../models/profile.interface';
import { LocalStorageService } from '../services/local-storage.service';

@Component({
  selector: 'app-edit-profiles',
  standalone: true,
  imports: [
    ContainerDirective,
    ButtonDirDirective,
    WidgetDirective,
    InputDirDirective,

    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-profiles.component.html',
  styleUrl: './edit-profiles.component.css'
})
export class EditProfilesComponent implements OnInit, OnDestroy{
  @ViewChild('modalView', { read: ViewContainerRef }) modalView: ViewContainerRef;

  router = inject(Router);
  authService = inject(AuthService);
  dataService = inject(DataService);
  modalService = inject(ModalService);
  localStorageService = inject(LocalStorageService)

  loggedUser: User;
  isLoaded = false;
  action: string;
  actionMsg: string;
  errorMsg: string;
  data: any;
  selectedProfile: Profile;
  activeProfile: Profile;
  modalSub: Subscription;
  sub: Subscription;

  adminsCount;
  adminsLimit = 3;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.isLoaded = true;
        this.adminsCount = this.loggedUser.profiles.filter(profile => profile.role === 'admin').length;

        this.dataService.getProfile(this.loggedUser.uid, this.localStorageService.getItem('profileId')).then(profile => {
          this.activeProfile = profile
        })
      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onModifyPrivileges(template, profileName, profileIndex){
    this.action = 'modifyPrivileges'
    this.actionMsg = 'Uprawnienia profilu: '+profileName
    this.selectedProfile = this.loggedUser.profiles.find(profile => profile.id === profileIndex)!
    this.data = this.selectedProfile.role;
    this.modalService.openModal(this.modalView, template, profileIndex)
  }

  private modifyPrivileges(data){
    if(((data === 'admin' && this.adminsCount < this.adminsLimit) || data === 'user') && this.selectedProfile.id !== this.activeProfile.id){
      this.dataService.updateProfile(this.loggedUser.uid, this.selectedProfile.id, 'role', data).then(profile => {
        this.authService.changeProfiles(this.loggedUser, profile)
        this.data = null;
        this.action = '';
        this.onCloseModal()
      })
    }
  }

  onResetPinCode(template, profileIndex){
    this.action = 'resetPinCode'
    this.actionMsg = 'Podaj nowy kod PIN'
    this.selectedProfile = this.loggedUser.profiles.find(profile => profile.id === profileIndex)!
    this.modalService.openModal(this.modalView, template, profileIndex)
  }

  private resetPinCode(data){
    this.modalSub = this.modalService.dataSub.subscribe(pid => {
      this.dataService.updateProfile(this.loggedUser.uid, pid, 'PIN', data.toString()).then(data => {
        this.authService.changeProfiles(this.loggedUser, data)

        this.data = null;
        this.action = '';
        this.onCloseModal();
      })
    })
  }

  onDeleteProfile(template, profileName, profileIndex){
    this.action = 'deleteProfile'
    this.actionMsg = 'Czy na pewno chcesz usunąć '+profileName+'?';
    this.selectedProfile = this.loggedUser.profiles.find(profile => profile.id === profileIndex)!
    this.modalService.openModal(this.modalView, template, profileIndex)
  }

  private deleteProfile(pid: string){
    this.dataService.deleteProfile(this.loggedUser.uid, pid).then(() => {
      this.authService.deleteProfile(this.loggedUser, pid)
      this.onCloseModal();
    })
  }

  onCloseModal(){
    this.errorMsg = '';
    if(this.modalSub) this.modalSub.unsubscribe()
    this.modalService.closeModal(this.modalView)
  }

  onSubmitModal(){
    this.modalSub = this.modalService.dataSub.subscribe(data => {
      switch(this.action){
        case 'modifyPrivileges':
          if(this.selectedProfile.id === this.activeProfile.id) this.errorMsg = 'Nie można zmienić uprawnień dla aktywnego profilu.'
          else if(this.adminsCount === this.adminsLimit && this.data === 'admin') this.errorMsg = 'Przekroczono limit Założycieli.'
          else this.modifyPrivileges(this.data)
          break;
        case 'resetPinCode':
          this.resetPinCode(this.data)
          break;
        case 'deleteProfile':
          this.deleteProfile(data)
          break;
      }
    })
  }
}
