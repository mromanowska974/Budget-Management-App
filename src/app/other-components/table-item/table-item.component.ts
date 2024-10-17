import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Expense } from '../../models/expense.interface';
import { ExpenseService } from '../../services/expense.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

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
export class TableItemComponent implements OnChanges, OnInit{
  @Input() propToEdit;
  @Input() categories;
  @Input() expense: Expense;
  @Input() isEditable: boolean;
  @Input() coords: number[] = [];
  @Input() globalActiveCoords$: Observable<number[] | null> //available for every single Table Item

  @Output() activeCoordsChanged = new EventEmitter<number[]>;

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
    if(this.previewMode) this.isEditable = false;  
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['globalActiveCoords$']){
      this.globalActiveCoords$.subscribe(coords => {
        if(this.coords !== coords){
          this.onCloseEdit();
        }
      })
    }
  }

  private formatDate(){
    let day = this.today.getDate() < 10 ? '0'+ this.today.getDate() : this.today.getDate();
    let month = this.today.getMonth() < 9 ? '0'+ (this.today.getMonth()+1) : this.today.getMonth()+1;
    let year = this.today.getFullYear();
    return year+'-'+month+'-'+day;
  }

  onEnterEdit(){
    if(this.isEditable) {
      this.activeCoordsChanged.emit(this.coords);
      this.editMode = true;
    }
  }

  onCloseEdit(){
    this.editMode = false;
  }

  onChangeProp(){
    if(this.editForm.valid){
      let newExpense = this.expense;
      if(this.propToEdit === 'renewalTime'){
        newExpense.isPeriodic = this.editForm.value.periodic;
        newExpense.renewalTime = newExpense.isPeriodic ? this.editForm.value.newValue : null;
      }
      else{
        newExpense[this.propToEdit] = this.editForm.value.newValue;
      }
  
      this.expenseService.updateExpense(this.uid, this.profileId, newExpense.id, newExpense)
      .then(() => {
        this.expenseService.expenseWasEdited.emit();
      })
  
      this.onCloseEdit();
    }    
  }

  findCategory(){
    return (category) => category.id === this.expense.category;
  }
}
