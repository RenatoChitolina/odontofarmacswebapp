import { Component, Prop, EventEmitter } from '@stencil/core';

@Component({
  tag: 'of-pharmaceutic-forms-popover',
  styleUrl: 'of-pharmaceutic-forms-popover.scss'
})

export class PharmaceuticFormsPopover {

  @Prop()
  pharmaceuticForms: Array<any> = [];
  @Prop()
  pharmaceuticFormsEmitter: EventEmitter;

  checkUncheckPharmaceuticForm(checkedUncheckedPharmaceuticForm: any, checkedUncheckedPharmaceuticFormEvent: any) {
    let index = this.pharmaceuticForms.findIndex(pharmaceuticForm => pharmaceuticForm.index == checkedUncheckedPharmaceuticForm.index);
    this.pharmaceuticForms[index].selected = checkedUncheckedPharmaceuticFormEvent.target.checked;
    this.pharmaceuticFormsEmitter.emit(this.pharmaceuticForms);
  }



  render() {
    return (
      <ion-list>
        <ion-list-header color="primary">
          <ion-label class="list-header">Formas farmacêuticas</ion-label>
        </ion-list-header>
        {this.pharmaceuticForms
          ? this.pharmaceuticForms.map(pharmaceuticForm =>
            <ion-item>
              <ion-checkbox color="primary" checked={pharmaceuticForm.selected} onIonChange={event => this.checkUncheckPharmaceuticForm(pharmaceuticForm, event)}></ion-checkbox>
              <ion-label position="fixed">{pharmaceuticForm.name}</ion-label>
            </ion-item>)
          : ""}
      </ion-list>
    );
  }
}
