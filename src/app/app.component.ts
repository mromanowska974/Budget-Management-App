import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Data, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.interface';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'budget-management-app';

  authService = inject(AuthService);
  db = inject(Firestore);
  dataService = inject(DataService);

  ngOnInit(): void {
      this.authService.user$.subscribe(user => {
        if(user){
          this.dataService.getUser(user.uid).subscribe(data => {
            let userDoc = data; 

            this.authService.currentUserSig.set({
              email: userDoc.data()!['email'],
              accountStatus: userDoc.data()!['accountStatus'],
              profiles: userDoc.data()!['profiles'],
              uid: user.uid
            })
            console.log(this.authService.currentUserSig())
          })
        } else {
          this.authService.currentUserSig.set(null);
        }

        console.log(this.authService.currentUserSig())
      });
  }
}
