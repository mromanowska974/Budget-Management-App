import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';

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
export class CategoriesMenuComponent implements OnInit{
  router = inject(Router);
  localStorageService = inject(LocalStorageService);

  @Input() categories;
  @Input() previewMode;

  activeCategory;

  ngOnInit(): void {
      const catId = this.localStorageService.getItem('categoryId')
      if(catId){
        this.activeCategory = this.categories.find(category => category.id === catId)
      }
  }

  onAddCategory(){
    this.router.navigate(['add-category'])
  }

  onSelectCategory(category){
    if(this.activeCategory && this.activeCategory.id === category.id){
      this.activeCategory = null
      this.localStorageService.removeItem('categoryId')
      this.router.navigate(['main-page'])
    }
    else {
      this.activeCategory = category;
      this.localStorageService.setItem('categoryId', this.activeCategory.id)
      this.router.navigate(['main-page', category.content]).then(() => {
        window.location.reload()
      })
    }
  }
}
