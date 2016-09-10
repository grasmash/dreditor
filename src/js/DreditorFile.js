import DreditorDiff from './DreditorDiff';
import DreditorHunk from './DreditorHunk';
import DreditorPatch from './DreditorPatch';
import util from './DreditorUtility';

export default class DreditorFile extends DreditorDiff {

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
  constructor(patch, string) {
    if (!(patch instanceof DreditorPatch)) {
      throw new Error(`The "patch" argument must be an instance of DreditorPatch: ${patch}`);
    }

    super(patch.dreditor, string);

    /**
     * The DreditorPatch object this file belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorPatch}
     */
    Object.defineProperty(this, 'patch', {
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
    this.extension = null;

    /**
     * The filename.
     *
     * @type {String}
     */
    this.filename = null;

    /**
     * An array of DreditorHunk objects.
     *
     * @type {DreditorHunk[]}
     */
    this.hunks = [];

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    this.index = null;

    /**
     * The source file in the diff.
     *
     * @type {String}
     */
    this.source = null;

    /**
     * The status of this file: added, deleted, modified or renamed.
     *
     * @type {String}
     */
    this.status = null;

    /**
     * The target file in the diff.
     *
     * @type {String}
     */
    this.target = null;
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
  parse() {
    return this.doParse('file', () => {
      // Separate file into hunks.
      var hunks = this.raw.split(/^@@+\s/gm).filter(Boolean);

      // Extract the file information from the first hunk.
      util.forEach(hunks.shift().split(/\n/), (line) => {
        // Skip null values.
        if (/\/dev\/null/.test(line)) {
          return;
        }
        if (/^index\s/.test(line)) {
          this.index = line.replace(/^index\s/, '');
        }
        else if (/^---\s/.test(line)) {
          this.source = line.replace(/^---\s(a\/)?/, '');
        }
        else if (/^\+\+\+\s/.test(line)) {
          this.target = line.replace(/^\+\+\+\s(b\/)?/, '');
        }
      });

      if (!this.source && this.target) {
        this.filename = this.target;
        this.status = 'added';
      }
      else if (this.source && !this.target) {
        this.filename = this.source;
        this.status = 'deleted';
      }
      else if (this.source && this.target && this.source !== this.target) {
        this.filename = this.source + ' -> ' + this.target;
        this.status = 'renamed';
      }
      else if (this.source === this.target) {
        this.filename = this.target;
        this.status = 'modified';
      }

      // Determine the extension to associate with the DreditorFile object.
      this.extension = util.extension(this.target ? this.target : this.source);

      // Parse the hunks.
      return this.map(hunks, (string, i) => {
        var hunk = new DreditorHunk(this, string);
        return hunk.parse().then(() => {
          hunk.id = `hunk-${i + 1}`;
          hunk.index = i;
          this.size += hunk.size;
          this.hunks[i] = hunk;
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
    return this.doRender('file', () => {
      this.rendered = util.createElement('<div>', this.attributes).addClass('dreditor-file');

      var header = util.createElement('<div>').addClass('dreditor-file-header').appendTo(this.rendered);

      // Create file info.
      util.createElement('<div>').addClass('dreditor-file-info').appendTo(header)
        .append(this.renderDiffStats())
        .append(this.renderStatus())
        .append(this.renderFilename());

      var wrapper = util.createElement('<div>').addClass('dreditor-file-table-wrapper').appendTo(this.rendered);
      var table = util.createElement('<table>').addClass('dreditor-file-table').appendTo(wrapper);
      var body = util.createElement('<tbody>').appendTo(table);

      // Render the hunks.
      return this.map([].concat(this.hunks), (hunk) => {
        return hunk.render().then((content) => body.append(content));
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
  renderFilename() {
    return util.createElement('<span>').addClass('dreditor-filename').text(this.filename);
  }

  /**
   * Determines which abbreviation to use for the status.
   *
   * @return {DreditorElement|String}
   *   The DreditorElement object containing the rendered HTML. Can be cast to
   *   a string value or manually invoked using the toString method.
   */
  renderStatus() {
    var status = '?';
    if (this.status === 'added') {
      status = 'A';
    }
    else if (this.status === 'deleted') {
      status = 'D';
    }
    else if (this.status === 'modified') {
      status = 'M';
    }
    else if (this.status === 'renamed') {
      status = 'R';
    }
    return util.createElement('<span>').text(status)
      .addClass(['dreditor-file-status', `dreditor-file-status--${this.status ? this.status : 'unknown'}`])
      .setAttribute('title', this.status[0].toUpperCase() + this.status.substr(1));
  }

}
