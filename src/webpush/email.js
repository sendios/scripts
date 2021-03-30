import { EMAIL_DENY_TIMEOUT } from "../session/config";
import Cookie from "../cookie";

export default class EmailAttacher {
  email;

  /**
   * @param email
   */
  constructor( email ) {
    this.email = email;
  }

  /**
   * Initialize check user email and push user id
   * @returns {boolean}
   */
  init() {
    if ( !window.mfSession.pushUser ) {
      console.warn('Push user not specified. Need push subscription');
      return false;
    }

    if ( !this.validateEmail() ) {
      console.warn(`Email not valid input was - ${this.email}`);
      return false;
    }

    this.sendEmailToServer();
  }

  /**
   * Send user email to server
   */
  sendEmailToServer() {
    let alreadySend = Cookie.get('emailWasSend');

    if ( alreadySend ) {
      console.info('Email was already attached');

      return;
    }

    const data = {
      pushUser: window.mfSession.pushUser,
      email: this.email
    };

    let request = new XMLHttpRequest();
    const url = 'https://api.sendios.io/v1/webpush/email';
    request.open('POST', url, true);

    request.send(JSON.stringify(data));

    Cookie.set('emailWasSend', true, {expires: EMAIL_DENY_TIMEOUT});
  }

  /**
   * Validate email
   * @returns {boolean}
   */
  validateEmail() {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(this.email).toLowerCase());
  }
}