import { ComponentRef, EnvironmentInjector, Injectable, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { ModalComponent } from '../other-components/modal/modal.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  newModalComponent: ComponentRef<ModalComponent>;
  injector = inject(EnvironmentInjector)

  openModal(view: ViewContainerRef, content: TemplateRef<Element>) {
    view.clear();
    const innerContent = view.createEmbeddedView(content);

    this.newModalComponent = view.createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: [innerContent.rootNodes],
    });
  }

  closeModal(view: ViewContainerRef){
    this.newModalComponent.destroy()
    view.clear();
  }
}
