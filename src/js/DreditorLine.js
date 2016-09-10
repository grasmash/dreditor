import DreditorDiff from './DreditorDiff';
import DreditorHunk from './DreditorHunk';
import util from './DreditorUtility';

export default class DreditorLine extends DreditorDiff {

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
  constructor(hunk, string) {
    if (!(hunk instanceof DreditorHunk)) {
      throw new Error(`The "hunk" argument must be an instance of DreditorHunk: ${hunk}`);
    }

    super(hunk.dreditor, string);

    /**
     * The DreditorHunk object this line belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorHunk}
     */
    Object.defineProperty(this, 'hunk', {
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
    this.index = null;

    /**
     * The source and target line numbers.
     *
     * @type {{source: Number, target: Number}}
     */
    this.lineNumbers = {source: 0, target: 0};

    /**
     * The status of the line.
     *
     * @type {String}
     */
    this.status = null;

    /**
     * The value of the line.
     *
     * @type {String}
     */
    this.value = null;
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
  parse() {
    return this.doParse('line', () => {
      // Determine if this line was added, deleted or purely contextual.
      this.status = this.raw[0] === '+' && 'added' || this.raw[0] === '-' && 'deleted' || 'context';

      this.attributes.addClass(`dreditor-line--${this.status}`);

      // Remove the first character from the string as the "value".
      this.value = this.raw.substr(1);

      // Set the size of the line.
      this.size = this.value.length;

      // Increase stats.
      switch (this.status) {
        case 'added':
          this.hunk.additions++;
          this.hunk.file.additions++;
          this.hunk.file.patch.additions++;
          this.hunk.file.patch.parser.additions++;
          break;

        case 'deleted':
          this.hunk.deletions++;
          this.hunk.file.deletions++;
          this.hunk.file.patch.deletions++;
          this.hunk.file.patch.parser.deletions++;
          break;
      }

      return this.resolve(this.value);
    });
  }

  /**
   * {@inheritDoc}
   *
   * @return {Promise}
   *   A Promise object.
   */
  render() {
    return this.doRender('line', () => {
      this.rendered = util.createElement('<tr>', this.attributes).addClass(['dreditor-line', `dreditor-line--${this.status}`]).setAttribute('id', this.id);

      // Source line number.
      util.createElement('<td>').appendTo(this.rendered)
        .addClass('dreditor-line-number')
        .setAttribute('id', `${this.id}S${this.lineNumbers.source}`)
        .setAttribute('data-line-number', this.lineNumbers.source ? this.lineNumbers.source : '');

      // Target line number.
      util.createElement('<td>').appendTo(this.rendered)
        .addClass('dreditor-line-number')
        .setAttribute('id', `${this.id}T${this.lineNumbers.target}`)
        .setAttribute('data-line-number', this.lineNumbers.target ? this.lineNumbers.target : '');

      // Source code.
      var code = util.createElement('<td>').appendTo(this.rendered).addClass('dreditor-line-code');
      util.createElement('<span>')
        .appendTo(code)
        .addClass('dreditor-line-code-inner')
        .html(`${this.status === 'added' && '+' || this.status === 'deleted' && '-' || ' '}${this.value}`);

      return this.resolve(this.rendered);
    });
  }

}
