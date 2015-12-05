//Contributors: istiak.mah
//
//>>>>>>> e75616045baf06d6b860eb16ae26850623e8c2c4
//Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=T2J4GWJE5SKQE

/* Helper Methods */
(function() {
   'use strict';

    APP.$ = function(sel) {
        var elm = document.querySelectorAll(sel);
        return elm.length > 1 ? elm : elm[0];
    };

    APP.nodeToString = function(node) {
        var div = document.createElement('div');
        div.appendChild(node);
        return div.innerHTML;
    };

    APP.toggleClass = function(sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');
        if (re.test(currentClass)) {
            currentClass = currentClass.replace(re, '');
        } else {
            currentClass = currentClass + ' ' + className;
        }
        sel.className = currentClass;
        return sel;
    };


    APP.hasClass = function(sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        return re.test(currentClass);
    };

    APP.addClass = function(sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        if (!APP.hasClass(sel, className)) {
            currentClass = currentClass + ' ' + className;
        }

        sel.className = currentClass;
        return sel;
    };

    APP.removeClass = function(sel, className) {
        var currentClass = sel.className,
            re = new RegExp(className, 'g');

        if (APP.hasClass(sel, className)) {
            currentClass = currentClass.replace(re, '');
        }

        sel.className = currentClass;
        return sel;
    };

    APP.show = function(sel) {
        sel.style.display = 'block';
        return sel;
    };

    APP.hide = function(sel) {
        sel.style.display = 'none';
        return sel;
    };

    APP.plural = function(count, word) {
        return count > 1 ? word + 's' : word;
    };

    APP.escapeTags = function(text) {
        return text.replace(/<(?:.|\n)*?>/gm, '').replace(/</gm, '').replace(/>/gm, '');
    };

    APP.escape = function(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    APP.addSlashes = function(str) {
        str = APP.escapeTags(str);
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    };

    APP.Events = {
        on: function(sel, ev, fn, innerEl) {
            var el;

            if (typeof sel == 'string') {
                el = APP.$(sel);
            } else {
                el = sel;
            }

            if (innerEl) {
                el.addEventListener(ev, function(e) {
                    if (e.target.tagName.toLowerCase() == innerEl) {
                        fn.call(this, e, e.target);
                    }
                });
            } else {
                el.addEventListener(ev, fn);
            }
        }
    };

    APP.Ajax = function(opts) {
        var xmlhttp, httpType, link, callback, config;

        config = opts || {};
        xmlhttp = new XMLHttpRequest();
        httpType = config.type || 'GET';
        link = config.url || null;
        callback = config.callback || null;

        if (typeof link != 'string') {
            throw new Error('Empty url')
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if(xmlhttp.status == 200){
                    if (typeof callback == 'function') {
                        callback.call(this, xmlhttp.response);
                    }
                }
                else if(xmlhttp.status == 400) {
                    throw new Error('There was an error 400');
                }
                else {
                    throw new Error('Something else other than 200 was returned');
                }
            }
        };

        xmlhttp.open(httpType, link, true);
        xmlhttp.send();
    }
})();