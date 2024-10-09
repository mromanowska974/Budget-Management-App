import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContainerDirective } from '../../directives/container.directive';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Month } from '../../models/months.enum';
import { Expense } from '../../models/expense.interface';
import { ChangeMonthArrowsComponent } from "../../other-components/change-month-arrows/change-month-arrows.component";
import { ExpensesInfoComponent } from "../../other-components/expenses-info/expenses-info.component";
import { GraphComponent } from "../../other-components/graph/graph.component";
import { CategoryService } from '../../services/category.service';
import { ExpenseService } from '../../services/expense.service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    ContainerDirective,
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,
    CommonModule,
    ChangeMonthArrowsComponent,
    ExpensesInfoComponent,
    GraphComponent
],
  templateUrl: './category-page.component.html',
  styleUrls: [
    './category-page.component.css',
    './category-page.modal.component.css'
  ]
})
export class CategoryPageComponent implements OnInit {
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;
  @ViewChild('color') newColor;
  @ViewChild('content') newContent;

  authService = inject(AuthService);
  modalService = inject(ModalService);
  categoryService = inject(CategoryService);
  expenseService = inject(ExpenseService);
  router = inject(Router);

  activeCategory: {id, content: string, color: string};
  categories;
  daysInMonthChart: any;

  isLoaded = false;
  action: string = '';
  actionMsg: string = '';
  errorMsg: string = '';
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  categoryExpenses: Expense[] = [];
  monthlyExpenses: Observable<Expense[]>;
  monthlySum: number;
  previewMode: boolean;

  catId = localStorage.getItem('categoryId');
  pid = localStorage.getItem('profileId');
  uid = localStorage.getItem('uid');
  previewedId = localStorage.getItem('previewedProfileId');

  ngOnInit(): void {
    let profileId = this.previewedId ? this.previewedId : this.pid
    this.categoryService.getCategories(this.uid!, profileId!).then(categories => {
      this.categories = categories
      this.activeCategory = categories!.find(category => category.id === this.catId)!
      this.previewMode = this.previewedId ? true : false;
      this.isLoaded = true
    })

    this.expenseService.getExpenses(this.uid, profileId).then(data => {
      this.categoryExpenses = data.filter(expense => this.activeCategory.id === expense.category);
      this.filterExpensesByMonth();
    })
  }

  onEditCategory(template){
    this.action = 'edit';
    this.actionMsg = "Edytuj kategorię"
    this.modalService.openModal(this.modalRef, template)
  }

  onDeleteCategory(template){
    this.action = 'delete';
    this.actionMsg = "Czy na pewno chcesz usunąć: "+this.activeCategory.content+"?";
    this.modalService.openModal(this.modalRef, template)
  }

  onReceiveDate(event){
    this.checkedDate = event.fullDate;
    this.checkedMonth = event.monthName;
    this.filterExpensesByMonth();
  }

  onCloseModal(){
    this.errorMsg = '';
    this.modalService.closeModal(this.modalRef);
  }

  onSubmitModal(){
    if (this.action === 'edit'){
      if(this.newColor.nativeElement.value === this.activeCategory.color && this.newContent.nativeElement.value === this.activeCategory.content){
        this.errorMsg = 'Proszę zmienić co najmniej jedną z wartości.'
      }
      else if(this.newColor.nativeElement.value === '' || this.newContent.nativeElement.value === ''){
        this.errorMsg = 'Proszę uzupełnić wszystkie pola.'
      }
      else {
        this.categories.updateCategory(this.uid, this.pid, this.activeCategory.id, {
          content: this.newContent.nativeElement.value,
          color: this.newColor.nativeElement.value
        }).then(data => {
          this.authService.changeCategory(this.authService.user.getValue()!, this.pid!, data)
          this.onCloseModal()
          window.location.reload()
        })
      }
    }
    else {
      if(this.categories!.length <= 2){
        this.errorMsg = 'Profil musi mieć co najmniej 2 kategorie.'
      }
      else if(this.categoryExpenses.length > 0) {
        this.errorMsg = 'Nie można usunąć kategorii, do której są przypisane wydatki.';
      }
      else {
        this.categoryService.deleteCategory(this.uid!, this.pid!, this.activeCategory.id).then(() => {
          this.router.navigate(['main-page']);
        })
      }
    }
  }

  filterExpensesByMonth(){
    this.monthlySum = 0;
    this.monthlyExpenses.pipe(tap(() => {
      return this.categoryExpenses!.filter(expense => new Date(expense.date).getMonth() === this.checkedDate.getMonth() && new Date(expense.date).getFullYear() === this.checkedDate.getFullYear())!
    })).subscribe(expenses => {
      expenses.forEach(expense => {
        this.monthlySum += expense.price;
      })
    })
  }
}
