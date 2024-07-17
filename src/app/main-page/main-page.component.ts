import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../services/messaging.service';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    CategoriesMenuComponent,

    RouterModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit, OnDestroy{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;

  authService = inject(AuthService);
  router = inject(Router);
  dataService = inject(DataService);
  localStorageService = inject(LocalStorageService);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute)
  messagingService = inject(MessagingService);

  chart: any;
  activeChart = 'category'

  profileId = this.localStorageService.getItem('profileId');

  loggedUser: User;
  activeProfile: Profile;
  previewedProfile: Profile;
  previewMode = false;
  propToEdit: string = '';
  editedIndex;
  editedId;
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  monthlyExpenses: Expense[] = [];
  monthlySum: number;
  sub: Subscription;

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event): void {
    if(event.target.localName !== 'input' && event.target.localName !== 'select'){
      this.propToEdit = ''
      this.editedIndex = null;
    }
  }

  ngOnInit(): void {
    //this.messagingService.sendMessage(this.localStorageService.getItem('messageToken'), 'Zalogowano pomyślnie', 'Udało ci się zalogować. A mi wysłać tą wiadomość. Jupiiiii.');
    this.messagingService.currentMessage.subscribe(message => {
      console.log(message)
    })  
    this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.profileId)!

        this.route.paramMap.subscribe(params => {
          if(params.has('profileId')){
            this.dataService.getProfile(this.loggedUser?.uid, params.get('profileId')).then(profile => {
              if(profile.id === this.activeProfile.id){
                this.previewMode = false;
              }
              else {
                this.previewMode = true;
                this.previewedProfile = profile
              }
            }).then(() => {
              if(this.previewMode) this.getData(this.previewedProfile)
              else this.getData(this.activeProfile)
            })
          }
          else this.getData(this.activeProfile)
        })

      })
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  getData(profile: Profile){
    return this.dataService.getExpenses(this.loggedUser.uid, profile.id).then(expenses => {
      profile.expenses = expenses;
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile);
    }).then(() => {
      this.dataService.getCategories(this.loggedUser.uid, profile.id).then(categories => {
        profile.categories = categories;
      }).then(() => {
        this.createChart();
      })
    })   
  }

  createChart(){
    if(this.chart !== undefined){
      this.chart.destroy();
    }
    else {
      if(this.chart === null){
        console.log('nene')
      }
    }

    let names: string[] = [];
    let expensesSums: number[] = [];
    let colors: string[] = [];

    let daysInMonth = this.getDaysInMonth(this.checkedDate.getMonth(), this.checkedDate.getFullYear())

    let profile = this.previewMode ? this.previewedProfile : this.activeProfile;

    if(this.activeChart === 'category'){
      profile.categories?.forEach(category => {
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
            label: this.activeChart === 'category' ? 'Wydatki wg kategorii' : 'Wydatki w '+this.checkedMonth,
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

  onEnterEdit(propToEdit: string, index: number){
    this.propToEdit = propToEdit;
    this.editedIndex = index;
    console.log(propToEdit)
  }

  onCloseEdit(){
    this.dataService.updateExpense(this.loggedUser.uid, this.activeProfile.id, this.editedId, this.activeProfile.expenses![this.editedIndex]).then(data => {
      this.authService.changeExpense(this.loggedUser, this.activeProfile.id, data)
    })
    this.propToEdit = ''
    this.editedIndex = null;
  }

  onChangeProp(evt, propToEdit?){
    const editedExpense = this.activeProfile.expenses![this.editedIndex];
    if(propToEdit === 'isPeriodic'){ //only for isPeriodic
      editedExpense.isPeriodic = evt.target.checked;
      editedExpense.renewalTime = null;
    }
    else editedExpense[this.propToEdit] = evt.target.value;
    this.editedId = editedExpense.id;
    console.log(this.editedId)
    
    this.activeProfile.expenses![this.editedIndex] = editedExpense;
  }

  onStepBackMonth(){
    this.checkedDate.setMonth(this.checkedDate.getMonth()-1);
    this.checkedMonth = Month[this.checkedDate.getMonth()]
    this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile)
    this.createChart()
  }

  onMoveForwardMonth(){
    if((this.checkedDate.getMonth() < this.today.getMonth()) || (this.checkedDate.getMonth() >= this.today.getMonth() && this.checkedDate.getFullYear() < this.today.getFullYear())){
      this.checkedDate.setMonth(this.checkedDate.getMonth()+1);
      this.checkedMonth = Month[this.checkedDate.getMonth()]
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile)
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

      if(this.chart !== undefined){
        this.chart.destroy()
      }

      this.localStorageService.setItem('previewedProfileId', this.previewedProfile.id)
      this.router.navigate(['main-page','preview', this.previewedProfile.id]).then(() => {
        window.location.reload();
      })
    }
    else if(this.previewMode === false && profile.id === this.activeProfile.id){
      this.localStorageService.removeItem('previewedProfileId')
      this.router.navigate(['main-page']).then(() => {
        window.location.reload();
      })
    }
  }

  findCategory(expense: Expense){
    return (category) => category.id === expense.category
  }

  filterExpensesByMonth(profile: Profile){
    this.monthlySum = 0;
    this.monthlyExpenses = profile.expenses!.filter(expense => expense.date.getMonth() === this.checkedDate.getMonth() && expense.date.getFullYear() === this.checkedDate.getFullYear())!
    this.monthlyExpenses.forEach(expense => {
      this.monthlySum += expense.price;
    })
  }

  getDaysInMonth = (month, year) => (new Array(31)).fill('').map((v,i)=>new Date(year,month,i+1)).filter(v=>v.getMonth()===month)
}
