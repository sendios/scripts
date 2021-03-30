/**
 * Recive messages from children iframe
 * @param event
 */
import Cookie from '../cookie';

export default function postMessageHandler(event) {

  let data = {};
  try {
    data = JSON.parse(event.data);
  } catch (e) {
  }

  if (data.email) Cookie.set('subscribed', true);

  switch (data.action) {
    case 'close':
      window.mfPopup.closePopup();
      break;
    case 'subscribe':
      if (typeof window.mfPopup.subscribeEvent === 'function') {
        window.mfPopup.subscribeEvent();
        window.mfPopup.closeCallback = false;
        window.mfPopup.closePopup();
      }
      break;
    default:
      break;
  }
}
