import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { ModalService } from '../services/modal.service';
import { InputDirDirective } from '../directives/input-dir.directive';

@Component({
  selector: 'app-edit-profiles',
  standalone: true,
  imports: [
    ContainerDirective,
    ButtonDirDirective,
    WidgetDirective,
    InputDirDirective,

    CommonModule
  ],
  templateUrl: './edit-profiles.component.html',
  styleUrl: './edit-profiles.component.css'
})
export class EditProfilesComponent implements OnInit{
  @ViewChild('modalView', { read: ViewContainerRef }) modalView: ViewContainerRef;

  router = inject(Router);
  authService = inject(AuthService);
  modalService = inject(ModalService);

  loggedUser: User;
  isLoaded = false;
  action: string;
  actionMsg: string;

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

  onResetPinCode(template){
    this.action = 'resetPinCode'
    this.actionMsg = 'Podaj nowy kod PIN'
    this.modalService.openModal(this.modalView, template)
  }

  onDeleteProfile(template, profileName){
    this.action = 'deleteProfile'
    this.actionMsg = 'Czy na pewno chcesz usunąć '+profileName+'?';
    this.modalService.openModal(this.modalView, template)
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalView)
  }
}
