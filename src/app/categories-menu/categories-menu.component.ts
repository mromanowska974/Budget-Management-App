import { Component, Input } from '@angular/core';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories-menu',
  standalone: true,
  imports: [
    ButtonDirDirective,

    CommonModule
  ],
  templateUrl: './categories-menu.component.html',
  styleUrl: './categories-menu.component.css'
})
export class CategoriesMenuComponent {
  @Input() categories;
}
