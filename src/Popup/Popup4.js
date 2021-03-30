const Popup4 = function ({url, width = '100%', height = '245px'} = {}) {
  const $body = document.body
  const upperMid = window.matchMedia('(max-width: 1400px)')
  const mid = window.matchMedia('(max-width: 990px)')
  const small = window.matchMedia('(max-width: 735px)')
  const xsmall = window.matchMedia('(max-width: 360px)')

  const transitionReveal = () => 'all .5s cubic-bezier(0.06, 0.88, 0.26, 1.18)'
  const transitionHide = () => small.matches ? 'all 0.3s' : 'all 0.4s'
  const revealed = () => xsmall.matches ? '0px' : small.matches ? '-15px' : mid.matches ? '-70px' : upperMid.matches ? '-125px' : '-170px'

  const $style = document.createElement('style')
  $style.textContent = `
    .mf-popup {
      width: ${+width && width + 'px' || width};
      height: ${+height && height + 'px' || height};
      top: -305px;
      left: 0;
      right: 0;
      margin: 0 auto;
      z-index: 10;
      position: fixed;
    }
    .mf-iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  `
  const $popup = document.createElement('div')
  $popup.className = 'mf-popup'

  const $iframe = document.createElement('iframe')
  $iframe.className = 'mf-iframe'
  $iframe.src = url
  $iframe.scrolling = 'no'
  $iframe.name = 'guestFrame'

  window.addEventListener('resize', () => {
    $popup.style.top = revealed()
  }, false)

  return {
    closeCallback: false,

    show() {
      $body.appendChild($style)
      $body.appendChild($popup)
      $popup.appendChild($iframe)

      $iframe.addEventListener('load', () => {
        $popup.style.top = revealed()
        $popup.style.transition = transitionReveal()
        $iframe.addEventListener('load', () => {
          if (this.reloadCallback) this.reloadCallback()
        }, false)
      }, false)
    },

    remove() {
      $popup.style.top = '-305px'
      $popup.style.transition = transitionHide()
      setTimeout(() => {
        if (this.closeCallback) this.closeCallback()
        this.closeCallback = false
        if ($popup.parentNode) $body.removeChild($popup)
        if ($style.parentNode) $body.removeChild($style)
      }, 500)
    }
  }
}

export default Popup4
