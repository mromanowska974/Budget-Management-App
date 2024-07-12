import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { DataService } from '../services/data.service';
import { ModalService } from '../services/modal.service';
import { LocalStorageService } from '../services/local-storage.service';
import { Profile } from '../models/profile.interface';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    ContainerDirective,
    ButtonDirDirective
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;

  router = inject(Router);
  authService = inject(AuthService);
  dataService = inject(DataService);
  modalService = inject(ModalService);
  localStorageService = inject(LocalStorageService);

  loggedUser: User;
  activeProfile: Profile;

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.loggedUser = user!

        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!
      })
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onChangeAccountStatus(template){
    if(this.loggedUser.accountStatus==='free'){
      this.dataService.updateUser(this.loggedUser.uid, 'accountStatus', 'PLUS').subscribe(data => {
        this.authService.changeUser('accountStatus', data!['accountStatus'], this.loggedUser)
      })
    }
    else {
      this.modalService.openModal(this.modalRef, template)
      
    }
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalRef);
  }

  onUnderstood(){
    if(this.loggedUser.profiles.length <= 3 && this.loggedUser.profiles.filter(profile => profile.role === 'admin').length === 1){
      this.dataService.updateUser(this.loggedUser.uid, 'accountStatus', 'free').subscribe(data => {
        this.authService.changeUser('accountStatus', data!['accountStatus'], this.loggedUser)
      })
    }
    else {
      console.log('Nie można anulować')
    }
    this.onCloseModal()
  }
}
