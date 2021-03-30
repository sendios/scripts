(function () {
    var windowProxy = new Porthole.WindowProxy();
    var form = document.getElementById('mail-fire-form');

    var clw = document.createElement('input');
    clw.setAttribute('type', 'hidden');
    clw.setAttribute('name', 'width');
    form.appendChild(clw);

    document.addEventListener('DOMContentLoaded', function () {
      if (typeof FastClick !== 'undefined') FastClick.attach(document.body);
    }, false);

    Array.prototype.forEach.call(document.getElementsByClassName('close'), function (el) {
      el.addEventListener('click', function () {
        windowProxy.post({'action': 'close'});
      }, false);
    });

    form.onsubmit = function (e) {
      e.preventDefault();
      if (typeof onBeforeSubmit === 'function') {
        onBeforeSubmit();
      }
      clw.setAttribute('value', document.body.clientWidth);
      var email = form.email.value;

      if (!email || email == '' || email.indexOf('@') === -1) {
        isInvalid();
        return false;
      }

      ajax().post('https://api.sendios.io/v1/email/check', {email: email})
        .then(function (res) {
          if (!res.data.valid) {
            isInvalid();
          } else {
            if (typeof onBeforePost === 'function') {
              onBeforePost();
            }
            windowProxy.post({email: email});
            form.submit();
          }
        });
    };

    function isInvalid() {
      form.email.style.backgroundColor = '#fcc';
      alert('Enter correct email, please.');
      form.email.focus();
    }
})();
