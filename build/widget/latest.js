(function (w, d) {

    var windowProxy;
    var version;

    function getWindowSize() {
        var e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            width = w.innerWidth || e.clientWidth || g.clientWidth,
            height = w.innerHeight || e.clientHeight || g.clientHeight;

        return {
            width: width,
            height: height
        }
    }

    function hasOwnNestedProperty(obj, prop) {
        var parts = prop.split('.');
        for(var i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if(obj !== null && typeof obj === "object" && part in obj) {
                obj = obj[part];
            }
            else {
                return false;
            }
        }
        return true;
    }

    function resizePopup(width, height) {
        var windowSize = getWindowSize();

        if (windowSize.width >= width) {
            $('.mf-popup-wrapper').css({
                width: width + 'px'
            });
        } else {
            $('.mf-popup-wrapper').css({
                width: '100%'
            });
        }
        if (windowSize.height >= height) {
            $('.mf-popup-wrapper').css({
                height: height + 'px'
            });
        } else {
            $('.mf-popup-wrapper').css({
                height: '100%'
            });
        }
    }

    var arrayBufferToBase64 = function (buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    var Config = {
        showDelay: 10 * 1000,
        registeredNextDelay: 168 * 3600 * 1000,
        showedNextDelay: 168 * 3600 * 1000,
        showedKey: 'popup_showed_v1',
        showedSecondKey: 'popup_showed_second_v1',
        registeredKey: 'user_registered_v1'
    };

    var Settings = {};
    var Popup = {};

    var Cookie = {
        PREFIX: 'mf_',

        get: function (name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + this.PREFIX + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : void(0);
        },

        set: function (name, value, options) {
            options = options || {};
            /* Options can be:
             expires - seconds / Date obj
             path - like /
             domain - site.com
             secure - true/false
             */

            // Force Defaults
            if (typeof options.path === 'undefined') {
                options.path = '/';
            }
            if (typeof options.domain === 'undefined') {
                if (typeof Settings.subscribe.cookie_domain !== 'undefined') {
                    options.domain = Settings.subscribe.cookie_domain;
                } else {
                    options.domain = location.host;
                }
            }

            // Expires in seconds
            var expires = options.expires;
            if (typeof expires == "number" && expires) {
                var d = new Date();
                d.setTime(d.getTime() + expires);
                expires = options.expires = d;
            }
            if (expires && expires.toUTCString) {
                options.expires = expires.toUTCString();
            }

            // Key and Value
            value = encodeURIComponent(value);
            var updatedCookie = this.PREFIX + name + "=" + value;

            // Options obj to string
            for (var propName in options) {
                updatedCookie += "; " + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }

            document.cookie = updatedCookie;
        }
    };

    var PopupConstr = function (url, width, height) {
        var body = $('body');

        var $bg = $('<div>')
            .css({
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                'z-index': '99999999',
                opacity: 0,
                position: 'fixed',
                background: 'rgba(0,0,0,0.7)',
                transition: 'opacity 1s ease'
            });

        var windowSize = getWindowSize();
        var $wrapper = $('<div>')
            .css({
                width: windowSize.width >= width ? width + 'px' : '320px',
                height: height + 'px',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 'auto',
                position: 'absolute'
            }).appendTo($bg);

        $('<a>', {
            href: 'javascript:;'
        }).html('✕')
            .css({
                'line-height': '20px',
                height: '20px',
                font: '12px Arial',
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'block',
                'text-decoration': 'none',
                color: '#bbb',
                'text-align': 'center'
            })
            .appendTo($wrapper)
            .on('click', function () {
                pp.remove();
                return false;
            });

        var $iframe = $('<iframe>', {
            src: url
        }).css({
            width: '100%',
            height: '100%',
            border: 0
        });

        var pp = {
            closeCallback: false,
            show: function () {
                $bg.appendTo(body);
                $iframe.appendTo($wrapper)
                    .one('load', function () {
                        $bg.css({
                            opacity: 1
                        });
                        $iframe.one('load', pp.reloadCallback);
                    });
            },
            remove: function () {
                if (this.closeCallback) {
                    this.closeCallback();
                }
                this.closeCallback = false;

                $bg.css({
                    opacity: 0
                });
                setTimeout(function () {
                    $bg.remove();
                }, 1000);
            },
            reloadCallback: function () {
            }
        };

        return pp;
    };

    var PopupConstr2 = function (url, width, height) {
        var body = $('body');

        var $bg = $('<div>')
            .css({
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                'z-index': '99999999',
                opacity: 0,
                position: 'fixed',
                background: 'rgba(0,0,0,0.7)',
                transition: 'opacity 1s ease'
            });

        var wrapperCss = {

            width:  width + 'px',
            height: height + 'px',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            position: 'absolute',
            'min-width': '320px'
        };

        var $wrapper = $('<div class="mf-popup-wrapper">')
            .css(wrapperCss).appendTo($bg);

        var $iframe = $('<iframe>', {
            src: url,
            name: 'guestFrame'
        }).css({
            width: '100%',
            height: '100%',
            border: 0
        });

        $( window ).resize(function() {
            resizePopup(width, height);
        });

        var pp = {
            closeCallback: false,
            show: function () {
                $bg.appendTo(body);
                $iframe.appendTo($wrapper)
                    .one('load', function () {
                        $bg.css({
                            opacity: 1
                        });
                        $iframe.one('load', pp.reloadCallback);
                    });
                resizePopup(width, height);

            },
            remove: function () {
                if (this.closeCallback) {
                    this.closeCallback();
                }
                this.closeCallback = false;

                $bg.css({
                    opacity: 0
                });
                setTimeout(function () {
                    $bg.remove();
                }, 1000);
            },
            reloadCallback: function () {
            }
        };

        return pp;
    };

    // processing messages from iframe
    function onMessage(messageEvent) {
        if (hasOwnNestedProperty(messageEvent, 'data.action')){
            switch (messageEvent.data.action) {
                case 'close':
                    Popup.remove();
                    break;
            }
        }
    }

    function construct($) {
        // Init
        var prepared = false,
            body = $('body'),
            userId = false,
            mfObject = w[w['_mf_object_name']],
            project = mfObject.project;

        function prepare(callback) {
            if (prepared) {
                return;
            }

            // settings
            $.get('https://api.sendios.io/v1/widget/settings/' + project, function (res) { //TODO
            // $.get('http://api.mailfire.dev/v1/widget/settings/' + project, function (res) {
            //$.get('http://apistage.mailfier.com/v1/widget/settings/' + project, function (res) {
                Settings = res.data;

                if (Cookie.get('user_id')) {
                    userId = +Cookie.get('user_id');
                    console.log('mf_user_id ' + userId);
                }

                if (hasOwnNestedProperty(Settings, 'subscribe.version') && Settings.subscribe.version === 2){
                    //loadScript('http://scriptage.mailfier.com/build/widget/porthole.min.js', function(){//TODO
                    //loadScript('http://scripts.mailfire.dev/build/widget/porthole.min.js', function(){
                    loadScript('https://scripts.sendios.io/build/widget/porthole.min.js', function(){
                        // Create a proxy window to send to and receive
                        // messages from the iFrame
                        windowProxy = new Porthole.WindowProxy(
                            Settings.subscribe.url, 'guestFrame');

                        // Register an event handler to receive messages;
                        windowProxy.addEventListener(onMessage);

                        if (callback) {
                            callback();
                        }
                        prepared = true;
                        version = 2;
                        return true;
                    });

                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
            prepared = true;
        }

        // Objects
        var Actions = {
            // ----------------- INIT -----------------
            init: {
                auto: function () {
                    prepare(function () {
                        setTimeout(Actions.init.subscribe, 0);
                        //setTimeout(this.init.watcher, 0);
                    });
                },

                custom: function () {
                    return prepare();
                },

                watcher: function () {
                    var inFocus = true;

                    $(window).on('blur', function () {
                        inFocus = false;
                    });
                    $(window).on('focus', function () {
                        inFocus = true;
                    });

                    setInterval(function () {
                        if (inFocus) {
                            var newImage = new Image();
                            var d = new Date();

                            var params = ['ts=' + d.getTime()];
                            if (userId) {
                                params.push('user_id=' + userId);
                            }
                            if (Cookie.get('guest_id')) {
                                params.push('guest_id=' + Cookie.get('guest_id'));
                            }
                            newImage.src = "https://n.sendios.io/online/watch/" + project + "?" + params.join('&');
                        }
                    }, 35 * 1000);
                },

                subscribe: function () {
                    if (userId
                        || Cookie.get(Config.registeredKey) !== undefined
                        || (Cookie.get(Config.showedKey) !== undefined && Cookie.get(Config.showedSecondKey) !== undefined)
                    ) {
                        return;
                    }

                    var delay;
                    if (Cookie.get(Config.showedKey) !== undefined) {
                        delay = 1;
                        Cookie.set(Config.showedSecondKey, 1, {expires: Config.showedNextDelay});
                    } else {
                        delay = Config.showDelay;
                    }

                    setTimeout(function () {
                        Actions.init.showPopup();
                    }, delay);
                },

                showPopup: function (callbackObj) {
                    if (!Settings.subscribe){
                        return;
                    }
                    //Select popup obj
                    if (version === 2) {
                        Popup = PopupConstr2(Settings.subscribe.url, Settings.subscribe.width, Settings.subscribe.height);
                    } else {
                        Popup = PopupConstr(Settings.subscribe.url, Settings.subscribe.width, Settings.subscribe.height);
                    }

                    // Close callbacks
                    if (callbackObj && callbackObj.closeCallback && typeof callbackObj.closeCallback == "function") {
                        Popup.closeCallback = callbackObj.closeCallback;
                    }
                    Popup.reloadCallback = function () {
                        Cookie.set(Config.registeredKey, 1, {expires: Config.registeredNextDelay});
                        Popup.remove();
                    };

                    // Showing popup
                    Popup.show();
                    Cookie.set(Config.showedKey, 1, {expires: Config.showedNextDelay});
                    if (callbackObj && callbackObj.showCallback && typeof callbackObj.showCallback == "function") {
                        callbackObj.showCallback();
                    }
                }
            },

            // ----------------- WEBPUSH -----------------
            webpush: {
                init: function () {
                    if (!'serviceWorker' in navigator) {
                        console.log('Service workers aren\'t supported in this browser.');
                        return;
                    }

                    prepare(function () {
                        //setTimeout(function () {
                        //    Actions.webpush.showPopup();
                        //}, 1000);
                    });
                },
                showPopup: function () {
                    //Select popup obj
                    if (version === 2) {
                        Popup = PopupConstr2(Settings.webpush.url, Settings.webpush.width, Settings.webpush.height);
                    } else {
                        Popup = PopupConstr(Settings.webpush.url, Settings.webpush.width, Settings.webpush.height);
                    }
                    Popup.reloadCallback = function () {
//                        Cookie.set(Config.registeredKey, 1, {expires: Config.registeredNextDelay});
                        Actions.webpush.subscribe();
                        Popup.remove();
                    };
                    Popup.show();
                },
                subscribe: function () {
                    Notification.requestPermission();
                    navigator.serviceWorker.ready.then(function (reg) {
                        reg.pushManager.subscribe({userVisibleOnly: true})
                            .then(function (subscription) {
                                var data = {
                                    meta: {
                                        url: subscription.endpoint,
                                        public_key: arrayBufferToBase64(subscription.getKey('p256dh')),
                                        auth_token: arrayBufferToBase64(subscription.getKey('auth'))
                                    }
                                };

                                if (userId) {
                                    data.user_id = userId;
                                } else {
                                    data.hash = 1;
                                }

                                $.post('https://api.sendios.io/v1/webpush/project/' + project, data);
                            })
                            .catch(function (e) {
                                if (Notification.permission === 'denied') {
                                    console.log('Permission for Notifications was denied');
                                } else {
                                    console.log('Unable to subscribe to push.', e);
                                }
                            });
                    });
                }
            },

            email: {
                checkForm: function (formSelector) {
                    var $form = $(formSelector);

                    var $input = $form.find('.emailCheck');
                    if (!$input.length) {
                        $input = $form.find('input[type:email]');
                        if (!$input.length) {
                            return false;
                        }
                    }

                    $input = $($input[0]);

                    $form.one('submit', checkHandler);

                    function invalid() {
                        $input
                            .css({'borderColor': '#ff7777', 'background': '#ffeeee'})
                            .addClass('invalid')
                            .focus();
                    }

                    function checkHandler() {
                        var email = $input.val();

                        if (!email || email == '' || email.indexOf('@') === -1 || email.indexOf('.') === -1) {
                            invalid();
                            return false;
                        }

                        $.post('https://api.sendios.io/v1/email/check', {email: email}, function (res) {
                            if (!res.data.valid) {
                                invalid();
                                // Rebind for next check
                                $form.one('submit', checkHandler);
                            } else {
                                $form.submit();
                            }
                        });

                        // Disable first submit
                        return false;
                    }
                }
            }
        };

        window['mf'] = function (obj, method, data) {
            Actions[obj][method].call(this, data);
        };

        for (a in mfObject.q) {
            var obj = mfObject.q[a][0];
            var method = mfObject.q[a][1];
            var data = mfObject.q[a][2];
            mf(obj, method, data);
        }
    }

    function loadScript(url, loadCallback) {
        var l = document.createElement('script');
        l.src = url;
        l.type = 'text/javascript';
        l.async = true;
        l.onload = loadCallback;
        var s = d.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(l, s);
    }

    // Check exist jQuery
    if (typeof window.jQuery !== 'undefined') {
        jQuery(function () {
            construct(jQuery);
        });
    } else {
        // Load Zepto
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js',
            function () {
                Zepto(function () {
                    construct(Zepto);
                });
            });
    }

})
(window, document);
