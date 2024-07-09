import { Component, inject, Input } from '@angular/core';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  router = inject(Router);

  @Input() categories;

  onAddCategory(){
    this.router.navigate(['add-category'])
  }
}
