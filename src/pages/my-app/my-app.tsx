import "@ionic/core";
import { Component, Prop } from '@stencil/core';
import AuthenticationHandler from '../../services/authenticationHandler';
import NavigationHandler from '../../services/navigationHandler';

@Component({
  tag: 'my-app',
  styleUrl: 'my-app.scss'
})

export class MyApp {

  private ionNav: HTMLIonNavElement;
  private ionMenu: HTMLIonMenuElement;

  @Prop({ connect: 'ion-toast-controller' })
  toastCtrl: HTMLIonToastControllerElement;

  componentDidLoad() {
    this.ionNav = document.querySelector('ion-nav');
    this.ionMenu = document.querySelector('ion-menu');
  }

  goesThroughMenuTo(page: string, dataState: any = null) {
    this.ionMenu.close();
    NavigationHandler.getInstance().PushPage(this.ionNav, page, true, dataState);
  }

  exit() {
    AuthenticationHandler.getInstance().removePersistentAccess();
    this.goesThroughMenuTo("app-authentication");
  }

  showTimedToast(message: string, duration: number = 3000): Promise<HTMLIonToastElement> {
    return this.showToast({
      message: message,
      duration: duration
    });
  }

  showFixedToast(message: string, closeButtonText: string = "Fechar"): Promise<HTMLIonToastElement> {
    return this.showToast({
      message: message,
      showCloseButton: true,
      closeButtonText: closeButtonText
    });
  }

  showToast(options: any): Promise<HTMLIonToastElement> {
    options.cssClass = "toast";

    return this.toastCtrl.create(options);
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url='/autenticacao' component='app-authentication'></ion-route>
          <ion-route url='/perfil' component='app-profile'></ion-route>
          <ion-route url='/perfil-termo' component='app-term'></ion-route>
          <ion-route url='/perfil-senha' component='app-profile-password'></ion-route>
          <ion-route url='/enciclopedia' component='app-encyclopedia'></ion-route>
          <ion-route url='/medicamento' component='app-medicament'></ion-route>
          <ion-route url='/sugestao' component='app-suggestion'></ion-route>
          <ion-route-redirect from="/" to={NavigationHandler.getInstance().hasPersistentAccess() ? '/enciclopedia' : '/autenticacao'}></ion-route-redirect>
          <ion-route-redirect from="*" to={NavigationHandler.getInstance().hasPersistentAccess() ? null : '/autenticacao'}></ion-route-redirect>
        </ion-router>
        <ion-nav id="nav"></ion-nav>
        <ion-menu menuId="menu" contentId="nav" side="end">
          <ion-header>
            <ion-toolbar color="primary">
              <ion-title>Opções</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content>
            <ion-list>
              <ion-item button={true} onClick={() => this.goesThroughMenuTo("app-profile")} >
                <ion-icon class="menu-item-button" name="contact"></ion-icon>
                <ion-label>Perfil</ion-label>
              </ion-item>
              <ion-item button={true} onClick={() => this.exit()} >
                <ion-icon class="menu-item-button" name="exit"></ion-icon>
                <ion-label>Sair</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-menu>
      </ion-app>
    );
  }
}

