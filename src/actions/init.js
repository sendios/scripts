import Session from '../session'
import {Cookie, log} from '../utils'
import Config from '../config'
import Settings, {loadSettings, getUserInfo, checkInvalid, checkInvalidTimedOut} from '../settings'
import Popup from '../Popup'

const init = {
  /* should fix popup's getting out of viewport in iOS */
  // _iOSFocusFix() {
  //   const $html = $('html')
  //   const $body = $('body')
  //   const css = {
  //     '-webkit-overflow-scrolling': 'touch',
  //     'overflow': 'auto',
  //     'height': '100%'
  //   }
  //   $body.css(css)
  //   $html.css(css)
  // },

  auto() {
    // Session.Actions.init._iOSFocusFix()
    if (!Session.settingsLoading) {
      loadSettings(() => this.subscribe())
      getUserInfo(checkInvalidTimedOut)
    }
  },

  custom() {
    // Session.Actions.init._iOSFocusFix()
    if (!Session.settingsLoading) {
      loadSettings()
      getUserInfo(checkInvalidTimedOut)
    }
  },

  watcher() {
    let inFocus = true
    $(window).on('blur', () => inFocus = false)
    $(window).on('focus', () => inFocus = true)

    setInterval(() => {
      if (inFocus) {
        let newImage = new Image()

        let params = ['ts=' + new Date().getTime()]

        if (Session.userId) params.push('user_id=' + Session.userId)

        if (Cookie.get('guest_id')) params.push('guest_id=' + Cookie.get('guest_id'))

        newImage.src = `https://n.sendios.io/online/watch/${Session.project}?${params.join('&')}`
      }
    }, 35 * 1000)
  },

  subscribe() {
    if (
      Session.userId || Cookie.get(Config.registeredKey) !== undefined
      || (Cookie.get(Config.showedKey) !== undefined && Cookie.get(Config.showedSecondKey) !== undefined)
    ) return

    let delay
    if (Cookie.get(Config.showedKey) !== undefined) {
      delay = 1
      Cookie.set(Config.showedSecondKey, 1, {expires: Config.showedNextDelay})
    } else {
      delay = Config.showDelay
    }

    setTimeout(() => this.showPopup({popupSettings: Settings.subscribe}), delay)
  },

  removePopup() {
    Session.popup.remove()
  },

  showPopup({popupSettings, showCallback, closeCallback} = {}) {
    log('showPopup')
    const userId = Cookie.get('user_id')
    const primaryShowed = +Cookie.get(Config.showedKey) || 0
    const resubShowed = +Cookie.get(Config.resubShowedKey) || 0

    if (!Session.testPopup) {
      if (popupSettings && !popupSettings.invalid) {
        if (userId || primaryShowed) {
          log('🚫 showPopup noop. Reason:', `userId ${userId} || showed ${primaryShowed}`)
          return
        }
      }
    }

    if (!$.isEmptyObject(popupSettings)) {
      Session.popup = Popup(popupSettings)

      if (closeCallback && typeof closeCallback === 'function') Session.popup.closeCallback = closeCallback

      Session.popup.reloadCallback = () => {
        log('reloadCallback')
        if (!popupSettings.invalid /* primary subscribe popup */) {
          setTimeout(() => getUserInfo(checkInvalid), 5000)
          checkInvalid()
        } else {
          getUserInfo()
        }
        Cookie.set(Config.registeredKey, Date.now(), {expires: Config.registeredNextDelay})
        Session.popup.remove()
      }

      Session.popup.show()
      log('👁')

      if (!popupSettings.invalid) {
        Cookie.set(Config.showedKey, 1, {expires: Config.showedNextDelay})
      }

      if (popupSettings.invalid) {
        Cookie.set(Config.resubShowedKey, resubShowed && (resubShowed + 1) || 1)
      }

      if (showCallback && typeof showCallback === 'function') showCallback()

    }
    // else {
    //   const showPopup = () =>
    //     Session.Actions.init.showPopup({popupSettings: Settings.subscribe, showCallback, closeCallback})
    //
    //   if (!Session.settingsLoaded) {
    //     loadSettings()
    //   } else {
    //     showPopup()
    //   }
    //
    //   Session.settingsLoadedCb = showPopup
    // }
  }
}

export default init
