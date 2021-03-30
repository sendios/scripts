const email = {
  checkForm(formSelector) {
    const $form = $(formSelector)

    let $input = $form.find('.emailCheck')
    if (!$input.length) {
      $input = $form.find('input[type:email]')
      if (!$input.length) {
        return false
      }
    }

    $input = $($input[0])

    $form.one('submit', checkHandler)

    function invalid() {
      $form
        .addClass('invalid')
      $input
        .addClass('invalid')
        .focus()
    }

    function checkHandler() {
      let email = $input.val()

      if (!email || email === '' || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
        invalid()
        return false
      }

      $.post('https://api.sendios.io/v1/email/check', {email}, (res) => {
        if (!res.data.valid) {
          invalid()
          // Rebind for next check
          $form.one('submit', checkHandler)
        } else {
          $form.submit()
        }
      })

      // Disable first submit
      return false
    }
  }
}

export default email
