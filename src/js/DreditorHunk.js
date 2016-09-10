import DreditorDiff from './DreditorDiff';
import DreditorFile from './DreditorFile';
import DreditorLine from './DreditorLine';
import util from './DreditorUtility';

export default class DreditorHunk extends DreditorDiff {

  /**
   * @class DreditorHunk
   *
   * @param {DreditorFile} file
   *   The DreditorFile object this hunk belongs to.
   * @param {String} string
   *   The hunk string.
   *
   * @constructor
   */
  constructor(file, string) {
    if (!(file instanceof DreditorFile)) {
      throw new Error(`The "file" argument must be an instance of DreditorFile: ${file}`);
    }

    super(file.dreditor, string);

    /**
     * The DreditorFile object this hunk belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorFile}
     */
    Object.defineProperty(this, 'file', {
      value: file,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * The hunk header, if any.
     *
     * @type {String}
     */
    this.header = null;

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    this.index = null;

    /**
     * An array of DreditorLine objects.
     *
     * @type {DreditorLine[]}
     */
    this.lines = [];

    /**
     * The hunk meta information.
     *
     * @type {String}
     */
    this.meta = null;

    /**
     * The source meta info.
     *
     * @type {{start: Number, total: Number}}
     */
    this.source = {start: 0, total: 0};

    /**
     * The target meta info.
     *
     * @type {{start: Number, total: Number}}
     */
    this.target = {start: 0, total: 0};
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
      this.file = null;
    }
    return collect;
  }

  /**
   * Highlights code in the hunk.
   */
  highlightCode() {
    // Join each line value to simulate the hunk in its entirety.
    var string = '';
    util.forEach(this.lines, (line, i) => {
      string += line.value + (i !== this.lines.length - 1 ? '\n' : '');
    });

    var callback = this.getDreditorOption('highlightCode', util.noop);

    // Highlight the hunk code and split into an array of lines.
    var ret = (callback.apply(this, [string]) || '').split('\n').filter(Boolean);

    // Iterate over the return and set the corresponding line.
    util.forEach(ret, (line, i) => {
      this.lines[i].value = line;
    });
  }

  /**
   * {@inheritDoc}
   *
   * @return {Promise}
   *   A Promise object.
   */
  parse() {
    return this.doParse('hunk', () => {
      // Extract hunk meta information.
      var info = this.raw.match(/^[^\n]+/);
      if (info[0]) {
        // Extract the "at" separator, and prepend it to the meta information.
        // This was removed from the hunk split in DreditorFile.
        var at = info[0].match(/\s?(@@+)\s?/);
        this.meta = (at && at[1] && at[1] + ' ' || '') + info[0];

        var parts = info[0].split(/\s?@@+\s?/);
        if (parts[1]) {
          this.header = parts[1];
        }

        var source;
        var target;
        var ranges = parts[0].split(' ');
        if (ranges[0][0] === '-') {
          source = ranges[0].substr(1).split(',');
          target = ranges[1].substr(1).split(',');
        }
        else {
          source = ranges[1].substr(1).split(',');
          target = ranges[0].substr(1).split(',');
        }
        this.source.start = parseInt(source[0], 10);
        this.source.total = parseInt(source[1] || 0, 10);
        this.target.start = parseInt(target[0], 10);
        this.target.total = parseInt(target[1] || 0, 10);
      }

      var sourceStart = this.source.start;
      var targetStart = this.target.start;

      var lines = this.raw.replace(/^[^\n]*\n/, '').split(/\n/).filter(Boolean);

      // Parse the lines.
      return this.map(lines, (string, i) => {
        var line = new DreditorLine(this, string);
        return line.parse().then(() => {
          line.id = `line-${i + 1}`;
          line.index = i;
          this.size += line.size;
          switch (line.status) {
            case 'added':
              line.lineNumbers.target = targetStart++;
              break;
            case 'deleted':
              line.lineNumbers.source = sourceStart++;
              break;

            default:
              line.lineNumbers.source = sourceStart++;
              line.lineNumbers.target = targetStart++;
              break;
          }
          this.lines[i] = line;
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
    return this.doRender('hunk', () => {
      // Just create an empty element to house the rows.
      this.rendered = util.createElement();

      if (this.meta) {
        util.createElement('<tr>', this.attributes).addClass(['dreditor-line', 'dreditor-line--hunk'])
          .append('<td data-line-number="..." class="dreditor-line-number"></td>')
          .append('<td data-line-number="..." class="dreditor-line-number"></td>')
          .append(`<td>${this.meta}</td>`)
          .appendTo(this.rendered)
        ;
      }

      // Render the lines.
      return this.map([].concat(this.lines), (line) => {
        return line.render().then((content) => this.rendered.append(content));
      });
    });
  }

}
