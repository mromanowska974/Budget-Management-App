import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.interface';
import { ExpenseService } from '../../services/expense.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-table-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './table-item.component.html',
  styleUrl: './table-item.component.css'
})
export class TableItemComponent implements OnInit{
  @Input() propToEdit;
  @Input() categories;
  @Input() expense: Expense;

  @ViewChild('editForm') editForm: NgForm;
  
  expenseService = inject(ExpenseService);
  authService = inject(AuthService);
  
  uid = localStorage.getItem('uid');
  profileId = localStorage.getItem('profileId');
  previewMode: boolean;
  editMode: boolean = false;
  today: any = new Date();

  ngOnInit(): void {
      this.today = this.formatDate();
      this.previewMode = localStorage.getItem('previewedProfileId') ? true : false;
  }

  private formatDate(){
    let day = this.today.getDate() < 10 ? '0'+ this.today.getDate() : this.today.getDate();
    let month = this.today.getMonth() < 9 ? '0'+ (this.today.getMonth()+1) : this.today.getMonth()+1;
    let year = this.today.getFullYear();
    return year+'-'+month+'-'+day;
  }

  onEnterEdit(){
    this.editMode = true;
  }

  onCloseEdit(){
    this.editMode = false;
  }

  onChangeProp(){
    if(this.editForm.valid){
      let newExpense = this.expense;
      if(this.propToEdit === 'renewalTime'){
        newExpense.isPeriodic = this.editForm.value.periodic;
      }
      newExpense[this.propToEdit] = this.editForm.value.newValue;
  
      this.expenseService.updateExpense(this.uid, this.profileId, newExpense.id, newExpense)
      .then(() => {
        this.expenseService.expenseWasEdited.emit();
      })
  
      this.onCloseEdit();
    }    
  }

  findCategory(){
    return (category) => category.id === this.expense.category
  }
}
