import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
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
    GraphComponent
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
  dataService = inject(DataService);
  modalService = inject(ModalService);
  route = inject(ActivatedRoute)
  messagingService = inject(MessagingService);

  profileId = localStorage.getItem('profileId');

  loggedUser: User;
  activeProfile: Profile;
  previewedProfile: Profile;
  previewMode = false;
  unreadMessages: number;
  propToEdit: string = '';
  editedIndex;
  editedId;
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];
  monthlyExpenses: Expense[] = [];
  monthlySum: number;
  sub: Subscription;

  // @HostListener('document:mousedown', ['$event'])
  // onGlobalClick(event): void {
  //   if(event.target.localName !== 'input' && event.target.localName !== 'select'){
  //     this.propToEdit = ''
  //     this.editedIndex = null;
  //   }
  // }

  ngOnInit(): void {
    //this.messagingService.sendMessage('Zalogowano pomyślnie', 'Udało ci się zalogować. A mi wysłać tą wiadomość. Jupiiiii.');
    localStorage.removeItem('categoryId');

    this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!;
        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.profileId)!;
        this.dataService.updateProfile(this.loggedUser.uid, this.activeProfile.id, 'lastDeviceToken', localStorage.getItem('messageToken'));

        this.route.paramMap.subscribe(params => {
          if(params.has('profileId')){
            this.dataService.getProfile(this.loggedUser?.uid, params.get('profileId')).then(profile => {
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
              console.log(message)
              if(!this.activeProfile.messages?.find(item => item.id === message.messageId)){
                this.dataService.addMessage(this.loggedUser.uid, this.activeProfile.id, {
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
      this.sub.unsubscribe();
  }

  getData(profile: Profile){
    return this.dataService.getExpenses(this.loggedUser.uid, profile.id).then(expenses => {
      profile.expenses = expenses;
      this.filterExpensesByMonth(this.previewMode ? this.previewedProfile : this.activeProfile);
    }).then(() => {
      this.dataService.getCategories(this.loggedUser.uid, profile.id).then(categories => {
        profile.categories = categories;
      })
    }).then(() => {
      this.dataService.getMessages(this.loggedUser.uid, profile.id).then(messages => {
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

  onEnterEdit(propToEdit: string, index: number){
    this.propToEdit = propToEdit;
    this.editedIndex = index;
  }

  onCloseEdit(){
    this.dataService.updateExpense(this.loggedUser.uid, this.activeProfile.id, this.editedId, this.activeProfile.expenses![this.editedIndex]).then(data => {
      this.authService.changeExpense(this.loggedUser, this.activeProfile.id, data);
    })
    this.propToEdit = '';
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
}
