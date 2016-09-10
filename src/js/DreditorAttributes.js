import util from './DreditorUtility';

export default class DreditorAttributes {

  /**
   * @class DreditorAttributes
   *
   * @param {DreditorAttributes|Object} [attributes]
   *   An Attributes object with existing data or a plain object where the key
   *   is the attribute name and the value is the attribute value.
   *
   * @constructor
   */
  constructor(attributes = {}) {

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
  toString() {
    var output = '';
    var name;
    var value;
    for (name in this.data) {
      if (!this.data.hasOwnProperty(name)) {
        continue;
      }
      value = this.data[name];
      if (util.isFunction(value)) {
        value = value.call(this);
      }
      if (util.isObject(value)) {
        var values = [];
        for (var i in value) {
          if (value.hasOwnProperty(i)) {
            values.push(value[i]);
          }
        }
        value = values;
      }
      if (util.isArray(value)) {
        value = value.join(' ');
      }
      // Don't add an empty class array.
      if (name === 'class' && !value) {
        continue;
      }
      output += ` ${util.encodeHtmlEntities(name)}="${util.encodeHtmlEntities(value)}"`;
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
  addClass(value) {
    var args = Array.prototype.slice.call(arguments);
    var classes = [];
    for (var i = 0, l = args.length; i < l; i++) {
      classes = classes.concat(this.sanitizeClass(args[i]));
    }
    this.data['class'] = util.arrayUniq(this.data['class'].concat(classes));
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
  exists(name) {
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
  get(name, defaultValue) {
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
  getData() {
    return util.extend({}, this.data);
  }

  /**
   * Retrieves classes from the Attributes object.
   *
   * @return {Array}
   *   The classes array.
   */
  getClasses() {
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
  hasClass(className) {
    className = this.sanitizeClass(className);
    var classes = this.getClasses();
    for (var i = 0, l = className.length; i < l; i++) {
      // If one of the classes fails, immediately return false.
      if (util.indexOf(classes, className[i]) === -1) {
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
  merge(attributes, recursive) {
    attributes = attributes instanceof DreditorAttributes ? attributes.getData() : attributes;

    // Ensure any passed are sanitized.
    if (attributes && attributes['class'] !== void 0) {
      attributes['class'] = this.sanitizeClass(attributes['class']);
    }

    if (recursive === void 0 || recursive) {
      this.data = util.extend(true, {}, this.data, attributes);
    }
    else {
      this.data = util.extend({}, this.data, attributes);
    }

    // Ensure classes are unique after merge.
    this.data['class'] = util.arrayUniq(this.data['class']);

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
  remove(name) {
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
  removeClass(value) {
    var args = Array.prototype.slice.apply(arguments);
    var classes = this.getClasses();
    var values = [];
    for (var i = 0, l = args.length; i < l; i++) {
      values = values.concat(this.sanitizeClass(args[i]));
      for (var ii = 0, ll = values.length; ii < ll; ii++) {
        var index = util.indexOf(classes, values[ii]);
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
  replaceClass(oldValue, newValue) {
    var classes = this.getClasses();
    var i = util.indexOf(classes, oldValue);
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
  sanitizeClass(classes) {
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
  set(name, value) {
    this.data[name] = name === 'class' ? this.sanitizeClass(value) : value;
    return this;
  }

}
