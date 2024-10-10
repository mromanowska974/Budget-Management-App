import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { TableItemComponent } from "../table-item/table-item.component";
import { Profile } from '../../models/profile.interface';
import { Observable } from 'rxjs';
import { Expense } from '../../models/expense.interface';

@Component({
  selector: 'app-last-expenses-table',
  standalone: true,
  imports: [
    WidgetDirective,
    CommonModule,
    TableItemComponent
],
  templateUrl: './last-expenses-table.component.html',
  styleUrl: './last-expenses-table.component.css'
})
export class LastExpensesTableComponent implements OnChanges{
  @Input() monthlyExpenses: Observable<Expense[]>;
  @Input() wasOpenedFromCategoryPage: boolean;
  @Input() profile: Profile;


  doExpensesExist: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
      this.monthlyExpenses.subscribe(expenses => {
        if(expenses.length > 0) this.doExpensesExist = true;
        else this.doExpensesExist = false;
      })
  }
}
