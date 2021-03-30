import {resizePopup} from '../utils'

const Popup2 = function ({url, width = '100%', height = '245px', outside_click_close} = {}) {
  const $body = document.body

  const $style = document.createElement('style')
  $style.textContent = `
    .mf-bg {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 99999999;
      opacity: 0;
      position: fixed;
      background: rgba(0,0,0,0.7);
      transition: opacity 1s ease;
    }
    .mf-wrapper {
      width: ${+width && width + 'px' || width};
      height: ${+height && height + 'px' || height};
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;
      position: absolute;
      min-width: 320px;
    }
    .mf-iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  `
  const $bg = document.createElement('div')
  $bg.className = 'mf-bg'
  const $wrapper = document.createElement('div')
  $wrapper.className = 'mf-wrapper'

  const $iframe = document.createElement('iframe')
  $iframe.className = 'mf-iframe'
  $iframe.src = url
  $iframe.scrolling = 'no'
  $iframe.name = 'guestFrame'

  $(window).resize(() => resizePopup(width, height))

  const pp = {
    closeCallback: false,

    show() {
      $body.appendChild($style)
      $body.appendChild($bg)
      $bg.appendChild($wrapper)
      $wrapper.appendChild($iframe)

      $iframe.addEventListener('load', () => {
        $bg.style.opacity = 1
        $iframe.addEventListener('load', () => {
          if (this.reloadCallback) this.reloadCallback()
        }, false)
      }, false)

      resizePopup(width, height)
    },

    remove({action} = {}) {
      if (this.closeCallback && action === 'close') this.closeCallback()
      this.closeCallback = false
      $bg.style.opacity = 0
      setTimeout(() => {
        if ($bg.parentNode) $body.removeChild($bg)
      }, 1000)
    }
  }

  if (outside_click_close) {
    $bg.addEventListener('click', () => {
      pp.remove({action: 'close'})
      return false
    }, false)
  }

  return pp
}

export default Popup2
