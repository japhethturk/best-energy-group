"use strict";
jQuery(document).ready(function($) {
    var adpPopup = {};
    (function() {
        var $this;
        adpPopup = {
            sPrevious: window.scrollY,
            sDirection: 'down',
            init: function(e) {
                $this = adpPopup;
                $this.popupInit(e);
                $this.events(e);
            },
            events: function(e) {
                $(document).on('click', '.adp-popup-close', $this.closePopup);
                $(document).on('click', '.adp-popup-accept', $this.acceptPopup);
                $(document).on('click', '.adp-popup-accept', $this.closePopup);
                $(document).keyup(function(e) {
                    if (e.key === 'Escape') {
                        $('.adp-popup-open[data-esc-close="true"]').each(function(index, popup) {
                            $this.closePopup(popup);
                        });
                    }
                    if (e.key === 'F4') {
                        $('.adp-popup-open[data-f4-close="true"]').each(function(index, popup) {
                            $this.closePopup(popup);
                        });
                    }
                });
                $(document).on('click', '.adp-popup-overlay', function(e) {
                    $this.closePopup($(this).prev());
                });
            },
            popupInit: function(e) {
                $(document).on('scroll', function() {
                    let scrollCurrent = window.scrollY;
                    if (scrollCurrent > $this.sPrevious) {
                        $this.sDirection = 'down';
                    } else {
                        $this.sDirection = 'up';
                    }
                    $this.sPrevious = scrollCurrent;
                });
                $('.adp-popup').each(function(index, popup) {
                    if ('manual' === $(popup).data('open-trigger')) {
                        let selector = $(popup).data('open-manual-selector');
                        if (selector) {
                            $(document).on('click', selector, function(e) {
                                event.preventDefault();
                                $(popup).removeClass('adp-popup-already-opened');
                                $this.openPopup(popup);
                            });
                        }
                    }
                    if (!$this.isAllowPopup(popup)) {
                        return;
                    }
                    $this.openTriggerPopup(popup);
                });
            },
            openTriggerPopup: function(e) {
                let popup = (e.originalEvent) ? this : e;
                var trigger = $(popup).data('open-trigger');
                if ('viewed' === trigger) {
                    $this.openPopup(popup);
                }
                if ('delay' === trigger) {
                    setTimeout(function() {
                        $this.openPopup(popup);
                    }, $(popup).data('open-delay-number') * 1000);
                }
                if ('exit' === trigger) {
                    var showExit = true;
                    document.addEventListener("mousemove", function(e) {
                        var scroll = window.pageYOffset || document.documentElement.scrollTop;
                        if ((e.pageY - scroll) < 7 && showExit) {
                            $this.openPopup(popup);
                            showExit = false;
                        }
                    });
                }
                if ('read' === trigger || 'scroll' === trigger) {
                    var pointScrollType = $(popup).data('open-scroll-type');
                    var pointScrollPosition = $(popup).data('open-scroll-position');
                    if ('read' === trigger) {
                        pointScrollType = '%';
                        pointScrollPosition = 100;
                    }
                    $(document).on('scroll', function() {
                        if ('px' === pointScrollType) {
                            if (window.scrollY >= pointScrollPosition) {
                                $this.openPopup(popup);
                            }
                        }
                        if ('%' === pointScrollType) {
                            if ($this.getScrollPercent() >= pointScrollPosition) {
                                $this.openPopup(popup);
                            }
                        }
                    });
                }
                if ('accept' === trigger) {
                    let accept = $this.getCookie('adp-popup-accept-' + $(popup).data('id') || 0);
                    if (!accept) {
                        $this.openPopup(popup);
                    }
                }
            },
            closeTriggerPopup: function(e) {
                let popup = (e.originalEvent) ? this : e;
                var trigger = $(popup).data('close-trigger');
                if ('delay' === trigger) {
                    setTimeout(function() {
                        $this.closePopup(popup);
                    }, $(popup).data('close-delay-number') * 1000);
                }
                if ('scroll' === trigger) {
                    var pointScrollType = $(popup).data('close-scroll-type');
                    var pointScrollPosition = $(popup).data('close-scroll-position');
                    var initScrollPx = $(popup).data('init-scroll-px');
                    var initScrollPercent = $(popup).data('init-scroll-percent');
                    $(document).on('scroll', function() {
                        if ('px' === pointScrollType) {
                            if ('up' === $this.sDirection && window.scrollY < (initScrollPx - pointScrollPosition)) {
                                $this.closePopup(popup);
                            }
                            if ('down' === $this.sDirection && window.scrollY >= (initScrollPx + pointScrollPosition)) {
                                $this.closePopup(popup);
                            }
                        }
                        if ('%' === pointScrollType) {
                            if ('up' === $this.sDirection && $this.getScrollPercent() < (initScrollPercent - pointScrollPosition)) {
                                $this.closePopup(popup);
                            }
                            if ('down' === $this.sDirection && $this.getScrollPercent() >= (initScrollPercent + pointScrollPosition)) {
                                $this.closePopup(popup);
                            }
                        }
                    });
                }
            },
            openPopup: function(e) {
                let popup = (e.originalEvent) ? this : e;
                if ($(popup).hasClass('adp-popup-open')) {
                    return;
                }
                if ($(popup).hasClass('adp-popup-already-opened')) {
                    return;
                }
                $(popup).addClass('adp-popup-open');
                $(popup).data('init-scroll-px', window.scrollY);
                $(popup).data('init-scroll-percent', $this.getScrollPercent());
                if ($(popup).is('[data-body-scroll-disable="true"]')) {
                    $('body').addClass('adp-popup-scroll-hidden');
                }
                let limit = parseInt($this.getCookie('adp-popup-' + $(popup).data('id')) || 0) + 1;
                $this.setCookie('adp-popup-' + $(popup).data('id'), limit, {
                    expires: $(popup).data('limit-lifetime')
                });
                let animation = $(popup).data('open-animation');
                $this.applyAnimation(popup, animation);
                $this.closeTriggerPopup(popup);
            },
            acceptPopup: function(e) {
                let $el = (e.originalEvent) ? this : e;
                let popup = $($el).closest('.adp-popup');
                $this.setCookie('adp-popup-accept-' + $(popup).data('id'), 1, {
                    expires: 360
                });
            },
            closePopup: function(e) {
                let $el = (e.originalEvent) ? this : e;
                let popup = $($el).closest('.adp-popup');
                let animation = $(popup).data('exit-animation');
                $this.applyAnimation(popup, animation, function() {
                    $(popup).addClass('adp-popup-already-opened');
                    $(popup).removeClass('adp-popup-open');
                    $('body').removeClass('adp-popup-scroll-hidden');
                });
            },
            isAllowPopup: function(e) {
                let popup = (e.originalEvent) ? this : e;
                let limitDisplay = parseInt($(popup).data('limit-display') || 0);
                let limitDisplayCookie = parseInt($this.getCookie('adp-popup-' + $(popup).data('id')));
                if (limitDisplay && limitDisplayCookie && limitDisplayCookie >= limitDisplay) {
                    return;
                }
                return true;
            },
            applyAnimation: function(el, name, callback) {
                var popup = $(el).closest('.adp-popup');
                if (typeof callback === 'function') {
                    var overlayName = 'popupExitFade';
                } else {
                    var overlayName = 'popupOpenFade';
                }
                $(popup).next('.adp-popup-overlay').addClass('adp-popup-animated ' + overlayName).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(this).removeClass('adp-popup-animated ' + overlayName);
                });
                $(popup).find('.adp-popup-wrap').addClass('adp-popup-animated ' + name).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(this).removeClass('adp-popup-animated ' + name);
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            },
            getCookie: function(name) {
                var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            },
            setCookie: function(name, value, options) {
                options = options || {};
                options.path = options.hasOwnProperty('path') ? options.path : '/';
                options.expires = parseInt(options.expires);
                if (typeof options.expires == "number" && options.expires) {
                    options.expires = new Date().setDate(new Date().getDate() + options.expires);
                    options.expires = new Date(options.expires).toUTCString();
                }
                value = encodeURIComponent(value);
                var updatedCookie = name + "=" + value;
                for (var propName in options) {
                    updatedCookie += "; " + propName;
                    var propValue = options[propName];
                    if (propValue !== true) {
                        updatedCookie += "=" + propValue;
                    }
                }
                document.cookie = updatedCookie;
            },
            getScrollPercent: function() {
                var h = document.documentElement,
                    b = document.body,
                    st = 'scrollTop',
                    sh = 'scrollHeight';
                return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
            }
        };
    })();
    adpPopup.init();
});