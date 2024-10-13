import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Profile } from '../../models/profile.interface';
import { CommonModule } from '@angular/common';
import { combineLatest, forkJoin, merge, Observable, Subscription } from 'rxjs';
import { ModalService } from '../../services/modal.service';
import { Expense } from '../../models/expense.interface';
import { Month } from '../../models/months.enum';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { CategoriesMenuComponent } from '../categories-menu/categories-menu.component';
import { ChangeMonthArrowsComponent } from '../../other-components/change-month-arrows/change-month-arrows.component';
import { NavbarComponent } from "../../other-components/navbar/navbar.component";
import { ContainerDirective } from '../../directives/container.directive';
import { ExpensesInfoComponent } from "../../other-components/expenses-info/expenses-info.component";
import { GraphComponent } from "../../other-components/graph/graph.component";
import { LastExpensesTableComponent } from '../../other-components/last-expenses-table/last-expenses-table.component';
import { ProfileService } from '../../services/profile.service';
import { NotificationService } from '../../services/notification.service';
import { ExpenseService } from '../../services/expense.service';
import { CategoryService } from '../../services/category.service';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    WidgetDirective,
    ButtonDirDirective,
    ContainerDirective,
    CategoriesMenuComponent,
    ChangeMonthArrowsComponent,
    RouterModule,
    CommonModule,
    FormsModule,
    NavbarComponent,
    ExpensesInfoComponent,
    GraphComponent,
    LastExpensesTableComponent
],
  templateUrl: './main-page.component.html',
  styleUrls: [
    './main-page.component.css',
    './main-page.modal.component.css'
  ]
})
export class MainPageComponent implements OnInit, OnDestroy{
  @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;

  authService = inject(AuthService);
  router = inject(Router);
  profileService = inject(ProfileService);
  notificationService = inject(NotificationService);
  expenseService = inject(ExpenseService);
  categoryService = inject(CategoryService);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute)
  messagingService = inject(MessagingService);

  profileId = localStorage.getItem('profileId');

  activeProfile: Profile;
  previewedProfile: Profile | null;
  profiles: Profile[] = [];
  previewMode = false;
  unreadMessages: number;
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  monthlyExpenses: Observable<Expense[]>; 
  monthlySum: number;

  expenseSub: Subscription;
  editSub: Subscription;
  getDataSub: Subscription;
  initSub: Subscription;

  ngOnInit(): void {
    //this.messagingService.sendMessage('Zalogowano pomyślnie', 'Udało ci się zalogować. A mi wysłać tą wiadomość. Jupiiiii.');
    localStorage.removeItem('categoryId');
    this.editSub = this.expenseService.expenseWasEdited.subscribe(() => {
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile! : this.activeProfile)
    })

    const loggedUser$ = this.authService.user;
    const routeParams$ = this.route.paramMap;
    const currentMessage$ = this.messagingService.currentMessage;

    this.initSub = combineLatest([loggedUser$, routeParams$, currentMessage$]).subscribe(([loggedUser, routeParams, currentMessage]) => {
      this.profiles = loggedUser!.profiles;
      this.activeProfile = loggedUser!.profiles.find(profile => profile.id === this.profileId)!;
      this.profileService.updateProfile(localStorage.getItem('uid')!, localStorage.getItem('profileId')!, 'lastDeviceToken', localStorage.getItem('messageToken'));
      
      if(!routeParams.has('profileId')){
        this.getData(this.activeProfile);
         
        // if(!this.activeProfile.messages?.find(item => item.id === currentMessage.messageId)){
        //   this.notificationService.addMessage(localStorage.getItem('uid'), this.activeProfile.id, {
        //     title: currentMessage.notification.title,
        //     content: currentMessage.notification.body,
        //     isRead: false
        //   }, currentMessage.messageId)
        // }
      }
      else {
        this.previewMode = routeParams.get('profileId') === this.activeProfile.id ? false : true;
        this.previewedProfile = this.previewMode ? loggedUser!.profiles.find(profile => profile.id === routeParams.get('profileId'))! : null;
        this.getData(this.previewMode ? this.previewedProfile! : this.activeProfile);
      }
    })
  }

  ngOnDestroy(): void {
      if(this.initSub) this.initSub.unsubscribe();
      if(this.expenseSub) this.expenseSub.unsubscribe();
      if(this.editSub) this.editSub.unsubscribe();
      if(this.getDataSub) this.getDataSub.unsubscribe();
  }

  private getData(profile: Profile){
    const expenses$ = this.expenseService.getExpenses(localStorage.getItem('uid'), profile.id);
    const categories$ = this.categoryService.getCategories(localStorage.getItem('uid')!, profile.id);
    const notifications$ = this.notificationService.getMessages(localStorage.getItem('uid'), profile.id);

    this.getDataSub = combineLatest([expenses$, categories$, notifications$]).subscribe(([expenses, categories, notifications]) => {
      profile.expenses = expenses;
      profile.categories = categories;
      profile.messages;

      this.unreadMessages = notifications.filter(message => !message.isRead).length;
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile! : this.activeProfile);
    });
  }

  onReceiveDate(event){
    this.checkedDate = event.fullDate;
    this.checkedMonth = event.monthName;
    this.filterExpensesByMonth(this.previewMode ? this.previewedProfile! : this.activeProfile);
  }

  onEnterPreviewMode(template){
    this.modalService.openModal(this.modalRef, template);
  }

  onCloseModal(){
    this.modalService.closeModal(this.modalRef);
  }

  onSelectProfile(profile: Profile){
    if((this.previewMode === false && profile.id !== this.activeProfile.id) || (this.previewMode === true && profile.id !== this.activeProfile.id)){
      this.previewedProfile = profile;

      localStorage.setItem('previewedProfileId', this.previewedProfile.id)
      this.router.navigate(['main-page','preview', this.previewedProfile.id]).then(() => {
        this.onCloseModal();
      })
    }
    if(this.previewMode === true && profile.id === this.activeProfile.id){
      localStorage.removeItem('previewedProfileId');
      this.router.navigate(['main-page']);
    }
  }

  private filterExpensesByMonth(profile: Profile){
    this.monthlySum = 0;
    this.monthlyExpenses = new Observable((subscriber) => {
      subscriber.next(profile.expenses!.filter(expense => new Date(expense.date).getMonth() === this.checkedDate.getMonth() && new Date(expense.date).getFullYear() === this.checkedDate.getFullYear()));
    })

    this.expenseSub = this.monthlyExpenses.subscribe(expenses => {
      expenses.forEach(expense => {
        this.monthlySum += +expense.price;
      })
    })
  }
}
