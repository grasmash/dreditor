import DreditorAttributes from './DreditorAttributes';
import util from './DreditorUtility';

export default class DreditorElement {

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
  constructor(tag = null, attributes = {}, value = null) {

    /**
     * The Attributes object for this instance.
     *
     * @type {DreditorAttributes}
     */
    this.attributes = attributes instanceof DreditorAttributes ? attributes : new DreditorAttributes(attributes);

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
    this.voidElement = tag && util.indexOf(DreditorElement.voidElements, tag) !== -1;
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
  addClass(value) {
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
  append(content, attributes) {
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
  appendTo(element) {
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
  clone() {
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
  disable() {
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
  enable() {
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
  getAttribute(name, defaultValue) {
    return this.attributes.get.apply(this.attributes, arguments);
  }

  /**
   * Retrieves classes from the element's Attributes object.
   *
   * @return {Array}
   *   The classes array.
   */
  getClasses() {
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
  hasAttribute(name) {
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
  hasClass(className) {
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
  html(content) {
    // If any argument was provided, then it's in "set" mode.
    if (content !== void 0) {
      // Clear out any children.
      this.children = [];
      // Only set the content if there's value.
      if (content) {
        this.append(content);
      }
      return this;
    }
    else {
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
  prepend(content, attributes) {
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
  prependTo(element) {
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
  removeAttribute(name) {
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
  removeClass(value) {
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
  replaceClass(oldValue, newValue) {
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
  setAttribute(name, value) {
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
  setAttributes(attributes) {
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
  text(string) {
    if (string !== void 0) {
      this.children = [];
      this.value = util.encodeHtmlEntities(string);
      return this;
    }
    else {
      return this.value || '';
    }
  }

  /**
   * Renders an element to a string.
   *
   * @return {String}
   *   The rendered HTML output.
   */
  toString() {
    var output = '';

    // Skip if the element is not enabled.
    if (!this.enabled) {
      return output;
    }

    if (this.tag) {
      // To ensure backwards comparability, add a "self-closing" forward slash
      // for void element since HTML5 ignores these anyway.
      output += `<${this.tag}${this.attributes}${this.voidElement ? ' /' : ''}>`;
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
      output += `</${this.tag}>\n`;
    }

    return output;
  }

}

/**
 * The void elements.
 *
 * @type {String[]}
 */
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
DreditorElement.create = function create(content = null, attributes = {}) {
  if (content instanceof DreditorElement) {
    return content.setAttributes(attributes);
  }
  var tag = content && content.match(/^<?(\w+)[^>]*>?$/);
  if (tag) {
    return new DreditorElement(tag[1]);
  }
  else {
    var element = new DreditorElement();
    element.value = content;
    return element;
  }
};
