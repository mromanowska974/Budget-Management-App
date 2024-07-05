import { Component, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
<<<<<<< Updated upstream
=======
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProfileAuthService } from '../services/profile-auth.service';
import { LocalStorageService } from '../services/local-storage.service';
import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
>>>>>>> Stashed changes

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    CategoriesMenuComponent,

    RouterModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit{
  authService = inject(AuthService);
  router = inject(Router)

  ngOnInit(): void {
      this.authService.user$.subscribe(user => {
        console.log(user?.uid)
      })
  }

  onLogout(){
    this.authService.logout();
    this.router.navigate(["login"]);
  }
}
