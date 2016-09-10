import Dreditor from './Dreditor';
import util from './DreditorUtility';

export default class DreditorProxy {

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
  all(array) {
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
  constructor(dreditor, options = {}) {
    if (!(dreditor instanceof Dreditor)) {
      throw new Error(`The "dreditor" argument must be an instance of Dreditor: ${dreditor}`);
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
  doTask(name, callback) {
    var obj = this;
    return obj.promise((fulfill, reject) => {
      if (!obj.emit(`${name}.start`, this)) {
        return reject(obj);
      }
      return fulfill(callback.call(obj));
    }).then(() => {
      return obj.emit(`${name}.end`, this) && obj;
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
  each(array, callback) {
    array = util.isArray(array) ? array : [array];
    return array.reduce((prev, curr, i) => {
      return prev.then(() => {
        return callback(curr, i, array);
      });
    }, this.resolve()).then(() => {
      return this.resolve(array);
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
  emit(type, args) {
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
  garbageCollect(type = 'default') {
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
  getDreditorOption(name, defaultValue = null) {
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
  getOption(name, defaultValue = null) {
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
  map(array, callback) {
    // Convert each item in the object to a promise.
    return this.each(array, (value, i) => {
      array[i] = this.resolve(callback.apply(this, [value, i, array]));
    }).then((array) => {
      return this.all(array);
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
  off(type, listener) {
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
  on(type, listener) {
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
  once(type, listener) {
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
  promise(resolver) {
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
  proxy(method, args) {
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
  reject(value) {
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
  resolve(value) {
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
  sanitize(string, force = false) {
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
  t(text, langCode = this.langCode) {
    return this.proxy('t', arguments);
  }

}
