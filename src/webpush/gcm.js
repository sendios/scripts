import {
  jsonp,
  isGcmDataWasSend,
  setGcmDataWasSend,
  arrayBufferToBase64,
  isTokenSentToServer, isFunction
} from '../helpers/_helpers';
import WebPushTracker from '../helpers/_webpushTracker';
import Popup from '../popup';
import Cookie from '../cookie';
import { WEBPUSH_DENY_TIMEOUT } from '../session/config';

/**
 * Webpush via GCM component
 */
export default class WebPushGcm {

  /** @type {null|Popup} */
  popup = null;

  callback = null;

  showCallback = null;

  /**
   * Show popup from sendios system
   * @param callback - function that will be called after popup was showed
   * @param time - popup showing delay default 1000 ms
   * @param showCallback - popup show callback function
   * @returns {Promise<void>}
   */
  async init( callback = null, time = 1000, showCallback ) {
    this.callback = isFunction(callback) ? callback : function () {
    };
    this.showCallback = isFunction(showCallback) ? showCallback : function () {
    };

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

    setTimeout(() => {
      this.subscribe();
    }, time);
  }

  /**
   * Init popup
   * @returns { Popup }
   */
  async initPopup() {
    const {url} = window.mfSession.settings.webpush;

    if ( !url ) return;

    WebPushTracker.trackAttempt({popup_type: 1});

    this.popup = new Popup(url);
    this.popup.closeCallback = this.popupCloseCallback;
    this.popup.subscribeEvent = () => this.subscribe();

    return this.popup;
  }

  /**
   * @returns {WebPushFcm}
   */
  popupCloseCallback() {
    WebPushTracker.trackDeny({popup_type: 2});
    Cookie.set('pushDeny', true, {expires: WEBPUSH_DENY_TIMEOUT});

    this.callback();

    return this;
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
      WebPushTracker.trackAttempt({userId: window.mfSession.userId, popup_type: 2});
    }

    return await this.subscribeUser();
  }

  /**
   * Subscribe user (see firabase docks)
   * @returns {Promise<void>}
   */
  async subscribeUser() {
    const _this = this;

    this.showCallback();

    const result = await Notification.requestPermission();

    if ( result === 'denied' ) {
      WebPushTracker.trackDeny({popup_type: 2});
    }

    if ( result === 'denied' || result === 'default' ) {
      this.callback();
      return false;
    }

    const req = await navigator.serviceWorker.register(window.mfSession.sw);

    const subscription = await req.pushManager.subscribe({userVisibleOnly: true});

    const data = {
      meta: {
        url: subscription.endpoint,
        public_key: arrayBufferToBase64(subscription.getKey('p256dh')),
        auth_token: arrayBufferToBase64(subscription.getKey('auth'))
      }
    };

    /** set additional data **/
    if ( window.mfSession.userId ) {
      data.user_id = window.mfSession.userId;
    } else {
      data.hash = window.mfSession.guestId;
    }

    if ( window.mfSession.email ) {
      data.meta.email = window.mfSession.email;
    }

    if ( window.mfSession.pushUser ) {
      data.push_user_id = window.mfSession.pushUser;
    }

    _this.sendDataToServer(data);
  }

  /**
   * Send gcm data to server | set user cookie
   * @param data
   * @returns {Promise<void>}
   */
  async sendDataToServer( data ) {
    if ( isGcmDataWasSend() === true ) return;

    const _this = this;

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

      jsonp('https://n.sendios.io/users/setcookie');

      const cookieRequest = new XMLHttpRequest();

      cookieRequest.open('POST', 'https://n.sendios.io/users/setcookie', true);

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

    request.send(JSON.stringify(data));
    setGcmDataWasSend();
  }
}