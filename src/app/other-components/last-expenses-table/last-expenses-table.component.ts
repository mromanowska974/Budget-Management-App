import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { TableItemComponent } from "../table-item/table-item.component";
import { Profile } from '../../models/profile.interface';

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
export class LastExpensesTableComponent{
  @Input() monthlyExpenses;
  @Input() profile: Profile;
}
