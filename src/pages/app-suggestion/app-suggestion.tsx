import "@ionic/core";
import { Component, Prop, Element } from '@stencil/core';
import DatabaseHandler from '../../services/databaseHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-suggestion',
  styleUrl: 'app-suggestion.scss'
})

export class AppSuggestion {

  private ionNav: HTMLIonNavElement;

  @Element()
  htmlTemplate: HTMLElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;
  @Prop()
  category: any;
  @Prop()
  searchText: string;
  @Prop()
  pharmaceuticForms: any = []; //Array<any> = [];

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');
  }

  goesTo(page: string, dataState: any = null) {
    NavigationHandler.getInstance().PushPage(this.ionNav, page, true, dataState);
  }

  comeRoot() {
    NavigationHandler.getInstance().PopRootPage(this.ionNav, true);
  }

  comeBack() {
    NavigationHandler.getInstance().PopPage(this.ionNav, true);
  }

  send() {
    let form = this.htmlTemplate.querySelector('form');

    let elCategory = form.querySelector('#category') as HTMLInputElement;
    let elSearchText = form.querySelector('#searchText') as HTMLInputElement;
    let elPharmaceuticForms = form.querySelector('#pharmaceuticForms') as HTMLTextAreaElement;
    let elAdditionalInfo = form.querySelector('#additionalInfo') as HTMLTextAreaElement;

    DatabaseHandler.getInstance().addSuggestion(
      elCategory.value === "-" ? null : elCategory.value,
      elSearchText.value === "-" ? null : elSearchText.value,
      elPharmaceuticForms.value === "-" ? null : elPharmaceuticForms.value,
      elAdditionalInfo.value === "" ? null : elAdditionalInfo.value
    )
      .subscribe(() => {
        this.showToast('Sugestão cadastrada com sucesso.');
        this.comeRoot();
      });
  }

  async showToast(message: string) {
    let ionToast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      cssClass: "toast"
    });

    await ionToast.present();
  }



  render() {
    let categoryExpression: string = "-";
    let searchTextExpression: string = "-";
    let pharmaceuticFormsExpression: string = "-";

    if (this.category)
      categoryExpression = this.category.name;

    if (this.searchText)
      searchTextExpression = this.searchText;

    if (this.pharmaceuticForms.length > 0) {
      pharmaceuticFormsExpression = "";

      this.pharmaceuticForms.forEach(pharmaceuticForm => {
        pharmaceuticFormsExpression = pharmaceuticFormsExpression.concat((pharmaceuticFormsExpression === "" ? "" : ", "), pharmaceuticForm.name)
      });
    }

    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button fill="clear" onClick={() => this.comeBack()}>
              <ion-icon class="back-button" name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Sugestão</ion-title>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <ion-list>
          <ion-item>
            <ion-icon size="large" class="suggestion-item" slot="start" name="chatbubbles"></ion-icon>
            <ion-label color="primary" style={{ "font-size": "large" }}>{"Informações pesquisadas"}</ion-label>
          </ion-item>
          <form>
            <ion-item>
              <ion-label position="floating">Categoria</ion-label>
              <ion-input id="category" type="text" disabled={true} readonly={true} value={categoryExpression}></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Palavra(s)-chave</ion-label>
              <ion-input id="searchText" type="text" disabled={true} readonly={true} value={searchTextExpression}></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Forma(s) Farmacêutica(s)</ion-label>
              <ion-textarea id="pharmaceuticForms" disabled={true} readonly={true} value={pharmaceuticFormsExpression}></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Informações adicionais</ion-label>
              {/* Não há como dar foco, pois no momento não existe um método onIonTextAreaDidLoad e o autofocus não está funcionando */}
              <ion-textarea id="additionalInfo" placeholder="Conte-nos mais sobre a medicação sugerida" autofocus={true}></ion-textarea>
            </ion-item>
          </form>
        </ion-list>
        <ion-button expand="block" fill="solid" onClick={() => this.send()}>
          Enviar
        </ion-button>
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
