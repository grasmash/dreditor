import DreditorEmitter from './DreditorEmitter';
import util from './DreditorUtility';

export default class DreditorBase extends DreditorEmitter {

  /**
   * @class DreditorBase
   *
   * @param {Object} [options={}]
   *   Options to override defaults.
   */
  constructor(options = {}) {
    super();

    /**
     * The options.
     *
     * @type {Object}
     */
    this.options = util.extend(true, {}, options);
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
  getOption(name, defaultValue = null) {
    var ret = util.getProperty(name, this.options);
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
  promise(resolver) {
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
  sanitize(string, force = false) {
    // Always replace CRLF and CR characters with LF. This is necessary for
    // the parser to function properly, which assumes that everything is a LF.
    string = string.replace(/\r\n|\r/g, '\n');

    // Remove comments.
    if (force || this.getOption('sanitize.comments')) {
      string = string.replace(/^#[^\n]*\n/gm, '');
    }

    // Encode HTML entities.
    if (force || this.getOption('sanitize.encodeHtmlEntities')) {
      string = util.encodeHtmlEntities(string);
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
  setOption(name, value = null) {
    var p = name && name.split('.') || [];
    if (p.length === 1) {
      this.options[p[0]] = value;
      return this;
    }
    try {
      var obj = p.reduce(function (obj, i) {
        return !util.isPlainObject(obj[i]) ? obj : obj[i];
      }, this.options);
      obj[p[p.length - 1]] = value;
    }
    catch (e) {
      // Intentionally left empty.
    }
    return this;
  }

}
