import "@ionic/core";
import { Component, Prop, State, Element } from '@stencil/core';
import NavigationHandler from '../../services/navigationHandler';
import AuthenticationHandler from '../../services/authenticationHandler';

@Component({
  tag: 'app-profile-password',
  styleUrl: 'app-profile-password.scss'
})

export class AppProfilePassword {

  private ionNav: HTMLIonNavElement;

  @Element()
  htmlTemplate: HTMLElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;
  @Prop()
  profileId: string;

  @State()
  submitted: boolean = false;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');
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

  proceedUpdate(spinner: any) {
    let form = this.htmlTemplate.querySelector('form');

    if (!form.reportValidity()) {
      this.submitted = true;
      spinner.complete();
      return;
    }

    let elCurrentPassword = form.querySelector('#currentPassword') as HTMLInputElement;
    let elNewPassword = form.querySelector('#newPassword') as HTMLInputElement;
    let elNewPasswordConfirm = form.querySelector('#newPasswordConfirm') as HTMLInputElement;

    let profilePasswordData: any = {
      profileId: this.profileId,
      currentPassword: elCurrentPassword.value,
      newPassword: elNewPassword.value,
      newPasswordConfirm: elNewPasswordConfirm.value
    }

    AuthenticationHandler.getInstance().updateProfilePassword(profilePasswordData)
      .subscribe(
        responseSuccess => {
          spinner.complete();
          responseSuccess.result.infos.forEach(info => {
            this.showToast(info);
          });
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
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button fill="clear" onClick={() => this.comeBack()}>
              <ion-icon class="back-button" name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Perfil - Senha</ion-title>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <ion-list>
          <form>
            <ion-item>
              <ion-label position="floating">Senha atual *</ion-label>
              {/* Implementado onIonInputDidLoad porque autofocus no momento não está funcionando */}
              <ion-input id="currentPassword" type="password" class={this.submitted ? "submitted" : ""} required={true} autofocus={true} onIonInputDidLoad={() => {(this.htmlTemplate.querySelector('#currentPassword') as HTMLInputElement).focus()}}></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Nova senha *</ion-label>
              <ion-input id="newPassword" type="password" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Confirmação de senha *</ion-label>
              <ion-input id="newPasswordConfirm" type="password" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
            </ion-item>
          </form>
        </ion-list>
        <of-button-spinner expand="block" fill="solid" onClick={spinner => this.proceedUpdate(spinner)}>
          Atualizar
        </of-button-spinner>
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
