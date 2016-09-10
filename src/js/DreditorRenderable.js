import DreditorAttributes from './DreditorAttributes';
import DreditorProxy from './DreditorProxy';

export default class DreditorRenderable extends DreditorProxy {

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
  constructor(dreditor, string) {
    super(dreditor, string);

    /**
     * An Attributes object.
     *
     * @type {DreditorAttributes}
     */
    this.attributes = new DreditorAttributes();

    /**
     * The DOM identifier.
     *
     * It defaults to "patch-N", where N is the array index + 1.
     *
     * @type {String}
     */
    this.id = null;

    /**
     * The rendered HTML output.
     *
     * @type {DreditorElement|String}
     */
    this.rendered = null;
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
  doRender(name, callback) {
    if (this.rendered) {
      return this.resolve(this.rendered);
    }
    return this
      .doTask(name ? `render.${name}` : 'render', () => {
        return this.resolve(callback.call(this)).then(() => {
          if (this.getDreditorOption('renderToString')) {
            this.rendered = this.rendered.toString();
          }
          return this.resolve(this.rendered);
        });
      })
      .catch((e) => {
        // Rethrow any actual errors.
        if (e instanceof Error) {
          throw e;
        }
        // Otherwise, just resolve.
        return this.resolve(this.rendered.disable());
      })
      .then(() => {
        var value = this.resolve(this.rendered);
        this.garbageCollect('render');
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
  render() {
    return this.reject(new Error('You must subclass the "render" method of DreditorRenderable before invoking it.'));
  }

}
