import { Component, OnInit, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,

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
