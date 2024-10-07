import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.interface';

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
  
  dataService = inject(DataService);
  authService = inject(AuthService);
  
  uid = localStorage.getItem('uid');
  profileId = localStorage.getItem('profileId');
  previewMode: boolean;
  editMode: boolean = false;

  onEnterEdit(propToEdit: string){
    this.editMode = true;
  }

  onCloseEdit(){
    this.dataService.updateExpense(this.uid, this.profileId, this.expense.id, this.expense).then(data => {
      // this.authService.changeExpense(this.loggedUser, this.activeProfile.id, data);
    })
    this.editMode = false;
  }

  onChangeProp(evt, propToEdit?){
    // const editedExpense = this.activeProfile.expenses![this.editedIndex];
    if(propToEdit === 'isPeriodic'){ //only for isPeriodic
      this.expense.isPeriodic = evt.target.checked;
      this.expense.renewalTime = null;
    }
    else this.expense[this.propToEdit] = evt.target.value;
    // this.editedId = editedExpense.id;
    // console.log(this.editedId)
    
    // this.activeProfile.expenses![this.editedIndex] = editedExpense;
  }

  findCategory(){
    return (category) => category.id === this.expense.category
  }
}
