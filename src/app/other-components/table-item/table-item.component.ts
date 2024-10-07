import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.interface';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-table-item',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './table-item.component.html',
  styleUrl: './table-item.component.css'
})
export class TableItemComponent{
  @Input() propToEdit;
  @Input() categories;
  @Input() expense: Expense;
  
  expenseService = inject(ExpenseService);
  authService = inject(AuthService);
  
  uid = localStorage.getItem('uid');
  profileId = localStorage.getItem('profileId');
  previewMode: boolean;
  editMode: boolean = false;

  onEnterEdit(propToEdit: string){
    this.editMode = true;
  }

  onCloseEdit(expense?){
    this.expenseService.updateExpense(this.uid, this.profileId, expense.id, expense).then(data => {
      // this.authService.changeExpense(this.loggedUser, this.activeProfile.id, data);
    })
    this.editMode = false;
  }

  onChangeProp(evt, propToEdit?){
    let newExpense = this.expense;
    if(propToEdit === 'isPeriodic'){ //only for isPeriodic
      newExpense.isPeriodic = evt.target.checked;
      newExpense.renewalTime = null;
    }
    else newExpense[this.propToEdit] = evt.target.value;

    this.onCloseEdit(newExpense);
  }

  findCategory(){
    return (category) => category.id === this.expense.category
  }
}
