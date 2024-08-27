import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appWidget]',
  standalone: true
})
export class WidgetDirective implements OnInit {
  @Input() widgetColor: string = 'white';

  style = this.el.nativeElement.style;
  
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.style.backgroundColor = this.widgetColor;
    this.style.borderRadius = '20px';
    this.style.boxShadow = '2px 2px 2px #aaaaaa'; 
  }
}
