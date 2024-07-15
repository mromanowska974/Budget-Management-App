import { AfterContentInit, AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { WidgetDirective } from '../directives/widget.directive';
import { ButtonDirDirective } from '../directives/button-dir.directive';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.interface';
import { Profile } from '../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../services/local-storage.service';
import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
import { DataService } from '../services/data.service';
import { ModalService } from '../services/modal.service';
import { Expense } from '../models/expense.interface';
import { Month } from '../models/months.enum';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    CategoriesMenuComponent,

    RouterModule,
    CommonModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit, OnDestroy, AfterContentInit, AfterViewInit{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;

  authService = inject(AuthService);
  router = inject(Router);
  dataService = inject(DataService);
  localStorageService = inject(LocalStorageService);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute)

  chart: any;
  activeChart = 'category'

  profileId = this.localStorageService.getItem('profileId');

  loggedUser: User;
  activeProfile: Profile;
  previewedProfile: Profile;
  previewMode = false;
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  monthlyExpenses: Expense[] = [];
  monthlySum: number;
  sub: Subscription;

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.profileId)!

        this.dataService.getExpenses(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.expenses = data;
          this.filterExpensesByMonth();
          this.createChart();
        })
        
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.activeProfile.categories = data;
        }).then(() => {
          this.route.paramMap.subscribe(params => {
            if(params.has('profileId')){
              this.dataService.getProfile(this.loggedUser?.uid, params.get('profileId')).then(profile => {
                if(profile.id === this.activeProfile.id){
                  this.previewMode = false;
                  this.localStorageService.removeItem('previewedProfileId')
                  this.router.navigate(['main-page']) 
                }
                else {
                  this.previewMode = true;
                  this.previewedProfile = profile
                }
              })
            }
          })
        })
      })
  }

  ngAfterContentInit(): void {
    this.createChart();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  createChart(){
    if(this.chart !== undefined){
      this.chart.destroy();
    }

    let names: string[] = [];
    let expensesSums: number[] = [];
    let colors: string[] = [];

    let daysInMonth = this.getDaysInMonth(this.checkedDate.getMonth(), this.checkedDate.getFullYear())

    if(this.activeChart === 'category'){
      this.activeProfile.categories?.forEach(category => {
        let sum = 0;
        names.push(category.content);
        colors.push(category.color);
  
        this.monthlyExpenses?.forEach(expense => {
          if(expense.category === category.id){
            sum += expense.price;
          }
        })
        expensesSums.push(sum);
      })
    }
    else if(this.activeChart === 'daysInMonth'){
      daysInMonth.forEach(day => {
        let sum = 0;
        names.push(day.getDate().toString());
  
        this.monthlyExpenses.forEach(expense => {
          expense.date.setHours(0,0,0,0);
          day.setHours(0,0,0,0);
          
          if(expense.date.getTime() === day.getTime()){
            sum+=expense.price;
          }
        })
  
        expensesSums.push(sum);
      });
    }


    this.chart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: 'Wydatki',
            data: expensesSums,
            backgroundColor: this.activeChart === 'category' ? colors : '#c6c4ff',
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

  onLogout(){
    this.localStorageService.clear();
    this.authService.logout();
    this.router.navigate(["login"]);
  }

  onAddProfile(){
    this.router.navigate(["add-profile"]);
  }

  onAddExpense(){
    this.router.navigate(['add-expense'])
  }

  onStepBackMonth(){
    this.checkedDate.setMonth(this.checkedDate.getMonth()-1);
    this.checkedMonth = Month[this.checkedDate.getMonth()]
    this.filterExpensesByMonth()
    this.createChart()
  }

  onMoveForwardMonth(){
    if((this.checkedDate.getMonth() < this.today.getMonth()) || (this.checkedDate.getMonth() >= this.today.getMonth() && this.checkedDate.getFullYear() < this.today.getFullYear())){
      this.checkedDate.setMonth(this.checkedDate.getMonth()+1);
      this.checkedMonth = Month[this.checkedDate.getMonth()]
      this.filterExpensesByMonth()
      this.createChart()
    }
  }

  onSettings(){
    this.router.navigate(["settings"]);
  }

  onCategoryChart(){
    this.activeChart = 'category'
    this.createChart()
  }

  onDaysInMonthChart(){
    this.activeChart = 'daysInMonth'
    this.createChart()
  }

  onEnterPreviewMode(template){
    this.modalService.openModal(this.modalRef, template)
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalRef);
  }

  onSelectProfile(profile: Profile){
    if((this.previewMode === false && profile.id !== this.activeProfile.id) || (this.previewMode === true && profile.id !== this.previewedProfile.id)){
      this.previewedProfile = profile;
      this.localStorageService.setItem('previewedProfileId', this.previewedProfile.id)
      this.router.navigate(['main-page','preview', this.previewedProfile.id]).then(() => {
        window.location.reload();
      })
    }
  }

  findCategory(expense: Expense){
    return (category) => category.id === expense.category
  }

  filterExpensesByMonth(){
    this.monthlySum = 0;
    this.monthlyExpenses = this.activeProfile.expenses!.filter(expense => expense.date.getMonth() === this.checkedDate.getMonth() && expense.date.getFullYear() === this.checkedDate.getFullYear())!
    this.monthlyExpenses.forEach(expense => {
      this.monthlySum += expense.price;
    })
  }

  getDaysInMonth = (month, year) => (new Array(31)).fill('').map((v,i)=>new Date(year,month,i+1)).filter(v=>v.getMonth()===month)
}
