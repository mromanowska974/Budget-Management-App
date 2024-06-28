import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appButtonDir]',
  standalone: true
})
export class ButtonDirDirective {

  constructor(private el: ElementRef) {
    const style = this.el.nativeElement.style;
    style.backgroundColor = '#c6c4ff';
    style.border = '0';
    style.borderRadius = '10px';
    style.height = '45px';
    style.boxShadow = '2px 2px 2px #aaaaaa';
    style.fontFamily = 'Inter';
  }

}
