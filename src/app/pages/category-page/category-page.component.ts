import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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
import { combineLatest, Observable, Subscription } from 'rxjs';
import { LastExpensesTableComponent } from "../../other-components/last-expenses-table/last-expenses-table.component";

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
    GraphComponent,
    LastExpensesTableComponent
],
  templateUrl: './category-page.component.html',
  styleUrls: [
    './category-page.component.css',
    './category-page.modal.component.css'
  ]
})
export class CategoryPageComponent implements OnInit, OnDestroy {
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;
  @ViewChild('color') newColor;
  @ViewChild('content') newContent;

  authService = inject(AuthService);
  modalService = inject(ModalService);
  categoryService = inject(CategoryService);
  expenseService = inject(ExpenseService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  activeCategory$: Observable<{id, content: string, color: string}>;
  category: {id, content: string, color: string};
  categories: {id, content: string, color: string}[];
  daysInMonthChart: any;

  action: string = '';
  actionMsg: string = '';
  errorMsg: string = '';
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  categoryExpenses: Expense[] = [];
  monthlyExpenses$: Observable<Expense[]>;
  monthlySum: number;
  previewMode: boolean;

  catId = localStorage.getItem('categoryId');
  pid = localStorage.getItem('profileId');
  uid = localStorage.getItem('uid');
  previewedId = localStorage.getItem('previewedProfileId');

  categoryEditSub: Subscription;
  categorySwitchSub: Subscription;
  categorySub: Subscription;
  combinedSub: Subscription;
  expensesSub: Subscription;

  ngOnInit(): void {
    let profileId = this.previewedId ? this.previewedId : this.pid;

    const categories$ = this.categoryService.getCategories(this.uid!, profileId!);
    const expenses$ = this.expenseService.getExpenses(this.uid, profileId);
    const categoryWasSwitched$ = this.categoryService.categoryWasSwitched;

    this.categoryEditSub = this.categoryService.categoryWasEdited.subscribe((category$) => this.getActiveCategory(category$));
    this.categorySwitchSub = combineLatest([expenses$, categoryWasSwitched$]).subscribe(([expenses, category$]) => {
      this.getActiveCategory(category$);
      this.categoryExpenses = expenses.filter(expense => this.category.id === expense.category);
      this.filterExpensesByMonth();
    });
 
    this.combinedSub = combineLatest([categories$, expenses$]).subscribe(([categories, expenses]) => {
      let category$ = new Observable(subscriber => {
        subscriber.next(categories!.find(category => category.id === this.catId));
      })

      this.categories = categories;
      this.previewMode = this.previewedId ? true : false;
      this.getActiveCategory(category$);
      this.categoryExpenses = expenses.filter(expense => this.category.id === expense.category);
      this.filterExpensesByMonth();
    })
  }

  ngOnDestroy(): void {
      if(this.categoryEditSub) this.categoryEditSub.unsubscribe();
      if(this.combinedSub) this.combinedSub.unsubscribe();
      if(this.expensesSub) this.expensesSub.unsubscribe();
  }

  private getActiveCategory(category$: Observable<any>){
    this.activeCategory$ = category$;

    this.categorySub = this.activeCategory$.subscribe((category) => {
      this.category = category;
    });
  }

  onEditCategory(template){
    this.action = 'edit';
    this.actionMsg = "Edytuj kategorię";
    this.modalService.openModal(this.modalRef, template);
  }

  onDeleteCategory(template){
    this.action = 'delete';
    this.actionMsg = "Czy na pewno chcesz usunąć: "+ this.category.content+"?";
    if(this.categories!.length <= 2){
      this.errorMsg = 'Profil musi mieć co najmniej 2 kategorie.';
    }
    else if(this.categoryExpenses.length > 0) {
      this.errorMsg = 'Nie można usunąć kategorii, do której są przypisane wydatki.';
    }
    else {
      this.errorMsg = 'UWAGA!!! Czynności nie można cofnąć!';
    }
    this.modalService.openModal(this.modalRef, template);
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

  private editCategory(){
    if(this.newColor.nativeElement.value === this.category.color && this.newContent.nativeElement.value === this.category.content){
      this.errorMsg = 'Proszę zmienić co najmniej jedną z wartości.';
    }
    else if(this.newColor.nativeElement.value === '' || this.newContent.nativeElement.value === ''){
      this.errorMsg = 'Proszę uzupełnić wszystkie pola.';
    }
    else {
      this.categoryService.updateCategory(this.uid, this.pid, this.category.id, {
        content: this.newContent.nativeElement.value,
        color: this.newColor.nativeElement.value
      }).subscribe((category$) => {
        this.categoryService.categoryWasEdited.next(category$);
        this.onCloseModal();
      })
    }
  }

  private deleteCategory(){  
    if(this.categories!.length <= 2){
      this.errorMsg = 'Profil musi mieć co najmniej 2 kategorie.';
    }
    else if(this.categoryExpenses.length > 0) {
      this.errorMsg = 'Nie można usunąć kategorii, do której są przypisane wydatki.';
    }
    else {
      this.errorMsg = 'UWAGA!!! Operacji nie można cofnąć!';
      this.categoryService.deleteCategory(this.uid!, this.pid!, this.category.id).subscribe(() => {
        this.router.navigate(['main-page']);
      })
    }
  }

  onSubmitModal(){
    if (this.action === 'edit'){
      this.editCategory();
    }
    else {
      this.deleteCategory();
    }
  }

  filterExpensesByMonth(){
    this.monthlySum = 0;
    this.monthlyExpenses$ = new Observable(subscriber => {
      subscriber.next(this.categoryExpenses!.filter(expense => new Date(expense.date).getMonth() === this.checkedDate.getMonth() && new Date(expense.date).getFullYear() === this.checkedDate.getFullYear()))
    })

      
    this.expensesSub = this.monthlyExpenses$.subscribe(expenses => {
      expenses.forEach(expense => {
        this.monthlySum += expense.price;
      })
    })
  }
}
