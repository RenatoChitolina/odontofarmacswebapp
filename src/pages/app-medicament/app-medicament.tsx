import "@ionic/core";
import { Component, Prop, State, Element } from '@stencil/core';
import MedicamentCalculator from '../../services/medicamentCalculator';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-medicament',
  styleUrl: 'app-medicament.scss'
})

export class AppMedicament {

  private ionNav: HTMLIonNavElement;

  @Element()
  htmlTemplate: HTMLElement;

  @Prop()
  medicament: any;

  @State()
  dose: number = 0;
  @State()
  periodicity: number = 0;
  @State()
  step: number = 1;
  @State()
  submitted: boolean = false;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');
  }

  goesTo(page: string, dataState: any = null) {
    NavigationHandler.getInstance().PushPage(this.ionNav, page, true, dataState);
  }

  comeBack() {
    NavigationHandler.getInstance().PopPage(this.ionNav, true);
  }

  calculate() {
    let form = this.htmlTemplate.querySelector('form');

    if (!form.reportValidity()) {
      this.submitted = true;
      return;
    }

    let calc = MedicamentCalculator.getInstance();

    let elConcentration = form.querySelector('#concentration') as HTMLSelectElement;
    let elAge = form.querySelector('#age') as HTMLInputElement;
    let elWeight = form.querySelector('#weight') as HTMLInputElement;

    let selectedConcentration = this.defineSelectedConcentration(elConcentration.value);

    let posology = calc.calculatePosology(this.medicament.pharmaceuticForm, selectedConcentration, +elAge.value, +elWeight.value);

    this.dose = posology.dose;
    this.periodicity = posology.periodicity;

    this.step = 2;
  }

  reset() {
    this.dose = 0;
    this.periodicity = 0;
    this.submitted = false;
    this.step = 1;
  }

  defineSelectedConcentration(concentrationName: string): any {
    return this.medicament.concentrations.find(concentration => {
      return concentration.name === concentrationName;
    })
  }



  render() {
    let tplListContent = [];
    let tplButtonContent = [];

    let tplMedicament =
      this.medicament
        ? <ion-item>
          <ion-avatar slot="start">
            <of-lazy-img src={this.medicament.category.image}></of-lazy-img>
          </ion-avatar>
          <ion-label style={{ "color": this.medicament.category.color, "font-size": "x-large", "padding-top": "2px" }}>{this.medicament.name}
            <p style={{ "color": "silver", "font-size": "large", "padding-top": "4px" }}>
              {this.medicament.pharmaceuticForm.name}
              <ion-badge style={{ "margin-left": "4px" }} color="primary">{this.medicament.unit}</ion-badge>
            </p>
          </ion-label>
        </ion-item>
        : "";

    tplListContent.push(tplMedicament);

    if (this.step == 2) {

      let tplResult =
        <ion-item class="card-result">
          <ion-card color="primary">
            <div class="card-result-primary">{this.dose}</div>
            <div class="card-result-primary">{this.medicament.outputUnit}</div>
            <div class="card-result-secondary">{this.periodicity}</div>
          </ion-card>
        </ion-item>

      let tplContraindication =
        this.medicament.contraindication !== ""
          ? <ion-item class="card-contraindication">
            <ion-card>
              <div class="card-contraindication-title">Contra-indicações</div>
              <div class="card-contraindication-text">{this.medicament.contraindication}</div>
            </ion-card>
          </ion-item>
          : ""

      let tplCalcAgain =
        <ion-button expand="block" fill="solid" onClick={() => this.reset()}>
          Calcular novamente
        </ion-button>

      tplListContent.push(tplResult);

      tplListContent.push(tplContraindication);

      tplButtonContent.push(tplCalcAgain);
    }
    else {

      let tplFormData =
        <form>
          <ion-item>
            <ion-label position="floating">Concentração *</ion-label>
            {/* Não há como dar foco, pois no momento não existe um método onIonTextAreaDidLoad e nem um autofocus */}
            <ion-select id="concentration" ok-text="Ok" cancel-text="Cancelar" value={this.medicament.concentrations.length > 0 ? this.medicament.concentrations[0].name : ""}>
              {this.medicament.concentrations.length > 0
                ? this.medicament.concentrations.map(concentration =>
                  <ion-select-option value={concentration.name}>{concentration.name}</ion-select-option>)
                : ""}
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Idade *</ion-label>
            <ion-input id="age" type="number" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Peso *</ion-label>
            <ion-input id="weight" type="number" class={this.submitted ? "submitted" : ""} step="0.1" required={true}></ion-input>
          </ion-item>
        </form>

      let tplCalc =
        <ion-button expand="block" fill="solid" onClick={() => this.calculate()}>
          Calcular
        </ion-button>

      tplListContent.push(tplFormData);

      tplButtonContent.push(tplCalc);
    }

    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button fill="clear" onClick={() => this.comeBack()}>
              <ion-icon class="back-button" name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Medicamento</ion-title>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <ion-list>
          {tplListContent}
        </ion-list>
        {tplButtonContent}
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
