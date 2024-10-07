import { Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ContainerDirective } from '../../directives/container.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

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
export class SubscriptionComponent implements OnInit, OnDestroy{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;

  router = inject(Router);
  authService = inject(AuthService);
  userService = inject(UserService);
  modalService = inject(ModalService);

  loggedUser: User;
  activeProfile: Profile;

  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!

        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === localStorage.getItem('profileId'))!
      })
  }

  ngOnDestroy(): void {
      if(this.sub) this.sub.unsubscribe();
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onChangeAccountStatus(template){
    if(this.loggedUser.accountStatus==='free'){
      this.userService.updateUser(this.loggedUser.uid, 'accountStatus', 'PLUS').subscribe(data => {
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
      this.userService.updateUser(this.loggedUser.uid, 'accountStatus', 'free').subscribe(data => {
        this.authService.changeUser('accountStatus', data!['accountStatus'], this.loggedUser)
      })
    }
    this.onCloseModal()
  }
}
