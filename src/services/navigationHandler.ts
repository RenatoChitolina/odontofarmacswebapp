import AuthenticationHandler from './authenticationHandler';

export default class NavigationHandler {

  constructor() {
    if (NavigationHandler._instance)
      throw new Error("Instantiation failed: Use NavigationHandler.getInstance() instead of new keyword.");

    NavigationHandler._instance = this;
  }

  PushPage(ionNav: HTMLIonNavElement, page: string, verifyPersistentAccess: boolean, dataState: any = null) {
    if (verifyPersistentAccess)
      if (!this.hasPersistentAccess(ionNav))
        return;

    if (dataState)
      ionNav.push(page, dataState);
    else
      ionNav.push(page);
  }

  PopPage(ionNav: HTMLIonNavElement, verifyPersistentAccess: boolean) {
    if (verifyPersistentAccess)
      if (!this.hasPersistentAccess(ionNav))
        return;

    ionNav.pop();
  }

  PopRootPage(ionNav: HTMLIonNavElement, verifyPersistentAccess: boolean) {
    if (verifyPersistentAccess)
      if (!this.hasPersistentAccess(ionNav))
        return;

    ionNav.setRoot("app-encyclopedia");
    ionNav.popToRoot();
  }

  hasPersistentAccess(ionNav: HTMLIonNavElement = null): boolean {
    let hasPRAccess = AuthenticationHandler.getInstance().verifyPersistentAccess();

    if (!hasPRAccess && ionNav) {
      ionNav.setRoot("app-authentication");
      ionNav.popToRoot();
    }

    return hasPRAccess;
  }

  /* Singleton features */
  private static _instance: NavigationHandler = new NavigationHandler();
  public static getInstance(): NavigationHandler { return NavigationHandler._instance; }
}
