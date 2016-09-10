import DreditorLocaleBase from './DreditorLocaleBase';
import DreditorParser from './DreditorParser';
import util from './DreditorUtility';


export default class Dreditor extends DreditorLocaleBase {

  /**
   * @class Dreditor
   *
   * @param {Object} [options]
   *   Any additional options to pass along to the object when instantiating.
   *
   * @constructor
   */
  constructor(options = {}) {
    super(util.extend(true, {}, Dreditor.__defaultOptions__, options));

    // Ensure there is a valid Promise API available.
    let promise = this.getOption('promise');
    if (!(typeof promise !== 'function' || typeof promise !== 'object') || typeof (promise.then || (typeof promise === 'function' && new promise(util.noop))).then !== 'function') {
      throw new Error('Dreditor requires a valid Promise API. There are several polyfills or comprehensive libraries available to choose from.');
    }

    // Bind a highlight method for hunks, if one exists.
    var highlighter = this.getOption('highlighter');
    if (highlighter) {
      this.on('render.hunk.start', function (e, hunk) {
        hunk.highlightCode();
      });
    }

    // Set the "sanitize.encodeHtmlEntities" option based on whether there
    // was a "highlighter" option provided.
    if (this.getOption('sanitize.encodeHtmlEntities') === null) {
      this.setOption('sanitize.encodeHtmlEntities', !highlighter);
    }
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
  parse(string, url = null) {
    return this.promise(function (fulfill, reject) {
      try {
        var parser = new DreditorParser(this, string, url);
        fulfill(parser.parse());
      }
      catch (e) {
        reject(e);
      }
    });
  }

}

/**
 * The version.
 *
 * @type {String}
 */
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
  highlightCode: function (string) {

    /**
     * The highlighter object or function.
     *
     * @type {Function|Object}
     */
    var highlighter = this.getOption('highlighter');

    // See if the highlighter provided is PrismJS by checking the necessary
    // functions and objects inside the passed highlighter.
    if (highlighter && util.isFunction(highlighter.highlight) && util.isFunction(highlighter.Token) && util.isPlainObject(highlighter.languages) && util.isPlainObject(highlighter.languages.markup)) {
      // Determine the correct language grammar object to use for Prism.
      var prismLanguage = this.getOption('prismLanguage', util.noop);
      var language = prismLanguage.call(this, highlighter) || 'markup';
      // Highlight the string.
      string = highlighter.highlight(string, highlighter.languages[language], language);
    }
    // Otherwise if the highlighter option provided is a function, see if it
    // returns any output.
    else if (util.isFunction(highlighter)) {
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
  prismLanguage(Prism) {
    // Immediately return if an explicit language exists for the file extension.
    if (util.isPlainObject(Prism.languages[this.file.extension])) {
      return this.file.extension;
    }

    /** @type Object */
    var map = this.getOption('prismExtensionLanguageMap', {});

    // Otherwise, attempt to find the appropriate language based on extension.
    util.forEach([].concat(map[this.file.extension] || []), (language) => {
      if (util.isPlainObject(Prism.languages[language])) {
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
