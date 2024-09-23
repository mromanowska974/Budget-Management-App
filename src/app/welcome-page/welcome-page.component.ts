import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { ContainerDirective } from '../directives/container.directive';

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

}
