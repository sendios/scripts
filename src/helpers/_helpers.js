/**
 * Firebase script url
 * @type {string}
 */
export const FIREBASE_JS = 'https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js';
/**
 * Firebae messaging script url
 * @type {string}
 */
export const FIREBASE_MESSAGING = 'https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js';

/**
 * Sendios api url
 * @type {string}
 */
export const API_URL = 'https://n.sendios.io/';


/**
 * Load script to dom
 * @param {string} url
 */
export function loadScript( url ) {
  return new Promise(resolve => {
    let l = document.createElement('script');
    l.src = url;
    l.type = 'text/javascript';
    l.async = true;
    l.onload = resolve;
    let s = document.getElementsByTagName('body')[ 0 ];
    s.parentNode.insertBefore(l, s);
  });
}

/**
 * Check if firebase token was send to server
 * @param token
 * @returns {boolean}
 */
export function isTokenSentToServer( token ) {
  return window.localStorage.getItem('sentFirebaseMessagingToken') === token;
}

/**
 * Set flag that token was send
 * @param token
 */
export function setTokenWasSent( token ) {
  window.localStorage.setItem('sentFirebaseMessagingToken', token || '');
}

/**
 * Check if gcm data was send to the server
 * @returns {string | null}
 */
export function isGcmDataWasSend() {
  return window.localStorage.getItem('sendGcmData')
}

/**
 * Set flag that dcm request data was sended
 */
export function setGcmDataWasSend() {
  window.localStorage.setItem('sendGcmData', true);
}

/**
 * Jsonp request
 * @param uri
 * @returns {Promise<any>}
 */
export function jsonp( uri ) {
  return new Promise(( resolve, reject ) => {
    const id = `_${Math.round(10000 * Math.random())}`;
    const callbackName = `jsonp_callback_${id}`;

    window[ callbackName ] = function ( data ) {
      delete window[ callbackName ];
      const ele = document.getElementById(id);
      ele.parentNode.removeChild(ele);
      resolve(data);
    };

    const src = `${uri}&callback=${callbackName}`;
    const script = document.createElement('script');
    script.src = src;
    script.id = id;
    script.addEventListener('error', reject);
    (document.getElementsByTagName('head')[ 0 ] || document.body || document.documentElement).appendChild(script);
  });
}

/**
 * Decode user subscribtion
 * @param buffer
 * @returns {string}
 */
export function arrayBufferToBase64( buffer ) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for ( var i = 0; i < len; i++ ) {
    binary += String.fromCharCode(bytes[ i ]);
  }
  return window.btoa(binary);
}

/**
 * @param functionToCheck
 * @returns {*|boolean}
 */
export function isFunction( functionToCheck ) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
