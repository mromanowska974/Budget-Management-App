import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { LocalStorageService } from './local-storage.service';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  localStorageService = inject(LocalStorageService);
  messaging = inject(Messaging);
  http = inject(HttpClient);

  currentMessage = new Subject<any>;

  serverUrl = 'https://aidzbo-notifications.onrender.com';

  getDeviceToken(){
    getToken(this.messaging, {vapidKey: environment.vapidKey})
    .then(token => {
      this.localStorageService.setItem('messageToken', token)
    }).catch(error => {
      console.log(error)
    })
  }

  onMessage(){
    onMessage(this.messaging, {
      next: (payload) => {
        console.log('Message', payload)
        this.currentMessage.next(payload)
      },
      error: (error) => console.log('Message error', error),
      complete: () => console.log('Done listening to messages'),
    })
  }

  sendMessage(title, content){
    this.http.post(this.serverUrl+'/send', {
      fcmToken: this.localStorageService.getItem('messageToken'),
      title: title,
      content: content
    }).subscribe();
  }
}
