import { Component, ComponentRef, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';

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
export class EditProfilesComponent implements OnInit{
  @ViewChild('modalView', { read: ViewContainerRef }) modalView: ViewContainerRef;

  router = inject(Router);
  authService = inject(AuthService);
  dataService = inject(DataService);
  modalService = inject(ModalService);

  loggedUser: User;
  isLoaded = false;
  action: string;
  actionMsg: string;
  data: any;
  sub: Subscription;

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.isLoaded = true;

        console.log(this.loggedUser)
      })
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onModifyPrivileges(template, profileName){
    this.action = 'modifyPrivileges'
    this.actionMsg = 'Uprawnienia profilu: '+profileName
    this.modalService.openModal(this.modalView, template)
  }

  onResetPinCode(template, profileIndex){
    this.action = 'resetPinCode'
    this.actionMsg = 'Podaj nowy kod PIN'
    console.log('lolo')
    this.modalService.openModal(this.modalView, template, profileIndex)
  }

  private resetPinCode(data){
    console.log('dede')
    this.sub = this.modalService.dataSub.subscribe(pid => {
      console.log(data, pid)

      this.dataService.updateProfile(this.loggedUser.uid, pid, 'PIN', data.toString()).subscribe(data => {
        this.authService.changeProfiles(this.loggedUser, data)

        console.log(this.authService.user.value)
        this.data = null;
        this.action = '';
        this.onCloseModal();
      })
    })
  }

  onDeleteProfile(template, profileName){
    this.action = 'deleteProfile'
    this.actionMsg = 'Czy na pewno chcesz usunąć '+profileName+'?';
    this.modalService.openModal(this.modalView, template)
  }

  onCloseModal(){
    if(this.sub) this.sub.unsubscribe()
    this.modalService.closeModal(this.modalView)
  }

  onSubmitModal(){
    switch(this.action){
      case 'modifyPrivileges':
        break;
      case 'resetPinCode':
        console.log('nene')
        this.resetPinCode(this.data)
        break;
      case 'deleteProfile':
        break;
    }
  }
}
