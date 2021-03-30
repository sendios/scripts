(function (w, d) {
  var l = document.createElement('script');
  l.src = 'http://scripts.dev/build/widget/latest.js?d=' + (new Date().getTime());
  // l.src = 'http://127.0.0.1:8080/widget/latest.js?d=' + (new Date().getTime());
  l.type = 'text/javascript';
  l.async = true;
  var s = d.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(l, s);
})(window, document);
