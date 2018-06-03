import { Observable } from 'rxjs';

export function urlB64ToUint8Array(base64String: string) {
  let padding = '='.repeat((4 - base64String.length % 4) % 4);

  let base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  let rawData = window.atob(base64);

  let outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function uuIDv4(withoutDashes: boolean = false) {
  let uuid = "", i, random;

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;

    if (withoutDashes === false)
      if (i == 8 || i == 12 || i == 16 || i == 20)
        uuid += "-"

    uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
  }

  return uuid;
}

export function readTxt(txtFileAddress: string): Observable<string> {
  return new Observable(observer => {
    fetch(txtFileAddress)
      .then(result => result.text())
      .then(text => observer.next(text));
  });
}

export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '') //Remove tudo o que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') //Coloca um ponto entre o terceiro e o quarto dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') //Coloca um ponto entre o sexto e o sétimo dígitos
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); //Coloca um hífen entre o nono e o décimo dígitos
}
