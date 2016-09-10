import DreditorDiff from './DreditorDiff';
import DreditorFile from './DreditorFile';
import util from './DreditorUtility';

export default class DreditorPatch extends DreditorDiff {

  /**
   * @class DreditorPatch
   *
   * @param {DreditorParser} parser
   *   The DreditorParser object this file belongs to.
   * @param {String} string
   *   The contents of a diff file section.
   *
   * @constructor
   */
  constructor(parser, string) {
    super(parser.dreditor, string);

    /**
     * The DreditorParser object this patch belongs to.
     *
     * Define this property so that it cannot be overridden or show up in
     * enumerations. It is meant solely for referencing purposes only.
     *
     * @type {DreditorParser}
     */
    Object.defineProperty(this, 'parser', {
      value: parser,
      configurable: true,
      enumerable: false,
      writable: true
    });

    /**
     * An array of DreditorFile objects.
     *
     * @type {DreditorFile[]}
     */
    this.files = [];

    /**
     * The array index associated with this object.
     *
     * @type {Number}
     */
    this.index = null;

    /**
     * Meta information for the patch.
     *
     * @type {Object}
     */
    this.meta = null;

    /**
     * The patch SHA1 identifier, if any.
     *
     * Normally, this SHA1 is meaningless (for any real reference), however it
     * can be used to construct the DOM identifier (above) for creating anchors.
     *
     * @type {String}
     */
    this.sha1 = null;
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
      this.parser = null;
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
    return this.doParse('patch', () => {
      // Split into separate files, delimited by lines starting with "diff".
      var files = this.raw.split(/^diff\s[^\n]+\n/gm);

      // Extract any meta information from the first array item.
      var meta = files.shift();

      // Remove any lingering empty array items.
      files = files.filter(Boolean);

      // Parse the meta info and then the files.
      return this.parseMetaInfo(meta, files).then(() => {
        return this.parseFiles(files);
      });
    });
  }

  /**
   * Parses any supplied meta information from a patch.
   *
   * This is typically only ever provided if a patch was created using
   * git-format-patch.
   *
   * @param {String} info
   *   A string of meta information from a patch.
   * @param {Array} files
   *   The array of diff files in the patch.
   *
   * @return {Object|null}
   *   The fully parsed git-format object or null.
   */
  parseMetaInfo(info, files) {
    if (this.meta) {
      return this.meta;
    }
    return this.doParse('patch.meta', () => {
      var meta = {};

      if (info.length) {
        var headers = info.split('\n').filter(Boolean);

        // Determine position of the "first blank line", if any.
        var blank = util.indexOf(headers, '');

        // Determine position of the "scissor", if any.
        var scissor = util.indexOf(headers, '-- >8 --');

        // Join the headers and any subsequent headers from the "body" after the
        // first blank line and/or "scissor" delimiters.
        if (blank !== -1 && scissor !== -1) {
          // If there is no blank line, then just use the headers array length.
          if (blank === -1) {
            blank = headers.length;
          }
          headers = headers.slice(0, blank).concat(headers.slice((scissor !== -1 ? scissor : blank) + 1));
        }

        // Parse any meta information as "email header fields" per RFC 2822.
        // https://tools.ietf.org/html/rfc2822#section-2.2
        var previousKey;
        util.forEach(headers, (header, i) => {
          var parts = header.match(/^([\w\d\-_]+):\s(.*)/);
          var key = parts && parts[1] && util.machineName(parts[1]);
          var value = parts && parts[2];
          if (key && value) {
            // Convert to a date object.
            if (/^date/i.test(key)) {
              value = !isNaN(Date.parse(value)) ? new Date(value) : value;
            }
            // Remove the standard git subject prefix ([PATCH]) if there's
            // just one patch. If there is more than one patch ([PATCH n/n])
            // then keeping this prefix is important for identification.
            else if (/^subject/i.test(key)) {
              value = value.replace(/^\[PATCH]\s/, '');
            }
            meta[key] = value;
            previousKey = key;
          }
          // Parse "Long Header Fields" (lines that start with a single space)
          // and append its value to the previous key.
          else if (previousKey && header.match(/^\s/)) {
            meta[previousKey] += header;
          }
          else if (!header || header.match(/^---/)) {
            previousKey = null;
          }
        });

        // Finally, extract any signature and remove it from the last file.
        if (files && files.length) {
          var lastFile = files[files.length - 1];
          var signaturePosition = lastFile.search(/^--\s*\n(.|\n)*$/m);
          if (signaturePosition !== -1) {
            meta.signature = lastFile.substr(signaturePosition).replace(/^--\s*\n/, '') || null;
            if (meta.signature) {
              files[files.length - 1] = lastFile.substr(0, signaturePosition);
            }
          }
        }
      }

      this.meta = meta;
    });
  }

  /**
   * Parses the array of file strings.
   *
   * @param {Array} files
   *   The array of string files that was split.
   *
   * @return {Promise}
   *   A promise object.
   */
  parseFiles(files) {
    return this.map(files, (string, i) => {
      var file = new DreditorFile(this, string);
      return file.parse().then(() => {
        file.id = `file-${i + 1}`;
        file.index = i;
        this.size += file.size;
        this.files[i] = file;
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
    return this.doRender('patch', () => {
      this.rendered = util.createElement('<div>').addClass('dreditor-patch');

      if (Object.keys(this.meta).length) {
        var meta = util.createElement('<div>').addClass('dreditor-patch-meta').appendTo(this.rendered);
        var table = util.createElement('<table>').appendTo(meta);
        var body = util.createElement('<tbody>').appendTo(table);
        for (var p in this.meta) {
          if (this.meta.hasOwnProperty(p)) {
            var value = this.meta[p];
            if (value instanceof Date) {
              var iso = typeof value.toISOString === 'function' ? value.toISOString() : false;
              value = typeof value.toLocaleString === 'function' ? value.toLocaleString() : value.toString();
              if (iso) {
                value = `<time datetime="${iso}">${value}</time>`;
              }
            }
            util.createElement(`<tr><td>${p}</td><td>${value}</td></tr>`).appendTo(body);
          }
        }
      }
      // Render the files.
      return this.map([].concat(this.files), (file) => {
        return file.render().then((content) => this.rendered.append(content));
      });
    });
  }

}
