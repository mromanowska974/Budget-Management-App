import { ComponentRef, EnvironmentInjector, Injectable, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  newModalComponent: ComponentRef<ModalComponent>;
  injector = inject(EnvironmentInjector)

  dataSub = new BehaviorSubject<any>(null)

  openModal(view: ViewContainerRef, content: TemplateRef<Element>, profileIndex?) {
    view.clear();
    const innerContent = view.createEmbeddedView(content);

    this.newModalComponent = view.createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: [innerContent.rootNodes],
    });

    this.dataSub.next(profileIndex)
  }

  closeModal(view: ViewContainerRef){
    this.newModalComponent.destroy()
    view.clear();
  }
}
