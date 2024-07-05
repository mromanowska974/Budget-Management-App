import { Component } from '@angular/core';
import { ButtonDirDirective } from '../directives/button-dir.directive';

@Component({
  selector: 'app-categories-menu',
  standalone: true,
  imports: [
    ButtonDirDirective
  ],
  templateUrl: './categories-menu.component.html',
  styleUrl: './categories-menu.component.css'
})
export class CategoriesMenuComponent {

}
