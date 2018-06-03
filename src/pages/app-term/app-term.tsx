import "@ionic/core";
import { Component, Prop, State } from '@stencil/core';
import { readTxt } from '../../helpers/utils';
import DatabaseHandler from '../../services/databaseHandler';
import AuthenticationHandler from '../../services/authenticationHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-term',
  styleUrl: 'app-term.scss'
})

export class AppTerm {

  private ionNav: HTMLIonNavElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;
  @Prop()
  profileData: any;
  @Prop()
  formState: number = 1;

  @State()
  term: string;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');

    readTxt(`/assets/docs/termo-${this.profileData.type.name.toLowerCase()}.txt`)
      .subscribe(data => {
        this.term = data;
      });
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

  agree(spinner: any) {
    this.profileData.signature = new Date().valueOf().toString();

    if (this.formState == 2) {
      DatabaseHandler.getInstance().updateProfile(this.profileData)
        .subscribe(() => {
          spinner.complete();
          this.showToast('Cadastro atualizado com sucesso.');
          this.goesToRoot();
        });
    } else {
      AuthenticationHandler.getInstance().completeSignUp(this.profileData)
        .subscribe(
          responseSuccess => {
            responseSuccess.result.infos.forEach(info => {
              this.showToast(info);
            });
            let authData = {
              cpfCro: responseSuccess.result.data.cpf,
              password: responseSuccess.result.data.password
            }
            AuthenticationHandler.getInstance().signIn(authData)
              .subscribe(
                responseSuccess => {
                  spinner.complete();
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
          <ion-title>Termo</ion-title>
        </ion-toolbar>
      </ion-header>
      ,
      <ion-content>
        <div class="term-title">Termo de compromisso</div>
        <div class="term-subtitle">{this.profileData.type.name}</div>
        <div class="term-text">{this.term}</div>
        <of-button-spinner expand="block" fill="solid" onClick={spinner => this.agree(spinner)}>
          Concordar
        </of-button-spinner>
      </ion-content>
      ,
      <ion-footer style={{ "background-color": "#17ab93", height: "4%" }}>
        <of-footer></of-footer>
      </ion-footer>
    ];
  }
}
