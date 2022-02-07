import {
  FIREBASE_JS,
  FIREBASE_MESSAGING,
  isTokenSentToServer,
  jsonp,
  loadScript,
  setTokenWasSent,
  isFunction
} from '../helpers/_helpers';
import WebPushTracker from '../helpers/_webpushTracker';
import Popup from '../popup';
import Cookie from '../cookie';
import { WEBPUSH_DENY_TIMEOUT } from '../session/config';

/**
 * Webpush via FCM component
 */
export default class WebPushFcm {

  /** @type {null|Popup} */
  popup = null;

  callback = null;

  showCallback = null;

  firebaseInited = false;

  /**
   *  Show popup from sendios system
   * @param callback - function that will be called after popup was showed
   * @param time - popup showing delay default 1000 ms
   * @param showCallback - show popup callback
   * @returns {Promise<void>}
   */
  async init( callback = null, time = 1000, showCallback = null ) {
    this.callback = isFunction(callback) ? callback : function () {
    };
    this.showCallback = isFunction(showCallback) ? showCallback : function () {
    };

    await this.initFireBase();

    window.mfPopup = this.initPopup();

    await window.mfPopup.showPopup(time, showCallback);

    return this;
  }

  /**
   * Show default subscribe popup
   * @param callback - function that will be called after popup was showed
   * @param time  - popup showing delay default 3000 ms
   * @param showCallback - popup show callback
   * @returns {Promise<void>}
   */
  async subscribePopup( callback = null, time = 3000, showCallback = null ) {
    this.callback = isFunction(callback) ? callback : function () {
    };
    this.showCallback = isFunction(showCallback) ? showCallback : function () {
    };

    await this.initFireBase();

    setTimeout(() => {
      this.subscribe();
    }, time);

    return this;
  }

  /**
   * Init popup from session data
   * @returns { Popup }
   */
  initPopup() {
    const {url} = window.mfSession.settings.webpush;

    if ( !url ) return;

    this.popup = new Popup(url);
    this.popup.closeCallback = this.popupCloseCallback;
    this.popup.subscribeEvent = () => this.subscribe();

    return this.popup;
  }

  /**
   * Function that would be called after popup was closed
   * @returns {WebPushFcm}
   */
  popupCloseCallback() {
    WebPushTracker.trackDeny({popup_type: 2});
    Cookie.set('pushDeny', true, {expires: WEBPUSH_DENY_TIMEOUT});

    this.callback();

    return this;
  }

  /**
   * Init firebase scripts
   * @returns {Promise<void>}
   */
  async initFireBase() {
    if ( !('serviceWorker' in navigator) ) {
      return;
    }

    if ( !this.firebaseInited ) {
      await this.loadFirebaseScripts();
    }

    /** init firabase */
    const req = await navigator.serviceWorker.register(window.mfSession.sw);

    firebase.initializeApp({
      messagingSenderId: window.mfSession.msgSenderId,
    });

    window.mfSession.messaging = firebase.messaging();

    window.mfSession.messaging.useServiceWorker(req);

    this.firebaseInited = true;
  }

  /**
   * @returns {Promise<void>}
   */
  async loadFirebaseScripts() {
    /** Wait while scripts downloading */
    await loadScript(FIREBASE_JS);

    await loadScript(FIREBASE_MESSAGING);

    this.firebaseInited = true;
  }

  /**
   * Subscribe user
   * @returns {Promise<void>}
   */
  async subscribe() {
    /** Wait while user data would be set */
    if ( !window.mfSession.userId ) {
      await window.mfSession.getUserInfo();
    }
    /** Track that popup was showed */
    if ( Notification.permission === 'default' ) {
      await WebPushTracker.trackAttempt({userId: window.mfSession.userId, popup_type: 2});
    }

    return await this.subscribeUser();
  }

  /**
   * Subscribe user (see firabase docks)
   * @returns {Promise<void>}
   */
  async subscribeUser() {
    if ( window.localStorage.getItem('sentFirebaseMessagingToken') ) {
      return;
    }
    this.showCallback();

    console.log('BeforePopupShow');

    await window.mfSession.messaging.requestPermission();

    console.log('Permission - ' + Notification.permission);

    if ( Notification.permission === 'denied' ) {
      WebPushTracker.trackDeny({popup_type: 2});
      this.callback();
      return;
    }

    const token = await window.mfSession.messaging.getToken();

    console.log('Sending token');

    return await this.sendToken(token)
  }

  /**
   * Send user token to server
   * @param token
   */
  async sendToken( token ) {
    if ( isTokenSentToServer(token) ) return;

    const _this = this;

    const data = {
      fcm_meta: {token},
    };

    /** set additional data **/
    if ( window.mfSession.userId ) {
      data.user_id = window.mfSession.userId;
    } else if ( window.mfSession.email ) {
      data.fcm_meta.email = window.mfSession.email;
    } else if ( window.mfSession.pushUser ) {
      data.push_user_id = window.mfSession.pushUser;
    } else {
      data.hash = window.mfSession.guestId;
    }

    const request = new XMLHttpRequest();
    const url = `https://api.sendios.io/v1/webpush/project/${window.mfSession.project}`;

    request.open('POST', url, true);

    request.onload = function () {
      const response = JSON.parse(this.responseText);
      const pushUserId = response.data.push_user_id;

      if ( !pushUserId ) return;

      Cookie.set('push_user_id', pushUserId);

      const date = new Date();
      date.setDate(date.getDate() + 365);

      jsonp('https://tracking.sendios.io/users/setcookie');

      const cookieRequest = new XMLHttpRequest();

      cookieRequest.open('POST', 'https://tracking.sendios.io/users/setcookie', true);

      const userData = {
        push_user_id: {
          value: pushUserId,
          expire: date.toUTCString(),
        },
      };

      window.mfSession.pushUser = pushUserId;

      cookieRequest.onload = _this.callback;

      cookieRequest.send(JSON.stringify(userData));
    };

    await request.send(JSON.stringify(data));

    setTokenWasSent(token);
  }
}
