import { Observable } from 'rxjs';
import env from '../.env';
import DatabaseHandler from './databaseHandler';

//TODO: (R) Quando houver uma versão estável, remover essa tipagem forçada e fazer o import corretamente
declare const Cookies: any;

export default class AuthenticationHandler {
  private readonly _baseUri: any;

  constructor() {
    if (AuthenticationHandler._instance)
      throw new Error("Instantiation failed: Use AuthenticationHandler.getInstance() instead of new keyword.");

    this._baseUri = env.AUTH_SERVER_URI;

    AuthenticationHandler._instance = this;
  }

  private _userId: string
  get userId(): string {
    return this._userId;
  }

  private _userName: string;
  get userName(): string {
    return this._userName;
  }

  beginSignUp(profileData: any): Observable<any> {
    return new Observable(observer => {
      fetch(`${this._baseUri}/beginsignup`, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(profileData)
      })
        .then(res => {
          res.json()
            .then(json => {
              let response = { status: res.status, result: json };

              return (res.ok ? observer.next(response) : observer.error(response));
            })
        })
        .catch(err => {
          let response = { status: 0, result: { errors: [err] } };

          return observer.error(response);
        });
    });
  }

  completeSignUp(profileData: any): Observable<any> {
    return new Observable(observer => {
      fetch(`${this._baseUri}/completesignup`, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(profileData)
      })
        .then(res => {
          res.json()
            .then(json => {
              let response = { status: res.status, result: json };

              return (res.ok ? observer.next(response) : observer.error(response));
            })
        })
        .catch(err => {
          let response = { status: 0, result: { errors: [err] } };

          return observer.error(response);
        });
    });
  }

  signIn(authData: any): Observable<any> {
    return new Observable(observer => {
      fetch(`${this._baseUri}/signin`, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(authData)
      })
        .then(res => {
          res.json()
            .then(json => {
              let response = { status: res.status, result: json };

              return (res.ok ? observer.next(response) : observer.error(response));
            })
        })
        .catch(err => {
          let response = { status: 0, result: { errors: [err] } };

          return observer.error(response);
        });
    });
  }

  updateProfilePassword(profilePasswordData: any): Observable<any> {
    return new Observable(observer => {
      fetch(`${this._baseUri}/updateprofilepassword`, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(profilePasswordData)
      })
        .then(res => {
          res.json()
            .then(json => {
              let response = { status: res.status, result: json };

              return (res.ok ? observer.next(response) : observer.error(response));
            })
        })
        .catch(err => {
          let response = { status: 0, result: { errors: [err] } };

          return observer.error(response);
        });
    });
  }

  verifyPersistentAccess(): boolean {
    let prAccess: any = Cookies.getJSON('pr-access');

    if (prAccess)
      if (prAccess.profile && prAccess.token) {
        this._userId = prAccess.profile.id;
        this._userName = prAccess.profile.name;
        return true;
      }

    return false;
  }

  setPersistentAccess(profile: any, token: string, expiresIn: number) {
    Cookies.set('pr-access', { profile, token }, { expires: expiresIn });
    DatabaseHandler.getInstance().syncProfile(profile.id);
  }

  removePersistentAccess() {
    Cookies.remove('pr-access');
    this._userId = undefined;
    this._userName = undefined;
  }

  /* Singleton features */
  private static _instance: AuthenticationHandler = new AuthenticationHandler();
  public static getInstance(): AuthenticationHandler { return AuthenticationHandler._instance; }
}
