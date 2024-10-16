import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.interface';
import { Firestore } from '@angular/fire/firestore';
import { MessagingService } from './services/messaging.service';
import { UserService } from './services/user.service';
import { ProfileService } from './services/profile.service';
import { combineLatest } from 'rxjs';

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
    let uid: string | null = localStorage.getItem('uid');

    if(uid !== null){
      const user$ = this.userService.getUser(uid);
      const profiles$ = this.profileService.getProfiles(uid);
      
      combineLatest([user$, profiles$]).subscribe(([user, profiles]) => {
        this.authService.setUser({
          email: user!['email'],
          accountStatus: user!['accountStatus'],
          profiles: profiles,
          uid: uid!
        })
      })
    }

    //MESSAGING
    this.messagingService.getDeviceToken();
    this.messagingService.onMessage();
  }
}
