import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../other-components/navbar/navbar.component';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { ContainerDirective } from '../../directives/container.directive';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  imports: [
    NavbarComponent,
    ButtonDirDirective,
    ContainerDirective
  ],
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css'
})
export class WelcomePageComponent {
  router = inject(Router);

  onCreateAccount(){
    this.router.navigate(['register'])
  }
}
