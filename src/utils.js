import Settings from './settings'
import Session from './session'

export function getWindowSize() {
  let e = document.documentElement
  let g = document.getElementsByTagName('body')[0]
  let width = window.innerWidth || e.clientWidth || g.clientWidth
  let height = window.innerHeight || e.clientHeight || g.clientHeight

  return {width, height}
}

export function hasOwnNestedProperty(obj, prop) {
  let parts = prop.split('.')
  for (let i = 0, l = parts.length; i < l; i++) {
    let part = parts[i]
    if (obj !== null && typeof obj === 'object' && part in obj) {
      obj = obj[part]
    } else {
      return false
    }
  }
  return true
}

export function resizePopup(width, height) {
  const windowSize = getWindowSize()

  if (windowSize.width >= width) {
    $('.mf-wrapper').css({width: width + 'px'})
  } else {
    $('.mf-wrapper').css({width: '100%'})
  }

  if (windowSize.height >= height) {
    $('.mf-wrapper').css({height: height + 'px'})
  } else {
    $('.mf-wrapper').css({height: '100%'})
  }
}

export function arrayBufferToBase64(buffer) {
  let binary = ''
  let bytes = new Uint8Array(buffer)
  let len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export function loadScript(url, loadCallback) {
  let l = document.createElement('script')
  l.src = url
  l.type = 'text/javascript'
  l.async = true
  l.onload = loadCallback
  let s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(l, s)
}

export const Cookie = {
  PREFIX: 'mf_',

  get: function (name) {
    let matches = document.cookie.match(new RegExp(
      '(?:^|; )' + this.PREFIX + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ))
    return matches ? decodeURIComponent(matches[1]) : void (0)
  },

  set: function (name, value, options) {
    options = options || {}
    /* Options can be:
     expires - msec / Date obj
     path - like /
     domain - site.com
     secure - true/false
     */

    // Force Defaults
    if (process.env.NODE_ENV === 'production') {
      if (typeof options.path === 'undefined') {
        options.path = '/'
      }
      if (typeof options.domain === 'undefined') {
        if (typeof Settings.subscribe.cookie_domain !== 'undefined') {
          options.domain = Settings.subscribe.cookie_domain
        } else {
          options.domain = location.host
        }
      }
    }

    let expires = options.expires
    if (typeof expires === 'number' && expires) {
      let d = new Date()
      d.setTime(d.getTime() + expires)
      expires = options.expires = d.toUTCString()

    } else if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString()

    } else {
      let d = new Date()
      d.setTime(d.getTime() + 365 * 24 * 3600000)
      expires = options.expires = d.toUTCString()
    }

    // Key and Value
    value = encodeURIComponent(value)
    var updatedCookie = this.PREFIX + name + '=' + value

    // Options obj to string
    for (var propName in options) {
      updatedCookie += '; ' + propName
      var propValue = options[propName]
      if (propValue !== true) {
        updatedCookie += '=' + propValue
      }
    }

    document.cookie = updatedCookie
  }
}

export const log = (...args) => {
  if (Session.debug) console.log(...args)
}
