import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { InputDirDirective } from '../../directives/input-dir.directive';
import { ContainerDirective } from '../../directives/container.directive';
import { ButtonDirDirective } from '../../directives/button-dir.directive';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { MessagingService } from '../../services/messaging.service';
import { User } from '../../models/user.interface';
import { Profile } from '../../models/profile.interface';
import { Expense } from '../../models/expense.interface';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [
    ContainerDirective,
    InputDirDirective,
    ButtonDirDirective,

    FormsModule,
    CommonModule
  ],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css'
})
export class AddExpenseComponent implements OnInit, OnDestroy{
  @ViewChild('expenseForm') expenseForm: NgForm;

  router = inject(Router);
  authService = inject(AuthService);
  dataService = inject(DataService);
  localStorageService = inject(LocalStorageService);
  messagingService = inject(MessagingService);

  loggedUser: User;
  activeProfile: Profile;
  categories: {id, content: string, color: string}[];
  errorMsg = '';
  today: any = new Date();

  sub: Subscription

  ngOnInit(): void {
      this.sub = this.authService.user.subscribe(user => {
        this.loggedUser = user!;

        this.activeProfile = this.loggedUser.profiles.find(profile => profile.id === this.localStorageService.getItem('profileId'))!;
        this.dataService.getCategories(this.loggedUser.uid, this.activeProfile.id).then(data => {
          this.categories = data
        })
      })

      this.today = this.formatDate();
  }

  ngOnDestroy(): void {
      this.sub.unsubscribe();
  }

  private formatDate(){
    let day = this.today.getDate() < 10 ? '0'+ this.today.getDate() : this.today.getDate();
    let month = this.today.getMonth() < 9 ? '0'+ (this.today.getMonth()+1) : this.today.getMonth()+1;
    let year = this.today.getFullYear();
    return year+'-'+month+'-'+day;
  }

  onSubmit(){
    let newExpense: Expense = {
      price: this.expenseForm.value.price,
      date: this.expenseForm.value.date,
      description: this.expenseForm.value.desc,
      isPeriodic: this.expenseForm.value.cyclic ? true : false,
      renewalTime: this.expenseForm.value.cyclic ? this.expenseForm.value.renewal : null,
      category: this.expenseForm.value.category,
    }

    const today = new Date();
    let monthlyExpenses = this.activeProfile.expenses?.filter(expense => expense.date.getMonth() === today.getMonth() && expense.date.getFullYear() === today.getFullYear())
    let monthlySum = 0;

    monthlyExpenses?.forEach(expense => {
      monthlySum += expense.price
    })

    if(monthlySum < this.activeProfile.monthlyLimit){
      this.dataService.addExpense(this.loggedUser.uid, this.activeProfile.id, newExpense).then(() => {
        this.onCancel()
      })
    }
    else {
      this.errorMsg = 'Przekroczono limit wydatków.'
    }

    if(monthlySum+newExpense.price >= this.activeProfile.monthlyLimit){
      this.messagingService.sendMessage('Przekroczono limit miesięczny', 'Limit wydatków na ten miesiąc został osiągnięty. Zmień limit miesięczny, jeśli chcesz dodać kolejny wydatek w bieżącym miesiącu.');
    }
  }

  onCancel(){
    this.router.navigate(['main-page'])
  }
}
