import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
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

  loggedUser: User; //not needed imo
  activeProfile: Profile;
  previewedProfile: Profile; //można zrobić jeden profil w zależności od istnienia id previewedProfile w przeglądarce
  profile: Profile;
  previewMode = false; //można by to pozyskać od ExpenseInfo
  unreadMessages: number;
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  monthlyExpenses: Observable<Expense[]>; 
  monthlySum: number;
  authSub: Subscription;
  expenseSub: Subscription;

  ngOnInit(): void {
    //this.messagingService.sendMessage('Zalogowano pomyślnie', 'Udało ci się zalogować. A mi wysłać tą wiadomość. Jupiiiii.');
    localStorage.removeItem('categoryId');
    this.expenseSub = this.expenseService.expenseWasEdited.subscribe(() => {
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile)
    })

    this.authSub = this.authService.user.subscribe(user => {
        this.loggedUser = user!;
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.profileId)!;
        this.profileService.updateProfile(localStorage.getItem('uid')!, localStorage.getItem('profileId')!, 'lastDeviceToken', localStorage.getItem('messageToken'));

        this.route.paramMap.subscribe(params => {
          if(params.has('profileId')){
            this.profileService.getProfile(localStorage.getItem('uid'), params.get('profileId')).then(profile => {
              if(profile.id === this.activeProfile.id){
                this.previewMode = false;
                localStorage.removeItem('previewedProfileId');
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
          else this.getData(this.activeProfile).then(() => {
            this.messagingService.currentMessage.subscribe(message => {
              if(!this.activeProfile.messages?.find(item => item.id === message.messageId)){
                this.notificationService.addMessage(localStorage.getItem('uid'), this.activeProfile.id, {
                  title: message.notification.title,
                  content: message.notification.body,
                  isRead: false
                }, message.messageId)
              }
            })
          })
        })
      })
  }

  ngOnDestroy(): void {
      if(this.authSub) this.authSub.unsubscribe();
      if(this.expenseSub) this.expenseSub.unsubscribe();
  }

  private getData(profile: Profile){
    return this.expenseService.getExpenses(localStorage.getItem('uid'), profile.id).then(expenses => {
      profile.expenses = expenses;
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile);
    }).then(() => {
      this.categoryService.getCategories(localStorage.getItem('uid')!, profile.id).then(categories => {
        profile.categories = categories;
      })
    }).then(() => {
      this.notificationService.getMessages(localStorage.getItem('uid'), profile.id).then(messages => {
        profile.messages;

        this.unreadMessages = messages.filter(message => !message.isRead).length;
      })
    }) 
  }

  onReceiveDate(event){
    this.checkedDate = event.fullDate;
    this.checkedMonth = event.monthName;
    this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile);
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

      localStorage.setItem('previewedProfileId', this.previewedProfile.id)
      this.router.navigate(['main-page','preview', this.previewedProfile.id]).then(() => {
        window.location.reload();
      })
    }
    if(this.previewMode === true && profile.id === this.activeProfile.id){
      localStorage.removeItem('previewedProfileId')
      this.router.navigate(['main-page']).then(() => {
        window.location.reload();
      })
    }
  }

  filterExpensesByMonth(profile: Profile){
    this.monthlySum = 0;
    this.monthlyExpenses = new Observable((subscriber) => {
      subscriber.next(profile.expenses!.filter(expense => new Date(expense.date).getMonth() === this.checkedDate.getMonth() && new Date(expense.date).getFullYear() === this.checkedDate.getFullYear()));
    })

    this.monthlyExpenses.subscribe(expenses => {
      expenses.forEach(expense => {
        this.monthlySum += +expense.price;
      })
    })
  }
}
