import Session from './session'
import {hasOwnNestedProperty, Cookie, loadScript, log} from './utils'
import Config from './config'

const settings = {subscribe: {}, webpush: {}, invalid: null}
let windowProxy
Session.settingsLoading = false
Session.settingsLoaded = false
Session.settingsLoadedCb = () => false


function onMessage(msg) {
  if (hasOwnNestedProperty(msg, 'data.action')) {
    switch (msg.data.action) {
      case 'close':
        Session.popup.remove({action: 'close'})
        break

      case 'mf-widget-loaded':
        console.log('mf-widget-loaded')
        windowProxy.post({email: Cookie.get(Config.enteredEmail)})
        break
    }
  }

  if (hasOwnNestedProperty(msg, 'data.email')) {
    log('msg.data.email', msg.data.email)
    Cookie.set(Config.enteredEmail, msg.data.email, {expires: Config.enteredEmailTTL})
  }
}

const isResubExpired = () => {
  const reg_ts = Cookie.get('reg_ts')
  if (!reg_ts) return null
  const diff = Date.now() - 1000 * reg_ts
  const minSinceReg = Math.floor(diff / 60000)
  return minSinceReg > 5
}

const resubShowedTimes = () => {
  const resubShowed = Cookie.get(Config.resubShowedKey)
  if (!resubShowed) return null
  return +resubShowed
}

export const checkInvalid = () => {
  if (settings.invalid) {
    const resubShowed = resubShowedTimes()
    log('resubShowed:', resubShowed)

    const exp = isResubExpired()
    log('resubExpired:', exp)

    if (resubShowed && resubShowed >= 2 || exp) {
      log('🚫 checkInvalid noop. Reason:', `showed ${resubShowed} time(s) || exp: ${exp}`)
      return
    }

    log('checkInvalid', `userId: ${Session.userId}; 📪: ${Cookie.get(Config.enteredEmail)}`)
    if (Session.userId) {
      $.get(`${Session.apiRoot}users/invalid/${Session.userId}`, res => {
        log('checkInvalid done', 'unsub =', res.data)

        if (res.data /* invalid email entered */) {
          Session.Actions.init.showPopup({popupSettings: Object.assign(settings.invalid, {invalid: true})})
        }
      })
    }
  }
}

export const checkInvalidTimedOut = (userId) => userId && setTimeout(checkInvalid, 1000)

export const getUserInfo = (callback) => {
  log('getUserInfo')

  if (Cookie.get('guest_id')) {
    Session.guestId = Cookie.get('guest_id')
    log('mf_guest_id', Session.guestId)
  }

  $.ajax({
    url: `${Session.apiRoot}users/cookie`,
    dataType: 'jsonp',
    success({reg_ts, user_id, guest_id}) {
      log('Tried to obtain userId', user_id)
      if (user_id || guest_id || reg_ts) {
        if (reg_ts) {
          Cookie.set('reg_ts', reg_ts)
          log('/users/cookie ->', '⏱', reg_ts)
        }
        if (user_id) {
          Session.userId = user_id
          Cookie.set('user_id', user_id)
          log('/users/cookie ->', '👤', user_id)
        }
        if (guest_id) {
          Session.guestId = guest_id
          Cookie.set('guest_id', guest_id)
          log('/users/cookie ->', '👽', guest_id)
        }
        if (callback) callback(Session.userId)
      }
    },
    error() {
      if (callback) callback(null)
    }
  })
}

export const loadSettings = (callback) => {
  Session.settingsLoading = true
  log('settingsLoaded', Session.settingsLoaded)

  if (Session.settingsLoaded) {
    log('Session.settingsLoaded')
    Session.settingsLoadedCb(true)
    if (callback) callback()
    return
  }

  $.get(`${Session.apiRoot}widget/settings/${Session.project}`, res => {
    Object.keys(res.data).forEach(k => settings[k] = res.data[k])

    if (hasOwnNestedProperty(settings, 'subscribe.version')) {
      loadScript('https://n.sendios.io/scripts/widgets/porthole.min.js', () => {
        if (!windowProxy) {
          // Create a proxy window to send to and receive messages from the iFrame
          windowProxy = new Porthole.WindowProxy(settings.subscribe.url, 'guestFrame')
          windowProxy.addEventListener(onMessage)
          Session.settingsLoading = false
          Session.settingsLoaded = true
          Session.settingsLoadedCb(true)
          Session.version = 2
          if (callback) callback()
          log('settingsLoaded', Session.settingsLoaded)
        }
      })
    } else {
      if (callback) callback()
    }
  })
}

export default settings
