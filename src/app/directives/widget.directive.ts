import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appWidget]',
  standalone: true
})
export class WidgetDirective implements OnInit {
  @Input() widgetWidth!: string;
  @Input() widgetHeight!: string;

  style = this.el.nativeElement.style;
  
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.style.width = this.widgetWidth;
    this.style.height = this.widgetHeight;
    this.style.backgroundColor = 'white';
    this.style.borderRadius = '20px';
    this.style.boxShadow = '2px 2px 2px #aaaaaa'; 
  }
}
