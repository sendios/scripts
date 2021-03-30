import Session from './session'
import {Cookie, loadScript} from './utils'
import init from './actions/init'
import webpush from './actions/webpush'
import webpushfcm from './actions/webpushfcm'
import email from './actions/email'

if (typeof window.jQuery !== 'undefined') {
  jQuery(() => bootstrap(jQuery))
} else {
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js',
  () => Zepto(() => bootstrap(Zepto)))
}

function bootstrap($) {
  if (typeof Storage !== 'undefined') {
    Session.debug = localStorage.getItem('mf-debug') === 'true'
  }
  const mfObject = window[window['_mf_object_name']]
  Session.Actions = {init, webpush, webpushfcm, email}
  Session.project = mfObject.project
  Session.msgSenderId = mfObject.msgSenderId
  Session.sw = mfObject.sw
  Session.apiRoot = mfObject.api || process.env.API_ROOT
  Session.testPopup = mfObject.testPopup || false
  Session.env = mfObject.env || 'prod'
  Session.popupName = mfObject.popupName
  Session.userId = Cookie.get('user_id')

  window['mf'] = function (obj, method, data) {
    Session.Actions[obj][method].call(this, data)
  }

  for (let a in mfObject.q) {
    if (mfObject.q.hasOwnProperty(a)) {
      const obj = mfObject.q[a][0]
      const method = mfObject.q[a][1]
      const data = mfObject.q[a][2]
      Session.Actions[obj][method](data)
    }
  }
}
