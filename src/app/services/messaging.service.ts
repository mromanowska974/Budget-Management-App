import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  messaging = inject(Messaging);
  http = inject(HttpClient);

  currentMessage = new Subject<any>;

  serverUrl = 'https://aidzbo-notifications.onrender.com';

  getDeviceToken(){
    getToken(this.messaging, {vapidKey: environment.vapidKey})
    .then(token => {
      localStorage.setItem('messageToken', token)
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
      fcmToken: localStorage.getItem('messageToken'),
      title: title,
      content: content
    }).subscribe();
  }
}
