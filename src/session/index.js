import Cookie from '../cookie';
import { API_URL, jsonp } from '../helpers/_helpers';

export default class Session {
  settings = {subscribe: {}, webpush: {}, invalid: null};

  project = false;

  msgSenderId = false;

  sw = false;

  apiRoot = API_URL;

  userId = false;

  guestId = false;

  email = false;

  constructor( project, msgSenderId, swPath, apiRoot, email = false ) {
    this.project = project;
    this.msgSenderId = msgSenderId;
    this.sw = swPath;
    this.apiRoot = apiRoot || API_URL;
    this.userId = Cookie.get('user_id');
    this.pushUser = Cookie.get('push_user_id');
    this.email = email;
  }

  /**
   * Load user settings by specific project
   * @returns {Promise<any>}
   */
  loadSettings() {
    return new Promise(( resolve ) => {
      const _this = this;

      const request = new XMLHttpRequest();
      const url = `${this.apiRoot}widget/settings/${this.project}`;
      request.open('GET', url, true);

      request.onload = function () {
        const res = JSON.parse(this.responseText);

        _this.settings = Object.assign(_this.settings, res.data);
        window.mfSession = _this;
        resolve();
      };

      request.send();
    });
  }

  /**
   * Get user information
   */
  getUserInfo() {
    if ( Cookie.get('guest_id') ) window.mfSession.guestId = Cookie.get('guest_id');

    jsonp(`${window.mfSession.apiRoot}users/cookie`).then(( result ) => {
      const {reg_ts, user_id, guest_id} = result;

      if ( reg_ts ) Cookie.set('reg_ts', reg_ts);

      if ( user_id ) {
        window.mfSession.userId = user_id;
        Cookie.set('user_id', user_id);
      }
      if ( guest_id ) {
        window.mfSession.guestId = guest_id;
        Cookie.set('guest_id', guest_id);
      }
    }).catch(err => {
      console.log(err);
    });
  }
}
