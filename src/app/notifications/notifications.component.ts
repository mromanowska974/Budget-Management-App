import { Component, inject, OnInit } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';
import { Profile } from '../models/profile.interface';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { Message } from '../models/message.interface';

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
  localStorageService = inject(LocalStorageService);
  dataService = inject(DataService);
  activeProfile: Profile;

  uid = this.localStorageService.getItem('uid');
  pid = this.localStorageService.getItem('profileId');

  ngOnInit(): void {
      this.dataService.getProfile(this.uid, this.pid).then(profile => {
        this.activeProfile = profile
      }).then(() => {
        this.dataService.getMessages(this.uid, this.pid).then(messages => {
          this.activeProfile.messages = messages;
        })
      })
  }

  onGoBack(){
    this.router.navigate(['main-page']);
  }

  onReadMessage(message: Message){
    message.isRead = true
    this.dataService.readMessage(this.uid, this.pid, message.id)
  }
}
