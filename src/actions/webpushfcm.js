import Session from '../session'
import Settings, {loadSettings, getUserInfo} from '../settings'
import {Cookie, log, loadScript} from '../utils'
import Popup from '../Popup'
import Config from '../config'

export default {init, auto, showPopup, subscribe}

let initialize = () => null
let initInProgress = false

function init() {
  if (initInProgress) return
  initInProgress = true

  if (!('serviceWorker' in navigator)) {
    log("Service workers aren't supported in this browser.")
    initInProgress = false
    return
  }

  loadScript('https://www.gstatic.com/firebasejs/4.5.0/firebase-app.js', () => {
    loadScript('https://www.gstatic.com/firebasejs/4.5.0/firebase-messaging.js', () => {
      navigator.serviceWorker.register(Session.sw)
        .then(reg => {
          if (reg.installing) {
            console.log('Service worker installing')
          } else if (reg.waiting) {
            console.log('Service worker installed')
          } else if (reg.active) {
            console.log('Service worker active')
          }

          firebase.initializeApp({
            messagingSenderId: Session.msgSenderId
          })
          Session.messaging = firebase.messaging()
          Session.messaging.useServiceWorker(reg)

          loadSettings(() => {
            initInProgress = false
            initialize()
          })
        })
    })
  })
}

function auto() {
  init()

  if (initInProgress) {
    const webpushShowed = Cookie.get(Config.webpushShowed)
    log('webpushShowed', webpushShowed)
    if (webpushShowed) {
      log('bailing out...')
      return
    }

    log('permission', Notification.permission)

    if (Notification.permission === 'denied') {
      log('bailing out...')
      return
    }

    // initialize = () => setTimeout(() => showPopup(), 3000)
    initialize = () => setTimeout(() => subscribe(), 3000)
    return
  }
}

function showPopup() {
  if (initInProgress) {
    initialize = showPopup
    return
  }

  const {url, width, height, outside_click_close} = Settings.webpush
  // log('url, width, height', url, width, height)

  if (url && width && height) {
    Session.popup = Popup({url, width, height, outside_click_close})

    Cookie.set(Config.webpushShowed, 1, {expires: Config.webpushShowedTTL})
    log(Config.webpushShowed, 1)

    trackAttempt({popup_type: 1})

    Session.popup.closeCallback = () => {
      trackDeny({popup_type: 1})
    }

    Session.popup.reloadCallback = () => {
      subscribe()
      Session.popup.remove()
    }

    if ('serviceWorker' in navigator) {
      Session.popup.show()
    }
  }
}

function trackAttempt({userId, popup_type}) {
  $.post(`https://tracking.sendios.io/v1/webpush/attempt/${Session.project}`,
    {user_id: userId && +userId || null, popup_type},
    () => {
      log('attempt ok;', 'popup_type', popup_type)
    }
  )
}

function trackDeny({popup_type}) {
  $.post(`https://tracking.sendios.io/v1/webpush/deny/${Session.project}`, {popup_type}, () => {
    log('deny ok;', 'popup_type', popup_type)
  })
}

function subscribe() {
  if (initInProgress) {
    initialize = subscribe
    return
  }

  log('>> Permission', Notification.permission)

  if (Session.userId) {
    if (Notification.permission === 'default') {
      trackAttempt({userId: Session.userId, popup_type: 2})
    }
    subscribeUser()
  } else {
    getUserInfo(userId => {
      if (Notification.permission === 'default') {
        trackAttempt({userId, popup_type: 2})
      }
      subscribeUser()
    })
  }
}

function subscribeUser() {
  Notification.requestPermission()
    .then(function (result) {
      log('>> Permission', result)

      navigator.serviceWorker.ready.then(reg => {
        log('serviceWorker.ready')

        Session.messaging
          .requestPermission()
          .then(() => {
            Session.messaging
              .getToken()
              .then(currentToken => {
                log(currentToken)
                if (currentToken) {
                  sendTokenToServer(currentToken)
                  // updateUIForPushEnabled(currentToken)
                } else {
                  log('No Instance ID token available. Request permission to generate one.')
                  setTokenSentToServer(false)
                }
              })
              .catch(err => {
                log('An error occurred while retrieving token.', err)
                // updateUIForPushPermissionRequired()
                setTokenSentToServer(false)
              })
          })
          .catch(err => {
            if (Notification.permission === 'denied') {
              log('Permission denied.', err)
              trackDeny({popup_type: 2})
            }
          })
      })
    })
    .catch(() => log('FAILED'))
}

function isTokenSentToServer(currentToken) {
  return window.localStorage.getItem('sentFirebaseMessagingToken') === currentToken
}

function setTokenSentToServer(currentToken) {
  window.localStorage.setItem('sentFirebaseMessagingToken', currentToken || '')
}

function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer(currentToken)) {
    log('Sending token to server...')

    const data = {
      fcm_meta: {
        token: currentToken
      }
    }

    if (Session.userId) {
      data.user_id = +Session.userId
    } else {
      data.hash = Session.guestId
    }

    $.post(`https://api.sendios.io/v1/webpush/project/${Session.project}`, data, ({data}) => {
      const {push_user_id} = data
      if (push_user_id) {
        log('push_user_id', push_user_id)
        Cookie.set('push_user_id', push_user_id)

        const date = new Date()
        date.setDate(date.getDate() + 365)

        $.ajax({
          dataType: 'jsonp',
          url: 'https://n.sendios.io/users/setcookie',
          data: {
            'push_user_id': {
              value: push_user_id,
              expire: date.toUTCString()
            }
          },
          jsonp: 'callback',
          success(res) {
            log(res)
          }
        })
      }
    })
    setTokenSentToServer(currentToken)
  }
}
