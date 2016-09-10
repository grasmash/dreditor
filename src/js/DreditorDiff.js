import DreditorRenderable from './DreditorRenderable';
import util from './DreditorUtility';

export default class DreditorDiff extends DreditorRenderable {

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
  constructor(dreditor, string) {
    super(dreditor);

    if (typeof string !== 'string') {
      throw new Error(`The argument passed must be a string. This was passed instead: ${string}`);
    }

    /**
     * The number additions.
     *
     * @type {Number}
     */
    this.additions = 0;

    /**
     * The number of deletions.
     *
     * @type {Number}
     */
    this.deletions = 0;

    /**
     * The un-altered string that was passed.
     *
     * @type {String}
     */
    this.raw = string;

    /**
     * The un-altered byte size of the string that was passed.
     *
     * @type {Number}
     */
    this.rawSize = string.length;

    /**
     * The patch byte size, minute any meta information.
     *
     * @type {Number}
     */
    this.size = 0;
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
  doParse(name, callback) {
    return this
      .doTask(name ? `parse.${name}` : 'parse', () => {
        return this.resolve(callback.call(this));
      })
      .then(() => {
        var value = this.resolve(this);
        this.garbageCollect('parse');
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
  garbageCollect(type = 'default') {
    var collect = super.garbageCollect(type);
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
  parse() {
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
  renderDiffStats(object = this) {
    if (!(object instanceof DreditorDiff)) {
      throw new Error(`The "object" argument passed is not an instance of DreditorDiff: ${object}`);
    }
    return util.createElement('<span>').addClass('dreditor-stat')
      .append(`<span class="dreditor-stat-additions" title="${object.additions} additions">+${object.additions}</span>`)
      .append(`<span class="dreditor-stat-deletions" title="${object.deletions} deletions">-${object.deletions}</span>`);
  }

}
