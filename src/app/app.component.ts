import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.interface';
import { Firestore } from '@angular/fire/firestore';
import { MessagingService } from './services/messaging.service';
import { UserService } from './services/user.service';
import { ProfileService } from './services/profile.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Smart Coinbook';

  db = inject(Firestore);
  authService = inject(AuthService);
  messagingService = inject(MessagingService);
  userService = inject(UserService);
  profileService = inject(ProfileService);

  loggedUser: User | null = null;

  ngOnInit(): void {
    let uid: string |null = localStorage.getItem('uid');

    if(uid !== null){
      this.userService.getUser(uid).then(result => {
        this.profileService.getProfiles(uid).then(data => {
          this.authService.setUser({
            email: result!['email'],
            accountStatus: result!['accountStatus'],
            profiles: data,
            uid: uid!
          })
        })

      })
    }

    //MESSAGING
    this.messagingService.getDeviceToken();
    this.messagingService.onMessage();
  }
}
