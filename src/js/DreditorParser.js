import Dreditor from './Dreditor';
import DreditorDiff from './DreditorDiff';
import DreditorPatch from './DreditorPatch';
import DreditorUrl from './DreditorUrl';
import util from './DreditorUtility';

export default class DreditorParser extends DreditorDiff {

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
  constructor(dreditor, string, url = null) {
    super(dreditor, string);

    /**
     * The sanitized string.
     *
     * @type {String}
     */
    this.sanitized = null;

    /**
     * An array of DreditorPatch objects.
     *
     * @type {DreditorPatch[]}
     */
    this.patches = [];

    /**
     * The DreditorUrl object that provided the contents of this file, if any.
     *
     * @type {DreditorUrl}
     */
    this.url = url && DreditorUrl.create(url) || null;
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
  parse() {
    return this.doParse(null, () => {
      this.sanitized = this.sanitize(this.raw);

      // Extract sequential constructed patches created using git-format-patch by
      // splitting the file up based on git's "fixed magic date" header.
      // @see https://git-scm.com/docs/git-format-patch
      var sha1 = [];
      var patches = this.sanitized.split(/^From (\b[0-9a-f]{5,40}\b) Mon Sep 17 00:00:00 2001/gm).filter((patch) => {
        if (/^[0-9a-f]{5,40}/.test(patch)) {
          sha1.push(patch);
          return false;
        }
        return !!patch.length;
      });

      // Parse the patches.
      return this.map(patches, (string, i) => {
        var patch = new DreditorPatch(this, string);
        return patch.parse().then(() => {
          patch.sha1 = sha1[i] || null;
          patch.id = `patch-${patch.sha1 ? patch.sha1.substr(0, 5) : (i + 1)}`;
          patch.index = i;
          this.size += patch.size;
          this.patches[i] = patch;
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
  render() {
    return this.doRender(null, () => {
      this.rendered = util.createElement('<div>', this.attributes).addClass(['dreditor-wrapper', 'dreditor-reset']);

      var pager = util.createElement('<ul>').addClass('dreditor-patch-menu').appendTo(this.rendered).append('<li><strong>Patch</strong></li>');
      var patches = util.createElement('<div>').addClass('dreditor-patches').appendTo(this.rendered);

      // Disable the pager if there isn't more than 1 patch.
      if (this.patches.length <= 1) {
        pager.disable();
      }

      // Render the patches.
      return this.map([].concat(this.patches), (patch, i) => {
        pager.append(`<li><a href="#${patch.id}">${i + 1}</a></li>`);
        return patch.render().then((output) => patches.append(output));
      });
    });
  }

}
