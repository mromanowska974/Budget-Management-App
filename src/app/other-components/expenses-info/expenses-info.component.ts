import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';

@Component({
  selector: 'app-expenses-info',
  standalone: true,
  imports: [
    WidgetDirective,
    CommonModule
  ],
  templateUrl: './expenses-info.component.html',
  styleUrl: './expenses-info.component.css'
})
export class ExpensesInfoComponent implements OnChanges{
  @Input() previewMode: boolean;
  @Input() monthlySum: number;
  @Input() date: {fullDate, monthName};
  @Input() data: any;

  name: string = '';

  @Output() enterPreviewMode = new EventEmitter();
    
  ngOnChanges(changes: SimpleChanges): void {
    this.name = this.data.category ? this.data.category.content 
    : (this.previewMode ? this.data.previewedProfile.name : this.data.activeProfile.name);
  }

  onEnterPreviewMode(){
    this.enterPreviewMode.emit();
  }
}
