import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WidgetDirective } from '../../directives/widget.directive';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { Observable } from 'rxjs';
import { Expense } from '../../models/expense.interface';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [
    WidgetDirective,
    CommonModule
  ],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent implements OnChanges{
  @Input() monthlyExpenses: Observable<Expense[]>;
  @Input() categories: {id, content: string, color: string}[] = [];
  @Input() date: {fullDate, monthName: string};
  @Input() activeCategory;

  doExpenesExist: boolean = false;
  isChartDaysInMonthType: boolean = true;
  isChartCategoryType: boolean = false;
  chart: any;

  ngOnChanges(changes: SimpleChanges): void {
    this.monthlyExpenses.subscribe(expenses => {
      if(expenses.length > 0){
        this.doExpenesExist = true;
        this.createChart(expenses);
      }
    })
  }
  
  createChart(expenses: Expense[]){
    if(this.chart !== undefined && this.chart !== null){
      this.chart.destroy();
    }

    let names: string[] = [];
    let expensesSums: number[] = [];
    let colors: string[] = [];

    let daysInMonth = this.getDaysInMonth(this.date.fullDate.getMonth(), this.date.fullDate.getFullYear());

    if(this.isChartCategoryType){
      this.categories.forEach(category => {
        let sum = 0;
        names.push(category.content);
        colors.push(category.color);
  
        expenses.forEach(expense => {
          if(expense.category === category.id){
            sum += +expense.price;
          }
        })
        expensesSums.push(sum);
      });
    }
    else if(this.isChartDaysInMonthType){
      daysInMonth.forEach(day => {
        let sum = 0;
        names.push(day.getDate().toString()+' '+this.date.monthName.substring(0, 3));
  
        expenses.forEach(expense => {
          let expenseDate = new Date(expense.date);
          expenseDate.setHours(0,0,0,0);
          day.setHours(0,0,0,0);
            
          if(expenseDate.getTime() === day.getTime()){
            sum += +expense.price;
          }
        })
        expensesSums.push(sum);
      })  
    }


    this.chart = new Chart('chart', {
      type: 'bar',
      data: {
        labels: names,
        datasets: [
          {
            label: this.isChartCategoryType ? 'Wydatki wg kategorii' : 'Wydatki w '+this.date.monthName,
            data: expensesSums,
            backgroundColor: this.isChartCategoryType ? colors : (this.activeCategory ? this.activeCategory.color : '#c6c4ff'),
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        maintainAspectRatio: false
      },
    });
  }

  onSwitchChartType(){
    this.isChartDaysInMonthType = !this.isChartDaysInMonthType;
    this.isChartCategoryType = !this.isChartCategoryType;

    this.monthlyExpenses.subscribe(expenses => {
      this.createChart(expenses);
    })
  }

  getDaysInMonth = (month, year) => (new Array(31)).fill('').map((v,i)=>new Date(year,month,i+1)).filter(v=>v.getMonth()===month)
}
