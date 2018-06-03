import "@ionic/core";
import { Component, Prop, State, Element } from '@stencil/core';
import AuthenticationHandler from '../../services/authenticationHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-authentication',
  styleUrl: 'app-authentication.scss'
})

export class AppAuthentication {

  private ionNav: HTMLIonNavElement;

  @Element()
  htmlTemplate: HTMLElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;

  @State()
  submitted: boolean = false;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');

    //TODO: (R) Quando houver uma versão estável em que o Router funcione corretamente, remover esse trecho de validação daqui, e substituílo por um Route-redirect no componente base
    if (AuthenticationHandler.getInstance().verifyPersistentAccess())
      NavigationHandler.getInstance().PopRootPage(this.ionNav, false);
  }

  goesTo(page: string, secured: boolean, dataState: any = null) {
    NavigationHandler.getInstance().PushPage(this.ionNav, page, secured, dataState);
  }

  goesToRoot() {
    NavigationHandler.getInstance().PopRootPage(this.ionNav, true);
  }

  comeBack() {
    NavigationHandler.getInstance().PopPage(this.ionNav, true);
  }

  authenticate(spinner: any) {
    let form = this.htmlTemplate.querySelector('form');

    if (!form.reportValidity()) {
      this.submitted = true;
      spinner.complete();
      return;
    }

    let elCpfCro = form.querySelector('#cpfCro') as HTMLInputElement;
    let elPassword = form.querySelector('#password') as HTMLInputElement;

    let authData = {
      cpfCro: elCpfCro.value,
      password: elPassword.value
    }

    AuthenticationHandler.getInstance().signIn(authData)
      .subscribe(
        responseSuccess => {
          spinner.complete();
          responseSuccess.result.infos.forEach(info => {
            this.showToast(info);
          });
          let profile = {
            id: responseSuccess.result.data.id,
            name: responseSuccess.result.data.name,
            cpf: responseSuccess.result.data.cpf
          };
          AuthenticationHandler.getInstance().setPersistentAccess(profile, responseSuccess.result.data.token, responseSuccess.result.data.expiresIn);
          this.goesToRoot();
        },
        responseError => {
          spinner.complete();
          if (responseError.status == 0) {
            this.showToast("O servidor de autenticação está inacessível. Verifique sua conexão e tente novamente.");
            return;
          }
          responseError.result.errors.forEach(error => {
            this.showToast(error);
          });
        }
      );
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
    return [
      <ion-header>
        <ion-toolbar color='primary'>
          <ion-title>Odonto Farmacs</ion-title>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <ion-list>
          <ion-list-header>
            <ion-title text-center>
              <of-lazy-img src="assets/logo/Logo.png"></of-lazy-img>
            </ion-title>
          </ion-list-header>
          <form>
            <ion-item>
              <ion-label position="stacked">CPF ou CRO</ion-label>
              {/* Implementado onIonInputDidLoad porque autofocus no momento não está funcionando */}
              <ion-input id="cpfCro" type="text" class={this.submitted ? "submitted" : ""} required={true} autofocus={true} onIonInputDidLoad={() => { (this.htmlTemplate.querySelector('#cpfCro') as HTMLInputElement).focus() }}></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Senha</ion-label>
              <ion-input id="password" type="password" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
            </ion-item>
          </form>
        </ion-list>
        <of-button-spinner expand="block" fill="solid" onClick={spinner => this.authenticate(spinner)}>
          Entrar
        </of-button-spinner>
        <ion-button expand="block" fill="outline" onClick={() => this.goesTo("app-profile", false)}>
          Cadastre-se
        </ion-button>
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
