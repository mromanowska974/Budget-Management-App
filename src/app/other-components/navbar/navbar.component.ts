import { Component, inject } from '@angular/core';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonDirDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  router = inject(Router);

  onLogin(){
    this.router.navigate(['login']);
  }

  onGoToAboutPage() {
    this.router.navigate(['about']);
  }

  onGoToMainPage() {
    this.router.navigate(['']);
  }
}
