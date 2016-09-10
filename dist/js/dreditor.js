/*!
 * Dreditor v2.0.0 (https://dreditor.org)
 * Copyright (c) 2016 Mark Carver (https://www.drupal.org/u/markcarver)
 * Licensed under MIT (https://github.com/unicorn-fail/dreditor/blob/2.x/LICENSE-MIT)
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dreditor = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

// there's 3 implementations written in increasing order of efficiency

// 1 - no Set type is defined
function uniqNoSet(arr) {
	var ret = [];

	for (var i = 0; i < arr.length; i++) {
		if (ret.indexOf(arr[i]) === -1) {
			ret.push(arr[i]);
		}
	}

	return ret;
}

// 2 - a simple Set type is defined
function uniqSet(arr) {
	var seen = new Set();
	return arr.filter(function (el) {
		if (!seen.has(el)) {
			seen.add(el);
			return true;
		}

		return false;
	});
}

// 3 - a standard Set type is defined and it has a forEach method
function uniqSetWithForEach(arr) {
	var ret = [];

	(new Set(arr)).forEach(function (el) {
		ret.push(el);
	});

	return ret;
}

// V8 currently has a broken implementation
// https://github.com/joyent/node/issues/8449
function doesForEachActuallyWork() {
	var ret = false;

	(new Set([true])).forEach(function (el) {
		ret = el;
	});

	return ret === true;
}

if ('Set' in global) {
	if (typeof Set.prototype.forEach === 'function' && doesForEachActuallyWork()) {
		module.exports = uniqSetWithForEach;
	} else {
		module.exports = uniqSet;
	}
} else {
	module.exports = uniqNoSet;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
/*!
 * Sync/Async forEach
 * https://github.com/cowboy/javascript-sync-async-foreach
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

(function(exports) {

  // Iterate synchronously or asynchronously.
  exports.forEach = function(arr, eachFn, doneFn) {
    var i = -1;
    // Resolve array length to a valid (ToUint32) number.
    var len = arr.length >>> 0;

    // This IIFE is called once now, and then again, by name, for each loop
    // iteration.
    (function next(result) {
      // This flag will be set to true if `this.async` is called inside the
      // eachFn` callback.
      var async;
      // Was false returned from the `eachFn` callback or passed to the
      // `this.async` done function?
      var abort = result === false;

      // Increment counter variable and skip any indices that don't exist. This
      // allows sparse arrays to be iterated.
      do { ++i; } while (!(i in arr) && i !== len);

      // Exit if result passed to `this.async` done function or returned from
      // the `eachFn` callback was false, or when done iterating.
      if (abort || i === len) {
        // If a `doneFn` callback was specified, invoke that now. Pass in a
        // boolean value representing "not aborted" state along with the array.
        if (doneFn) {
          doneFn(!abort, arr);
        }
        return;
      }

      // Invoke the `eachFn` callback, setting `this` inside the callback to a
      // custom object that contains one method, and passing in the array item,
      // index, and the array.
      result = eachFn.call({
        // If `this.async` is called inside the `eachFn` callback, set the async
        // flag and return a function that can be used to continue iterating.
        async: function() {
          async = true;
          return next;
        }
      }, arr[i], i, arr);

      // If the async flag wasn't set, continue by calling `next` synchronously,
      // passing in the result of the `eachFn` callback.
      if (!async) {
        next(result);
      }
    }());
  };

}(typeof exports === "object" && exports || this));
},{}],3:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],4:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],5:[function(require,module,exports){
'use strict';

var v4 = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}';
var v6 = '(?:(?:[0-9a-fA-F:]){1,4}(?:(?::(?:[0-9a-fA-F]){1,4}|:)){2,7})+';

var ip = module.exports = function (opts) {
	opts = opts || {};
	return opts.exact ? new RegExp('(?:^' + v4 + '$)|(?:^' + v6 + '$)') :
	                    new RegExp('(?:' + v4 + ')|(?:' + v6 + ')', 'g');
};

ip.v4 = function (opts) {
	opts = opts || {};
	return opts.exact ? new RegExp('^' + v4 + '$') : new RegExp(v4, 'g');
};

ip.v6 = function (opts) {
	opts = opts || {};
	return opts.exact ? new RegExp('^' + v6 + '$') : new RegExp(v6, 'g');
};

},{}],6:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],7:[function(require,module,exports){
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;
  
  if (isObjectObject(o) === false) return false;
  
  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;
  
  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;
  
  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }
  
  // Most likely a plain Object
  return true;
};

},{"isobject":8}],8:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object'
    && !Array.isArray(val);
};

},{}],9:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],10:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isArray = require('isarray');

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && isArray(val) === false;
};

},{"isarray":9}],11:[function(require,module,exports){
'use strict';
var ipRegex = require('ip-regex');

module.exports = function (opts) {
	opts = opts || {};

	var protocol = '(?:(?:[a-z]+:)?//)';
	var auth = '(?:\\S+(?::\\S*)?@)?';
	var ip = ipRegex.v4().source;
	var host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
	var domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
	var tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';
	var port = '(?::\\d{2,5})?';
	var path = '(?:[/?#][^\\s"]*)?';
	var regex = [
		'(?:' + protocol + '|www\\.)' + auth, '(?:localhost|' + ip + '|' + host + domain + tld + ')',
		port, path
	].join('');

	return opts.exact ? new RegExp('(?:^' + regex + '$)', 'i') :
						new RegExp(regex, 'ig');
};

},{"ip-regex":5}],12:[function(require,module,exports){
(function (global){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorLocaleBase2 = require('./DreditorLocaleBase');

var _DreditorLocaleBase3 = _interopRequireDefault(_DreditorLocaleBase2);

var _DreditorParser = require('./DreditorParser');

var _DreditorParser2 = _interopRequireDefault(_DreditorParser);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Dreditor = function (_DreditorLocaleBase) {
  _inherits(Dreditor, _DreditorLocaleBase);

  /**
   * @class Dreditor
   *
   * @param {Object} [options]
   *   Any additional options to pass along to the object when instantiating.
   *
   * @constructor
   */
  function Dreditor() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Dreditor);

    // Ensure there is a valid Promise API available.
    var _this = _possibleConstructorReturn(this, (Dreditor.__proto__ || Object.getPrototypeOf(Dreditor)).call(this, _DreditorUtility2.default.extend(true, {}, Dreditor.__defaultOptions__, options)));

    var promise = _this.getOption('promise');
    if (!(typeof promise !== 'function' || (typeof promise === 'undefined' ? 'undefined' : _typeof(promise)) !== 'object') || typeof (promise.then || typeof promise === 'function' && new promise(_DreditorUtility2.default.noop)).then !== 'function') {
      throw new Error('Dreditor requires a valid Promise API. There are several polyfills or comprehensive libraries available to choose from.');
    }

    // Bind a highlight method for hunks, if one exists.
    var highlighter = _this.getOption('highlighter');
    if (highlighter) {
      _this.on('render.hunk.start', function (e, hunk) {
        hunk.highlightCode();
      });
    }

    // Set the "sanitize.encodeHtmlEntities" option based on whether there
    // was a "highlighter" option provided.
    if (_this.getOption('sanitize.encodeHtmlEntities') === null) {
      _this.setOption('sanitize.encodeHtmlEntities', !highlighter);
    }
    return _this;
  }

  /**
   * Parses a Diff string.
   *
   * @param {String} string
   *   The string to parse.
   * @param {DreditorUrl|String} [url=null]
   *   A URL to associate with the string.
   *
   * @return {Promise}
   *   A promise.
   */


  _createClass(Dreditor, [{
    key: 'parse',
    value: function parse(string) {
      var url = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return this.promise(function (fulfill, reject) {
        try {
          var parser = new _DreditorParser2.default(this, string, url);
          fulfill(parser.parse());
        } catch (e) {
          reject(e);
        }
      });
    }
  }]);

  return Dreditor;
}(_DreditorLocaleBase3.default);

/**
 * The version.
 *
 * @type {String}
 */


exports.default = Dreditor;
Dreditor.__version__ = '2.0.0';

/**
 * The default options for Dreditor.
 *
 * @type {Object}
 */
Dreditor.__defaultOptions__ = {

  /**
   * Flag indicating whether or not to automatically free up memory resources.
   *
   * Warning: disabling this may cause excessive memory usage. Only disable if
   * you know what you're doing and plan on manually managing it.
   *
   * @type {Boolean}
   */
  garbageCollect: true,

  /**
   * A function that will highlight code found in the diff.
   *
   * @type {PrismJS|Object|Function}
   */
  highlighter: null,

  /**
   * Helper function to highlight the code found in the diff.
   *
   * Note: This highlight function makes the assumption that the highlighter
   * being used is PrismJS. If you choose to implement a different highlighter,
   * you will likely need to override this function in the options provided to
   * Dreditor.
   *
   * @param {String} string
   *   The content to be highlighted.
   *
   * @return {String}
   *   The string that was passed, modified if highlight was successful.
   *
   * @type {Function|false}
   *
   * @this {DreditorHunk}
   */
  highlightCode: function highlightCode(string) {

    /**
     * The highlighter object or function.
     *
     * @type {Function|Object}
     */
    var highlighter = this.getOption('highlighter');

    // See if the highlighter provided is PrismJS by checking the necessary
    // functions and objects inside the passed highlighter.
    if (highlighter && _DreditorUtility2.default.isFunction(highlighter.highlight) && _DreditorUtility2.default.isFunction(highlighter.Token) && _DreditorUtility2.default.isPlainObject(highlighter.languages) && _DreditorUtility2.default.isPlainObject(highlighter.languages.markup)) {
      // Determine the correct language grammar object to use for Prism.
      var prismLanguage = this.getOption('prismLanguage', _DreditorUtility2.default.noop);
      var language = prismLanguage.call(this, highlighter) || 'markup';
      // Highlight the string.
      string = highlighter.highlight(string, highlighter.languages[language], language);
    }
    // Otherwise if the highlighter option provided is a function, see if it
    // returns any output.
    else if (_DreditorUtility2.default.isFunction(highlighter)) {
        var ret = highlighter.apply(highlighter, string);
        return ret || string;
      }
    return string;
  },

  /**
   * Helper function to retrieve the language grammar object for Prism.
   *
   * @param {Function|Object} Prism
   *   The PrismJS object, if it exists.
   *
   * @return {Object|void}
   *   A grammar object for the language, based on the file extension, if any.
   *
   * @this {DreditorHunk}
   */
  prismLanguage: function prismLanguage(Prism) {
    // Immediately return if an explicit language exists for the file extension.
    if (_DreditorUtility2.default.isPlainObject(Prism.languages[this.file.extension])) {
      return this.file.extension;
    }

    /** @type Object */
    var map = this.getOption('prismExtensionLanguageMap', {});

    // Otherwise, attempt to find the appropriate language based on extension.
    _DreditorUtility2.default.forEach([].concat(map[this.file.extension] || []), function (language) {
      if (_DreditorUtility2.default.isPlainObject(Prism.languages[language])) {
        return language;
      }
    });
  },


  /**
   * The PrismJS extension -> language map.
   *
   * @type {Object}
   */
  prismExtensionLanguageMap: {
    coffee: ['coffeescript', 'javascript'],
    htaccess: 'apacheconf',
    inc: 'php',
    info: 'ini',
    md: 'markdown',
    yml: 'yaml'
  },

  /**
   * A Promise constructor.
   *
   * @type {Promise}
   */
  promise: global.Promise,

  /**
   * Flag indicating whether or not to render to a string.
   *
   * By default, the rendered output of any Dreditor object will be an instance
   * of DreditorElement. This allows for further manipulation of the elements,
   * in an OO way, before they're ultimately converted into a string.
   *
   * When the object is joined with a string, it will automatically render the
   * DreditorElement instance (and its children) into strings using the magic
   * `toString` method.
   *
   * If you have an object or method that does different things based on
   * whether the provided value is a string or an object and you're not seeing
   * any output, then typecast the return value of a Dreditor object's render
   * method to a string when passing the value. An example using jQuery:
   *
   * ```js
   *   $('#content').html('' + parser.render());
   * ```
   *
   * If you find that ugly or have absolutely no need for further manipulation
   * of the DreditorElement object, you can set this option to `true` to
   * enforce that any render method will always return a string.
   *
   * @type {Boolean}
   */
  renderToString: false,

  /**
   * Sanitization options.
   *
   * @type {Object}
   */
  sanitize: {

    /**
     * Flag indicating whether or not to remove commented lines.
     *
     * Commented lines start with "#" and are likely from an IDE.
     *
     * @type {Boolean}
     */
    comments: true,

    /**
     * Flag indicating whether or not to replace HTML entities.
     *
     * By default, this value is populated based solely on whether or not
     * the "highlighter" was passed a value as most highlighters will encode
     * HTML entities themselves. You can always explicitly set this to `true`
     * or `false` if you are not getting the desired results.
     *
     * @type {Boolean}
     */
    encodeHtmlEntities: null,

    /**
     * Flag indicating whether or not to remove SVN "new file" lines.
     *
     * @type {Boolean}
     */
    svnNewFiles: true

  }

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./DreditorLocaleBase":22,"./DreditorParser":23,"./DreditorUtility":28}],13:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorAttributes = function () {

  /**
   * @class DreditorAttributes
   *
   * @param {DreditorAttributes|Object} [attributes]
   *   An Attributes object with existing data or a plain object where the key
   *   is the attribute name and the value is the attribute value.
   *
   * @constructor
   */
  function DreditorAttributes() {
    var attributes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, DreditorAttributes);

    /*! Attributes (http://cgit.drupalcode.org/bootstrap/tree/js/attributes.js) * Copyright (c) 2016 Mark Carver <https://www.drupal.org/u/markcarver> * Licensed under GPL-2.0 (https://www.drupal.org/about/licensing) */ // eslint-disable-line

    /**
     * The internal object containing the data for the attributes.
     *
     * @type {Object}
     */
    this.data = {};
    this.data['class'] = [];

    this.merge(attributes);
  }

  /**
   * Renders the attributes object as a string to inject into an HTML element.
   *
   * @return {String}
   *   A string representation of the attributes array, intended to be injected
   *   into a DOM element.
   */


  _createClass(DreditorAttributes, [{
    key: 'toString',
    value: function toString() {
      var output = '';
      var name;
      var value;
      for (name in this.data) {
        if (!this.data.hasOwnProperty(name)) {
          continue;
        }
        value = this.data[name];
        if (_DreditorUtility2.default.isFunction(value)) {
          value = value.call(this);
        }
        if (_DreditorUtility2.default.isObject(value)) {
          var values = [];
          for (var i in value) {
            if (value.hasOwnProperty(i)) {
              values.push(value[i]);
            }
          }
          value = values;
        }
        if (_DreditorUtility2.default.isArray(value)) {
          value = value.join(' ');
        }
        // Don't add an empty class array.
        if (name === 'class' && !value) {
          continue;
        }
        output += ' ' + _DreditorUtility2.default.encodeHtmlEntities(name) + '="' + _DreditorUtility2.default.encodeHtmlEntities(value) + '"';
      }
      return output;
    }

    /**
     * Add class(es) to the Attributes object.
     *
     * @param {...String|Array} value
     *   An individual class or an array of classes to add.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'addClass',
    value: function addClass(value) {
      var args = Array.prototype.slice.call(arguments);
      var classes = [];
      for (var i = 0, l = args.length; i < l; i++) {
        classes = classes.concat(this.sanitizeClass(args[i]));
      }
      this.data['class'] = _DreditorUtility2.default.arrayUniq(this.data['class'].concat(classes));
      return this;
    }

    /**
     * Indicates whether an attribute exists in the Attributes object.
     *
     * @param {String} name
     *   An attribute name to check.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'exists',
    value: function exists(name) {
      return this.data[name] !== void 0 && this.data[name] !== null;
    }

    /**
     * Retrieve a specific attribute from the Attributes object.
     *
     * @param {String} name
     *   The specific attribute to retrieve.
     * @param {*} [defaultValue=null]
     *   (optional) The default value to set if the attribute does not exist.
     *
     * @return {*}
     *   A specific attribute value, passed by reference.
     */

  }, {
    key: 'get',
    value: function get(name, defaultValue) {
      if (!this.exists(name)) {
        this.data[name] = defaultValue !== void 0 ? defaultValue : null;
      }
      return this.data[name];
    }

    /**
     * Retrieves a cloned copy of the internal attributes data object.
     *
     * @return {Object}
     *   The cloned copy of the attribute data.
     */

  }, {
    key: 'getData',
    value: function getData() {
      return _DreditorUtility2.default.extend({}, this.data);
    }

    /**
     * Retrieves classes from the Attributes object.
     *
     * @return {Array}
     *   The classes array.
     */

  }, {
    key: 'getClasses',
    value: function getClasses() {
      return this.get('class', []);
    }

    /**
     * Indicates whether a class is present in the Attributes object.
     *
     * @param {String|Array} className
     *   The class name(s) to search for.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'hasClass',
    value: function hasClass(className) {
      className = this.sanitizeClass(className);
      var classes = this.getClasses();
      for (var i = 0, l = className.length; i < l; i++) {
        // If one of the classes fails, immediately return false.
        if (_DreditorUtility2.default.indexOf(classes, className[i]) === -1) {
          return false;
        }
      }
      return true;
    }

    /**
     * Merges multiple values into the Attributes object.
     *
     * @param {DreditorAttributes|Object|String} attributes
     *   An Attributes object with existing data or a plain object where the key
     *   is the attribute name and the value is the attribute value.
     * @param {Boolean} [recursive]
     *   Flag determining whether or not to recursively merge key/value pairs.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'merge',
    value: function merge(attributes, recursive) {
      attributes = attributes instanceof DreditorAttributes ? attributes.getData() : attributes;

      // Ensure any passed are sanitized.
      if (attributes && attributes['class'] !== void 0) {
        attributes['class'] = this.sanitizeClass(attributes['class']);
      }

      if (recursive === void 0 || recursive) {
        this.data = _DreditorUtility2.default.extend(true, {}, this.data, attributes);
      } else {
        this.data = _DreditorUtility2.default.extend({}, this.data, attributes);
      }

      // Ensure classes are unique after merge.
      this.data['class'] = _DreditorUtility2.default.arrayUniq(this.data['class']);

      return this;
    }

    /**
     * Removes an attribute from the Attributes object.
     *
     * @param {String} name
     *   The name of the attribute to remove.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'remove',
    value: function remove(name) {
      if (this.exists(name)) {
        delete this.data[name];
      }
      return this;
    }

    /**
     * Removes a class from the Attributes object.
     *
     * @param {...String|Array} value
     *   An individual class or an array of classes to remove.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'removeClass',
    value: function removeClass(value) {
      var args = Array.prototype.slice.apply(arguments);
      var classes = this.getClasses();
      var values = [];
      for (var i = 0, l = args.length; i < l; i++) {
        values = values.concat(this.sanitizeClass(args[i]));
        for (var ii = 0, ll = values.length; ii < ll; ii++) {
          var index = _DreditorUtility2.default.indexOf(classes, values[ii]);
          if (index !== -1) {
            classes.slice(index, 1);
          }
        }
      }
      return this;
    }

    /**
     * Replaces a class in the Attributes object.
     *
     * @param {String} oldValue
     *   The old class to remove.
     * @param {String} newValue
     *   The new class. It will not be added if the old class does not exist.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'replaceClass',
    value: function replaceClass(oldValue, newValue) {
      var classes = this.getClasses();
      var i = _DreditorUtility2.default.indexOf(classes, oldValue);
      if (i !== -1) {
        classes[i] = newValue;
      }
      return this;
    }

    /**
     * Ensures class is an array and/or split into individual array items.
     *
     * @param {String|Array} classes
     *   The class or classes to sanitize.
     *
     * @return {Array}
     *   A sanitized array of classes.
     */

  }, {
    key: 'sanitizeClass',
    value: function sanitizeClass(classes) {
      var sanitized = [];
      classes = [].concat(classes).filter(Boolean);
      for (var i = 0, l = classes.length; i < l; i++) {
        var value = classes[i].split(' ').filter(Boolean);
        for (var ii = 0, ll = value.length; ii < ll; ii++) {
          sanitized.push(value[ii]);
        }
      }
      return sanitized;
    }

    /**
     * Sets an attribute on the Attributes object.
     *
     * @param {String} name
     *   The name of the attribute to set.
     * @param {*} value
     *   The value of the attribute to set.
     *
     * @return {DreditorAttributes}
     *   The Attributes instance.
     *
     * @chainable
     */

  }, {
    key: 'set',
    value: function set(name, value) {
      this.data[name] = name === 'class' ? this.sanitizeClass(value) : value;
      return this;
    }
  }]);

  return DreditorAttributes;
}();

exports.default = DreditorAttributes;

},{"./DreditorUtility":28}],14:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorEmitter2 = require('./DreditorEmitter');

var _DreditorEmitter3 = _interopRequireDefault(_DreditorEmitter2);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorBase = function (_DreditorEmitter) {
  _inherits(DreditorBase, _DreditorEmitter);

  /**
   * @class DreditorBase
   *
   * @param {Object} [options={}]
   *   Options to override defaults.
   */
  function DreditorBase() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, DreditorBase);

    /**
     * The options.
     *
     * @type {Object}
     */
    var _this = _possibleConstructorReturn(this, (DreditorBase.__proto__ || Object.getPrototypeOf(DreditorBase)).call(this));

    _this.options = _DreditorUtility2.default.extend(true, {}, options);
    return _this;
  }

  /**
   * Retrieves an option.
   *
   * @param {String} name
   *   The option name. It can also be a namespaced (using dot notation) key to
   *   retrieve a deeply nested option value.
   * @param {*} [defaultValue=null]
   *   The default value to return, if no option has been set.
   *
   * @return {*|null}
   *   The option value or `null` if there is no option or it hasn't been set.
   */


  _createClass(DreditorBase, [{
    key: 'getOption',
    value: function getOption(name) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var ret = _DreditorUtility2.default.getProperty(name, this.options);
      return ret === null ? defaultValue : ret;
    }

    /**
     * Creates a new Promise.
     *
     * @param {Function} resolver
     *   The resolver function for the Promise. It will automatically be bound
     *   to the object that invoked this method.
     *
     * @return {Promise}
     *   A new Promise object.
     *
     * @see Dreditor.promise
     */

  }, {
    key: 'promise',
    value: function promise(resolver) {
      var promise = this.getOption('promise');
      return new promise(resolver.bind(this));
    }

    /**
     * Sanitizes a string.
     *
     * @param {String} string
     *   The string to sanitize.
     * @param {Boolean} [force=false]
     *   Bypasses option and forces sanitization.
     *
     * @return {String}
     *   The sanitized string.
     */

  }, {
    key: 'sanitize',
    value: function sanitize(string) {
      var force = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      // Always replace CRLF and CR characters with LF. This is necessary for
      // the parser to function properly, which assumes that everything is a LF.
      string = string.replace(/\r\n|\r/g, '\n');

      // Remove comments.
      if (force || this.getOption('sanitize.comments')) {
        string = string.replace(/^#[^\n]*\n/gm, '');
      }

      // Encode HTML entities.
      if (force || this.getOption('sanitize.encodeHtmlEntities')) {
        string = _DreditorUtility2.default.encodeHtmlEntities(string);
      }

      // Remove SVN new files.
      if (force || this.getOption('sanitize.svnNewFiles')) {
        string = string.replace(/^\?[^\n]*\n/gm, '');
      }

      return string;
    }

    /**
     * Retrieves an option.
     *
     * @param {String} name
     *   The option name. It can also be a namespaced (using dot notation) key to
     *   retrieve a deeply nested option value.
     * @param {*} [value=null]
     *   The value to set, if no option has been set.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'setOption',
    value: function setOption(name) {
      var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var p = name && name.split('.') || [];
      if (p.length === 1) {
        this.options[p[0]] = value;
        return this;
      }
      try {
        var obj = p.reduce(function (obj, i) {
          return !_DreditorUtility2.default.isPlainObject(obj[i]) ? obj : obj[i];
        }, this.options);
        obj[p[p.length - 1]] = value;
      } catch (e) {
        // Intentionally left empty.
      }
      return this;
    }
  }]);

  return DreditorBase;
}(_DreditorEmitter3.default);

exports.default = DreditorBase;

},{"./DreditorEmitter":17,"./DreditorUtility":28}],15:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorRenderable2 = require('./DreditorRenderable');

var _DreditorRenderable3 = _interopRequireDefault(_DreditorRenderable2);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorDiff = function (_DreditorRenderable) {
  _inherits(DreditorDiff, _DreditorRenderable);

  /**
   * @class DreditorDiff
   *
   * @param {Dreditor} dreditor
   *   The Dreditor instance.
   * @param {String} string
   *   The raw diff string.
   *
   * @constructor
   */
  function DreditorDiff(dreditor, string) {
    _classCallCheck(this, DreditorDiff);

    var _this = _possibleConstructorReturn(this, (DreditorDiff.__proto__ || Object.getPrototypeOf(DreditorDiff)).call(this, dreditor));

    if (typeof string !== 'string') {
      throw new Error('The argument passed must be a string. This was passed instead: ' + string);
    }

    /**
     * The number additions.
     *
     * @type {Number}
     */
    _this.additions = 0;

    /**
     * The number of deletions.
     *
     * @type {Number}
     */
    _this.deletions = 0;

    /**
     * The un-altered string that was passed.
     *
     * @type {String}
     */
    _this.raw = string;

    /**
     * The un-altered byte size of the string that was passed.
     *
     * @type {Number}
     */
    _this.rawSize = string.length;

    /**
     * The patch byte size, minute any meta information.
     *
     * @type {Number}
     */
    _this.size = 0;
    return _this;
  }

  /**
   * Creates a promised based parse task with start and end emitted events.
   *
   * @param {String} name
   *   The name of the parse task. It will be used as the emitted event and
   *   will be prepended with "parse" and appended with both a "start" and
   *   "stop" namespace. If no name is provided the emitted event will simply
   *   be "parse".
   * @param {Function} callback
   *   The parse callback that will be invoked inside the Promise. Once the
   *   parse task has ended, the return value of the task will be the object
   *   that originally invoked the task.
   *
   * @return {Promise}
   *   A Promise object.
   */


  _createClass(DreditorDiff, [{
    key: 'doParse',
    value: function doParse(name, callback) {
      var _this2 = this;

      return this.doTask(name ? 'parse.' + name : 'parse', function () {
        return _this2.resolve(callback.call(_this2));
      }).then(function () {
        var value = _this2.resolve(_this2);
        _this2.garbageCollect('parse');
        return value;
      });
    }

    /**
     * {@inheritDoc}
     *
     * @param {String} [type='default']
     *   The type of garbage collection.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorDiff.prototype.__proto__ || Object.getPrototypeOf(DreditorDiff.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.raw = null;
      }
      return collect;
    }

    /**
     * Parses a DreditorDiff object.
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      return this.reject(new Error('You must subclass the "parse" method of DreditorDiff before invoking it.'));
    }

    /**
     * Function to help render consistent diff stats through out all the objects.
     *
     * @param {Object<DreditorDiff>} [object=this]
     *   An object to render stats for; it must be an instance of DreditorDiff.
     *   If no object was passed, then the instance that invoked this method will
     *   be used.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement object containing the rendered HTML. Can be cast to
     *   a string value or manually invoked using the toString method.
     */

  }, {
    key: 'renderDiffStats',
    value: function renderDiffStats() {
      var object = arguments.length <= 0 || arguments[0] === undefined ? this : arguments[0];

      if (!(object instanceof DreditorDiff)) {
        throw new Error('The "object" argument passed is not an instance of DreditorDiff: ' + object);
      }
      return _DreditorUtility2.default.createElement('<span>').addClass('dreditor-stat').append('<span class="dreditor-stat-additions" title="' + object.additions + ' additions">+' + object.additions + '</span>').append('<span class="dreditor-stat-deletions" title="' + object.deletions + ' deletions">-' + object.deletions + '</span>');
    }
  }]);

  return DreditorDiff;
}(_DreditorRenderable3.default);

exports.default = DreditorDiff;

},{"./DreditorRenderable":26,"./DreditorUtility":28}],16:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorAttributes = require('./DreditorAttributes');

var _DreditorAttributes2 = _interopRequireDefault(_DreditorAttributes);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorElement = function () {

  /**
   * @class DreditorElement
   *
   * @param {String} [tag=null]
   *   The element tag name.
   * @param {DreditorAttributes|Object} [attributes={}]
   *   Optional. The attributes to initialize with.
   * @param {String} [value=null]
   *   The text value.
   *
   * @constructor
   */
  function DreditorElement() {
    var tag = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var value = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, DreditorElement);

    /**
     * The Attributes object for this instance.
     *
     * @type {DreditorAttributes}
     */
    this.attributes = attributes instanceof _DreditorAttributes2.default ? attributes : new _DreditorAttributes2.default(attributes);

    /**
     * The child DreditorElement objects, if any.
     *
     * @type {Array}
     */
    this.children = [];

    /**
     * Flag determining whether or not the element should be rendered.
     *
     * @type {boolean}
     */
    this.enabled = true;

    /**
     * The tag name of the element.
     *
     * @type {String}
     */
    this.tag = tag;

    /**
     * The text value of the element, if any.
     *
     * @type {String}
     */
    this.value = value;

    /**
     * Flag indicating whether or not this is a void element.
     *
     * @type {Boolean}
     *   True or false.
     */
    this.voidElement = tag && _DreditorUtility2.default.indexOf(DreditorElement.voidElements, tag) !== -1;
  }

  /**
   * Add class(es) to the element's Attributes object.
   *
   * @param {...String|Array} value
   *   An individual class or an array of classes to add.
   *
   * @return {DreditorElement|String}
   *   The DreditorElement instance.
   *
   * @chainable
   */


  _createClass(DreditorElement, [{
    key: 'addClass',
    value: function addClass(value) {
      this.attributes.addClass.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Appends content to this element as a child DreditorElement object.
     *
     * @param {DreditorElement|String} content
     *   The content used to create the element. Must be fully enclosed HTML tags.
     * @param {DreditorAttributes|Object} [attributes]
     *   Optional. The attributes to initialize the content with.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     */

  }, {
    key: 'append',
    value: function append(content, attributes) {
      this.children.push(DreditorElement.create(content, attributes));
      return this;
    }

    /**
     * Appends this element as a child of the provided DreditorElement object.
     *
     * @param {DreditorElement} element
     *   The DreditorElement object to append this object inside of.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     */

  }, {
    key: 'appendTo',
    value: function appendTo(element) {
      if (!(element instanceof DreditorElement)) {
        throw new Error('You can only append to another DreditorElement instance.');
      }
      element.append(this);
      return this;
    }

    /**
     * Clones a DreditorElement object.
     *
     * @return {DreditorElement}
     *   The cloned DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'clone',
    value: function clone() {
      var clone = new DreditorElement(this.tag, this.attributes.getData());
      if (this.value) {
        clone.value = this.value;
      }
      for (var i = 0, l = this.children.length; i < l; i++) {
        clone.children.push(this.children[i].clone());
      }
      return clone;
    }

    /**
     * Disables an element from rendering.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'disable',
    value: function disable() {
      this.enabled = false;
      return this;
    }

    /**
     * Enables an element for rendering.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'enable',
    value: function enable() {
      this.enabled = true;
      return this;
    }

    /**
     * Retrieve a specific attribute from the element's Attributes object.
     *
     * @param {String} name
     *   The specific attribute to retrieve.
     * @param {*} [defaultValue=null]
     *   (optional) The default value to set if the attribute does not exist.
     *
     * @return {*}
     *   A specific attribute value, passed by reference.
     */

  }, {
    key: 'getAttribute',
    value: function getAttribute(name, defaultValue) {
      return this.attributes.get.apply(this.attributes, arguments);
    }

    /**
     * Retrieves classes from the element's Attributes object.
     *
     * @return {Array}
     *   The classes array.
     */

  }, {
    key: 'getClasses',
    value: function getClasses() {
      return this.attributes.getClasses.apply(this.attributes, arguments);
    }

    /**
     * Indicates whether an attribute exists in the element's Attributes object.
     *
     * @param {String} name
     *   An attribute name to check.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'hasAttribute',
    value: function hasAttribute(name) {
      return this.attributes.exists.apply(this.attributes, arguments);
    }

    /**
     * Indicates whether a class is present in the element's Attributes object.
     *
     * @param {String|Array} className
     *   The class name(s) to search for.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'hasClass',
    value: function hasClass(className) {
      return this.attributes.hasClass.apply(this.attributes, arguments);
    }

    /**
     * Sets or retrieves the inner HTML content (children) of this element.
     *
     * @param {DreditorElement|String} [content]
     *   The content to set. Must be fully enclosed HTML tags.
     *
     * @return {DreditorElement|String}
     *   If no content was provided, then the current value of the element's inner
     *   HTML (children) will be rendered. If content was provided, then the
     *   DreditorElement instance will be returned.
     *
     * @chainable
     */

  }, {
    key: 'html',
    value: function html(content) {
      // If any argument was provided, then it's in "set" mode.
      if (content !== void 0) {
        // Clear out any children.
        this.children = [];
        // Only set the content if there's value.
        if (content) {
          this.append(content);
        }
        return this;
      } else {
        var output = '';
        for (var i = 0, l = this.children; i < l; i++) {
          output += this.children[i].toString();
        }
        return output;
      }
    }

    /**
     * Prepends content to this element as a child DreditorElement object.
     *
     * @param {DreditorElement|String} content
     *   The content used to create the element. Must be fully enclosed HTML tags.
     * @param {DreditorAttributes|Object} [attributes]
     *   Optional. The attributes to initialize the content with.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     */

  }, {
    key: 'prepend',
    value: function prepend(content, attributes) {
      this.children.unshift(DreditorElement.create(content, attributes));
      return this;
    }

    /**
     * Prepends this element as a child of the provided DreditorElement object.
     *
     * @param {DreditorElement} element
     *   The DreditorElement object to prepend this object inside of.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     */

  }, {
    key: 'prependTo',
    value: function prependTo(element) {
      if (!(element instanceof DreditorElement)) {
        throw new Error('You can only prepend to another DreditorElement instance.');
      }
      element.prepend(this);
      return this;
    }

    /**
     * Removes an attribute from the Attributes object.
     *
     * @param {String} name
     *   The name of the attribute to remove.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'removeAttribute',
    value: function removeAttribute(name) {
      this.attributes.remove.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Removes a class from the element's Attributes object.
     *
     * @param {...String|Array} value
     *   An individual class or an array of classes to remove.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'removeClass',
    value: function removeClass(value) {
      this.attributes.removeClass.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Replaces a class in the element's Attributes object.
     *
     * @param {String} oldValue
     *   The old class to remove.
     * @param {String} newValue
     *   The new class. It will not be added if the old class does not exist.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'replaceClass',
    value: function replaceClass(oldValue, newValue) {
      this.attributes.replaceClass.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Sets an attribute on the element's Attributes object.
     *
     * @param {String} name
     *   The name of the attribute to set.
     * @param {*} value
     *   The value of the attribute to set.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'setAttribute',
    value: function setAttribute(name, value) {
      this.attributes.set.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Sets an attribute on the element's Attributes object.
     *
     * @param {DreditorAttributes|Object} attributes
     *   An Attributes object with existing data or a plain object where the key
     *   is the attribute name and the value is the attribute value.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement instance.
     *
     * @chainable
     */

  }, {
    key: 'setAttributes',
    value: function setAttributes(attributes) {
      this.attributes.merge.apply(this.attributes, arguments);
      return this;
    }

    /**
     * Sets or retrieves the text value of the element.
     *
     * @param {String} [string]
     *   The text string to set. Any HTML will be escaped.
     *
     * @return {DreditorElement|String}
     *   If no string value was provided, then the current value of the element
     *   will be returned. If a string value was provided, then the DreditorElement
     *   instance will be returned.
     *
     * @chainable
     */

  }, {
    key: 'text',
    value: function text(string) {
      if (string !== void 0) {
        this.children = [];
        this.value = _DreditorUtility2.default.encodeHtmlEntities(string);
        return this;
      } else {
        return this.value || '';
      }
    }

    /**
     * Renders an element to a string.
     *
     * @return {String}
     *   The rendered HTML output.
     */

  }, {
    key: 'toString',
    value: function toString() {
      var output = '';

      // Skip if the element is not enabled.
      if (!this.enabled) {
        return output;
      }

      if (this.tag) {
        // To ensure backwards comparability, add a "self-closing" forward slash
        // for void element since HTML5 ignores these anyway.
        output += '<' + this.tag + this.attributes + (this.voidElement ? ' /' : '') + '>';
      }

      // Parser set a text element as child.
      if (!this.value && this.children.length === 1 && !(this.children[0] instanceof DreditorElement)) {
        this.value = this.children[0];
        this.children = [];
      }

      if (this.value) {
        output += this.value;
      }

      // Render any value or children.
      if (this.children.length) {
        for (var i = 0, l = this.children.length; i < l; i++) {
          output += this.children[i].toString();
        }
      }

      // Only close if there is a tag and it isn't a void element.
      if (this.tag && !this.voidElement) {
        output += '</' + this.tag + '>\n';
      }

      return output;
    }
  }]);

  return DreditorElement;
}();

/**
 * The void elements.
 *
 * @type {String[]}
 */


exports.default = DreditorElement;
DreditorElement.voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

/**
 * Creates a new DreditorElement.
 *
 * @param {DreditorElement|String} [content=null]
 *   The content used to create the element. Must be fully enclosed HTML tags.
 * @param {DreditorAttributes|Object} [attributes={}]
 *   Optional. The attributes to initialize the content with.
 *
 * @return {DreditorElement|String}
 *   A new DreditorElement instance or a string value.
 */
DreditorElement.create = function create() {
  var content = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
  var attributes = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (content instanceof DreditorElement) {
    return content.setAttributes(attributes);
  }
  var tag = content && content.match(/^<?(\w+)[^>]*>?$/);
  if (tag) {
    return new DreditorElement(tag[1]);
  } else {
    var element = new DreditorElement();
    element.value = content;
    return element;
  }
};

},{"./DreditorAttributes":13,"./DreditorUtility":28}],17:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorEvent = require('./DreditorEvent');

var _DreditorEvent2 = _interopRequireDefault(_DreditorEvent);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorEmitter = function () {

  /**
   * @class DreditorEmitter
   *
   * @constructor
   */
  function DreditorEmitter() {
    _classCallCheck(this, DreditorEmitter);

    /**
     * A list of listeners.
     *
     * @type {Object}
     */
    this.listeners = {};
  }

  /**
   * Emit an event.
   *
   * @param {String} type
   *   A string representing the type of the event to emit. An event type can be
   *   namespaced using dot notation, e.g.:
   *   - a.b.c (invoked first)
   *   - a.b   (invoked second)
   *   - a     (invoked last)
   * @param {...*} [args]
   *   Any additional arguments to pass to the listener. The "this" object for
   *   any bound listener will be the object that originally emitted the event.
   *   In case a listener has bound the callback to a different object, the
   *   object that originally emitted will be appended to the end of the supplied
   *   arguments. See existing objects for examples.
   *
   * @return {Boolean}
   *   True or false. If even one listener returns "false", the entire emitted
   *   event fails and will immediately return. This specifically prevents other
   *   less specific namespaced listeners from being invoked.
   */


  _createClass(DreditorEmitter, [{
    key: 'emit',
    value: function emit(type) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (!type || typeof type !== 'string') {
        throw new Error('Invalid event type: ' + type);
      }

      // Retrieve any listeners. Attempt to use any defined "dreditor" property
      // first before attempting to use any defined "listeners" property.
      var listeners = [];

      // Find all potential listeners that match the event type.
      for (var name in this.listeners) {
        if (type.match(new RegExp(name))) {
          listeners = listeners.concat(this.listeners[name]);
        }
      }

      // Go ahead and return true if there are no listeners to invoke.
      if (!listeners.length) {
        return true;
      }

      // Create an event object.
      var event = new _DreditorEvent2.default(type);

      // Set the object that emitted the event.
      event.setTarget(this);

      // Prepend arguments with the event object.
      args.unshift(event);

      // Iterate over the listeners.
      _DreditorUtility2.default.forEach(listeners, function (listener) {
        listener.apply(_this, args);
      });

      // Return whether or not the event was prevented.
      return !event.defaultPrevented;
    }

    /**
     * Removes either a specific listener or all listeners for an event type.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} [listener]
     *   The event listener.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'off',
    value: function off(type, listener) {
      // Immediately return if there is no event type.
      if (!this.listeners[type]) {
        return this;
      }

      // Remove all events of a specific type.
      if (!listener) {
        this.listeners[type] = [];
        return this;
      }

      // Remove a specific listener.
      for (var i = 0, l = this.listeners[type].length; i < l; i++) {
        if (this.listeners[type][i] === listener) {
          this.listeners[type].splice(i, 1);
          break;
        }
      }
      return this;
    }

    /**
     * Adds a listener for an event type.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} listener
     *   The event listener.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'on',
    value: function on(type, listener) {
      if (!this.listeners[type]) {
        this.listeners[type] = [];
      }
      this.listeners[type].push(listener);
      return this;
    }

    /**
     * Adds a listener for an event type that is only invoked once.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} listener
     *   The event listener.
     *
     * @chainable
     *
     * @return {Dreditor}
     *   The Diff instance.
     */

  }, {
    key: 'once',
    value: function once(type, listener) {
      var once = function once() {
        this.off(type, once);
        listener.apply(this, arguments);
      };
      return this.on(type, once);
    }
  }]);

  return DreditorEmitter;
}();

exports.default = DreditorEmitter;

},{"./DreditorEvent":18,"./DreditorUtility":28}],18:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorEvent =

/**
 * @class DreditorEvent
 *
 * @param {String} type
 *   The event type.
 *
 * @constructor
 */
function DreditorEvent(type) {
  _classCallCheck(this, DreditorEvent);

  // Read-only/internal variables.
  var defaultPrevented = false;
  var eventTarget = null;
  var namespace = type.split('.').filter(Boolean);
  var eventType = namespace.shift();
  Object.defineProperty(this, 'defaultPrevented', {
    get: function get() {
      return defaultPrevented;
    }
  });
  Object.defineProperty(this, 'namespace', { value: [''].concat(namespace).join('.') });
  Object.defineProperty(this, 'timeStamp', { value: Date.now() });
  Object.defineProperty(this, 'type', { value: eventType });
  Object.defineProperty(this, 'preventDefault', {
    value: function value() {
      defaultPrevented = true;
    }
  });
  Object.defineProperty(this, 'setTarget', {
    value: function value(object) {
      if (eventTarget === null) {
        eventTarget = object;
      }
    }
  });
  Object.defineProperty(this, 'target', {
    get: function get() {
      return eventTarget;
    }
  });
};

exports.default = DreditorEvent;

},{}],19:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorDiff2 = require('./DreditorDiff');

var _DreditorDiff3 = _interopRequireDefault(_DreditorDiff2);

var _DreditorHunk = require('./DreditorHunk');

var _DreditorHunk2 = _interopRequireDefault(_DreditorHunk);

var _DreditorPatch = require('./DreditorPatch');

var _DreditorPatch2 = _interopRequireDefault(_DreditorPatch);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorFile = function (_DreditorDiff) {
  _inherits(DreditorFile, _DreditorDiff);

  /**
   * @class DreditorFile
   *
   * @param {DreditorPatch} patch
   *   The DreditorPatch object this file belongs to.
   * @param {String} string
   *   The contents of a diff file section.
   *
   * @constructor
   */
  function DreditorFile(patch, string) {
    _classCallCheck(this, DreditorFile);

    if (!(patch instanceof _DreditorPatch2.default)) {
      throw new Error('The "patch" argument must be an instance of DreditorPatch: ' + patch);
    }

    /**
     * The DreditorPatch object this file belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorPatch}
     */
    var _this = _possibleConstructorReturn(this, (DreditorFile.__proto__ || Object.getPrototypeOf(DreditorFile)).call(this, patch.dreditor, string));

    Object.defineProperty(_this, 'patch', {
      value: patch,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * The file extension.
     *
     * @type {String}
     */
    _this.extension = null;

    /**
     * The filename.
     *
     * @type {String}
     */
    _this.filename = null;

    /**
     * An array of DreditorHunk objects.
     *
     * @type {DreditorHunk[]}
     */
    _this.hunks = [];

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    _this.index = null;

    /**
     * The source file in the diff.
     *
     * @type {String}
     */
    _this.source = null;

    /**
     * The status of this file: added, deleted, modified or renamed.
     *
     * @type {String}
     */
    _this.status = null;

    /**
     * The target file in the diff.
     *
     * @type {String}
     */
    _this.target = null;
    return _this;
  }

  /**
   * {@inheritDoc}
   *
   * @param {String} [type='default']
   *   The type of garbage collection.
   *
   * @return {Boolean}
   *   True or false.
   */


  _createClass(DreditorFile, [{
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorFile.prototype.__proto__ || Object.getPrototypeOf(DreditorFile.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.patch = null;
      }
      return collect;
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      var _this2 = this;

      return this.doParse('file', function () {
        // Separate file into hunks.
        var hunks = _this2.raw.split(/^@@+\s/gm).filter(Boolean);

        // Extract the file information from the first hunk.
        _DreditorUtility2.default.forEach(hunks.shift().split(/\n/), function (line) {
          // Skip null values.
          if (/\/dev\/null/.test(line)) {
            return;
          }
          if (/^index\s/.test(line)) {
            _this2.index = line.replace(/^index\s/, '');
          } else if (/^---\s/.test(line)) {
            _this2.source = line.replace(/^---\s(a\/)?/, '');
          } else if (/^\+\+\+\s/.test(line)) {
            _this2.target = line.replace(/^\+\+\+\s(b\/)?/, '');
          }
        });

        if (!_this2.source && _this2.target) {
          _this2.filename = _this2.target;
          _this2.status = 'added';
        } else if (_this2.source && !_this2.target) {
          _this2.filename = _this2.source;
          _this2.status = 'deleted';
        } else if (_this2.source && _this2.target && _this2.source !== _this2.target) {
          _this2.filename = _this2.source + ' -> ' + _this2.target;
          _this2.status = 'renamed';
        } else if (_this2.source === _this2.target) {
          _this2.filename = _this2.target;
          _this2.status = 'modified';
        }

        // Determine the extension to associate with the DreditorFile object.
        _this2.extension = _DreditorUtility2.default.extension(_this2.target ? _this2.target : _this2.source);

        // Parse the hunks.
        return _this2.map(hunks, function (string, i) {
          var hunk = new _DreditorHunk2.default(_this2, string);
          return hunk.parse().then(function () {
            hunk.id = 'hunk-' + (i + 1);
            hunk.index = i;
            _this2.size += hunk.size;
            _this2.hunks[i] = hunk;
          });
        });
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return this.doRender('file', function () {
        _this3.rendered = _DreditorUtility2.default.createElement('<div>', _this3.attributes).addClass('dreditor-file');

        var header = _DreditorUtility2.default.createElement('<div>').addClass('dreditor-file-header').appendTo(_this3.rendered);

        // Create file info.
        _DreditorUtility2.default.createElement('<div>').addClass('dreditor-file-info').appendTo(header).append(_this3.renderDiffStats()).append(_this3.renderStatus()).append(_this3.renderFilename());

        var wrapper = _DreditorUtility2.default.createElement('<div>').addClass('dreditor-file-table-wrapper').appendTo(_this3.rendered);
        var table = _DreditorUtility2.default.createElement('<table>').addClass('dreditor-file-table').appendTo(wrapper);
        var body = _DreditorUtility2.default.createElement('<tbody>').appendTo(table);

        // Render the hunks.
        return _this3.map([].concat(_this3.hunks), function (hunk) {
          return hunk.render().then(function (content) {
            return body.append(content);
          });
        });
      });
    }

    /**
     * Renders the filename.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement object containing the rendered HTML. Can be cast to
     *   a string value or manually invoked using the toString method.
     */

  }, {
    key: 'renderFilename',
    value: function renderFilename() {
      return _DreditorUtility2.default.createElement('<span>').addClass('dreditor-filename').text(this.filename);
    }

    /**
     * Determines which abbreviation to use for the status.
     *
     * @return {DreditorElement|String}
     *   The DreditorElement object containing the rendered HTML. Can be cast to
     *   a string value or manually invoked using the toString method.
     */

  }, {
    key: 'renderStatus',
    value: function renderStatus() {
      var status = '?';
      if (this.status === 'added') {
        status = 'A';
      } else if (this.status === 'deleted') {
        status = 'D';
      } else if (this.status === 'modified') {
        status = 'M';
      } else if (this.status === 'renamed') {
        status = 'R';
      }
      return _DreditorUtility2.default.createElement('<span>').text(status).addClass(['dreditor-file-status', 'dreditor-file-status--' + (this.status ? this.status : 'unknown')]).setAttribute('title', this.status[0].toUpperCase() + this.status.substr(1));
    }
  }]);

  return DreditorFile;
}(_DreditorDiff3.default);

exports.default = DreditorFile;

},{"./DreditorDiff":15,"./DreditorHunk":20,"./DreditorPatch":24,"./DreditorUtility":28}],20:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorDiff2 = require('./DreditorDiff');

var _DreditorDiff3 = _interopRequireDefault(_DreditorDiff2);

var _DreditorFile = require('./DreditorFile');

var _DreditorFile2 = _interopRequireDefault(_DreditorFile);

var _DreditorLine = require('./DreditorLine');

var _DreditorLine2 = _interopRequireDefault(_DreditorLine);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorHunk = function (_DreditorDiff) {
  _inherits(DreditorHunk, _DreditorDiff);

  /**
   * @class DreditorHunk
   *
   * @param {DreditorFile} file
   *   The DreditorFile object this hunk belongs to.
   * @param {String} string
   *   The hunk string.
   *
   * @constructor
   */
  function DreditorHunk(file, string) {
    _classCallCheck(this, DreditorHunk);

    if (!(file instanceof _DreditorFile2.default)) {
      throw new Error('The "file" argument must be an instance of DreditorFile: ' + file);
    }

    /**
     * The DreditorFile object this hunk belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorFile}
     */
    var _this = _possibleConstructorReturn(this, (DreditorHunk.__proto__ || Object.getPrototypeOf(DreditorHunk)).call(this, file.dreditor, string));

    Object.defineProperty(_this, 'file', {
      value: file,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * The hunk header, if any.
     *
     * @type {String}
     */
    _this.header = null;

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    _this.index = null;

    /**
     * An array of DreditorLine objects.
     *
     * @type {DreditorLine[]}
     */
    _this.lines = [];

    /**
     * The hunk meta information.
     *
     * @type {String}
     */
    _this.meta = null;

    /**
     * The source meta info.
     *
     * @type {{start: Number, total: Number}}
     */
    _this.source = { start: 0, total: 0 };

    /**
     * The target meta info.
     *
     * @type {{start: Number, total: Number}}
     */
    _this.target = { start: 0, total: 0 };
    return _this;
  }

  /**
   * {@inheritDoc}
   *
   * @param {String} [type='default']
   *   The type of garbage collection.
   *
   * @return {Boolean}
   *   True or false.
   */


  _createClass(DreditorHunk, [{
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorHunk.prototype.__proto__ || Object.getPrototypeOf(DreditorHunk.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.file = null;
      }
      return collect;
    }

    /**
     * Highlights code in the hunk.
     */

  }, {
    key: 'highlightCode',
    value: function highlightCode() {
      var _this2 = this;

      // Join each line value to simulate the hunk in its entirety.
      var string = '';
      _DreditorUtility2.default.forEach(this.lines, function (line, i) {
        string += line.value + (i !== _this2.lines.length - 1 ? '\n' : '');
      });

      var callback = this.getDreditorOption('highlightCode', _DreditorUtility2.default.noop);

      // Highlight the hunk code and split into an array of lines.
      var ret = (callback.apply(this, [string]) || '').split('\n').filter(Boolean);

      // Iterate over the return and set the corresponding line.
      _DreditorUtility2.default.forEach(ret, function (line, i) {
        _this2.lines[i].value = line;
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      var _this3 = this;

      return this.doParse('hunk', function () {
        // Extract hunk meta information.
        var info = _this3.raw.match(/^[^\n]+/);
        if (info[0]) {
          // Extract the "at" separator, and prepend it to the meta information.
          // This was removed from the hunk split in DreditorFile.
          var at = info[0].match(/\s?(@@+)\s?/);
          _this3.meta = (at && at[1] && at[1] + ' ' || '') + info[0];

          var parts = info[0].split(/\s?@@+\s?/);
          if (parts[1]) {
            _this3.header = parts[1];
          }

          var source;
          var target;
          var ranges = parts[0].split(' ');
          if (ranges[0][0] === '-') {
            source = ranges[0].substr(1).split(',');
            target = ranges[1].substr(1).split(',');
          } else {
            source = ranges[1].substr(1).split(',');
            target = ranges[0].substr(1).split(',');
          }
          _this3.source.start = parseInt(source[0], 10);
          _this3.source.total = parseInt(source[1] || 0, 10);
          _this3.target.start = parseInt(target[0], 10);
          _this3.target.total = parseInt(target[1] || 0, 10);
        }

        var sourceStart = _this3.source.start;
        var targetStart = _this3.target.start;

        var lines = _this3.raw.replace(/^[^\n]*\n/, '').split(/\n/).filter(Boolean);

        // Parse the lines.
        return _this3.map(lines, function (string, i) {
          var line = new _DreditorLine2.default(_this3, string);
          return line.parse().then(function () {
            line.id = 'line-' + (i + 1);
            line.index = i;
            _this3.size += line.size;
            switch (line.status) {
              case 'added':
                line.lineNumbers.target = targetStart++;
                break;
              case 'deleted':
                line.lineNumbers.source = sourceStart++;
                break;

              default:
                line.lineNumbers.source = sourceStart++;
                line.lineNumbers.target = targetStart++;
                break;
            }
            _this3.lines[i] = line;
          });
        });
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      var _this4 = this;

      return this.doRender('hunk', function () {
        // Just create an empty element to house the rows.
        _this4.rendered = _DreditorUtility2.default.createElement();

        if (_this4.meta) {
          _DreditorUtility2.default.createElement('<tr>', _this4.attributes).addClass(['dreditor-line', 'dreditor-line--hunk']).append('<td data-line-number="..." class="dreditor-line-number"></td>').append('<td data-line-number="..." class="dreditor-line-number"></td>').append('<td>' + _this4.meta + '</td>').appendTo(_this4.rendered);
        }

        // Render the lines.
        return _this4.map([].concat(_this4.lines), function (line) {
          return line.render().then(function (content) {
            return _this4.rendered.append(content);
          });
        });
      });
    }
  }]);

  return DreditorHunk;
}(_DreditorDiff3.default);

exports.default = DreditorHunk;

},{"./DreditorDiff":15,"./DreditorFile":19,"./DreditorLine":21,"./DreditorUtility":28}],21:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorDiff2 = require('./DreditorDiff');

var _DreditorDiff3 = _interopRequireDefault(_DreditorDiff2);

var _DreditorHunk = require('./DreditorHunk');

var _DreditorHunk2 = _interopRequireDefault(_DreditorHunk);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorLine = function (_DreditorDiff) {
  _inherits(DreditorLine, _DreditorDiff);

  /**
   * @class DreditorLine
   *
   * @param {DreditorHunk} hunk
   *   The DreditorHunk object that this line belongs to.
   * @param {String} string
   *   The line of text.
   *
   * @constructor
   */
  function DreditorLine(hunk, string) {
    _classCallCheck(this, DreditorLine);

    if (!(hunk instanceof _DreditorHunk2.default)) {
      throw new Error('The "hunk" argument must be an instance of DreditorHunk: ' + hunk);
    }

    /**
     * The DreditorHunk object this line belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorHunk}
     */
    var _this = _possibleConstructorReturn(this, (DreditorLine.__proto__ || Object.getPrototypeOf(DreditorLine)).call(this, hunk.dreditor, string));

    Object.defineProperty(_this, 'hunk', {
      value: hunk,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    _this.index = null;

    /**
     * The source and target line numbers.
     *
     * @type {{source: Number, target: Number}}
     */
    _this.lineNumbers = { source: 0, target: 0 };

    /**
     * The status of the line.
     *
     * @type {String}
     */
    _this.status = null;

    /**
     * The value of the line.
     *
     * @type {String}
     */
    _this.value = null;
    return _this;
  }

  /**
   * {@inheritDoc}
   *
   * @param {String} [type='default']
   *   The type of garbage collection.
   *
   * @return {Boolean}
   *   True or false.
   */


  _createClass(DreditorLine, [{
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorLine.prototype.__proto__ || Object.getPrototypeOf(DreditorLine.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.hunk = null;
      }
      return collect;
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      var _this2 = this;

      return this.doParse('line', function () {
        // Determine if this line was added, deleted or purely contextual.
        _this2.status = _this2.raw[0] === '+' && 'added' || _this2.raw[0] === '-' && 'deleted' || 'context';

        _this2.attributes.addClass('dreditor-line--' + _this2.status);

        // Remove the first character from the string as the "value".
        _this2.value = _this2.raw.substr(1);

        // Set the size of the line.
        _this2.size = _this2.value.length;

        // Increase stats.
        switch (_this2.status) {
          case 'added':
            _this2.hunk.additions++;
            _this2.hunk.file.additions++;
            _this2.hunk.file.patch.additions++;
            _this2.hunk.file.patch.parser.additions++;
            break;

          case 'deleted':
            _this2.hunk.deletions++;
            _this2.hunk.file.deletions++;
            _this2.hunk.file.patch.deletions++;
            _this2.hunk.file.patch.parser.deletions++;
            break;
        }

        return _this2.resolve(_this2.value);
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return this.doRender('line', function () {
        _this3.rendered = _DreditorUtility2.default.createElement('<tr>', _this3.attributes).addClass(['dreditor-line', 'dreditor-line--' + _this3.status]).setAttribute('id', _this3.id);

        // Source line number.
        _DreditorUtility2.default.createElement('<td>').appendTo(_this3.rendered).addClass('dreditor-line-number').setAttribute('id', _this3.id + 'S' + _this3.lineNumbers.source).setAttribute('data-line-number', _this3.lineNumbers.source ? _this3.lineNumbers.source : '');

        // Target line number.
        _DreditorUtility2.default.createElement('<td>').appendTo(_this3.rendered).addClass('dreditor-line-number').setAttribute('id', _this3.id + 'T' + _this3.lineNumbers.target).setAttribute('data-line-number', _this3.lineNumbers.target ? _this3.lineNumbers.target : '');

        // Source code.
        var code = _DreditorUtility2.default.createElement('<td>').appendTo(_this3.rendered).addClass('dreditor-line-code');
        _DreditorUtility2.default.createElement('<span>').appendTo(code).addClass('dreditor-line-code-inner').html('' + (_this3.status === 'added' && '+' || _this3.status === 'deleted' && '-' || ' ') + _this3.value);

        return _this3.resolve(_this3.rendered);
      });
    }
  }]);

  return DreditorLine;
}(_DreditorDiff3.default);

exports.default = DreditorLine;

},{"./DreditorDiff":15,"./DreditorHunk":20,"./DreditorUtility":28}],22:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DreditorBase2 = require('./DreditorBase');

var _DreditorBase3 = _interopRequireDefault(_DreditorBase2);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorLocaleBase = function (_DreditorBase) {
  _inherits(DreditorLocaleBase, _DreditorBase);

  function DreditorLocaleBase() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, DreditorLocaleBase);

    /**
     * The current language code.
     *
     * @type {String}
     */
    var _this = _possibleConstructorReturn(this, (DreditorLocaleBase.__proto__ || Object.getPrototypeOf(DreditorLocaleBase)).call(this, _DreditorUtility2.default.extend(true, {}, DreditorLocaleBase.__defaultOptions__, options)));

    _this.langCode = _this.getOption('langCode', 'en-US');

    /**
     * The locale object.
     *
     * @type {Object}
     */
    _this.locale = _this.getOption('locale', {});
    return _this;
  }

  /**
   * Generates a translated locale string for a given locale key.
   *
   * @param {String} text
   *   The text to translate.
   * @param {String} [langCode]
   *   Overrides the currently set langCode option.
   *
   * @return {String}
   *   The translated string.
   */


  _createClass(DreditorLocaleBase, [{
    key: 't',
    value: function t(text) {
      var langCode = arguments.length <= 1 || arguments[1] === undefined ? this.langCode : arguments[1];

      if (this.locale[langCode] && this.locale[langCode].hasOwnProperty(text)) {
        return this.locale[langCode][text];
      }
      return text;
    }
  }]);

  return DreditorLocaleBase;
}(_DreditorBase3.default);

exports.default = DreditorLocaleBase;


DreditorLocaleBase.__defaultOptions__ = {
  locale: {}
};

},{"./DreditorBase":14,"./DreditorUtility":28}],23:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Dreditor = require('./Dreditor');

var _Dreditor2 = _interopRequireDefault(_Dreditor);

var _DreditorDiff2 = require('./DreditorDiff');

var _DreditorDiff3 = _interopRequireDefault(_DreditorDiff2);

var _DreditorPatch = require('./DreditorPatch');

var _DreditorPatch2 = _interopRequireDefault(_DreditorPatch);

var _DreditorUrl = require('./DreditorUrl');

var _DreditorUrl2 = _interopRequireDefault(_DreditorUrl);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorParser = function (_DreditorDiff) {
  _inherits(DreditorParser, _DreditorDiff);

  /**
   * @class DreditorParser
   *
   * @param {Dreditor} dreditor
   *   The Dreditor instance.
   * @param {String} string
   *   The diff contents to parse.
   * @param {DreditorUrl} [url=null]
   *   The DreditorUrl object associated with the string.
   *
   * @constructor
   */
  function DreditorParser(dreditor, string) {
    var url = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, DreditorParser);

    /**
     * The sanitized string.
     *
     * @type {String}
     */
    var _this = _possibleConstructorReturn(this, (DreditorParser.__proto__ || Object.getPrototypeOf(DreditorParser)).call(this, dreditor, string));

    _this.sanitized = null;

    /**
     * An array of DreditorPatch objects.
     *
     * @type {DreditorPatch[]}
     */
    _this.patches = [];

    /**
     * The DreditorUrl object that provided the contents of this file, if any.
     *
     * @type {DreditorUrl}
     */
    _this.url = url && _DreditorUrl2.default.create(url) || null;
    return _this;
  }

  /**
   * {@inheritDoc}
   *
   * @param {String} [type='default']
   *   The type of garbage collection.
   *
   * @return {Boolean}
   *   True or false.
   */


  _createClass(DreditorParser, [{
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorParser.prototype.__proto__ || Object.getPrototypeOf(DreditorParser.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'parse') {
        this.sanitized = null;
      }
      return collect;
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      var _this2 = this;

      return this.doParse(null, function () {
        _this2.sanitized = _this2.sanitize(_this2.raw);

        // Extract sequential constructed patches created using git-format-patch by
        // splitting the file up based on git's "fixed magic date" header.
        // @see https://git-scm.com/docs/git-format-patch
        var sha1 = [];
        var patches = _this2.sanitized.split(/^From (\b[0-9a-f]{5,40}\b) Mon Sep 17 00:00:00 2001/gm).filter(function (patch) {
          if (/^[0-9a-f]{5,40}/.test(patch)) {
            sha1.push(patch);
            return false;
          }
          return !!patch.length;
        });

        // Parse the patches.
        return _this2.map(patches, function (string, i) {
          var patch = new _DreditorPatch2.default(_this2, string);
          return patch.parse().then(function () {
            patch.sha1 = sha1[i] || null;
            patch.id = 'patch-' + (patch.sha1 ? patch.sha1.substr(0, 5) : i + 1);
            patch.index = i;
            _this2.size += patch.size;
            _this2.patches[i] = patch;
          });
        });
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      return this.doRender(null, function () {
        _this3.rendered = _DreditorUtility2.default.createElement('<div>', _this3.attributes).addClass(['dreditor-wrapper', 'dreditor-reset']);

        var pager = _DreditorUtility2.default.createElement('<ul>').addClass('dreditor-patch-menu').appendTo(_this3.rendered).append('<li><strong>Patch</strong></li>');
        var patches = _DreditorUtility2.default.createElement('<div>').addClass('dreditor-patches').appendTo(_this3.rendered);

        // Disable the pager if there isn't more than 1 patch.
        if (_this3.patches.length <= 1) {
          pager.disable();
        }

        // Render the patches.
        return _this3.map([].concat(_this3.patches), function (patch, i) {
          pager.append('<li><a href="#' + patch.id + '">' + (i + 1) + '</a></li>');
          return patch.render().then(function (output) {
            return patches.append(output);
          });
        });
      });
    }
  }]);

  return DreditorParser;
}(_DreditorDiff3.default);

exports.default = DreditorParser;

},{"./Dreditor":12,"./DreditorDiff":15,"./DreditorPatch":24,"./DreditorUrl":27,"./DreditorUtility":28}],24:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorDiff2 = require('./DreditorDiff');

var _DreditorDiff3 = _interopRequireDefault(_DreditorDiff2);

var _DreditorFile = require('./DreditorFile');

var _DreditorFile2 = _interopRequireDefault(_DreditorFile);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorPatch = function (_DreditorDiff) {
  _inherits(DreditorPatch, _DreditorDiff);

  /**
   * @class DreditorPatch
   *
   * @param {DreditorParser} parser
   *   The DreditorParser object this file belongs to.
   * @param {String} string
   *   The contents of a diff file section.
   *
   * @constructor
   */
  function DreditorPatch(parser, string) {
    _classCallCheck(this, DreditorPatch);

    /**
     * The DreditorParser object this patch belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorParser}
     */
    var _this = _possibleConstructorReturn(this, (DreditorPatch.__proto__ || Object.getPrototypeOf(DreditorPatch)).call(this, parser.dreditor, string));

    Object.defineProperty(_this, 'parser', {
      value: parser,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * An array of DreditorFile objects.
     *
     * @type {DreditorFile[]}
     */
    _this.files = [];

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    _this.index = null;

    /**
     * Meta information for the patch.
     *
     * @type {Object}
     */
    _this.meta = null;

    /**
     * The patch SHA1 identifier, if any.
     *
     * Normally, this SHA1 is meaningless (for any real reference), however it
     * can be used to construct the DOM identifier (above) for creating anchors.
     *
     * @type {String}
     */
    _this.sha1 = null;
    return _this;
  }

  /**
   * {@inheritDoc}
   *
   * @param {String} [type='default']
   *   The type of garbage collection.
   *
   * @return {Boolean}
   *   True or false.
   */


  _createClass(DreditorPatch, [{
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorPatch.prototype.__proto__ || Object.getPrototypeOf(DreditorPatch.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.parser = null;
      }
      return collect;
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A promise object.
     */

  }, {
    key: 'parse',
    value: function parse() {
      var _this2 = this;

      return this.doParse('patch', function () {
        // Split into separate files, delimited by lines starting with "diff".
        var files = _this2.raw.split(/^diff\s[^\n]+\n/gm);

        // Extract any meta information from the first array item.
        var meta = files.shift();

        // Remove any lingering empty array items.
        files = files.filter(Boolean);

        // Parse the meta info and then the files.
        return _this2.parseMetaInfo(meta, files).then(function () {
          return _this2.parseFiles(files);
        });
      });
    }

    /**
     * Parses any supplied meta information from a patch.
     *
     * This is typically only ever provided if a patch was created using
     * git-format-patch.
     *
     * @param {String} info
     *   A string of meta information from a patch.
     * @param {Array} files
     *   The array of diff files in the patch.
     *
     * @return {Object|null}
     *   The fully parsed git-format object or null.
     */

  }, {
    key: 'parseMetaInfo',
    value: function parseMetaInfo(info, files) {
      var _this3 = this;

      if (this.meta) {
        return this.meta;
      }
      return this.doParse('patch.meta', function () {
        var meta = {};

        if (info.length) {
          var headers = info.split('\n').filter(Boolean);

          // Determine position of the "first blank line", if any.
          var blank = _DreditorUtility2.default.indexOf(headers, '');

          // Determine position of the "scissor", if any.
          var scissor = _DreditorUtility2.default.indexOf(headers, '-- >8 --');

          // Join the headers and any subsequent headers from the "body" after the
          // first blank line and/or "scissor" delimiters.
          if (blank !== -1 && scissor !== -1) {
            // If there is no blank line, then just use the headers array length.
            if (blank === -1) {
              blank = headers.length;
            }
            headers = headers.slice(0, blank).concat(headers.slice((scissor !== -1 ? scissor : blank) + 1));
          }

          // Parse any meta information as "email header fields" per RFC 2822.
          // https://tools.ietf.org/html/rfc2822#section-2.2
          var previousKey;
          _DreditorUtility2.default.forEach(headers, function (header, i) {
            var parts = header.match(/^([\w\d\-_]+):\s(.*)/);
            var key = parts && parts[1] && _DreditorUtility2.default.machineName(parts[1]);
            var value = parts && parts[2];
            if (key && value) {
              // Convert to a date object.
              if (/^date/i.test(key)) {
                value = !isNaN(Date.parse(value)) ? new Date(value) : value;
              }
              // Remove the standard git subject prefix ([PATCH]) if there's
              // just one patch. If there is more than one patch ([PATCH n/n])
              // then keeping this prefix is important for identification.
              else if (/^subject/i.test(key)) {
                  value = value.replace(/^\[PATCH]\s/, '');
                }
              meta[key] = value;
              previousKey = key;
            }
            // Parse "Long Header Fields" (lines that start with a single space)
            // and append its value to the previous key.
            else if (previousKey && header.match(/^\s/)) {
                meta[previousKey] += header;
              } else if (!header || header.match(/^---/)) {
                previousKey = null;
              }
          });

          // Finally, extract any signature and remove it from the last file.
          if (files && files.length) {
            var lastFile = files[files.length - 1];
            var signaturePosition = lastFile.search(/^--\s*\n(.|\n)*$/m);
            if (signaturePosition !== -1) {
              meta.signature = lastFile.substr(signaturePosition).replace(/^--\s*\n/, '') || null;
              if (meta.signature) {
                files[files.length - 1] = lastFile.substr(0, signaturePosition);
              }
            }
          }
        }

        _this3.meta = meta;
      });
    }

    /**
     * Parses the array of file strings.
     *
     * @param {Array} files
     *   The array of string files that was split.
     *
     * @return {Promise}
     *   A promise object.
     */

  }, {
    key: 'parseFiles',
    value: function parseFiles(files) {
      var _this4 = this;

      return this.map(files, function (string, i) {
        var file = new _DreditorFile2.default(_this4, string);
        return file.parse().then(function () {
          file.id = 'file-' + (i + 1);
          file.index = i;
          _this4.size += file.size;
          _this4.files[i] = file;
        });
      });
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      return this.doRender('patch', function () {
        _this5.rendered = _DreditorUtility2.default.createElement('<div>').addClass('dreditor-patch');

        if (Object.keys(_this5.meta).length) {
          var meta = _DreditorUtility2.default.createElement('<div>').addClass('dreditor-patch-meta').appendTo(_this5.rendered);
          var table = _DreditorUtility2.default.createElement('<table>').appendTo(meta);
          var body = _DreditorUtility2.default.createElement('<tbody>').appendTo(table);
          for (var p in _this5.meta) {
            if (_this5.meta.hasOwnProperty(p)) {
              var value = _this5.meta[p];
              if (value instanceof Date) {
                var iso = typeof value.toISOString === 'function' ? value.toISOString() : false;
                value = typeof value.toLocaleString === 'function' ? value.toLocaleString() : value.toString();
                if (iso) {
                  value = '<time datetime="' + iso + '">' + value + '</time>';
                }
              }
              _DreditorUtility2.default.createElement('<tr><td>' + p + '</td><td>' + value + '</td></tr>').appendTo(body);
            }
          }
        }
        // Render the files.
        return _this5.map([].concat(_this5.files), function (file) {
          return file.render().then(function (content) {
            return _this5.rendered.append(content);
          });
        });
      });
    }
  }]);

  return DreditorPatch;
}(_DreditorDiff3.default);

exports.default = DreditorPatch;

},{"./DreditorDiff":15,"./DreditorFile":19,"./DreditorUtility":28}],25:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Dreditor = require('./Dreditor');

var _Dreditor2 = _interopRequireDefault(_Dreditor);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorProxy = function () {
  _createClass(DreditorProxy, [{
    key: 'all',


    /**
     * Creates a new Promise that ensures all items in the iterable have finished.
     *
     * @param {Promise[]} array
     *   An array of promises.
     *
     * @return {Promise}
     *   A new Promise object.
     *
     * @see Dreditor.promise
     */
    value: function all(array) {
      // Don't proxy the entire method since "this" needs to be bound correctly.
      var promise = this.getDreditorOption('promise');
      return promise.all(array);
    }

    /**
     * @class DreditorProxy
     *
     * A helper class that allows other classes to proxy the methods on the
     * Dreditor instance rather than on their own objects. This helps ensure,
     * for instance, all event bindings are located in one place.
     *
     * @param {Dreditor} dreditor
     *   The Dreditor instance.
     * @param {Object} [options={}]
     *   The options specific to this proxied instance.
     *
     * @constructor
     */

  }]);

  function DreditorProxy(dreditor) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, DreditorProxy);

    if (!(dreditor instanceof _Dreditor2.default)) {
      throw new Error('The "dreditor" argument must be an instance of Dreditor: ' + dreditor);
    }

    /**
     * The Dreditor instance.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {Dreditor}
     */
    Object.defineProperty(this, 'dreditor', {
      value: dreditor,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * The options specific to this proxied instance.
     *
     * @type {Object}
     */
    this.options = options;
  }

  /**
   * Creates a promised based task with start and end emitted events.
   *
   * @param {String} name
   *   The name of the task. It will be used as the emitted event and will be
   *   appended with both a "start" and "stop" namespace.
   * @param {Function} callback
   *   The task callback that will be invoked inside the Promise. It's return
   *   value will be used to fulfill the task's promise. Once the task has
   *   ended, the return value of the task will be the object that originally
   *   invoked the task.
   *
   * @return {Promise}
   *   A Promise object.
   */


  _createClass(DreditorProxy, [{
    key: 'doTask',
    value: function doTask(name, callback) {
      var _this = this;

      var obj = this;
      return obj.promise(function (fulfill, reject) {
        if (!obj.emit(name + '.start', _this)) {
          return reject(obj);
        }
        return fulfill(callback.call(obj));
      }).then(function () {
        return obj.emit(name + '.end', _this) && obj;
      });
    }

    /**
     * Call a function for each value in an array and return a Promise.
     *
     * @param {Array} array
     *   The array to iterate over.
     * @param {Function} callback
     *   The callback to perform on each array item.
     *
     * @return {Promise}
     *   A promise object.
     */

  }, {
    key: 'each',
    value: function each(array, callback) {
      var _this2 = this;

      array = _DreditorUtility2.default.isArray(array) ? array : [array];
      return array.reduce(function (prev, curr, i) {
        return prev.then(function () {
          return callback(curr, i, array);
        });
      }, this.resolve()).then(function () {
        return _this2.resolve(array);
      });
    }

    /**
     * Emit an event.
     *
     * @param {String} type
     *   A string representing the type of the event to emit.
     * @param {...*} [args]
     *   Any additional arguments to pass to the listener.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'emit',
    value: function emit(type, args) {
      return this.proxy('emit', arguments);
    }

    /**
     * Cleans up any memory references in the object.
     *
     * @param {String} [type='default']
     *   The type of garbage collection.
     *
     * @return {Boolean}
     *   Flag indicating whether an object's properties should be collected.
     */

  }, {
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = !!this.getDreditorOption('garbageCollect');
      if (collect && type === 'render') {
        this.dreditor = null;
      }
      return collect;
    }

    /**
     * Retrieves an option specific to the Dreditor instance.
     *
     * @param {String} name
     *   The option name. It can also be a namespaced (using dot notation) key to
     *   retrieve a deeply nested option value.
     * @param {*} [defaultValue=null]
     *   The default value to to return, if no option has been set.
     *
     * @return {*|null}
     *   The option value or `null` if there is no option or it hasn't been set.
     */

  }, {
    key: 'getDreditorOption',
    value: function getDreditorOption(name) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return this.proxy('getOption', arguments);
    }

    /**
     * Retrieves an option for this instance.
     *
     * @param {String} name
     *   The option name. It can also be a namespaced (using dot notation) key to
     *   retrieve a deeply nested option value.
     * @param {*} [defaultValue=null]
     *   The default value to to return, if no option has been set.
     *
     * @return {*|null}
     *   The option value or `null` if there is no option or it hasn't been set.
     */

  }, {
    key: 'getOption',
    value: function getOption(name) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return this.dreditor.getOption.apply(this, arguments);
    }

    /**
     * Creates a new Promise that ensures all items in the iterable have finished.
     *
     * @param {Array} array
     *   The array to map.
     * @param {Function} callback
     *   The callback to invoke on each item in the array.
     *
     * @return {Promise}
     *   A new Promise object.
     *
     * @see Dreditor.promise
     */

  }, {
    key: 'map',
    value: function map(array, callback) {
      var _this3 = this;

      // Convert each item in the object to a promise.
      return this.each(array, function (value, i) {
        array[i] = _this3.resolve(callback.apply(_this3, [value, i, array]));
      }).then(function (array) {
        return _this3.all(array);
      });
    }

    /**
     * Removes either a specific listener or all listeners for an event type.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} [listener]
     *   The event listener.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'off',
    value: function off(type, listener) {
      this.proxy('off', arguments);
      return this;
    }

    /**
     * Adds a listener for an event type.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} listener
     *   The event listener.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'on',
    value: function on(type, listener) {
      this.proxy('on', arguments);
      return this;
    }

    /**
     * Adds a listener for an event type that is only invoked once.
     *
     * @param {String} type
     *   The event type.
     * @param {Function} listener
     *   The event listener.
     *
     * @chainable
     *
     * @return {*}
     *   The class instance that invoked this method.
     */

  }, {
    key: 'once',
    value: function once(type, listener) {
      this.proxy('once', arguments);
      return this;
    }

    /**
     * Creates a new Promise.
     *
     * @param {Function} resolver
     *   The resolver function for the Promise. It will automatically be bound
     *   to the object that invoked this method.
     *
     * @return {Promise}
     *   A new Promise object.
     *
     * @see Dreditor.promise
     */

  }, {
    key: 'promise',
    value: function promise(resolver) {
      // Don't proxy the entire method since "this" needs to be bound correctly.
      var promise = this.getDreditorOption('promise');
      return new promise(resolver.bind(this));
    }

    /**
     * Proxies a method call to the Dreditor instance.
     *
     * @param {String} method
     *   The method name to invoke.
     * @param {Arguments|Array} args
     *   The arguments to pass.
     *
     * @return {*}
     *   Returns whatever the proxied method returns.
     */

  }, {
    key: 'proxy',
    value: function proxy(method, args) {
      return this.dreditor[method].apply(this.dreditor, args);
    }

    /**
     * Creates a new Promise that immediately rejects.
     *
     * @param {*} [value]
     *   The value to reject with.
     *
     * @return {Promise}
     *   A rejected Promise object.
     */

  }, {
    key: 'reject',
    value: function reject(value) {
      // Don't proxy the entire method since "this" needs to be bound correctly.
      var promise = this.getDreditorOption('promise');
      return promise.reject(value);
    }

    /**
     * Creates a new Promise that immediately resolves.
     *
     * @param {*} [value]
     *   The value to resolve.
     *
     * @return {Promise}
     *   A resolved Promise object.
     */

  }, {
    key: 'resolve',
    value: function resolve(value) {
      // Don't proxy the entire method since "this" needs to be bound correctly.
      var promise = this.getDreditorOption('promise');
      return promise.resolve(value);
    }

    /**
     * Sanitizes a string.
     *
     * @param {String} string
     *   The string to sanitize.
     * @param {Boolean} [force=false]
     *   Bypasses option and forces sanitization.
     *
     * @return {String}
     *   The sanitized string.
     */

  }, {
    key: 'sanitize',
    value: function sanitize(string) {
      var force = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      return this.proxy('sanitize', arguments);
    }

    /**
     * Generates a translated locale string for a given locale key.
     *
     * @param {String} text
     *   The text to translate.
     * @param {String} [langCode]
     *   Overrides the currently set langCode option.
     *
     * @return {String}
     *   The translated string.
     */

  }, {
    key: 't',
    value: function t(text) {
      var langCode = arguments.length <= 1 || arguments[1] === undefined ? this.langCode : arguments[1];

      return this.proxy('t', arguments);
    }
  }]);

  return DreditorProxy;
}();

exports.default = DreditorProxy;

},{"./Dreditor":12,"./DreditorUtility":28}],26:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DreditorAttributes = require('./DreditorAttributes');

var _DreditorAttributes2 = _interopRequireDefault(_DreditorAttributes);

var _DreditorProxy2 = require('./DreditorProxy');

var _DreditorProxy3 = _interopRequireDefault(_DreditorProxy2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DreditorRenderable = function (_DreditorProxy) {
  _inherits(DreditorRenderable, _DreditorProxy);

  /**
   * @class DreditorRenderable
   *
   * @param {Dreditor} dreditor
   *   The Dreditor instance.
   * @param {String} string
   *   The raw diff string.
   *
   * @constructor
   */
  function DreditorRenderable(dreditor, string) {
    _classCallCheck(this, DreditorRenderable);

    /**
     * An Attributes object.
     *
     * @type {DreditorAttributes}
     */
    var _this = _possibleConstructorReturn(this, (DreditorRenderable.__proto__ || Object.getPrototypeOf(DreditorRenderable)).call(this, dreditor, string));

    _this.attributes = new _DreditorAttributes2.default();

    /**
     * The DOM identifier.
     *
     * It defaults to "patch-N", where N is the array index + 1.
     *
     * @type {String}
     */
    _this.id = null;

    /**
     * The rendered HTML output.
     *
     * @type {DreditorElement|String}
     */
    _this.rendered = null;
    return _this;
  }

  /**
   * Creates a promised based render task with start and end emitted events.
   *
   * @param {String} name
   *   The name of the render task. It will be used as the emitted event and
   *   will be prepended with "render" and appended with both a "start" and
   *   "stop" namespace. If no name is provided the emitted event will simply
   *   be "render".
   * @param {Function} callback
   *   The render callback that will be invoked inside the Promise. Once the
   *   render task has ended, the return value of the promise will be the
   *   rendered property on the object.
   *
   * @return {Promise}
   *   A Promise object.
   */


  _createClass(DreditorRenderable, [{
    key: 'doRender',
    value: function doRender(name, callback) {
      var _this2 = this;

      if (this.rendered) {
        return this.resolve(this.rendered);
      }
      return this.doTask(name ? 'render.' + name : 'render', function () {
        return _this2.resolve(callback.call(_this2)).then(function () {
          if (_this2.getDreditorOption('renderToString')) {
            _this2.rendered = _this2.rendered.toString();
          }
          return _this2.resolve(_this2.rendered);
        });
      }).catch(function (e) {
        // Rethrow any actual errors.
        if (e instanceof Error) {
          throw e;
        }
        // Otherwise, just resolve.
        return _this2.resolve(_this2.rendered.disable());
      }).then(function () {
        var value = _this2.resolve(_this2.rendered);
        _this2.garbageCollect('render');
        return value;
      });
    }

    /**
     * {@inheritDoc}
     *
     * @param {String} [type='default']
     *   The type of garbage collection.
     *
     * @return {Boolean}
     *   True or false.
     */

  }, {
    key: 'garbageCollect',
    value: function garbageCollect() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];

      var collect = _get(DreditorRenderable.prototype.__proto__ || Object.getPrototypeOf(DreditorRenderable.prototype), 'garbageCollect', this).call(this, type);
      if (collect && type === 'render') {
        this.attributes = null;
      }
      return collect;
    }

    /**
     * {@inheritDoc}
     *
     * @return {Promise}
     *   A Promise object.
     */

  }, {
    key: 'render',
    value: function render() {
      return this.reject(new Error('You must subclass the "render" method of DreditorRenderable before invoking it.'));
    }
  }]);

  return DreditorRenderable;
}(_DreditorProxy3.default);

exports.default = DreditorRenderable;

},{"./DreditorAttributes":13,"./DreditorProxy":25}],27:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DreditorUrl =

/**
 * @class DreditorUrl
 *
 * @param {DreditorUrl|String|{url: String}} url
 *   The URL for the file. Optionally, an object can be passed instead and
 *   its properties will be merged in.
 *
 * @constructor
 */
function DreditorUrl(url) {
  _classCallCheck(this, DreditorUrl);

  /**
   * The base filename, without the extension.
   *
   * @type {String}
   */
  this.basename = null;

  /**
   * The file extensions.
   *
   * @type {String}
   */
  this.extension = null;

  /**
   * The filename.
   *
   * @type {String}
   */
  this.filename = null;

  /**
   * The file SHA1 digest based on the value of the URL.
   *
   * @type {Number}
   */
  this.sha1 = null;

  /**
   * The file size, if known.
   *
   * @type {Number}
   */
  this.size = 0;

  /**
   * The file mime type, if known.
   *
   * @type {String}
   */
  this.type = null;

  /**
   * The file URL.
   *
   * @type {String}
   */
  this.url = typeof url === 'string' && url || null;

  // Merge in any passed object properties.
  if (_DreditorUtility2.default.isObject(url)) {
    _DreditorUtility2.default.extend(this, url);
  }

  if (!this.url || !_DreditorUtility2.default.isUrl(this.url)) {
    throw new Error('A DreditorUrl object must be initialized with a valid "url" property.');
  }

  // Fill in the defaults.
  this.extension = _DreditorUtility2.default.extension(this.url);
  this.basename = _DreditorUtility2.default.basename(this.url, '.' + this.extension);
  this.filename = [this.basename, this.extension].join('.');
  this.sha1 = _DreditorUtility2.default.sha1(this.url);
};

/**
 * Creates a new DreditorUrl instance.
 *
 * @param {DreditorUrl|String|{url: String}} url
 *   The URL for the file. Optionally, an object can be passed instead and
 *   its properties will be merged in.
 *
 * @return {DreditorUrl}
 *   A new DreditorFile instance.
 */


exports.default = DreditorUrl;
DreditorUrl.create = function create(url) {
  return url instanceof DreditorUrl ? url : new DreditorUrl(url);
};

},{"./DreditorUtility":28}],28:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", {
  value: true
});

var _arrayUniq2 = require('array-uniq');

var _arrayUniq3 = _interopRequireDefault(_arrayUniq2);

var _DreditorElement = require('./DreditorElement');

var _DreditorElement2 = _interopRequireDefault(_DreditorElement);

var _extend2 = require('extend');

var _extend3 = _interopRequireDefault(_extend2);

var _indexof = require('indexof');

var _indexof2 = _interopRequireDefault(_indexof);

var _isarray = require('isarray');

var _isarray2 = _interopRequireDefault(_isarray);

var _isFunction2 = require('is-function');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _isobject = require('isobject');

var _isobject2 = _interopRequireDefault(_isobject);

var _isPlainObject2 = require('is-plain-object');

var _isPlainObject3 = _interopRequireDefault(_isPlainObject2);

var _urlRegex = require('url-regex');

var _urlRegex2 = _interopRequireDefault(_urlRegex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _forEach = require('async-foreach').forEach;

var DreditorUtility = {

  /**
   * Ensures that the values in an array are unique.
   *
   * @param {Array} array
   *   The array to iterate over.
   *
   * @return {Array}
   *   An array with unique values.
   */
  arrayUniq: function arrayUniq(array) {
    return (0, _arrayUniq3.default)(array);
  },

  /**
   * Retrieves the basename for a path.
   *
   * @param {String} path
   *   The path to use.
   * @param {String} [suffix]
   *   Optional. The suffix to strip off.
   *
   * @return {String}
   *   The basename of the path, minus any suffix that was passed.
   */
  basename: function basename(path, suffix) {
    /*eslint-disable*/
    /*! PHP's basename in JavaScript (https://github.com/kvz/locutus/blob/master/src/php/filesystem/basename.js) * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors) * Licensed under MIT (https://github.com/kvz/locutus/blob/master/LICENSE) */
    var b = path;
    var lastChar = b.charAt(b.length - 1);
    if (lastChar === '/' || lastChar === '\\') {
      b = b.slice(0, -1);
    }
    b = b.replace(/^.*[\/\\]/g, '');
    if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
      b = b.substr(0, b.length - suffix.length);
    }
    return b;
    /*eslint-enable*/
  },

  /**
   * Creates a new DreditorElement.
   *
   * @param {DreditorElement|String} [content]
   *   The content used to create the element. Must be fully enclosed HTML tags.
   * @param {DreditorAttributes|Object} [attributes]
   *   Optional. The attributes to initialize the content with.
   *
   * @return {DreditorElement|String}
   *   A new DreditorElement instance or a string value.
   */
  createElement: function createElement(content, attributes) {
    return _DreditorElement2.default.create(content, attributes);
  },

  /**
   * Iterate over key/value pairs of either an array or dictionary like object.
   *
   * @param {Iterable|Object} obj
   *   The array or object to iterate over.
   * @param {Function} callback
   *   The callback to invoke on each item in the object.
   */
  forEach: function forEach(obj, callback) {
    _forEach(obj, callback);
  },

  /**
   * Small helper method to encode html entities.
   *
   * @param {String} string
   *   The string to encode.
   *
   * @return {String}
   *   The encoded string.
   *
   * @todo Possibly replace with real library like html-entities?
   * A little wary of doing so though since many of these libraries
   * add a lot of weight (min 40k).
   */
  encodeHtmlEntities: function encodeHtmlEntities(string) {
    return ('' + string).replace(/[\u00A0-\u9999<>&]/g, function (i) {
      return '&#' + i.charCodeAt(0) + ';';
    });
  },

  /**
   * Extends an object (similar to jQuery's extend).
   *
   * @param {Boolean} [deep=false]
   *   Whether or not to iterate through any nested objects and merge any
   *   differences at that level.
   * @param {...Object} obj
   *   The objects to extend. The first object passed will be used as the
   *   "target" object. So if you don't want to extend the first object, pass
   *   an empty object. This is essentially the same as "cloning" an object.
   *
   * @return {Object}
   *   The target object (first object passed).
   */
  extend: function extend(deep, obj) {
    return _extend3.default.apply({}, arguments);
  },

  /**
   * Retrieves a file's extension.
   *
   * @param {String} filename
   *   The filename to extract the extension from.
   *
   * @return {String}
   *   The extension.
   *
   * @see http://stackoverflow.com/a/12900504
   */
  extension: function extension(filename) {
    return (/tar\.gz$/.test(filename) ? 'tar.gz' : filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
    );
  },

  /**
   * Retrieves a property of an object using dot notation.
   *
   * @param {String} name
   *   The property to retrieve, using dot notation.
   * @param {Object} object
   *   The object to search through.
   *
   * @return {*|null}
   *   The property value or null if it isn't set.
   */
  getProperty: function getProperty(name, object) {
    return name.split('.').reduce(function (a, b) {
      return a[b] !== void 0 ? a[b] : null;
    }, object);
  },

  /**
   * Retrieves the index of the value in an array.
   *
   * @param {Array} array
   *   The array to search.
   * @param {*} value
   *   The value to search for.
   *
   * @return {Number}
   *   The index position or -1 if the value is not in the array.
   */
  indexOf: function indexOf(array, value) {
    return (0, _indexof2.default)(array, value);
  },

  /**
   * Determines if the value passed is an array.
   *
   * @param {*} value
   *   The value to test.
   *
   * @return {Boolean}
   *   True or false.
   */
  isArray: function isArray(value) {
    return (0, _isarray2.default)(value);
  },

  /**
   * Determines if the value passed is a function.
   *
   * @param {*} value
   *   The value to test.
   *
   * @return {Boolean}
   *   True or false.
   */
  isFunction: function isFunction(value) {
    return (0, _isFunction3.default)(value);
  },

  /**
   * Determines if the value passed is an object.
   *
   * @param {*} value
   *   The value to test.
   *
   * @return {Boolean}
   *   True or false.
   */
  isObject: function isObject(value) {
    return (0, _isobject2.default)(value);
  },

  /**
   * Determines if the value passed is a "plain" object.
   *
   * @param {*} value
   *   The value to test.
   *
   * @return {Boolean}
   *   True or false.
   */
  isPlainObject: function isPlainObject(value) {
    return (0, _isPlainObject3.default)(value);
  },

  /**
   * Determines if a string is a valid SHA1 digest.
   *
   * @param {String} string
   *   The string to test.
   *
   * @return {Boolean}
   *   True or false.
   */
  isSha1: function isSha1(string) {
    return (/^[0-9a-f]{5,40}$/.test(string)
    );
  },

  /**
   * Determines if a string is a properly constructed URL.
   *
   * @param {String} string
   *   The string to test.
   * @param {Object} [options={exact:true}]
   *   The options to pass along to the url-regex module.
   *
   * @return {Boolean}
   *   Returns `true` if the string is a URL, false otherwise.
   *
   * @see https://www.npmjs.com/package/url-regex
   */
  isUrl: function isUrl(string) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? { exact: true } : arguments[1];

    // Immediately return false if there is more than one line in the string.
    return string.search(/(\n|\r\n|\r)/gm) !== -1 ? false : (0, _urlRegex2.default)(options).test(string);
  },

  /**
   * Retrieves a machine name version of a string.
   *
   * @param {String} string
   *   The string to parse.
   *
   * @return {string}
   *   The machine name.
   */
  machineName: function machineName(string) {
    return string.replace(/([A-Z]+[^A-Z]+)/g, '_$1').toLowerCase().replace(/[^a-z0-9-]+/g, '_').replace(/_+/g, '_').replace(/(^_|_$)/g, '');
  },

  /**
   * An empty function.
   *
   * @type {Function}
   */
  noop: function noop() {},

  /**
   * Generates an SHA1 digest for a string.
   *
   * @param {String} str
   *   The string to use.
   *
   * @return {String}
   *   The SHA1 digest.
   */
  sha1: function sha1(str) {
    /*eslint-disable*/
    /*! PHP's sha1 in JavaScript (https://github.com/kvz/locutus/blob/master/src/php/strings/sha1.js) * Copyright (c) 2007-2016 Kevin van Zonneveld (http://kvz.io) and Contributors (http://locutus.io/authors) Licensed under MIT (https://github.com/kvz/locutus/blob/master/LICENSE) */
    var _rotLeft = function _rotLeft(n, s) {
      var t4 = n << s | n >>> 32 - s;
      return t4;
    };
    var _cvtHex = function _cvtHex(val) {
      var str = '',
          i,
          v;
      for (i = 7; i >= 0; i--) {
        v = val >>> i * 4 & 0x0f;
        str += v.toString(16);
      }
      return str;
    };
    var blockstart, i, j, A, B, C, D, E, temp;
    var W = new Array(80),
        H0 = 0x67452301,
        H1 = 0xEFCDAB89,
        H2 = 0x98BADCFE,
        H3 = 0x10325476,
        H4 = 0xC3D2E1F0;
    str = unescape(encodeURIComponent(str));
    var strLen = str.length;
    var wordArray = [];
    for (i = 0; i < strLen - 3; i += 4) {
      j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
      wordArray.push(j);
    }
    switch (strLen % 4) {
      case 0:
        i = 0x080000000;
        break;
      case 1:
        i = str.charCodeAt(strLen - 1) << 24 | 0x0800000;
        break;
      case 2:
        i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000;
        break;
      case 3:
        i = str.charCodeAt(strLen - 3) << 24 | str.charCodeAt(strLen - 2) << 16 | str.charCodeAt(strLen - 1) << 8 | 0x80;
        break;
    }
    wordArray.push(i);
    while (wordArray.length % 16 !== 14) {
      wordArray.push(0);
    }
    wordArray.push(strLen >>> 29);
    wordArray.push(strLen << 3 & 0x0ffffffff);
    for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
      for (i = 0; i < 16; i++) {
        W[i] = wordArray[blockstart + i];
      }
      for (i = 16; i <= 79; i++) {
        W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
      }
      A = H0;
      B = H1;
      C = H2;
      D = H3;
      E = H4;
      for (i = 0; i <= 19; i++) {
        temp = _rotLeft(A, 5) + (B & C | ~B & D) + E + W[i] + 0x5A827999 & 0x0ffffffff;
        E = D;
        D = C;
        C = _rotLeft(B, 30);
        B = A;
        A = temp;
      }
      for (i = 20; i <= 39; i++) {
        temp = _rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1 & 0x0ffffffff;
        E = D;
        D = C;
        C = _rotLeft(B, 30);
        B = A;
        A = temp;
      }
      for (i = 40; i <= 59; i++) {
        temp = _rotLeft(A, 5) + (B & C | B & D | C & D) + E + W[i] + 0x8F1BBCDC & 0x0ffffffff;
        E = D;
        D = C;
        C = _rotLeft(B, 30);
        B = A;
        A = temp;
      }
      for (i = 60; i <= 79; i++) {
        temp = _rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6 & 0x0ffffffff;
        E = D;
        D = C;
        C = _rotLeft(B, 30);
        B = A;
        A = temp;
      }
      H0 = H0 + A & 0x0ffffffff;
      H1 = H1 + B & 0x0ffffffff;
      H2 = H2 + C & 0x0ffffffff;
      H3 = H3 + D & 0x0ffffffff;
      H4 = H4 + E & 0x0ffffffff;
    }
    temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4);
    return temp.toLowerCase();
    /*eslint-enable*/
  },

  /**
   * Replaces template strings with data.
   *
   * This is a cheap imitation of Twig's variable token replacement. It can
   * support nested data, e.g. {{ nested.object.property }}.
   *
   * @param {String} template
   *   The template string to use. Any "{{ variable }}" like tokens will be
   *   replaced with the corresponding data.
   * @param {Object} [data={}]
   *   The data to use for replacing variable tokens found in the template.
   * @param {Boolean} [remove=true]
   *   Flag indicating whether or not tokens will be removed if there is no
   *   corresponding data. If set to false, the original token will be
   *   returned instead.
   *
   * @return {String}
   *   A string representation of the template with data replaced.
   */
  template: function template(_template) {
    var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var remove = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    return _template.replace(/[{][{] ([\w._-]+) [}][}]/gmi, function (token, name) {
      var value = DreditorUtility.getProperty(name, data);
      if (value !== null) {
        return value;
      }
      return remove ? '' : token;
    });
  }

};

exports.default = DreditorUtility;

},{"./DreditorElement":16,"array-uniq":1,"async-foreach":2,"extend":3,"indexof":4,"is-function":6,"is-plain-object":7,"isarray":9,"isobject":10,"url-regex":11}],29:[function(require,module,exports){
var _Dreditor = require('./Dreditor');

var _Dreditor2 = _interopRequireDefault(_Dreditor);

var _DreditorAttributes = require('./DreditorAttributes');

var _DreditorAttributes2 = _interopRequireDefault(_DreditorAttributes);

var _DreditorBase = require('./DreditorBase');

var _DreditorBase2 = _interopRequireDefault(_DreditorBase);

var _DreditorDiff = require('./DreditorDiff');

var _DreditorDiff2 = _interopRequireDefault(_DreditorDiff);

var _DreditorElement = require('./DreditorElement');

var _DreditorElement2 = _interopRequireDefault(_DreditorElement);

var _DreditorEmitter = require('./DreditorEmitter');

var _DreditorEmitter2 = _interopRequireDefault(_DreditorEmitter);

var _DreditorEvent = require('./DreditorEvent');

var _DreditorEvent2 = _interopRequireDefault(_DreditorEvent);

var _DreditorFile = require('./DreditorFile');

var _DreditorFile2 = _interopRequireDefault(_DreditorFile);

var _DreditorHunk = require('./DreditorHunk');

var _DreditorHunk2 = _interopRequireDefault(_DreditorHunk);

var _DreditorLine = require('./DreditorLine');

var _DreditorLine2 = _interopRequireDefault(_DreditorLine);

var _DreditorLocaleBase = require('./DreditorLocaleBase');

var _DreditorLocaleBase2 = _interopRequireDefault(_DreditorLocaleBase);

var _DreditorParser = require('./DreditorParser');

var _DreditorParser2 = _interopRequireDefault(_DreditorParser);

var _DreditorPatch = require('./DreditorPatch');

var _DreditorPatch2 = _interopRequireDefault(_DreditorPatch);

var _DreditorProxy = require('./DreditorProxy');

var _DreditorProxy2 = _interopRequireDefault(_DreditorProxy);

var _DreditorRenderable = require('./DreditorRenderable');

var _DreditorRenderable2 = _interopRequireDefault(_DreditorRenderable);

var _DreditorUrl = require('./DreditorUrl');

var _DreditorUrl2 = _interopRequireDefault(_DreditorUrl);

var _DreditorUtility = require('./DreditorUtility');

var _DreditorUtility2 = _interopRequireDefault(_DreditorUtility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (options) {
  return new _Dreditor2.default(options);
};

module.exports.__version__ = _Dreditor2.default.__version__;
module.exports.__defaultOptions__ = _Dreditor2.default.__defaultOptions__;
module.exports.Dreditor = _Dreditor2.default;
module.exports.DreditorAttributes = _DreditorAttributes2.default;
module.exports.DreditorBase = _DreditorBase2.default;
module.exports.DreditorDiff = _DreditorDiff2.default;
module.exports.DreditorElement = _DreditorElement2.default;
module.exports.DreditorEmitter = _DreditorEmitter2.default;
module.exports.DreditorEvent = _DreditorEvent2.default;
module.exports.DreditorFile = _DreditorFile2.default;
module.exports.DreditorHunk = _DreditorHunk2.default;
module.exports.DreditorLine = _DreditorLine2.default;
module.exports.DreditorLocaleBase = _DreditorLocaleBase2.default;
module.exports.DreditorParser = _DreditorParser2.default;
module.exports.DreditorPatch = _DreditorPatch2.default;
module.exports.DreditorProxy = _DreditorProxy2.default;
module.exports.DreditorRenderable = _DreditorRenderable2.default;
module.exports.DreditorUrl = _DreditorUrl2.default;
module.exports.DreditorUtility = _DreditorUtility2.default;

},{"./Dreditor":12,"./DreditorAttributes":13,"./DreditorBase":14,"./DreditorDiff":15,"./DreditorElement":16,"./DreditorEmitter":17,"./DreditorEvent":18,"./DreditorFile":19,"./DreditorHunk":20,"./DreditorLine":21,"./DreditorLocaleBase":22,"./DreditorParser":23,"./DreditorPatch":24,"./DreditorProxy":25,"./DreditorRenderable":26,"./DreditorUrl":27,"./DreditorUtility":28}]},{},[29])(29)
});