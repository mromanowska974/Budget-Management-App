import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appInputDir]',
  standalone: true
})
export class InputDirDirective {

  constructor(private el: ElementRef) {
    const style = this.el.nativeElement.style;

    style.border = '0';
    style.borderRadius = '5px';
    style.boxShadow = '2px 2px 2px #aaaaaa';
    // style.height = '30px';
    // style.width = '300px';
    style.fontFamily = 'sans-serif';
    style.padding = '0px 10px'
  }

}
