import Cookie from "../cookie";
import Session from "../session";
import WebPushFcm from "../webpush/fcm";

/**
 * Webpush event tracker
 */
export default class WebPushTracker {
  /**
   * User close popup
   * @param popup_type
   */
  static trackDeny( {popup_type} ) {
    const request = new XMLHttpRequest();
    const data = new FormData();
    const url = `https://tracking.sendios.io/v1/webpush/deny/${window.mfSession.project}`;

    data.append('popup_type', popup_type);

    request.open('POST', url, true);
    request.send(data);
  }

  /**
   * Popup wash showed
   * @param user_id
   * @param popup_type
   */
  static trackAttempt( {user_id, popup_type} ) {
    const request = new XMLHttpRequest();
    const data = new FormData();
    const url = `https://tracking.sendios.io/v1/webpush/attempt/${window.mfSession.project}`;

    data.append('popup_type', popup_type);
    data.append('user_id', user_id);

    request.open('POST', url, true);
    request.send(data);
  }
}