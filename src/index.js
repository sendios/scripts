import 'idempotent-babel-polyfill';
import Session from './session';
import WebPushFcm from './webpush/fcm';
import postMessageHandler from './helpers/_reciver';
import Email from './email';
import Cookie from './cookie';
import WebPushGcm from './webpush/gcm'
import EmailAttacher from "./webpush/email";
import WebPushTracker from "./helpers/_webpushTracker";


console.log('Script loaded');

/**
 * Register postMessage (handle messages from iframe)
 */
if ( window.addEventListener ) {
  window.addEventListener('message', postMessageHandler, false);
} else {
  window.attachEvent('onmessage', postMessageHandler);
}

const mfObject = window[ window._mf_object_name ];

const bootstrap = async () => {
  /** Init session */
  console.log('Session inited');

  window.session = new Session(mfObject.project, mfObject.msgSenderId, mfObject.sw, mfObject.api, mfObject.email);
};

window.mfWorker = async function ( obj, method, callback = null, time = 3000, oneSessionInit = true ) {

  console.log('Initializing worker');

  await bootstrap();

  window.session.loadSettings().then(() => {
    switch ( obj ) {
      case 'webpushfcm':
        if ( Notification.permission === 'denied' || Cookie.get('pushDeny') ) break;
        if ( oneSessionInit && window.sessionStorage.getItem('fcmWasCalled') ) break;
        const fcm = new WebPushFcm();
        method === 'init' ? fcm.init(callback, time, mfObject.pushPopupShowCallback) : fcm.subscribePopup(callback, time, mfObject.pushPopupShowCallback);
        window.sessionStorage.setItem('fcmWasCalled', true);
        break;
      case 'email':
        if ( Cookie.get('subscribed') || window.mfSession.userId || Cookie.get('emailDeny') || window.sessionStorage.getItem('emailWasCalled') ) break;
        (new Email()).init(callback, time);
        window.sessionStorage.setItem('emailWasCalled', true);
        window.mfPopup.showPopupCallBack = mfObject.popupShowCallback;
        break;
      case 'webpushgcm' :
        if ( Notification.permission === 'denied' || Cookie.get('pushDeny') ) break;
        if ( oneSessionInit && window.sessionStorage.getItem('gcmWasCalled') ) break;
        const gcm = new WebPushGcm();
        method === 'init' ? gcm.init(callback, time, mfObject.pushPopupShowCallback) : gcm.subscribePopup(callback, time, mfObject.pushPopupShowCallback);
        window.sessionStorage.setItem('gcmWasCalled', true);
        break;
      default:
        break;
    }
  })
};

window.mfWorker.attachEmailToPushUser = async function ( email ) {
  window.session = new Session(mfObject.project, mfObject.msgSenderId, mfObject.sw, mfObject.api, mfObject.email);

  await window.session.loadSettings();

  let attacher = new EmailAttacher(email);

  attacher.init();
};

window.mfWorker.initFireBase = function () {
  let fcmPush = new WebPushFcm();
  fcmPush.loadFirebaseScripts();
};


