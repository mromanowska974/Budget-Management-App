import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { Observable, of, Subscription } from 'rxjs';
import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';

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
export class CategoriesMenuComponent implements OnInit, OnDestroy{
  router = inject(Router);
  categoryService = inject(CategoryService);

  @Input() categories: Category[];
  @Input() previewMode;

  activeCategory$: Observable<Category>;
  activeCategory: Category | null;

  categorySub: Subscription;

  ngOnInit(): void {
      let catId = localStorage.getItem('categoryId');

      if(catId) this.activeCategory = this.categories.find(category => category.id === catId)!;
  }

  ngOnDestroy(): void {
      if(this.categorySub) this.categorySub.unsubscribe();
  }

  onAddCategory(){
    this.router.navigate(['add-category']);
  }

  private switchCategory$(category: Category){
    return of(category);
  }

  onSelectCategory(category: Category){
    const catId = localStorage.getItem('categoryId');

    if(catId !== category.id || !catId){
      this.activeCategory$ = this.switchCategory$(category);

      this.categorySub = this.activeCategory$.subscribe(data => {
        this.activeCategory = data!;
        localStorage.setItem('categoryId', data?.id);

        let navigationArray = this.previewMode ? ['main-page', category.content, 'preview'] : ['main-page', category.content];
        this.router.navigate(navigationArray);
        this.categoryService.categoryWasSwitched.next(this.activeCategory$);
      })
    }
    else {
      this.activeCategory = null;
      let navigationArray = this.previewMode ? ['main-page', 'preview', localStorage.getItem('previewedProfileId')] : ['main-page'];
      this.router.navigate(navigationArray);
    }   
  }
}
