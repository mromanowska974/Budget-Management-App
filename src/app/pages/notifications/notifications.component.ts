import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContainerDirective } from '../../directives/container.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { WidgetDirective } from '../../directives/widget.directive';
import { Profile } from '../../models/profile.interface';
import { Message } from '../../models/message.interface';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    ContainerDirective,
    ButtonDirDirective,
    WidgetDirective,

    CommonModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit{
  router = inject(Router);
  profileService = inject(ProfileService);
  notificationService = inject(NotificationService);
  activeProfile: Profile;

  uid = localStorage.getItem('uid');
  pid = localStorage.getItem('profileId');

  ngOnInit(): void {
      this.profileService.getProfile(this.uid, this.pid).then(profile => {
        this.activeProfile = profile
      }).then(() => {
        this.notificationService.getMessages(this.uid, this.pid).then(messages => {
          this.activeProfile.messages = messages;
        })
      })
  }

  onGoBack(){
    this.router.navigate(['main-page']);
  }

  onReadMessage(message: Message){
    message.isRead = true
    this.notificationService.readMessage(this.uid, this.pid, message.id)
  }
}
