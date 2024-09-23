import { Component } from '@angular/core';
import { ButtonDirDirective } from '../directives/button-dir.directive';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonDirDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
