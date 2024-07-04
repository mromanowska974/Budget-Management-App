import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { User } from './models/user.interface';
import { Firestore } from '@angular/fire/firestore';
import { DataService } from './services/data.service';
import { LocalStorageService } from './services/local-storage.service';

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
  localStorageService = inject(LocalStorageService)

  loggedUser: User | null = null;

  ngOnInit(): void {
    let uid: string |null = this.retrieveFromLocalStorage('uid');

    if(uid !== null){
      this.dataService.getUser(uid!).subscribe(result => {
        console.log(result.data())
        this.authService.setUser({
          email: result.data()!['email'],
          accountStatus: result.data()!['accountStatus'],
          profiles: result.data()!['profiles'],
          uid: uid!
        })

      })
    }
  }

  retrieveFromLocalStorage(key) {
    const value = this.localStorageService.getItem(key);
    return value;
  }
}
