import "@ionic/core";
import { Component, Prop, State, Element } from '@stencil/core';
import { maskCPF } from '../../helpers/utils';
import DatabaseHandler from '../../services/databaseHandler';
import AuthenticationHandler from '../../services/authenticationHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'app-profile',
  styleUrl: 'app-profile.scss'
})

export class AppProfile {

  private ionNav: HTMLIonNavElement;

  @Element()
  htmlTemplate: HTMLElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;

  @State()
  profile: any;
  @State()
  formState: number = 1;
  @State()
  submitted: boolean = false;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');

    if (AuthenticationHandler.getInstance().userId) {
      this.getData();
      this.formState = 2;
    }
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

  getData() {
    let db = DatabaseHandler.getInstance()

    db.getProfile(AuthenticationHandler.getInstance().userId)
      .subscribe(data => {
        this.profile = { ...data };
      });
  }

  proceedSignup(spinner: any) {
    let form = this.htmlTemplate.querySelector('form');

    if (!form.reportValidity()) {
      this.submitted = true;
      spinner.complete();
      return;
    }

    let elName = form.querySelector('#name') as HTMLInputElement;
    let elSurname = form.querySelector('#surname') as HTMLInputElement;
    let elBirth = form.querySelector('#birth') as HTMLInputElement;
    let elCpf = form.querySelector('#cpf') as HTMLInputElement;
    let elCro = form.querySelector('#cro') as HTMLInputElement;
    let elEmail = form.querySelector('#email') as HTMLInputElement;
    let elPassword = form.querySelector('#password') as HTMLInputElement;
    let elPasswordConfirm = form.querySelector('#passwordConfirm') as HTMLInputElement;

    let profileData: any = {
      type: this.defineProfileType(elCro.value),
      name: elName.value,
      surname: elSurname.value,
      birth: new Date(`${elBirth.value} 00:00:00`).valueOf().toString(),
      cpf: elCpf.value,
      password: elPassword.value,
      passwordConfirm: elPasswordConfirm.value
    }

    if (elCro.value)
      profileData.cro = elCro.value;

    if (elEmail.value)
      profileData.email = elEmail.value;

    AuthenticationHandler.getInstance().beginSignUp(profileData)
      .subscribe(
        responseSuccess => {
          spinner.complete();
          responseSuccess.result.infos.forEach(info => {
            this.showToast(info);
          });
          this.goesTo("app-term", false, { profileData: profileData, formState: this.formState });
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

  proceedUpdate() {
    let form = this.htmlTemplate.querySelector('form');

    if (!form.reportValidity()) {
      this.submitted = true;
      return;
    }

    let elName = form.querySelector('#name') as HTMLInputElement;
    let elSurname = form.querySelector('#surname') as HTMLInputElement;
    let elBirth = form.querySelector('#birth') as HTMLInputElement;
    let elCro = form.querySelector('#cro') as HTMLInputElement;
    let elEmail = form.querySelector('#email') as HTMLInputElement;

    let oldProfileType = this.profile.type;

    this.profile.type = this.defineProfileType(elCro.value);
    this.profile.name = elName.value;
    this.profile.surname = elSurname.value;
    this.profile.birth = new Date(`${elBirth.value} 00:00:00`).valueOf().toString();

    if (elCro.value)
      this.profile.cro = elCro.value;
    else
      delete this.profile.cro;

    if (elEmail.value)
      this.profile.email = elEmail.value;
    else
      delete this.profile.email;

    if (this.profile.type.index != oldProfileType) {
      this.goesTo("app-term", false, { profileData: this.profile, formState: this.formState });
    } else {
      DatabaseHandler.getInstance().updateProfile(this.profile)
        .subscribe(() => {
          this.showToast('Cadastro atualizado com sucesso.');
          this.goesToRoot();
        });
    }
  }

  defineProfileType(cro: string): any {
    return cro
      ? { index: 1, name: "Profissional" }
      : { index: 2, name: "Estudante" };
  }

  maskCPF(changedCPFEvent: any) {
    changedCPFEvent.target.value = maskCPF(changedCPFEvent.target.value);
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
    let tplListContent = [];
    let tplButtonContent = [];

    if (this.formState == 2) {

      let tplFormEdit =
        <form>
          <ion-item>
            <ion-label position="floating">Nome *</ion-label>
            {/* Implementado onIonInputDidLoad porque autofocus no momento não está funcionando */}
            <ion-input id="name" type="text" class={this.submitted ? "submitted" : ""} required={true} value={this.profile ? this.profile.name : ""} autofocus={true} onIonInputDidLoad={() => { (this.htmlTemplate.querySelector('#name') as HTMLInputElement).focus() }}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Sobrenome *</ion-label>
            <ion-input id="surname" type="text" class={this.submitted ? "submitted" : ""} required={true} value={this.profile ? this.profile.surname : ""}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Nascimento *</ion-label>
            <ion-input id="birth" type="date" class={this.submitted ? "submitted" : ""} required={true} value={this.profile ? this.profile.birth : ""}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">CPF *</ion-label>
            <ion-input id="cpf" type="text" inputmode="numeric" maxlength={14} class={this.submitted ? "submitted" : ""} required={true} disabled={true} value={this.profile ? this.profile.cpf : ""} onIonChange={event => this.maskCPF(event)}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">CRO</ion-label>
            <ion-input id="cro" type="text" value={this.profile ? this.profile.cro : ""}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">E-mail</ion-label>
            <ion-input id="email" type="email" value={this.profile ? this.profile.email : ""}></ion-input>
          </ion-item>
        </form>

      let tplConclude =
        <ion-button expand="block" fill="solid" onClick={() => this.proceedUpdate()}>
          Atualizar
        </ion-button>

      tplListContent.push(tplFormEdit);

      tplButtonContent.push(tplConclude);

    } else {

      let tplFormAdd =
        <form>
          <ion-item>
            <ion-label position="floating">Nome *</ion-label>
            {/* Implementado onIonInputDidLoad porque autofocus no momento não está funcionando */}
            <ion-input id="name" type="text" class={this.submitted ? "submitted" : ""} required={true} autofocus={true} onIonInputDidLoad={() => { (this.htmlTemplate.querySelector('#name') as HTMLInputElement).focus() }}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Sobrenome *</ion-label>
            <ion-input id="surname" type="text" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Nascimento *</ion-label>
            <ion-input id="birth" type="date" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">CPF *</ion-label>
            <ion-input id="cpf" type="text" inputmode="numeric" maxlength={14} class={this.submitted ? "submitted" : ""} required={true} onIonChange={event => this.maskCPF(event)}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">CRO</ion-label>
            <ion-input id="cro" type="text"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">E-mail</ion-label>
            <ion-input id="email" type="email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Senha *</ion-label>
            <ion-input id="password" type="password" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Confirmação de senha *</ion-label>
            <ion-input id="passwordConfirm" type="password" class={this.submitted ? "submitted" : ""} required={true}></ion-input>
          </ion-item>
        </form>

      let tplConclude =
        <of-button-spinner expand="block" fill="solid" onClick={spinner => this.proceedSignup(spinner)}>
          Finalizar
        </of-button-spinner>

      tplListContent.push(tplFormAdd);

      tplButtonContent.push(tplConclude);
    }

    return [
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button fill="clear" onClick={() => this.comeBack()}>
              <ion-icon class="back-button" name="arrow-back"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            {this.formState == 2
              ? <ion-button fill="clear" onClick={() => this.goesTo("app-profile-password", true, { profileId: this.profile._id })}>
                <ion-icon class="key-button" name="key"></ion-icon>
              </ion-button>
              : ""
            }
          </ion-buttons>
          <ion-title>Perfil</ion-title>
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
