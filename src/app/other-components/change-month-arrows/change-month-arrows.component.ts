import { Component, EventEmitter, Output } from '@angular/core';
import { Month } from '../../models/months.enum';

@Component({
  selector: 'app-change-month-arrows',
  standalone: true,
  imports: [],
  templateUrl: './change-month-arrows.component.html',
  styleUrl: './change-month-arrows.component.css'
})
export class ChangeMonthArrowsComponent {
  today = new Date();
  checkedDate: Date = new Date(this.today);
  checkedMonth = Month[this.checkedDate.getMonth()];

  @Output() dateEmitter = new EventEmitter<{fullDate: Date, monthName: string}>();

  onStepBackMonth(){
    this.checkedDate.setMonth(this.checkedDate.getMonth()-1);
    this.checkedMonth = Month[this.checkedDate.getMonth()]
    this.dateEmitter.emit({fullDate: this.checkedDate, monthName: this.checkedMonth})
  }

  onMoveForwardMonth(){
    if((this.checkedDate.getMonth() < this.today.getMonth()) || (this.checkedDate.getMonth() >= this.today.getMonth() && this.checkedDate.getFullYear() < this.today.getFullYear())){
      this.checkedDate.setMonth(this.checkedDate.getMonth()+1);
      this.checkedMonth = Month[this.checkedDate.getMonth()]
      this.dateEmitter.emit({fullDate: this.checkedDate, monthName: this.checkedMonth})
    }
  }
}
