import { isFunction } from '../helpers/_helpers';

export default class Popup {
  /**
   * Close callback function
   * @type {boolean}
   */
  closeCallback = false;

  /**
   * Subscribe callback function
   * @type {boolean}
   */
  subscribeEvent = false;


  height = '100%';

  type = 1;

  /**
   * Popup wrapper styles
   */
  style =
    ".mf_iframe{" +
    "    border: none;" +
    "}" +
    ".popup {\n" +
    "    position: fixed;\n" +
    "    top: 0;\n" +
    "    right: 0;\n" +
    "opacity : 0;" +
    "    left: 0;\n" +
    "    -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";\n" +
    "    z-index: 1050;\n" +
    "    overflow: auto;\n" +
    "    outline: 0;\n" +
    "    text-align: center;\n" +
    "    font-size: 0;\n" +
    "transition: opacity,top 1s ease-in-out;\n" +
    "}\n" +
    "\n" +
    ".popup:after {\n" +
    "    content: '';\n" +
    "    display: inline-block;\n" +
    "    vertical-align: middle;\n" +
    "    width: 0;\n" +
    "    height: 100%;\n" +
    "}\n" +
    "\n" +
    "\n" +
    ".popup__container {\n" +
    "    display: inline-block;\n" +
    "    vertical-align: middle;\n" +
    "    position: relative;\n" +
    "    width: 100%;\n" +
    "    height: " + this.height + ";" +
    "}\n" +
    "\n" +
    ".popup.opened {\n" +
    "    opacity: 1;\n" +
    "    -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)\";\n" +
    "    top: 0;\n" +
    "}\n" +
    "\n" +
    "body.popup-opened {\n" +
    "    position: fixed;\n" +
    "    top: 0;\n" +
    "    left: 0;\n" +
    "    right: 0;\n" +
    "    overflow: hidden;\n" +
    "}" +
    ".type_1 {\n" +
    "transition: opacity 1s ease-out 0.5s;\n" +
    "background: rgba(0,0,0,0.7);\n" +
    "height: 100%;" +
    "}" +
    ".type_4 {\n" +
    "top: -50%;\n " +
    "opacity: 1;" +
    "transition: opacity,top 1s ease-in-out;\n" +
    "}"
  ;

  constructor( url, width = '100%', height = '100%', type = 1 ) {
    this.body = document.body;
    this.url = url;
    this.width = width;
    this.height = height;
    this.type = type;

    this.init();
  }

  /**
   * Build iframe wrapper
   */
  init() {
    this.body.innerHTML += `
      <style>${this.style}</style>
      <div class="popup type_${this.type}" height="${this.height}">
      <div class="popup__container">
            <iframe  class="mf_iframe" scrolling="no"  width="${this.width}" height="${this.height}" src="${this.url}"></iframe>
      </div>
      </div>
    `;
  }

  /**
   * Close popup (usage: window.mfPopup.closePopup())
   */
  closePopup() {
    const bg = document.getElementsByClassName('popup')[ 0 ];
    bg.classList.remove('opened');

    if ( typeof this.closeCallback === 'function' ) this.closeCallback();
    setTimeout(() => bg.remove(), 2000);
  }

  /**
   * Show popup (usage: window.mfPopup.showPopup(1000))
   * @param time
   * @param callback
   */
  async showPopup( time = 3000, callback = null ) {
    const bg = document.getElementsByClassName('popup')[ 0 ];

    await new Promise(( resolve ) => setTimeout(() => {
      bg.classList.add('opened');

      if ( callback !== null ) {
        callback();
      }

    }, time));

    return this;
  }
}
