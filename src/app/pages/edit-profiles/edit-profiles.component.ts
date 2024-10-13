import { Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContainerDirective } from '../../directives/container.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { WidgetDirective } from '../../directives/widget.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { ProfileService } from '../../services/profile.service';

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
  modalService = inject(ModalService);
  profileService = inject(ProfileService);

  loggedUser: User;
  isLoaded = false;
  action: string;
  actionMsg: string;
  errorMsg: string;
  data: any;
  selectedProfile: Profile;
  activeProfile: Profile;
  sub: Subscription;

  adminsCount;
  adminsLimit = 3;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.isLoaded = true;
        this.adminsCount = this.loggedUser.profiles.filter(profile => profile.role === 'admin').length;

        this.profileService.getProfile(this.loggedUser.uid, localStorage.getItem('profileId')).subscribe(profile => {
          this.activeProfile = profile
        })
      })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe();
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onModifyPrivileges(template, profileName, profileIndex){
    this.action = 'modifyPrivileges'
    this.actionMsg = 'Uprawnienia profilu: '+profileName
    this.selectedProfile = this.loggedUser.profiles.find(profile => profile.id === profileIndex)!
    this.modalService.openModal(this.modalView, template)
  }

  private modifyPrivileges(data){
    if(((data === 'admin' && this.adminsCount < this.adminsLimit) || data === 'user') && this.selectedProfile.id !== this.activeProfile.id){
      this.profileService.updateProfile(this.loggedUser.uid, this.selectedProfile.id, 'role', data).subscribe(profile => {
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
    this.modalService.openModal(this.modalView, template)
  }

  private resetPinCode(newPin, pid){
    if(newPin === undefined) this.errorMsg = 'Proszę podać nowy kod PIN.';
    else if(newPin.toString().length < 4 || newPin.toString().length > 8) this.errorMsg = 'Kod PIN musi zawierać od 4 do 8 cyfr.';
    else {
      this.profileService.updateProfile(this.loggedUser.uid, pid, 'PIN', newPin.toString()).subscribe(data => {
        this.authService.changeProfiles(this.loggedUser, data)
  
        this.data = null;
        this.action = '';
        this.onCloseModal();
      })
    }
  }

  onDeleteProfile(template, profileName, profileIndex){
    this.action = 'deleteProfile'
    this.actionMsg = 'Czy na pewno chcesz usunąć '+profileName+'?';
    this.selectedProfile = this.loggedUser.profiles.find(profile => profile.id === profileIndex)!
    this.modalService.openModal(this.modalView, template)
  }

  private deleteProfile(pid: string){
    this.profileService.deleteProfile(this.loggedUser.uid, pid).then(() => {
      this.authService.deleteProfile(this.loggedUser, pid)
      this.onCloseModal();
    })
  }

  onCloseModal(){
    this.errorMsg = '';
    this.action = '';
    this.data = '';
    this.modalService.closeModal(this.modalView);
  }

  onSubmitModal(profileId){
    switch(this.action){
      case 'modifyPrivileges':
        if(this.adminsCount === this.adminsLimit && this.selectedProfile.role === 'admin') this.errorMsg = 'Przekroczono limit Założycieli.'
        else this.modifyPrivileges(this.selectedProfile.role)
        break;
      case 'resetPinCode':
        this.resetPinCode(this.data, profileId)
        break;
      case 'deleteProfile':
        this.deleteProfile(profileId)
        break;
    }
  }
}
