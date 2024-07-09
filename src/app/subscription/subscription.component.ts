import { Component, inject, OnInit } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { DataService } from '../services/data.service';

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
  router = inject(Router);
  authService = inject(AuthService);
  dataService = inject(DataService);

  loggedUser: User;

  ngOnInit(): void {
      this.authService.user.subscribe(user => {
        this.loggedUser = user!
      })
  }

  onGoBack(){
    this.router.navigate(['settings']);
  }

  onChangeAccountStatus(){
    if(this.loggedUser.accountStatus==='free'){
      this.dataService.updateUser(this.loggedUser.uid, 'accountStatus', 'PLUS').subscribe(data => {
        console.log(data)
        this.authService.changeUser('accountStatus', data!['accountStatus'], this.loggedUser)
      })
    }
    else {
      this.dataService.updateUser(this.loggedUser.uid, 'accountStatus', 'free').subscribe(data => {
        console.log(data)
        this.authService.changeUser('accountStatus', data!['accountStatus'], this.loggedUser)
      })
    }
  }
}
