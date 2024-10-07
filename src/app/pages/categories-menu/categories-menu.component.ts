import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonDirDirective } from '../../directives/button-dir.directive';

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

  @Input() categories;
  @Input() previewMode;

  activeCategory;

  ngOnInit(): void {
      const catId = localStorage.getItem('categoryId')
      if(catId){
        this.activeCategory = this.categories.find(category => category.id === catId)
      }
  }

  onAddCategory(){
    this.router.navigate(['add-category'])
  }

  onSelectCategory(category){
    if(this.activeCategory && this.activeCategory.id === category.id){
      this.activeCategory = null;
      localStorage.removeItem('categoryId');
      if(this.previewMode){
        this.router.navigate(['main-page', 'preview', localStorage.getItem('previewedProfileId')]);
      }
      else{
        this.router.navigate(['main-page']);
      }
    }
    else {
      this.activeCategory = category;
      localStorage.setItem('categoryId', this.activeCategory.id);
      if (this.previewMode){
        this.router.navigate(['main-page', category.content, 'preview']).then(() => {
          window.location.reload();
        })
      }
      else {
        this.router.navigate(['main-page', category.content]).then(() => {
          window.location.reload();
        })
      }
    }
  }
}
