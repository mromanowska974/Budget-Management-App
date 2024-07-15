import { Component, inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ContainerDirective } from '../directives/container.directive';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { LocalStorageService } from '../services/local-storage.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { ModalService } from '../services/modal.service';
import { InputDirDirective } from '../directives/input-dir.directive';
import { Router } from '@angular/router';
import { Month } from '../models/months.enum';
import { Expense } from '../models/expense.interface';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [
    ContainerDirective,
    WidgetDirective,
    ButtonDirDirective,
    InputDirDirective,

    CommonModule
  ],
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;
  @ViewChild('color') newColor;
  @ViewChild('content') newContent;

  localStorageService = inject(LocalStorageService);
  authService = inject(AuthService);
  dataService = inject(DataService);
  modalService = inject(ModalService);
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
  monthlyExpenses: Expense[] = [];
  monthlySum: number;
  previewMode: boolean;

  catId = this.localStorageService.getItem('categoryId');
  pid = this.localStorageService.getItem('profileId');
  uid = this.localStorageService.getItem('uid');
  previewedId = this.localStorageService.getItem('previewedProfileId');

  ngOnInit(): void {
    if(this.previewedId){
      this.dataService.getCategories(this.uid!, this.previewedId!).then(categories => {
        this.categories = categories
        this.activeCategory = categories!.find(category => category.id === this.catId)!
        this.previewMode = true;
        this.isLoaded = true
      })
    }
    else {
      this.dataService.getCategories(this.uid!, this.pid!).then(categories => {
        this.categories = categories
        this.activeCategory = categories!.find(category => category.id === this.catId)!
        this.previewMode = false
        this.isLoaded = true
      })
    }

    this.dataService.getExpenses(this.uid, this.pid).then(data => {
      this.categoryExpenses = data.filter(expense => this.activeCategory.id === expense.category);
      this.filterExpensesByMonth();
      this.createDaysInMonthChart();
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

  onStepBackMonth(){
    this.checkedDate.setMonth(this.checkedDate.getMonth()-1);
    this.checkedMonth = Month[this.checkedDate.getMonth()]
    this.filterExpensesByMonth()
    this.createDaysInMonthChart()
  }

  onMoveForwardMonth(){
    if((this.checkedDate.getMonth() < this.today.getMonth()) || (this.checkedDate.getMonth() >= this.today.getMonth() && this.checkedDate.getFullYear() < this.today.getFullYear())){
      this.checkedDate.setMonth(this.checkedDate.getMonth()+1);
      this.checkedMonth = Month[this.checkedDate.getMonth()]
      this.filterExpensesByMonth()
      this.createDaysInMonthChart()
    }
  }

  createDaysInMonthChart(){
    if(this.daysInMonthChart !== undefined){
      this.daysInMonthChart.destroy();
    }

    const daysInMonth = this.getDaysInMonth(this.checkedDate.getMonth(), this.checkedDate.getFullYear())

    let days: number[] = [];
    let daysExpensesSums: number[] = [];

    daysInMonth.forEach(day => {
      let sum = 0;
      days.push(day.getDate());

      this.monthlyExpenses.forEach(expense => {
        expense.date.setHours(0,0,0,0);
        day.setHours(0,0,0,0);
        
        if(expense.date.getTime() === day.getTime()){
          sum+=expense.price;
        }
      })

      daysExpensesSums.push(sum);
    });


    this.daysInMonthChart = new Chart('daysInMonthChart', {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Wydatki wg dni miesiąca',
            data: daysExpensesSums,
            backgroundColor: this.activeCategory.color,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        maintainAspectRatio: false
      },
    });
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalRef)
  }

  onSubmitModal(){
    if (this.action === 'edit'){
      if(this.newColor.nativeElement.value === this.activeCategory.color && this.newContent.nativeElement.value === this.activeCategory.content){
        this.errorMsg = 'Proszę zmienić co najmniej jedno pole.'
      }
      else {
        this.dataService.updateCategory(this.uid, this.pid, this.activeCategory.id, {
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
      if(this.categories!.length > 2){
        this.dataService.deleteCategory(this.uid!, this.pid!, this.activeCategory.id).then(() => {
          this.router.navigate(['main-page']);
        })
      }
      else {
        this.errorMsg = 'Profil musi mieć co najmniej 2 kategorie.'
      }
    }
  }

  filterExpensesByMonth(){
    this.monthlySum = 0;
    this.monthlyExpenses = this.categoryExpenses!.filter(expense => expense.date.getMonth() === this.checkedDate.getMonth() && expense.date.getFullYear() === this.checkedDate.getFullYear())!
    this.monthlyExpenses.forEach(expense => {
      this.monthlySum += expense.price;
    })
  }

  getDaysInMonth = (month, year) => (new Array(31)).fill('').map((v,i)=>new Date(year,month,i+1)).filter(v=>v.getMonth()===month)
}
