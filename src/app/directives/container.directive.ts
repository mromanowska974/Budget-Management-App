import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appContainer]',
  standalone: true
})
export class ContainerDirective implements OnInit{

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    const style = this.el.nativeElement.style;

    style.backgroundColor = '#eceaea';
    style.display = 'flex';
    style.flexDirection = 'column';
    style.height = '100vh';
    style.fontFamily = 'Inter';
  }

}
