(function (w, d) {
    var l = document.createElement('script');
    l.src = 'https://scripts.sendios.io/build/widget/latest.js?d=' + (new Date().getTime());
    l.type = 'text/javascript';
    l.async = true;

    var s = d.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(l, s);
})(window, document);