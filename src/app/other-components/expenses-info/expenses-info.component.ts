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
  category;

  @Output() enterPreviewMode = new EventEmitter();
    
  ngOnChanges(changes: SimpleChanges): void {
    if(this.data.category){
      this.data.category.subscribe(category => {
        this.category = category;
        this.name = category.content;
      });
    }
    else {
      this.name = (this.previewMode ? this.data.previewedProfile.name : this.data.activeProfile.name);
    }
  }

  onEnterPreviewMode(){
    this.enterPreviewMode.emit();
  }
}
