/*!
 * Modernizr v2.7.1
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.7.1',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

!function(a,b,c,d){"use strict";function e(a){var b,c=this;if(this.trackingClick=!1,this.trackingClickStart=0,this.targetElement=null,this.touchStartX=0,this.touchStartY=0,this.lastTouchIdentifier=0,this.touchBoundary=10,this.layer=a,!a||!a.nodeType)throw new TypeError("Layer must be a document node");this.onClick=function(){return e.prototype.onClick.apply(c,arguments)},this.onMouse=function(){return e.prototype.onMouse.apply(c,arguments)},this.onTouchStart=function(){return e.prototype.onTouchStart.apply(c,arguments)},this.onTouchMove=function(){return e.prototype.onTouchMove.apply(c,arguments)},this.onTouchEnd=function(){return e.prototype.onTouchEnd.apply(c,arguments)},this.onTouchCancel=function(){return e.prototype.onTouchCancel.apply(c,arguments)},e.notNeeded(a)||(this.deviceIsAndroid&&(a.addEventListener("mouseover",this.onMouse,!0),a.addEventListener("mousedown",this.onMouse,!0),a.addEventListener("mouseup",this.onMouse,!0)),a.addEventListener("click",this.onClick,!0),a.addEventListener("touchstart",this.onTouchStart,!1),a.addEventListener("touchmove",this.onTouchMove,!1),a.addEventListener("touchend",this.onTouchEnd,!1),a.addEventListener("touchcancel",this.onTouchCancel,!1),Event.prototype.stopImmediatePropagation||(a.removeEventListener=function(b,c,d){var e=Node.prototype.removeEventListener;"click"===b?e.call(a,b,c.hijacked||c,d):e.call(a,b,c,d)},a.addEventListener=function(b,c,d){var e=Node.prototype.addEventListener;"click"===b?e.call(a,b,c.hijacked||(c.hijacked=function(a){a.propagationStopped||c(a)}),d):e.call(a,b,c,d)}),"function"==typeof a.onclick&&(b=a.onclick,a.addEventListener("click",function(a){b(a)},!1),a.onclick=null))}function f(a){return("string"==typeof a||a instanceof String)&&(a=a.replace(/^[\\/'"]+|(;\s?})+|[\\/'"]+$/g,"")),a}0===a("head").has(".foundation-mq-small").length&&a("head").append('<meta class="foundation-mq-small">'),0===a("head").has(".foundation-mq-medium").length&&a("head").append('<meta class="foundation-mq-medium">'),0===a("head").has(".foundation-mq-large").length&&a("head").append('<meta class="foundation-mq-large">'),0===a("head").has(".foundation-mq-xlarge").length&&a("head").append('<meta class="foundation-mq-xlarge">'),0===a("head").has(".foundation-mq-xxlarge").length&&a("head").append('<meta class="foundation-mq-xxlarge">'),e.prototype.deviceIsAndroid=navigator.userAgent.indexOf("Android")>0,e.prototype.deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent),e.prototype.deviceIsIOS4=e.prototype.deviceIsIOS&&/OS 4_\d(_\d)?/.test(navigator.userAgent),e.prototype.deviceIsIOSWithBadTarget=e.prototype.deviceIsIOS&&/OS ([6-9]|\d{2})_\d/.test(navigator.userAgent),e.prototype.needsClick=function(a){switch(a.nodeName.toLowerCase()){case"button":case"select":case"textarea":if(a.disabled)return!0;break;case"input":if(this.deviceIsIOS&&"file"===a.type||a.disabled)return!0;break;case"label":case"video":return!0}return/\bneedsclick\b/.test(a.className)},e.prototype.needsFocus=function(a){switch(a.nodeName.toLowerCase()){case"textarea":case"select":return!0;case"input":switch(a.type){case"button":case"checkbox":case"file":case"image":case"radio":case"submit":return!1}return!a.disabled&&!a.readOnly;default:return/\bneedsfocus\b/.test(a.className)}},e.prototype.sendClick=function(a,d){var e,f;c.activeElement&&c.activeElement!==a&&c.activeElement.blur(),f=d.changedTouches[0],e=c.createEvent("MouseEvents"),e.initMouseEvent("click",!0,!0,b,1,f.screenX,f.screenY,f.clientX,f.clientY,!1,!1,!1,!1,0,null),e.forwardedTouchEvent=!0,a.dispatchEvent(e)},e.prototype.focus=function(a){var b;this.deviceIsIOS&&a.setSelectionRange?(b=a.value.length,a.setSelectionRange(b,b)):a.focus()},e.prototype.updateScrollParent=function(a){var b,c;if(b=a.fastClickScrollParent,!b||!b.contains(a)){c=a;do{if(c.scrollHeight>c.offsetHeight){b=c,a.fastClickScrollParent=c;break}c=c.parentElement}while(c)}b&&(b.fastClickLastScrollTop=b.scrollTop)},e.prototype.getTargetElementFromEventTarget=function(a){return a.nodeType===Node.TEXT_NODE?a.parentNode:a},e.prototype.onTouchStart=function(a){var c,d,e;if(a.targetTouches.length>1)return!0;if(c=this.getTargetElementFromEventTarget(a.target),d=a.targetTouches[0],this.deviceIsIOS){if(e=b.getSelection(),e.rangeCount&&!e.isCollapsed)return!0;if(!this.deviceIsIOS4){if(d.identifier===this.lastTouchIdentifier)return a.preventDefault(),!1;this.lastTouchIdentifier=d.identifier,this.updateScrollParent(c)}}return this.trackingClick=!0,this.trackingClickStart=a.timeStamp,this.targetElement=c,this.touchStartX=d.pageX,this.touchStartY=d.pageY,a.timeStamp-this.lastClickTime<200&&a.preventDefault(),!0},e.prototype.touchHasMoved=function(a){var b=a.changedTouches[0],c=this.touchBoundary;return Math.abs(b.pageX-this.touchStartX)>c||Math.abs(b.pageY-this.touchStartY)>c?!0:!1},e.prototype.onTouchMove=function(a){return this.trackingClick?((this.targetElement!==this.getTargetElementFromEventTarget(a.target)||this.touchHasMoved(a))&&(this.trackingClick=!1,this.targetElement=null),!0):!0},e.prototype.findControl=function(a){return a.control!==d?a.control:a.htmlFor?c.getElementById(a.htmlFor):a.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea")},e.prototype.onTouchEnd=function(a){var d,e,f,g,h,i=this.targetElement;if(!this.trackingClick)return!0;if(a.timeStamp-this.lastClickTime<200)return this.cancelNextClick=!0,!0;if(this.lastClickTime=a.timeStamp,e=this.trackingClickStart,this.trackingClick=!1,this.trackingClickStart=0,this.deviceIsIOSWithBadTarget&&(h=a.changedTouches[0],i=c.elementFromPoint(h.pageX-b.pageXOffset,h.pageY-b.pageYOffset)||i,i.fastClickScrollParent=this.targetElement.fastClickScrollParent),f=i.tagName.toLowerCase(),"label"===f){if(d=this.findControl(i)){if(this.focus(i),this.deviceIsAndroid)return!1;i=d}}else if(this.needsFocus(i))return a.timeStamp-e>100||this.deviceIsIOS&&b.top!==b&&"input"===f?(this.targetElement=null,!1):(this.focus(i),this.deviceIsIOS4&&"select"===f||(this.targetElement=null,a.preventDefault()),!1);return this.deviceIsIOS&&!this.deviceIsIOS4&&(g=i.fastClickScrollParent,g&&g.fastClickLastScrollTop!==g.scrollTop)?!0:(this.needsClick(i)||(a.preventDefault(),this.sendClick(i,a)),!1)},e.prototype.onTouchCancel=function(){this.trackingClick=!1,this.targetElement=null},e.prototype.onMouse=function(a){return this.targetElement?a.forwardedTouchEvent?!0:a.cancelable?!this.needsClick(this.targetElement)||this.cancelNextClick?(a.stopImmediatePropagation?a.stopImmediatePropagation():a.propagationStopped=!0,a.stopPropagation(),a.preventDefault(),!1):!0:!0:!0},e.prototype.onClick=function(a){var b;return this.trackingClick?(this.targetElement=null,this.trackingClick=!1,!0):"submit"===a.target.type&&0===a.detail?!0:(b=this.onMouse(a),b||(this.targetElement=null),b)},e.prototype.destroy=function(){var a=this.layer;this.deviceIsAndroid&&(a.removeEventListener("mouseover",this.onMouse,!0),a.removeEventListener("mousedown",this.onMouse,!0),a.removeEventListener("mouseup",this.onMouse,!0)),a.removeEventListener("click",this.onClick,!0),a.removeEventListener("touchstart",this.onTouchStart,!1),a.removeEventListener("touchmove",this.onTouchMove,!1),a.removeEventListener("touchend",this.onTouchEnd,!1),a.removeEventListener("touchcancel",this.onTouchCancel,!1)},e.notNeeded=function(a){var d;if("undefined"==typeof b.ontouchstart)return!0;if(/Chrome\/[0-9]+/.test(navigator.userAgent)){if(!e.prototype.deviceIsAndroid)return!0;if(d=c.querySelector("meta[name=viewport]"),d&&-1!==d.content.indexOf("user-scalable=no"))return!0}return"none"===a.style.msTouchAction?!0:!1},e.attach=function(a){return new e(a)},"undefined"!=typeof define&&define.amd?define(function(){return e}):"undefined"!=typeof module&&module.exports?(module.exports=e.attach,module.exports.FastClick=e):b.FastClick=e,"undefined"!=typeof e&&e.attach(c.body);var g=function(b,d){return"string"==typeof b?d?a(d.querySelectorAll(b)):a(c.querySelectorAll(b)):a(b,d)};b.matchMedia=b.matchMedia||function(a){var b,c=a.documentElement,d=c.firstElementChild||c.firstChild,e=a.createElement("body"),f=a.createElement("div");return f.id="mq-test-1",f.style.cssText="position:absolute;top:-100em",e.style.background="none",e.appendChild(f),function(a){return f.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',c.insertBefore(e,d),b=42===f.offsetWidth,c.removeChild(e),{matches:b,media:a}}}(c),function(){function a(){c&&(f(a),jQuery.fx.tick())}for(var c,d=0,e=["webkit","moz"],f=b.requestAnimationFrame,g=b.cancelAnimationFrame;d<e.length&&!f;d++)f=b[e[d]+"RequestAnimationFrame"],g=g||b[e[d]+"CancelAnimationFrame"]||b[e[d]+"CancelRequestAnimationFrame"];f?(b.requestAnimationFrame=f,b.cancelAnimationFrame=g,jQuery.fx.timer=function(b){b()&&jQuery.timers.push(b)&&!c&&(c=!0,a())},jQuery.fx.stop=function(){c=!1}):(b.requestAnimationFrame=function(a){var c=(new Date).getTime(),e=Math.max(0,16-(c-d)),f=b.setTimeout(function(){a(c+e)},e);return d=c+e,f},b.cancelAnimationFrame=function(a){clearTimeout(a)})}(jQuery),b.Foundation={name:"Foundation",version:"5.0.0",media_queries:{small:g(".foundation-mq-small").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),medium:g(".foundation-mq-medium").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),large:g(".foundation-mq-large").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),xlarge:g(".foundation-mq-xlarge").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,""),xxlarge:g(".foundation-mq-xxlarge").css("font-family").replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g,"")},stylesheet:a("<style></style>").appendTo("head")[0].sheet,init:function(a,b,c,d,e){var f=[a,c,d,e],h=[];if(this.rtl=/rtl/i.test(g("html").attr("dir")),this.scope=a||this.scope,b&&"string"==typeof b&&!/reflow/i.test(b))this.libs.hasOwnProperty(b)&&h.push(this.init_lib(b,f));else for(var i in this.libs)h.push(this.init_lib(i,b));return a},init_lib:function(a,b){return this.libs.hasOwnProperty(a)?(this.patch(this.libs[a]),b&&b.hasOwnProperty(a)?this.libs[a].init.apply(this.libs[a],[this.scope,b[a]]):this.libs[a].init.apply(this.libs[a],b)):function(){}},patch:function(a){a.scope=this.scope,a.data_options=this.lib_methods.data_options,a.bindings=this.lib_methods.bindings,a.S=g,a.rtl=this.rtl},inherit:function(a,b){for(var c=b.split(" "),d=c.length-1;d>=0;d--)this.lib_methods.hasOwnProperty(c[d])&&(this.libs[a.name][c[d]]=this.lib_methods[c[d]])},random_str:function(a){var b="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");a||(a=Math.floor(Math.random()*b.length));for(var c="",d=0;a>d;d++)c+=b[Math.floor(Math.random()*b.length)];return c},libs:{},lib_methods:{throttle:function(a,b){var c=null;return function(){var d=this,e=arguments;clearTimeout(c),c=setTimeout(function(){a.apply(d,e)},b)}},data_options:function(b){function c(a){return!isNaN(a-0)&&null!==a&&""!==a&&a!==!1&&a!==!0}function d(b){return"string"==typeof b?a.trim(b):b}var e,f,g,h,i={},j=b.data("options");if("object"==typeof j)return j;for(g=(j||":").split(";"),h=g.length,e=h-1;e>=0;e--)f=g[e].split(":"),/true/i.test(f[1])&&(f[1]=!0),/false/i.test(f[1])&&(f[1]=!1),c(f[1])&&(f[1]=parseInt(f[1],10)),2===f.length&&f[0].length>0&&(i[d(f[0])]=d(f[1]));return i},delay:function(a,b){return setTimeout(a,b)},empty:function(a){if(a.length&&a.length>0)return!1;if(a.length&&0===a.length)return!0;for(var b in a)if(hasOwnProperty.call(a,b))return!1;return!0},register_media:function(b,c){Foundation.media_queries[b]===d&&(a("head").append('<meta class="'+c+'">'),Foundation.media_queries[b]=f(a("."+c).css("font-family")))},addCustomRule:function(a,b){if(b===d)Foundation.stylesheet.insertRule(a,Foundation.stylesheet.cssRules.length);else{var c=Foundation.media_queries[b];c!==d&&Foundation.stylesheet.insertRule("@media "+Foundation.media_queries[b]+"{ "+a+" }")}},loaded:function(a,b){function c(){b(a[0])}function d(){if(this.one("load",c),/MSIE (\d+\.\d+);/.test(navigator.userAgent)){var a=this.attr("src"),b=a.match(/\?/)?"&":"?";b+="random="+(new Date).getTime(),this.attr("src",a+b)}}return a.attr("src")?(a[0].complete||4===a[0].readyState?c():d.call(a),void 0):(c(),void 0)},bindings:function(b,c){var d=this,e=!g(this).data(this.name+"-init");return"string"==typeof b?this[b].call(this):(g(this.scope).is("[data-"+this.name+"]")?(g(this.scope).data(this.name+"-init",a.extend({},this.settings,c||b,this.data_options(g(this.scope)))),e&&this.events(this.scope)):g("[data-"+this.name+"]",this.scope).each(function(){var e=!g(this).data(d.name+"-init");g(this).data(d.name+"-init",a.extend({},d.settings,c||b,d.data_options(g(this)))),e&&d.events(this)}),void 0)}}},a.fn.foundation=function(){var a=Array.prototype.slice.call(arguments,0);return this.each(function(){return Foundation.init.apply(Foundation,[this].concat(a)),this})}}(jQuery,this,this.document),function(a,b,c){"use strict";Foundation.libs.abide={name:"abide",version:"5.0.0",settings:{focus_on_invalid:!0,timeout:1e3,patterns:{alpha:/[a-zA-Z]+/,alpha_numeric:/[a-zA-Z0-9]+/,integer:/-?\d+/,number:/-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?/,password:/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,card:/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,cvv:/^([0-9]){3,4}$/,email:/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,url:/(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?/,domain:/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/,datetime:/([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))/,date:/(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))/,time:/(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}/,dateISO:/\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,month_day_year:/(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d/,color:/^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/}},timer:null,init:function(a,b,c){this.bindings(b,c)},events:function(b){{var c=this,d=a(b).attr("novalidate","novalidate");d.data("abide-init")}d.off(".abide").on("submit.fndtn.abide validate.fndtn.abide",function(b){var d=/ajax/i.test(a(this).attr("data-abide"));return c.validate(a(this).find("input, textarea, select").get(),b,d)}).find("input, textarea, select").off(".abide").on("blur.fndtn.abide change.fndtn.abide",function(a){c.validate([this],a)}).on("keydown.fndtn.abide",function(b){var d=a(this).closest("form").data("abide-init");clearTimeout(c.timer),c.timer=setTimeout(function(){c.validate([this],b)}.bind(this),d.timeout)})},validate:function(b,c,d){for(var e=this.parse_patterns(b),f=e.length,g=a(b[0]).closest("form"),h=/submit/.test(c.type),i=0;f>i;i++)if(!e[i]&&(h||d))return this.settings.focus_on_invalid&&b[i].focus(),g.trigger("invalid"),a(b[i]).closest("form").attr("data-invalid",""),!1;return(h||d)&&g.trigger("valid"),g.removeAttr("data-invalid"),d?!1:!0},parse_patterns:function(a){for(var b=a.length,c=[],d=b-1;d>=0;d--)c.push(this.pattern(a[d]));return this.check_validation_and_apply_styles(c)},pattern:function(a){var b=a.getAttribute("type"),c="string"==typeof a.getAttribute("required");if(this.settings.patterns.hasOwnProperty(b))return[a,this.settings.patterns[b],c];var d=a.getAttribute("pattern")||"";return this.settings.patterns.hasOwnProperty(d)&&d.length>0?[a,this.settings.patterns[d],c]:d.length>0?[a,new RegExp(d),c]:(d=/.*/,[a,d,c])},check_validation_and_apply_styles:function(b){for(var c=b.length,d=[],e=c-1;e>=0;e--){var f=b[e][0],g=b[e][2],h=f.value,i=f.getAttribute("data-equalto"),j="radio"===f.type,k=g?f.value.length>0:!0;j&&g?d.push(this.valid_radio(f,g)):i&&g?d.push(this.valid_equal(f,g)):b[e][1].test(h)&&k||!g&&f.value.length<1?(a(f).removeAttr("data-invalid").parent().removeClass("error"),d.push(!0)):(a(f).attr("data-invalid","").parent().addClass("error"),d.push(!1))}return d},valid_radio:function(b){for(var d=b.getAttribute("name"),e=c.getElementsByName(d),f=e.length,g=!1,h=0;f>h;h++)e[h].checked&&(g=!0);for(var h=0;f>h;h++)g?a(e[h]).removeAttr("data-invalid").parent().removeClass("error"):a(e[h]).attr("data-invalid","").parent().addClass("error");return g},valid_equal:function(b){var d=c.getElementById(b.getAttribute("data-equalto")).value,e=b.value,f=d===e;return f?a(b).removeAttr("data-invalid").parent().removeClass("error"):a(b).attr("data-invalid","").parent().addClass("error"),f}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.accordion={name:"accordion",version:"5.0.1",settings:{active_class:"active",toggleable:!0},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".accordion").on("click.fndtn.accordion","[data-accordion] > dd > a",function(b){var c=a(this).parent(),d=a("#"+this.href.split("#")[1]),e=a("> dd > .content",d.closest("[data-accordion]")),f=c.parent().data("accordion-init"),g=a("> dd > .content."+f.active_class,c.parent());return b.preventDefault(),g[0]==d[0]&&f.toggleable?d.toggleClass(f.active_class):(e.removeClass(f.active_class),d.addClass(f.active_class),void 0)})},off:function(){},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.alert={name:"alert",version:"5.0.0",settings:{animation:"fadeOut",speed:300,callback:function(){}},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".alert").on("click.fndtn.alert","[data-alert] a.close",function(b){var c=a(this).closest("[data-alert]"),d=c.data("alert-init");b.preventDefault(),c[d.animation](d.speed,function(){a(this).trigger("closed").remove(),d.callback()})})},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.clearing={name:"clearing",version:"5.0.0",settings:{templates:{viewing:'<a href="#" class="clearing-close">&times;</a><div class="visible-img" style="display: none"><img src="//:0"><p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a><a href="#" class="clearing-main-next"><span></span></a></div>'},close_selectors:".clearing-close",init:!1,locked:!1},init:function(b,c,d){var e=this;Foundation.inherit(this,"throttle loaded"),this.bindings(c,d),a(this.scope).is("[data-clearing]")?this.assemble(a("li",this.scope)):a("[data-clearing]",this.scope).each(function(){e.assemble(a("li",this))})},events:function(c){var d=this;a(this.scope).off(".clearing").on("click.fndtn.clearing","ul[data-clearing] li",function(b,c,e){var c=c||a(this),e=e||c,f=c.next("li"),g=c.closest("[data-clearing]").data("clearing-init"),h=a(b.target);b.preventDefault(),g||(d.init(),g=c.closest("[data-clearing]").data("clearing-init")),e.hasClass("visible")&&c[0]===e[0]&&f.length>0&&d.is_open(c)&&(e=f,h=a("img",e)),d.open(h,c,e),d.update_paddles(e)}).on("click.fndtn.clearing",".clearing-main-next",function(a){d.nav(a,"next")}).on("click.fndtn.clearing",".clearing-main-prev",function(a){d.nav(a,"prev")}).on("click.fndtn.clearing",this.settings.close_selectors,function(a){Foundation.libs.clearing.close(a,this)}).on("keydown.fndtn.clearing",function(a){d.keydown(a)}),a(b).off(".clearing").on("resize.fndtn.clearing",function(){d.resize()}),this.swipe_events(c)},swipe_events:function(){var b=this;a(this.scope).on("touchstart.fndtn.clearing",".visible-img",function(b){b.touches||(b=b.originalEvent);var c={start_page_x:b.touches[0].pageX,start_page_y:b.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:d};a(this).data("swipe-transition",c),b.stopPropagation()}).on("touchmove.fndtn.clearing",".visible-img",function(c){if(c.touches||(c=c.originalEvent),!(c.touches.length>1||c.scale&&1!==c.scale)){var d=a(this).data("swipe-transition");if("undefined"==typeof d&&(d={}),d.delta_x=c.touches[0].pageX-d.start_page_x,"undefined"==typeof d.is_scrolling&&(d.is_scrolling=!!(d.is_scrolling||Math.abs(d.delta_x)<Math.abs(c.touches[0].pageY-d.start_page_y))),!d.is_scrolling&&!d.active){c.preventDefault();var e=d.delta_x<0?"next":"prev";d.active=!0,b.nav(c,e)}}}).on("touchend.fndtn.clearing",".visible-img",function(b){a(this).data("swipe-transition",{}),b.stopPropagation()})},assemble:function(b){var c=b.parent();if(!c.parent().hasClass("carousel")){c.after('<div id="foundationClearingHolder"></div>');var d=a("#foundationClearingHolder"),e=c.data("clearing-init"),f=c.detach(),g={grid:'<div class="carousel">'+f[0].outerHTML+"</div>",viewing:e.templates.viewing},h='<div class="clearing-assembled"><div>'+g.viewing+g.grid+"</div></div>";return d.after(h).remove()}},open:function(b,c,d){var e=d.closest(".clearing-assembled"),f=a("div",e).first(),g=a(".visible-img",f),h=a("img",g).not(b);this.locked()||(h.attr("src",this.load(b)).css("visibility","hidden"),this.loaded(h,function(){h.css("visibility","visible"),e.addClass("clearing-blackout"),f.addClass("clearing-container"),g.show(),this.fix_height(d).caption(a(".clearing-caption",g),b).center(h).shift(c,d,function(){d.siblings().removeClass("visible"),d.addClass("visible")})}.bind(this)))},close:function(b,c){b.preventDefault();var d,e,f=function(a){return/blackout/.test(a.selector)?a:a.closest(".clearing-blackout")}(a(c));return c===b.target&&f&&(d=a("div",f).first(),e=a(".visible-img",d),this.settings.prev_index=0,a("ul[data-clearing]",f).attr("style","").closest(".clearing-blackout").removeClass("clearing-blackout"),d.removeClass("clearing-container"),e.hide()),!1},is_open:function(a){return a.parent().prop("style").length>0},keydown:function(b){var c=a("ul[data-clearing]",".clearing-blackout");39===b.which&&this.go(c,"next"),37===b.which&&this.go(c,"prev"),27===b.which&&a("a.clearing-close").trigger("click")},nav:function(b,c){var d=a("ul[data-clearing]",".clearing-blackout");b.preventDefault(),this.go(d,c)},resize:function(){var b=a("img",".clearing-blackout .visible-img");b.length&&this.center(b)},fix_height:function(b){var c=b.parent().children();return c.each(function(){var b=a(this),c=b.find("img");b.height()>c.outerHeight()&&b.addClass("fix-height")}).closest("ul").width(100*c.length+"%"),this},update_paddles:function(b){var c=b.closest(".carousel").siblings(".visible-img");b.next().length>0?a(".clearing-main-next",c).removeClass("disabled"):a(".clearing-main-next",c).addClass("disabled"),b.prev().length>0?a(".clearing-main-prev",c).removeClass("disabled"):a(".clearing-main-prev",c).addClass("disabled")},center:function(a){return this.rtl?a.css({marginRight:-(a.outerWidth()/2),marginTop:-(a.outerHeight()/2)}):a.css({marginLeft:-(a.outerWidth()/2),marginTop:-(a.outerHeight()/2)}),this},load:function(a){if("A"===a[0].nodeName)var b=a.attr("href");else var b=a.parent().attr("href");return this.preload(a),b?b:a.attr("src")},preload:function(a){this.img(a.closest("li").next()).img(a.closest("li").prev())},img:function(b){if(b.length){var c=new Image,d=a("a",b);c.src=d.length?d.attr("href"):a("img",b).attr("src")}return this},caption:function(a,b){var c=b.data("caption");return c?a.html(c).show():a.text("").hide(),this},go:function(b,c){var d=a(".visible",b),e=d[c]();e.length&&a("img",e).trigger("click",[d,e])},shift:function(a,b,c){var d,e=b.parent(),f=this.settings.prev_index||b.index(),g=this.direction(e,a,b),h=parseInt(e.css("left"),10),i=b.outerWidth();b.index()===f||/skip/.test(g)?/skip/.test(g)&&(d=b.index()-this.settings.up_count,this.lock(),d>0?e.animate({left:-(d*i)},300,this.unlock()):e.animate({left:0},300,this.unlock())):/left/.test(g)?(this.lock(),e.animate({left:h+i},300,this.unlock())):/right/.test(g)&&(this.lock(),e.animate({left:h-i},300,this.unlock())),c()},direction:function(b,c,d){var e,f=a("li",b),g=f.outerWidth()+f.outerWidth()/4,h=Math.floor(a(".clearing-container").outerWidth()/g)-1,i=f.index(d);return this.settings.up_count=h,e=this.adjacent(this.settings.prev_index,i)?i>h&&i>this.settings.prev_index?"right":i>h-1&&i<=this.settings.prev_index?"left":!1:"skip",this.settings.prev_index=i,e},adjacent:function(a,b){for(var c=b+1;c>=b-1;c--)if(c===a)return!0;return!1},lock:function(){this.settings.locked=!0},unlock:function(){this.settings.locked=!1},locked:function(){return this.settings.locked},off:function(){a(this.scope).off(".fndtn.clearing"),a(b).off(".fndtn.clearing")},reflow:function(){this.init()}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.dropdown={name:"dropdown",version:"5.0.0",settings:{active_class:"open",is_hover:!1,opened:function(){},closed:function(){}},init:function(a,b,c){Foundation.inherit(this,"throttle"),this.bindings(b,c)},events:function(){var c=this;a(this.scope).off(".dropdown").on("click.fndtn.dropdown","[data-dropdown]",function(b){var d=a(this).data("dropdown-init");b.preventDefault(),(!d.is_hover||Modernizr.touch)&&c.toggle(a(this))}).on("mouseenter.fndtn.dropdown","[data-dropdown], [data-dropdown-content]",function(){var b=a(this);if(clearTimeout(c.timeout),b.data("dropdown"))var d=a("#"+b.data("dropdown")),e=b;else{var d=b;e=a("[data-dropdown='"+d.attr("id")+"']")}var f=e.data("dropdown-init");f.is_hover&&c.open.apply(c,[d,e])}).on("mouseleave.fndtn.dropdown","[data-dropdown], [data-dropdown-content]",function(){var b=a(this);c.timeout=setTimeout(function(){if(b.data("dropdown")){var d=b.data("dropdown-init");d.is_hover&&c.close.call(c,a("#"+b.data("dropdown")))}else{var e=a('[data-dropdown="'+a(this).attr("id")+'"]'),d=e.data("dropdown-init");d.is_hover&&c.close.call(c,b)}}.bind(this),150)}).on("click.fndtn.dropdown",function(b){var d=a(b.target).closest("[data-dropdown-content]");if(!a(b.target).data("dropdown")&&!a(b.target).parent().data("dropdown"))return!a(b.target).data("revealId")&&d.length>0&&(a(b.target).is("[data-dropdown-content]")||a.contains(d.first()[0],b.target))?(b.stopPropagation(),void 0):(c.close.call(c,a("[data-dropdown-content]")),void 0)}).on("opened.fndtn.dropdown","[data-dropdown-content]",this.settings.opened).on("closed.fndtn.dropdown","[data-dropdown-content]",this.settings.closed),a(b).off(".dropdown").on("resize.fndtn.dropdown",c.throttle(function(){c.resize.call(c)},50)).trigger("resize")},close:function(b){var c=this;b.each(function(){a(this).hasClass(c.settings.active_class)&&(a(this).css(Foundation.rtl?"right":"left","-99999px").removeClass(c.settings.active_class),a(this).trigger("closed"))})},open:function(a,b){this.css(a.addClass(this.settings.active_class),b),a.trigger("opened")},toggle:function(b){var c=a("#"+b.data("dropdown"));0!==c.length&&(this.close.call(this,a("[data-dropdown-content]").not(c)),c.hasClass(this.settings.active_class)?this.close.call(this,c):(this.close.call(this,a("[data-dropdown-content]")),this.open.call(this,c,b)))},resize:function(){var b=a("[data-dropdown-content].open"),c=a("[data-dropdown='"+b.attr("id")+"']");b.length&&c.length&&this.css(b,c)},css:function(c,d){var e=c.offsetParent(),f=d.offset();if(f.top-=e.offset().top,f.left-=e.offset().left,this.small())c.css({position:"absolute",width:"95%","max-width":"none",top:f.top+d.outerHeight()}),c.css(Foundation.rtl?"right":"left","2.5%");else{if(!Foundation.rtl&&a(b).width()>c.outerWidth()+d.offset().left){var g=f.left;c.hasClass("right")&&c.removeClass("right")}else{c.hasClass("right")||c.addClass("right");var g=f.left-(c.outerWidth()-d.outerWidth())}c.attr("style","").css({position:"absolute",top:f.top+d.outerHeight(),left:g})}return c},small:function(){return matchMedia(Foundation.media_queries.small).matches&&!matchMedia(Foundation.media_queries.medium).matches},off:function(){a(this.scope).off(".fndtn.dropdown"),a("html, body").off(".fndtn.dropdown"),a(b).off(".fndtn.dropdown"),a("[data-dropdown-content]").off(".fndtn.dropdown"),this.settings.init=!1},reflow:function(){}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.interchange={name:"interchange",version:"5.0.0",cache:{},images_loaded:!1,nodes_loaded:!1,settings:{load_attr:"interchange",named_queries:{"default":Foundation.media_queries.small,small:Foundation.media_queries.small,medium:Foundation.media_queries.medium,large:Foundation.media_queries.large,xlarge:Foundation.media_queries.xlarge,xxlarge:Foundation.media_queries.xxlarge,landscape:"only screen and (orientation: landscape)",portrait:"only screen and (orientation: portrait)",retina:"only screen and (-webkit-min-device-pixel-ratio: 2),only screen and (min--moz-device-pixel-ratio: 2),only screen and (-o-min-device-pixel-ratio: 2/1),only screen and (min-device-pixel-ratio: 2),only screen and (min-resolution: 192dpi),only screen and (min-resolution: 2dppx)"},directives:{replace:function(b,c,d){if(/IMG/.test(b[0].nodeName)){var e=b[0].src;if(new RegExp(c,"i").test(e))return;return b[0].src=c,d(b[0].src)}var f=b.data("interchange-last-path");if(f!=c)return a.get(c,function(a){b.html(a),b.data("interchange-last-path",c),d()})}}},init:function(a,b,c){Foundation.inherit(this,"throttle"),this.data_attr="data-"+this.settings.load_attr,this.bindings(b,c),this.load("images"),this.load("nodes")},events:function(){var c=this;return a(b).off(".interchange").on("resize.fndtn.interchange",c.throttle(function(){c.resize.call(c)},50)),this},resize:function(){var b=this.cache;if(!this.images_loaded||!this.nodes_loaded)return setTimeout(a.proxy(this.resize,this),50),void 0;for(var c in b)if(b.hasOwnProperty(c)){var d=this.results(c,b[c]);d&&this.settings.directives[d.scenario[1]](d.el,d.scenario[0],function(){if(arguments[0]instanceof Array)var a=arguments[0];else var a=Array.prototype.slice.call(arguments,0);d.el.trigger(d.scenario[1],a)})}},results:function(a,b){var c=b.length;if(c>0)for(var d=this.S('[data-uuid="'+a+'"]'),e=c-1;e>=0;e--){var f,g=b[e][2];if(f=this.settings.named_queries.hasOwnProperty(g)?matchMedia(this.settings.named_queries[g]):matchMedia(g),f.matches)return{el:d,scenario:b[e]}}return!1},load:function(a,b){return("undefined"==typeof this["cached_"+a]||b)&&this["update_"+a](),this["cached_"+a]},update_images:function(){var a=this.S("img["+this.data_attr+"]"),b=a.length,c=0,d=this.data_attr;this.cache={},this.cached_images=[],this.images_loaded=0===b;for(var e=b-1;e>=0;e--){if(c++,a[e]){var f=a[e].getAttribute(d)||"";f.length>0&&this.cached_images.push(a[e])}c===b&&(this.images_loaded=!0,this.enhance("images"))}return this},update_nodes:function(){var a=this.S("["+this.data_attr+"]:not(img)"),b=a.length,c=0,d=this.data_attr;this.cached_nodes=[],this.nodes_loaded=0===b;for(var e=b-1;e>=0;e--){c++;var f=a[e].getAttribute(d)||"";f.length>0&&this.cached_nodes.push(a[e]),c===b&&(this.nodes_loaded=!0,this.enhance("nodes"))}return this},enhance:function(c){for(var d=this["cached_"+c].length,e=d-1;e>=0;e--)this.object(a(this["cached_"+c][e]));return a(b).trigger("resize")},parse_params:function(a,b,c){return[this.trim(a),this.convert_directive(b),this.trim(c)]},convert_directive:function(a){var b=this.trim(a);
return b.length>0?b:"replace"},object:function(a){var b=this.parse_data_attr(a),c=[],d=b.length;if(d>0)for(var e=d-1;e>=0;e--){var f=b[e].split(/\((.*?)(\))$/);if(f.length>1){var g=f[0].split(","),h=this.parse_params(g[0],g[1],f[1]);c.push(h)}}return this.store(a,c)},uuid:function(a){function b(){return(65536*(1+Math.random())|0).toString(16).substring(1)}var c=a||"-";return b()+b()+c+b()+c+b()+c+b()+c+b()+b()+b()},store:function(a,b){var c=this.uuid(),d=a.data("uuid");return d?this.cache[d]:(a.attr("data-uuid",c),this.cache[c]=b)},trim:function(b){return"string"==typeof b?a.trim(b):b},parse_data_attr:function(a){for(var b=a.data(this.settings.load_attr).split(/\[(.*?)\]/),c=b.length,d=[],e=c-1;e>=0;e--)b[e].replace(/[\W\d]+/,"").length>4&&d.push(b[e]);return d},reflow:function(){this.load("images",!0),this.load("nodes",!0)}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.joyride={name:"joyride",version:"5.0.0",defaults:{expose:!1,modal:!0,tip_location:"bottom",nub_position:"auto",scroll_speed:1500,scroll_animation:"linear",timer:0,start_timer_on_click:!0,start_offset:0,next_button:!0,tip_animation:"fade",pause_after:[],exposed:[],tip_animation_fade_speed:300,cookie_monster:!1,cookie_name:"joyride",cookie_domain:!1,cookie_expires:365,tip_container:"body",tip_location_patterns:{top:["bottom"],bottom:[],left:["right","top","bottom"],right:["left","top","bottom"]},post_ride_callback:function(){},post_step_callback:function(){},pre_step_callback:function(){},pre_ride_callback:function(){},post_expose_callback:function(){},template:{link:'<a href="#close" class="joyride-close-tip">&times;</a>',timer:'<div class="joyride-timer-indicator-wrap"><span class="joyride-timer-indicator"></span></div>',tip:'<div class="joyride-tip-guide"><span class="joyride-nub"></span></div>',wrapper:'<div class="joyride-content-wrapper"></div>',button:'<a href="#" class="small button joyride-next-tip"></a>',modal:'<div class="joyride-modal-bg"></div>',expose:'<div class="joyride-expose-wrapper"></div>',expose_cover:'<div class="joyride-expose-cover"></div>'},expose_add_class:""},init:function(a,b,c){Foundation.inherit(this,"throttle delay"),this.settings=this.defaults,this.bindings(b,c)},events:function(){var c=this;a(this.scope).off(".joyride").on("click.fndtn.joyride",".joyride-next-tip, .joyride-modal-bg",function(a){a.preventDefault(),this.settings.$li.next().length<1?this.end():this.settings.timer>0?(clearTimeout(this.settings.automate),this.hide(),this.show(),this.startTimer()):(this.hide(),this.show())}.bind(this)).on("click.fndtn.joyride",".joyride-close-tip",function(a){a.preventDefault(),this.end()}.bind(this)),a(b).off(".joyride").on("resize.fndtn.joyride",c.throttle(function(){if(a("[data-joyride]").length>0&&c.settings.$next_tip){if(c.settings.exposed.length>0){var b=a(c.settings.exposed);b.each(function(){var b=a(this);c.un_expose(b),c.expose(b)})}c.is_phone()?c.pos_phone():c.pos_default(!1,!0)}},100))},start:function(){var b=this,c=a("[data-joyride]",this.scope),d=["timer","scrollSpeed","startOffset","tipAnimationFadeSpeed","cookieExpires"],e=d.length;!c.length>0||(this.settings.init||this.events(),this.settings=c.data("joyride-init"),this.settings.$content_el=c,this.settings.$body=a(this.settings.tip_container),this.settings.body_offset=a(this.settings.tip_container).position(),this.settings.$tip_content=this.settings.$content_el.find("> li"),this.settings.paused=!1,this.settings.attempts=0,"function"!=typeof a.cookie&&(this.settings.cookie_monster=!1),(!this.settings.cookie_monster||this.settings.cookie_monster&&null===a.cookie(this.settings.cookie_name))&&(this.settings.$tip_content.each(function(c){var f=a(this);this.settings=a.extend({},b.defaults,b.data_options(f));for(var g=e-1;g>=0;g--)b.settings[d[g]]=parseInt(b.settings[d[g]],10);b.create({$li:f,index:c})}),!this.settings.start_timer_on_click&&this.settings.timer>0?(this.show("init"),this.startTimer()):this.show("init")))},resume:function(){this.set_li(),this.show()},tip_template:function(b){var c,d;return b.tip_class=b.tip_class||"",c=a(this.settings.template.tip).addClass(b.tip_class),d=a.trim(a(b.li).html())+this.button_text(b.button_text)+this.settings.template.link+this.timer_instance(b.index),c.append(a(this.settings.template.wrapper)),c.first().attr("data-index",b.index),a(".joyride-content-wrapper",c).append(d),c[0]},timer_instance:function(b){var c;return c=0===b&&this.settings.start_timer_on_click&&this.settings.timer>0||0===this.settings.timer?"":a(this.settings.template.timer)[0].outerHTML},button_text:function(b){return this.settings.next_button?(b=a.trim(b)||"Next",b=a(this.settings.template.button).append(b)[0].outerHTML):b="",b},create:function(b){var c=b.$li.attr("data-button")||b.$li.attr("data-text"),d=b.$li.attr("class"),e=a(this.tip_template({tip_class:d,index:b.index,button_text:c,li:b.$li}));a(this.settings.tip_container).append(e)},show:function(b){var c=null;this.settings.$li===d||-1===a.inArray(this.settings.$li.index(),this.settings.pause_after)?(this.settings.paused?this.settings.paused=!1:this.set_li(b),this.settings.attempts=0,this.settings.$li.length&&this.settings.$target.length>0?(b&&(this.settings.pre_ride_callback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.show_modal()),this.settings.pre_step_callback(this.settings.$li.index(),this.settings.$next_tip),this.settings.modal&&this.settings.expose&&this.expose(),this.settings.tip_settings=a.extend({},this.settings,this.data_options(this.settings.$li)),this.settings.timer=parseInt(this.settings.timer,10),this.settings.tip_settings.tip_location_pattern=this.settings.tip_location_patterns[this.settings.tip_settings.tip_location],/body/i.test(this.settings.$target.selector)||this.scroll_to(),this.is_phone()?this.pos_phone(!0):this.pos_default(!0),c=this.settings.$next_tip.find(".joyride-timer-indicator"),/pop/i.test(this.settings.tip_animation)?(c.width(0),this.settings.timer>0?(this.settings.$next_tip.show(),this.delay(function(){c.animate({width:c.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tip_animation_fade_speed)):this.settings.$next_tip.show()):/fade/i.test(this.settings.tip_animation)&&(c.width(0),this.settings.timer>0?(this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed).show(),this.delay(function(){c.animate({width:c.parent().width()},this.settings.timer,"linear")}.bind(this),this.settings.tip_animation_fadeSpeed)):this.settings.$next_tip.fadeIn(this.settings.tip_animation_fade_speed)),this.settings.$current_tip=this.settings.$next_tip):this.settings.$li&&this.settings.$target.length<1?this.show():this.end()):this.settings.paused=!0},is_phone:function(){return matchMedia(Foundation.media_queries.small).matches&&!matchMedia(Foundation.media_queries.medium).matches},hide:function(){this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.modal||a(".joyride-modal-bg").hide(),this.settings.$current_tip.css("visibility","hidden"),setTimeout(a.proxy(function(){this.hide(),this.css("visibility","visible")},this.settings.$current_tip),0),this.settings.post_step_callback(this.settings.$li.index(),this.settings.$current_tip)},set_li:function(a){a?(this.settings.$li=this.settings.$tip_content.eq(this.settings.start_offset),this.set_next_tip(),this.settings.$current_tip=this.settings.$next_tip):(this.settings.$li=this.settings.$li.next(),this.set_next_tip()),this.set_target()},set_next_tip:function(){this.settings.$next_tip=a(".joyride-tip-guide").eq(this.settings.$li.index()),this.settings.$next_tip.data("closed","")},set_target:function(){var b=this.settings.$li.attr("data-class"),d=this.settings.$li.attr("data-id"),e=function(){return d?a(c.getElementById(d)):b?a("."+b).first():a("body")};this.settings.$target=e()},scroll_to:function(){var c,d;c=a(b).height()/2,d=Math.ceil(this.settings.$target.offset().top-c+this.settings.$next_tip.outerHeight()),d>0&&a("html, body").animate({scrollTop:d},this.settings.scroll_speed,"swing")},paused:function(){return-1===a.inArray(this.settings.$li.index()+1,this.settings.pause_after)},restart:function(){this.hide(),this.settings.$li=d,this.show("init")},pos_default:function(c,d){var e=(Math.ceil(a(b).height()/2),this.settings.$next_tip.offset(),this.settings.$next_tip.find(".joyride-nub")),f=Math.ceil(e.outerWidth()/2),g=Math.ceil(e.outerHeight()/2),h=c||!1;if(h&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),"undefined"==typeof d&&(d=!1),/body/i.test(this.settings.$target.selector))this.settings.$li.length&&this.pos_modal(e);else{if(this.bottom()){var i=this.settings.$target.offset().left;Foundation.rtl&&(i=this.settings.$target.offset().width-this.settings.$next_tip.width()+i),this.settings.$next_tip.css({top:this.settings.$target.offset().top+g+this.settings.$target.outerHeight(),left:i}),this.nub_position(e,this.settings.tip_settings.nub_position,"top")}else if(this.top()){var i=this.settings.$target.offset().left;Foundation.rtl&&(i=this.settings.$target.offset().width-this.settings.$next_tip.width()+i),this.settings.$next_tip.css({top:this.settings.$target.offset().top-this.settings.$next_tip.outerHeight()-g,left:i}),this.nub_position(e,this.settings.tip_settings.nub_position,"bottom")}else this.right()?(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.outerWidth(this.settings.$target)+this.settings.$target.offset().left+f}),this.nub_position(e,this.settings.tip_settings.nub_position,"left")):this.left()&&(this.settings.$next_tip.css({top:this.settings.$target.offset().top,left:this.settings.$target.offset().left-this.outerWidth(this.settings.$next_tip)-f}),this.nub_position(e,this.settings.tip_settings.nub_position,"right"));!this.visible(this.corners(this.settings.$next_tip))&&this.settings.attempts<this.settings.tip_settings.tip_location_pattern.length&&(e.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),this.settings.tip_settings.tip_location=this.settings.tip_settings.tip_location_pattern[this.settings.attempts],this.settings.attempts++,this.pos_default())}h&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_phone:function(b){var c=this.settings.$next_tip.outerHeight(),d=(this.settings.$next_tip.offset(),this.settings.$target.outerHeight()),e=a(".joyride-nub",this.settings.$next_tip),f=Math.ceil(e.outerHeight()/2),g=b||!1;e.removeClass("bottom").removeClass("top").removeClass("right").removeClass("left"),g&&(this.settings.$next_tip.css("visibility","hidden"),this.settings.$next_tip.show()),/body/i.test(this.settings.$target.selector)?this.settings.$li.length&&this.pos_modal(e):this.top()?(this.settings.$next_tip.offset({top:this.settings.$target.offset().top-c-f}),e.addClass("bottom")):(this.settings.$next_tip.offset({top:this.settings.$target.offset().top+d+f}),e.addClass("top")),g&&(this.settings.$next_tip.hide(),this.settings.$next_tip.css("visibility","visible"))},pos_modal:function(a){this.center(),a.hide(),this.show_modal()},show_modal:function(){if(!this.settings.$next_tip.data("closed")){var b=a(".joyride-modal-bg");b.length<1&&a("body").append(this.settings.template.modal).show(),/pop/i.test(this.settings.tip_animation)?b.show():b.fadeIn(this.settings.tip_animation_fade_speed)}},expose:function(){var c,d,e,f,g,h="expose-"+Math.floor(1e4*Math.random());if(arguments.length>0&&arguments[0]instanceof a)e=arguments[0];else{if(!this.settings.$target||/body/i.test(this.settings.$target.selector))return!1;e=this.settings.$target}return e.length<1?(b.console&&console.error("element not valid",e),!1):(c=a(this.settings.template.expose),this.settings.$body.append(c),c.css({top:e.offset().top,left:e.offset().left,width:e.outerWidth(!0),height:e.outerHeight(!0)}),d=a(this.settings.template.expose_cover),f={zIndex:e.css("z-index"),position:e.css("position")},g=null==e.attr("class")?"":e.attr("class"),e.css("z-index",parseInt(c.css("z-index"))+1),"static"==f.position&&e.css("position","relative"),e.data("expose-css",f),e.data("orig-class",g),e.attr("class",g+" "+this.settings.expose_add_class),d.css({top:e.offset().top,left:e.offset().left,width:e.outerWidth(!0),height:e.outerHeight(!0)}),this.settings.modal&&this.show_modal(),this.settings.$body.append(d),c.addClass(h),d.addClass(h),e.data("expose",h),this.settings.post_expose_callback(this.settings.$li.index(),this.settings.$next_tip,e),this.add_exposed(e),void 0)},un_expose:function(){var c,d,e,f,g,h=!1;if(arguments.length>0&&arguments[0]instanceof a)d=arguments[0];else{if(!this.settings.$target||/body/i.test(this.settings.$target.selector))return!1;d=this.settings.$target}return d.length<1?(b.console&&console.error("element not valid",d),!1):(c=d.data("expose"),e=a("."+c),arguments.length>1&&(h=arguments[1]),h===!0?a(".joyride-expose-wrapper,.joyride-expose-cover").remove():e.remove(),f=d.data("expose-css"),"auto"==f.zIndex?d.css("z-index",""):d.css("z-index",f.zIndex),f.position!=d.css("position")&&("static"==f.position?d.css("position",""):d.css("position",f.position)),g=d.data("orig-class"),d.attr("class",g),d.removeData("orig-classes"),d.removeData("expose"),d.removeData("expose-z-index"),this.remove_exposed(d),void 0)},add_exposed:function(b){this.settings.exposed=this.settings.exposed||[],b instanceof a||"object"==typeof b?this.settings.exposed.push(b[0]):"string"==typeof b&&this.settings.exposed.push(b)},remove_exposed:function(b){var c,d;b instanceof a?c=b[0]:"string"==typeof b&&(c=b),this.settings.exposed=this.settings.exposed||[],d=this.settings.exposed.length;for(var e=0;d>e;e++)if(this.settings.exposed[e]==c)return this.settings.exposed.splice(e,1),void 0},center:function(){var c=a(b);return this.settings.$next_tip.css({top:(c.height()-this.settings.$next_tip.outerHeight())/2+c.scrollTop(),left:(c.width()-this.settings.$next_tip.outerWidth())/2+c.scrollLeft()}),!0},bottom:function(){return/bottom/i.test(this.settings.tip_settings.tip_location)},top:function(){return/top/i.test(this.settings.tip_settings.tip_location)},right:function(){return/right/i.test(this.settings.tip_settings.tip_location)},left:function(){return/left/i.test(this.settings.tip_settings.tip_location)},corners:function(c){var d=a(b),e=d.height()/2,f=Math.ceil(this.settings.$target.offset().top-e+this.settings.$next_tip.outerHeight()),g=d.width()+d.scrollLeft(),h=d.height()+f,i=d.height()+d.scrollTop(),j=d.scrollTop();return j>f&&(j=0>f?0:f),h>i&&(i=h),[c.offset().top<j,g<c.offset().left+c.outerWidth(),i<c.offset().top+c.outerHeight(),d.scrollLeft()>c.offset().left]},visible:function(a){for(var b=a.length;b--;)if(a[b])return!1;return!0},nub_position:function(a,b,c){"auto"===b?a.addClass(c):a.addClass(b)},startTimer:function(){this.settings.$li.length?this.settings.automate=setTimeout(function(){this.hide(),this.show(),this.startTimer()}.bind(this),this.settings.timer):clearTimeout(this.settings.automate)},end:function(){this.settings.cookie_monster&&a.cookie(this.settings.cookie_name,"ridden",{expires:this.settings.cookie_expires,domain:this.settings.cookie_domain}),this.settings.timer>0&&clearTimeout(this.settings.automate),this.settings.modal&&this.settings.expose&&this.un_expose(),this.settings.$next_tip.data("closed",!0),a(".joyride-modal-bg").hide(),this.settings.$current_tip.hide(),this.settings.post_step_callback(this.settings.$li.index(),this.settings.$current_tip),this.settings.post_ride_callback(this.settings.$li.index(),this.settings.$current_tip),a(".joyride-tip-guide").remove()},off:function(){a(this.scope).off(".joyride"),a(b).off(".joyride"),a(".joyride-close-tip, .joyride-next-tip, .joyride-modal-bg").off(".joyride"),a(".joyride-tip-guide, .joyride-modal-bg").remove(),clearTimeout(this.settings.automate),this.settings={}},reflow:function(){}}}(jQuery,this,this.document),function(a,b){"use strict";Foundation.libs.magellan={name:"magellan",version:"5.0.0",settings:{active_class:"active",threshold:0},init:function(){this.fixed_magellan=a("[data-magellan-expedition]"),this.set_threshold(),this.last_destination=a("[data-magellan-destination]").last(),this.events()},events:function(){var c=this;a(this.scope).off(".magellan").on("arrival.fndtn.magellan","[data-magellan-arrival]",function(){var b=a(this),d=b.closest("[data-magellan-expedition]"),e=d.attr("data-magellan-active-class")||c.settings.active_class;b.closest("[data-magellan-expedition]").find("[data-magellan-arrival]").not(b).removeClass(e),b.addClass(e)}),this.fixed_magellan.off(".magellan").on("update-position.fndtn.magellan",function(){a(this)}).trigger("update-position"),a(b).off(".magellan").on("resize.fndtn.magellan",function(){this.fixed_magellan.trigger("update-position")}.bind(this)).on("scroll.fndtn.magellan",function(){var d=a(b).scrollTop();c.fixed_magellan.each(function(){var b=a(this);"undefined"==typeof b.data("magellan-top-offset")&&b.data("magellan-top-offset",b.offset().top),"undefined"==typeof b.data("magellan-fixed-position")&&b.data("magellan-fixed-position",!1);var e=d+c.settings.threshold>b.data("magellan-top-offset"),f=b.attr("data-magellan-top-offset");b.data("magellan-fixed-position")!=e&&(b.data("magellan-fixed-position",e),e?(b.addClass("fixed"),b.css({position:"fixed",top:0})):(b.removeClass("fixed"),b.css({position:"",top:""})),e&&"undefined"!=typeof f&&0!=f&&b.css({position:"fixed",top:f+"px"}))})}),this.last_destination.length>0&&a(b).on("scroll.fndtn.magellan",function(){var d=a(b).scrollTop(),e=d+a(b).height(),f=Math.ceil(c.last_destination.offset().top);a("[data-magellan-destination]").each(function(){var b=a(this),g=b.attr("data-magellan-destination"),h=b.offset().top-b.outerHeight(!0)-d;h<=c.settings.threshold&&a("[data-magellan-arrival='"+g+"']").trigger("arrival"),e>=a(c.scope).height()&&f>d&&e>f&&a("[data-magellan-arrival]").last().trigger("arrival")})})},set_threshold:function(){"number"!=typeof this.settings.threshold&&(this.settings.threshold=this.fixed_magellan.length>0?this.fixed_magellan.outerHeight(!0):0)},off:function(){a(this.scope).off(".fndtn.magellan"),a(b).off(".fndtn.magellan")},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.offcanvas={name:"offcanvas",version:"5.0.0",settings:{},init:function(){this.events()},events:function(){a(this.scope).off(".offcanvas").on("click.fndtn.offcanvas",".left-off-canvas-toggle",function(b){b.preventDefault(),a(this).closest(".off-canvas-wrap").toggleClass("move-right")}).on("click.fndtn.offcanvas",".exit-off-canvas",function(b){b.preventDefault(),a(".off-canvas-wrap").removeClass("move-right")}).on("click.fndtn.offcanvas",".right-off-canvas-toggle",function(b){b.preventDefault(),a(this).closest(".off-canvas-wrap").toggleClass("move-left")}).on("click.fndtn.offcanvas",".exit-off-canvas",function(b){b.preventDefault(),a(".off-canvas-wrap").removeClass("move-left")})},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";var e=function(){},f=function(e,f){if(e.hasClass(f.slides_container_class))return this;var j,k,l,m,n,o,p=this,q=e,r=0,s=!1;q.children().first().addClass(f.active_slide_class),p.update_slide_number=function(b){f.slide_number&&(k.find("span:first").text(parseInt(b)+1),k.find("span:last").text(q.children().length)),f.bullets&&(l.children().removeClass(f.bullets_active_class),a(l.children().get(b)).addClass(f.bullets_active_class))},p.update_active_link=function(b){var c=a('a[data-orbit-link="'+q.children().eq(b).attr("data-orbit-slide")+'"]');c.parents("ul").find("[data-orbit-link]").removeClass(f.bullets_active_class),c.addClass(f.bullets_active_class)},p.build_markup=function(){q.wrap('<div class="'+f.container_class+'"></div>'),j=q.parent(),q.addClass(f.slides_container_class),f.navigation_arrows&&(j.append(a('<a href="#"><span></span></a>').addClass(f.prev_class)),j.append(a('<a href="#"><span></span></a>').addClass(f.next_class))),f.timer&&(m=a("<div>").addClass(f.timer_container_class),m.append("<span>"),m.append(a("<div>").addClass(f.timer_progress_class)),m.addClass(f.timer_paused_class),j.append(m)),f.slide_number&&(k=a("<div>").addClass(f.slide_number_class),k.append("<span></span> "+f.slide_number_text+" <span></span>"),j.append(k)),f.bullets&&(l=a("<ol>").addClass(f.bullets_container_class),j.append(l),l.wrap('<div class="orbit-bullets-container"></div>'),q.children().each(function(b){var c=a("<li>").attr("data-orbit-slide",b);l.append(c)})),f.stack_on_small&&j.addClass(f.stack_on_small_class),p.update_slide_number(0),p.update_active_link(0)},p._goto=function(b,c){if(b===r)return!1;"object"==typeof o&&o.restart();var d=q.children(),e="next";s=!0,r>b&&(e="prev"),b>=d.length?b=0:0>b&&(b=d.length-1);var g=a(d.get(r)),h=a(d.get(b));g.css("zIndex",2),g.removeClass(f.active_slide_class),h.css("zIndex",4).addClass(f.active_slide_class),q.trigger("before-slide-change.fndtn.orbit"),f.before_slide_change(),p.update_active_link(b);var i=function(){var a=function(){r=b,s=!1,c===!0&&(o=p.create_timer(),o.start()),p.update_slide_number(r),q.trigger("after-slide-change.fndtn.orbit",[{slide_number:r,total_slides:d.length}]),f.after_slide_change(r,d.length)};q.height()!=h.height()&&f.variable_height?q.animate({height:h.height()},250,"linear",a):a()};if(1===d.length)return i(),!1;var j=function(){"next"===e&&n.next(g,h,i),"prev"===e&&n.prev(g,h,i)};h.height()>q.height()&&f.variable_height?q.animate({height:h.height()},250,"linear",j):j()},p.next=function(a){a.stopImmediatePropagation(),a.preventDefault(),p._goto(r+1)},p.prev=function(a){a.stopImmediatePropagation(),a.preventDefault(),p._goto(r-1)},p.link_custom=function(b){b.preventDefault();var c=a(this).attr("data-orbit-link");if("string"==typeof c&&""!=(c=a.trim(c))){var d=j.find("[data-orbit-slide="+c+"]");-1!=d.index()&&p._goto(d.index())}},p.link_bullet=function(){var b=a(this).attr("data-orbit-slide");"string"==typeof b&&""!=(b=a.trim(b))&&p._goto(parseInt(b))},p.timer_callback=function(){p._goto(r+1,!0)},p.compute_dimensions=function(){var b=a(q.children().get(r)),c=b.height();f.variable_height||q.children().each(function(){a(this).height()>c&&(c=a(this).height())}),q.height(c)},p.create_timer=function(){var a=new g(j.find("."+f.timer_container_class),f,p.timer_callback);return a},p.stop_timer=function(){"object"==typeof o&&o.stop()},p.toggle_timer=function(){var a=j.find("."+f.timer_container_class);a.hasClass(f.timer_paused_class)?("undefined"==typeof o&&(o=p.create_timer()),o.start()):"object"==typeof o&&o.stop()},p.init=function(){p.build_markup(),f.timer&&(o=p.create_timer(),o.start()),n=new i(f,q),"slide"===f.animation&&(n=new h(f,q)),j.on("click","."+f.next_class,p.next),j.on("click","."+f.prev_class,p.prev),j.on("click","[data-orbit-slide]",p.link_bullet),j.on("click",p.toggle_timer),f.swipe&&j.on("touchstart.fndtn.orbit",function(a){a.touches||(a=a.originalEvent);var b={start_page_x:a.touches[0].pageX,start_page_y:a.touches[0].pageY,start_time:(new Date).getTime(),delta_x:0,is_scrolling:d};j.data("swipe-transition",b),a.stopPropagation()}).on("touchmove.fndtn.orbit",function(a){if(a.touches||(a=a.originalEvent),!(a.touches.length>1||a.scale&&1!==a.scale)){var b=j.data("swipe-transition");if("undefined"==typeof b&&(b={}),b.delta_x=a.touches[0].pageX-b.start_page_x,"undefined"==typeof b.is_scrolling&&(b.is_scrolling=!!(b.is_scrolling||Math.abs(b.delta_x)<Math.abs(a.touches[0].pageY-b.start_page_y))),!b.is_scrolling&&!b.active){a.preventDefault();var c=b.delta_x<0?r+1:r-1;b.active=!0,p._goto(c)}}}).on("touchend.fndtn.orbit",function(a){j.data("swipe-transition",{}),a.stopPropagation()}),j.on("mouseenter.fndtn.orbit",function(){f.timer&&f.pause_on_hover&&p.stop_timer()}).on("mouseleave.fndtn.orbit",function(){f.timer&&f.resume_on_mouseout&&o.start()}),a(c).on("click","[data-orbit-link]",p.link_custom),a(b).on("resize",p.compute_dimensions),a(b).on("load",p.compute_dimensions),a(b).on("load",function(){j.prev(".preloader").css("display","none")}),q.trigger("ready.fndtn.orbit")},p.init()},g=function(a,b,c){var d,e,f=this,g=b.timer_speed,h=a.find("."+b.timer_progress_class),i=-1;this.update_progress=function(a){var b=h.clone();b.attr("style",""),b.css("width",a+"%"),h.replaceWith(b),h=b},this.restart=function(){clearTimeout(e),a.addClass(b.timer_paused_class),i=-1,f.update_progress(0)},this.start=function(){return a.hasClass(b.timer_paused_class)?(i=-1===i?g:i,a.removeClass(b.timer_paused_class),d=(new Date).getTime(),h.animate({width:"100%"},i,"linear"),e=setTimeout(function(){f.restart(),c()},i),a.trigger("timer-started.fndtn.orbit"),void 0):!0},this.stop=function(){if(a.hasClass(b.timer_paused_class))return!0;clearTimeout(e),a.addClass(b.timer_paused_class);var c=(new Date).getTime();i-=c-d;var h=100-i/g*100;f.update_progress(h),a.trigger("timer-stopped.fndtn.orbit")}},h=function(b){var c=b.animation_speed,d=1===a("html[dir=rtl]").length,e=d?"marginRight":"marginLeft",f={};f[e]="0%",this.next=function(a,b,d){a.animate({marginLeft:"-100%"},c),b.animate(f,c,function(){a.css(e,"100%"),d()})},this.prev=function(a,b,d){a.animate({marginLeft:"100%"},c),b.css(e,"-100%"),b.animate(f,c,function(){a.css(e,"100%"),d()})}},i=function(b){{var c=b.animation_speed;1===a("html[dir=rtl]").length}this.next=function(a,b,d){b.css({margin:"0%",opacity:"0.01"}),b.animate({opacity:"1"},c,"linear",function(){a.css("margin","100%"),d()})},this.prev=function(a,b,d){b.css({margin:"0%",opacity:"0.01"}),b.animate({opacity:"1"},c,"linear",function(){a.css("margin","100%"),d()})}};Foundation.libs=Foundation.libs||{},Foundation.libs.orbit={name:"orbit",version:"5.0.0",settings:{animation:"slide",timer_speed:1e4,pause_on_hover:!0,resume_on_mouseout:!1,animation_speed:500,stack_on_small:!1,navigation_arrows:!0,slide_number:!0,slide_number_text:"of",container_class:"orbit-container",stack_on_small_class:"orbit-stack-on-small",next_class:"orbit-next",prev_class:"orbit-prev",timer_container_class:"orbit-timer",timer_paused_class:"paused",timer_progress_class:"orbit-progress",slides_container_class:"orbit-slides-container",bullets_container_class:"orbit-bullets",bullets_active_class:"active",slide_number_class:"orbit-slide-number",caption_class:"orbit-caption",active_slide_class:"active",orbit_transition_class:"orbit-transitioning",bullets:!0,timer:!0,variable_height:!1,swipe:!0,before_slide_change:e,after_slide_change:e},init:function(b,c){var d=this;if("object"==typeof c&&a.extend(!0,d.settings,c),a(b).is("[data-orbit]")){var e=a(b),g=d.data_options(e);new f(e,a.extend({},d.settings,g))}a("[data-orbit]",b).each(function(b,c){var e=a(c),g=d.data_options(e);new f(e,a.extend({},d.settings,g))})}}}(jQuery,this,this.document),function(a,b,c,d){"use strict";Foundation.libs.reveal={name:"reveal",version:"5.0.0",locked:!1,settings:{animation:"fadeAndPop",animation_speed:250,close_on_background_click:!0,close_on_esc:!0,dismiss_modal_class:"close-reveal-modal",bg_class:"reveal-modal-bg",open:function(){},opened:function(){},close:function(){},closed:function(){},bg:a(".reveal-modal-bg"),css:{open:{opacity:0,visibility:"visible",display:"block"},close:{opacity:1,visibility:"hidden",display:"none"}}},init:function(a,b,c){Foundation.inherit(this,"delay"),this.bindings(b,c)},events:function(){var b=this;return a("[data-reveal-id]",this.scope).off(".reveal").on("click.fndtn.reveal",function(c){if(c.preventDefault(),!b.locked){var d=a(this),e=d.data("reveal-ajax");if(b.locked=!0,"undefined"==typeof e)b.open.call(b,d);else{var f=e===!0?d.attr("href"):e;b.open.call(b,d,{url:f})}}}),a(this.scope).off(".reveal").on("click.fndtn.reveal",this.close_targets(),function(c){if(c.preventDefault(),!b.locked){var d=a("[data-reveal].open").data("reveal-init"),e=a(c.target)[0]===a("."+d.bg_class)[0];if(e&&!d.close_on_background_click)return;b.locked=!0,b.close.call(b,e?a("[data-reveal].open"):a(this).closest("[data-reveal]"))}}),a("[data-reveal]",this.scope).length>0?a(this.scope).on("open.fndtn.reveal",this.settings.open).on("opened.fndtn.reveal",this.settings.opened).on("opened.fndtn.reveal",this.open_video).on("close.fndtn.reveal",this.settings.close).on("closed.fndtn.reveal",this.settings.closed).on("closed.fndtn.reveal",this.close_video):a(this.scope).on("open.fndtn.reveal","[data-reveal]",this.settings.open).on("opened.fndtn.reveal","[data-reveal]",this.settings.opened).on("opened.fndtn.reveal","[data-reveal]",this.open_video).on("close.fndtn.reveal","[data-reveal]",this.settings.close).on("closed.fndtn.reveal","[data-reveal]",this.settings.closed).on("closed.fndtn.reveal","[data-reveal]",this.close_video),a("body").on("keyup.fndtn.reveal",function(b){var c=a("[data-reveal].open"),d=c.data("reveal-init");27===b.which&&d.close_on_esc&&c.foundation("reveal","close")}),!0},open:function(b,c){if(b)if("undefined"!=typeof b.selector)var d=a("#"+b.data("reveal-id"));else{var d=a(this.scope);c=b}else var d=a(this.scope);if(!d.hasClass("open")){var e=a("[data-reveal].open");if("undefined"==typeof d.data("css-top")&&d.data("css-top",parseInt(d.css("top"),10)).data("offset",this.cache_offset(d)),d.trigger("open"),e.length<1&&this.toggle_bg(),"undefined"!=typeof c&&c.url){var f=this,g="undefined"!=typeof c.success?c.success:null;a.extend(c,{success:function(b,c,h){a.isFunction(g)&&g(b,c,h),d.html(b),a(d).foundation("section","reflow"),f.hide(e,f.settings.css.close),f.show(d,f.settings.css.open)}}),a.ajax(c)}else this.hide(e,this.settings.css.close),this.show(d,this.settings.css.open)}},close:function(b){var b=b&&b.length?b:a(this.scope),c=a("[data-reveal].open");c.length>0&&(this.locked=!0,b.trigger("close"),this.toggle_bg(),this.hide(c,this.settings.css.close))},close_targets:function(){var a="."+this.settings.dismiss_modal_class;return this.settings.close_on_background_click?a+", ."+this.settings.bg_class:a},toggle_bg:function(){0===a("."+this.settings.bg_class).length&&(this.settings.bg=a("<div />",{"class":this.settings.bg_class}).appendTo("body")),this.settings.bg.filter(":visible").length>0?this.hide(this.settings.bg):this.show(this.settings.bg)},show:function(c,d){if(d){if(0===c.parent("body").length){var e=c.wrap('<div style="display: none;" />').parent();c.on("closed.fndtn.reveal.wrapped",function(){c.detach().appendTo(e),c.unwrap().unbind("closed.fndtn.reveal.wrapped")}),c.detach().appendTo("body")}if(/pop/i.test(this.settings.animation)){d.top=a(b).scrollTop()-c.data("offset")+"px";var f={top:a(b).scrollTop()+c.data("css-top")+"px",opacity:1};return this.delay(function(){return c.css(d).animate(f,this.settings.animation_speed,"linear",function(){this.locked=!1,c.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animation_speed/2)}if(/fade/i.test(this.settings.animation)){var f={opacity:1};return this.delay(function(){return c.css(d).animate(f,this.settings.animation_speed,"linear",function(){this.locked=!1,c.trigger("opened")}.bind(this)).addClass("open")}.bind(this),this.settings.animation_speed/2)}return c.css(d).show().css({opacity:1}).addClass("open").trigger("opened")}return/fade/i.test(this.settings.animation)?c.fadeIn(this.settings.animation_speed/2):c.show()},hide:function(c,d){if(d){if(/pop/i.test(this.settings.animation)){var e={top:-a(b).scrollTop()-c.data("offset")+"px",opacity:0};return this.delay(function(){return c.animate(e,this.settings.animation_speed,"linear",function(){this.locked=!1,c.css(d).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animation_speed/2)}if(/fade/i.test(this.settings.animation)){var e={opacity:0};return this.delay(function(){return c.animate(e,this.settings.animation_speed,"linear",function(){this.locked=!1,c.css(d).trigger("closed")}.bind(this)).removeClass("open")}.bind(this),this.settings.animation_speed/2)}return c.hide().css(d).removeClass("open").trigger("closed")}return/fade/i.test(this.settings.animation)?c.fadeOut(this.settings.animation_speed/2):c.hide()},close_video:function(){var b=a(this).find(".flex-video"),c=b.find("iframe");c.length>0&&(c.attr("data-src",c[0].src),c.attr("src","about:blank"),b.hide())
},open_video:function(){var b=a(this).find(".flex-video"),c=b.find("iframe");if(c.length>0){var e=c.attr("data-src");if("string"==typeof e)c[0].src=c.attr("data-src");else{var f=c[0].src;c[0].src=d,c[0].src=f}b.show()}},cache_offset:function(a){var b=a.show().height()+parseInt(a.css("top"),10);return a.hide(),b},off:function(){a(this.scope).off(".fndtn.reveal")},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.tab={name:"tab",version:"5.0.1",settings:{active_class:"active"},init:function(a,b,c){this.bindings(b,c)},events:function(){a(this.scope).off(".tab").on("click.fndtn.tab","[data-tab] > dd > a",function(b){b.preventDefault();var c=a(this).parent(),d=a("#"+this.href.split("#")[1]),e=c.siblings(),f=c.closest("[data-tab]").data("tab-init");c.addClass(f.active_class),e.removeClass(f.active_class),d.siblings().removeClass(f.active_class).end().addClass(f.active_class)})},off:function(){},reflow:function(){}}}(jQuery,this,this.document),function(a){"use strict";Foundation.libs.tooltip={name:"tooltip",version:"5.0.0",settings:{additional_inheritable_classes:[],tooltip_class:".tooltip",append_to:"body",touch_close_text:"Tap To Close",disable_for_touch:!1,tip_template:function(a,b){return'<span data-selector="'+a+'" class="'+Foundation.libs.tooltip.settings.tooltip_class.substring(1)+'">'+b+'<span class="nub"></span></span>'}},cache:{},init:function(a,b,c){this.bindings(b,c)},events:function(){var b=this;Modernizr.touch?a(this.scope).off(".tooltip").on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip","[data-tooltip]",function(c){var d=a.extend({},b.settings,b.data_options(a(this)));d.disable_for_touch||(c.preventDefault(),a(d.tooltip_class).hide(),b.showOrCreateTip(a(this)))}).on("click.fndtn.tooltip touchstart.fndtn.tooltip touchend.fndtn.tooltip",this.settings.tooltip_class,function(b){b.preventDefault(),a(this).fadeOut(150)}):a(this.scope).off(".tooltip").on("mouseenter.fndtn.tooltip mouseleave.fndtn.tooltip","[data-tooltip]",function(c){var d=a(this);/enter|over/i.test(c.type)?b.showOrCreateTip(d):("mouseout"===c.type||"mouseleave"===c.type)&&b.hide(d)})},showOrCreateTip:function(a){var b=this.getTip(a);return b&&b.length>0?this.show(a):this.create(a)},getTip:function(b){var c=this.selector(b),d=null;return c&&(d=a('span[data-selector="'+c+'"]'+this.settings.tooltip_class)),"object"==typeof d?d:!1},selector:function(a){var b=a.attr("id"),c=a.attr("data-tooltip")||a.attr("data-selector");return(b&&b.length<1||!b)&&"string"!=typeof c&&(c="tooltip"+Math.random().toString(36).substring(7),a.attr("data-selector",c)),b&&b.length>0?b:c},create:function(b){var c=a(this.settings.tip_template(this.selector(b),a("<div></div>").html(b.attr("title")).html())),d=this.inheritable_classes(b);c.addClass(d).appendTo(this.settings.append_to),Modernizr.touch&&c.append('<span class="tap-to-close">'+this.settings.touch_close_text+"</span>"),b.removeAttr("title").attr("title",""),this.show(b)},reposition:function(b,c,d){var e,f,g,h,i;if(c.css("visibility","hidden").show(),e=b.data("width"),f=c.children(".nub"),g=f.outerHeight(),h=f.outerHeight(),i=function(a,b,c,d,e,f){return a.css({top:b?b:"auto",bottom:d?d:"auto",left:e?e:"auto",right:c?c:"auto",width:f?f:"auto"}).end()},i(c,b.offset().top+b.outerHeight()+10,"auto","auto",b.offset().left,e),this.small())i(c,b.offset().top+b.outerHeight()+10,"auto","auto",12.5,a(this.scope).width()),c.addClass("tip-override"),i(f,-g,"auto","auto",b.offset().left);else{var j=b.offset().left;Foundation.rtl&&(j=b.offset().left+b.offset().width-c.outerWidth()),i(c,b.offset().top+b.outerHeight()+10,"auto","auto",j,e),c.removeClass("tip-override"),d&&d.indexOf("tip-top")>-1?i(c,b.offset().top-c.outerHeight(),"auto","auto",j,e).removeClass("tip-override"):d&&d.indexOf("tip-left")>-1?i(c,b.offset().top+b.outerHeight()/2-2.5*g,"auto","auto",b.offset().left-c.outerWidth()-g,e).removeClass("tip-override"):d&&d.indexOf("tip-right")>-1&&i(c,b.offset().top+b.outerHeight()/2-2.5*g,"auto","auto",b.offset().left+b.outerWidth()+g,e).removeClass("tip-override")}c.css("visibility","visible").hide()},small:function(){return matchMedia(Foundation.media_queries.small).matches},inheritable_classes:function(b){var c=["tip-top","tip-left","tip-bottom","tip-right","noradius"].concat(this.settings.additional_inheritable_classes),d=b.attr("class"),e=d?a.map(d.split(" "),function(b){return-1!==a.inArray(b,c)?b:void 0}).join(" "):"";return a.trim(e)},show:function(a){var b=this.getTip(a);this.reposition(a,b,a.attr("class")),b.fadeIn(150)},hide:function(a){var b=this.getTip(a);b.fadeOut(150)},reload:function(){var b=a(this);return b.data("fndtn-tooltips")?b.foundationTooltips("destroy").foundationTooltips("init"):b.foundationTooltips("init")},off:function(){a(this.scope).off(".fndtn.tooltip"),a(this.settings.tooltip_class).each(function(b){a("[data-tooltip]").get(b).attr("title",a(this).text())}).remove()},reflow:function(){}}}(jQuery,this,this.document),function(a,b,c){"use strict";Foundation.libs.topbar={name:"topbar",version:"5.0.1",settings:{index:0,sticky_class:"sticky",custom_back_text:!0,back_text:"Back",is_hover:!0,mobile_show_parent_link:!1,scrolltop:!0},init:function(b,c,d){Foundation.inherit(this,"addCustomRule register_media throttle");var e=this;e.register_media("topbar","foundation-mq-topbar"),this.bindings(c,d),a("[data-topbar]",this.scope).each(function(){{var b=a(this),c=b.data("topbar-init");a("section",this),a("> ul",this).first()}b.data("index",0);var d=b.parent();d.hasClass("fixed")||d.hasClass(c.sticky_class)?(e.settings.sticky_class=c.sticky_class,e.settings.stick_topbar=b,b.data("height",d.outerHeight()),b.data("stickyoffset",d.offset().top)):b.data("height",b.outerHeight()),c.assembled||e.assemble(b),c.is_hover?a(".has-dropdown",b).addClass("not-click"):a(".has-dropdown",b).removeClass("not-click"),e.addCustomRule(".f-topbar-fixed { padding-top: "+b.data("height")+"px }"),d.hasClass("fixed")&&a("body").addClass("f-topbar-fixed")})},toggle:function(c){var d=this;if(c)var e=a(c).closest("[data-topbar]");else var e=a("[data-topbar]");var f=e.data("topbar-init"),g=a("section, .section",e);d.breakpoint()&&(d.rtl?(g.css({right:"0%"}),a(">.name",g).css({right:"100%"})):(g.css({left:"0%"}),a(">.name",g).css({left:"100%"})),a("li.moved",g).removeClass("moved"),e.data("index",0),e.toggleClass("expanded").css("height","")),f.scrolltop?e.hasClass("expanded")?e.parent().hasClass("fixed")&&(f.scrolltop?(e.parent().removeClass("fixed"),e.addClass("fixed"),a("body").removeClass("f-topbar-fixed"),b.scrollTo(0,0)):e.parent().removeClass("expanded")):e.hasClass("fixed")&&(e.parent().addClass("fixed"),e.removeClass("fixed"),a("body").addClass("f-topbar-fixed")):(e.parent().hasClass(d.settings.sticky_class)&&e.parent().addClass("fixed"),e.parent().hasClass("fixed")&&(e.hasClass("expanded")?(e.addClass("fixed"),e.parent().addClass("expanded")):(e.removeClass("fixed"),e.parent().removeClass("expanded"),d.update_sticky_positioning())))},timer:null,events:function(){var c=this;a(this.scope).off(".topbar").on("click.fndtn.topbar","[data-topbar] .toggle-topbar",function(a){a.preventDefault(),c.toggle(this)}).on("click.fndtn.topbar","[data-topbar] li.has-dropdown",function(b){var d=a(this),e=a(b.target),f=d.closest("[data-topbar]"),g=f.data("topbar-init");return e.data("revealId")?(c.toggle(),void 0):(c.breakpoint()||(!g.is_hover||Modernizr.touch)&&(b.stopImmediatePropagation(),d.hasClass("hover")?(d.removeClass("hover").find("li").removeClass("hover"),d.parents("li.hover").removeClass("hover")):(d.addClass("hover"),"A"===e[0].nodeName&&e.parent().hasClass("has-dropdown")&&b.preventDefault())),void 0)}).on("click.fndtn.topbar","[data-topbar] .has-dropdown>a",function(b){if(c.breakpoint()){b.preventDefault();var d=a(this),e=d.closest("[data-topbar]"),f=e.find("section, .section"),g=(d.next(".dropdown").outerHeight(),d.closest("li"));e.data("index",e.data("index")+1),g.addClass("moved"),c.rtl?(f.css({right:-(100*e.data("index"))+"%"}),f.find(">.name").css({right:100*e.data("index")+"%"})):(f.css({left:-(100*e.data("index"))+"%"}),f.find(">.name").css({left:100*e.data("index")+"%"})),e.css("height",d.siblings("ul").outerHeight(!0)+e.data("height"))}}),a(b).off(".topbar").on("resize.fndtn.topbar",c.throttle(function(){c.resize.call(c)},50)).trigger("resize"),a("body").off(".topbar").on("click.fndtn.topbar touchstart.fndtn.topbar",function(b){var c=a(b.target).closest("li").closest("li.hover");c.length>0||a("[data-topbar] li").removeClass("hover")}),a(this.scope).on("click.fndtn.topbar","[data-topbar] .has-dropdown .back",function(b){b.preventDefault();var d=a(this),e=d.closest("[data-topbar]"),f=e.find("section, .section"),g=(e.data("topbar-init"),d.closest("li.moved")),h=g.parent();e.data("index",e.data("index")-1),c.rtl?(f.css({right:-(100*e.data("index"))+"%"}),f.find(">.name").css({right:100*e.data("index")+"%"})):(f.css({left:-(100*e.data("index"))+"%"}),f.find(">.name").css({left:100*e.data("index")+"%"})),0===e.data("index")?e.css("height",""):e.css("height",h.outerHeight(!0)+e.data("height")),setTimeout(function(){g.removeClass("moved")},300)})},resize:function(){var b=this;a("[data-topbar]").each(function(){var d,e=a(this),f=(e.data("topbar-init"),e.parent("."+b.settings.sticky_class));if(!b.breakpoint()){var g=e.hasClass("expanded");e.css("height","").removeClass("expanded").find("li").removeClass("hover"),g&&b.toggle(e)}f.length>0&&(f.hasClass("fixed")?(f.removeClass("fixed"),d=f.offset().top,a(c.body).hasClass("f-topbar-fixed")&&(d-=e.data("height")),e.data("stickyoffset",d),f.addClass("fixed")):(d=f.offset().top,e.data("stickyoffset",d)))})},breakpoint:function(){return!matchMedia(Foundation.media_queries.topbar).matches},assemble:function(b){{var c=b.data("topbar-init"),d=a("section",b);a("> ul",b).first()}d.detach(),a(".has-dropdown>a",d).each(function(){var b=a(this),d=b.siblings(".dropdown"),e=b.attr("href");if(c.mobile_show_parent_link&&e&&e.length>1)var f=a('<li class="title back js-generated"><h5><a href="#"></a></h5></li><li><a class="parent-link js-generated" href="'+e+'">'+b.text()+"</a></li>");else var f=a('<li class="title back js-generated"><h5><a href="#"></a></h5></li>');1==c.custom_back_text?a("h5>a",f).html(c.back_text):a("h5>a",f).html("&laquo; "+b.html()),d.prepend(f)}),d.appendTo(b),this.sticky(),this.assembled(b)},assembled:function(b){b.data("topbar-init",a.extend({},b.data("topbar-init"),{assembled:!0}))},height:function(b){var c=0;return a("> li",b).each(function(){c+=a(this).outerHeight(!0)}),c},sticky:function(){var c=(a(b),this);a(b).on("scroll",function(){c.update_sticky_positioning()})},update_sticky_positioning:function(){var c="."+this.settings.sticky_class,d=a(b);if(a(c).length>0){var e=this.settings.sticky_topbar.data("stickyoffset");a(c).hasClass("expanded")||(d.scrollTop()>e?a(c).hasClass("fixed")||(a(c).addClass("fixed"),a("body").addClass("f-topbar-fixed")):d.scrollTop()<=e&&a(c).hasClass("fixed")&&(a(c).removeClass("fixed"),a("body").removeClass("f-topbar-fixed")))}},off:function(){a(this.scope).off(".fndtn.topbar"),a(b).off(".fndtn.topbar")},reflow:function(){}}}(jQuery,this,this.document);