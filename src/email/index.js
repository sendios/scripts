import Popup from '../popup';
import Cookie from "../cookie";
import { EMAIL_DENY_TIMEOUT, WEBPUSH_CLOSE_TIMEOUT } from "../session/config";

/**
 * Init subscribe email
 */
export default class Email {

  /**
   * @type {null|Popup}
   */
  popup = null;

  /**
   * Init email component
   * @param callback - function that will be called after popup was showed
   * @param time - popup showing delay default 1000 ms
   */
  init( callback = null, time = 1000 ) {
    window.mfPopup = this.initPopup();
    if ( window.mfPopup ) window.mfPopup.showPopup(time).then(callback);
  }

  /**
   * Apply popup to session object
   * @returns {Popup}
   */
  initPopup() {
    const {url, width, height, appearence_id} = window.mfSession.settings.subscribe;

    if ( !url ) return false;

    this.popup = new Popup(url, width, height, appearence_id);
    this.popup.closeCallback = this.popupCloseCallback;

    return this.popup;
  }

  /**
   * @returns {WebPushFcm}
   */
  popupCloseCallback() {
    Cookie.set('emailDeny', true, {expires: EMAIL_DENY_TIMEOUT});

    return this;
  }
}
