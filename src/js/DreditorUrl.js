import util from './DreditorUtility';

export default class DreditorUrl {

  /**
   * @class DreditorUrl
   *
   * @param {DreditorUrl|String|{url: String}} url
   *   The URL for the file. Optionally, an object can be passed instead and
   *   its properties will be merged in.
   *
   * @constructor
   */
  constructor(url) {

    /**
     * The base filename, without the extension.
     *
     * @type {String}
     */
    this.basename = null;

    /**
     * The file extensions.
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
     * The file SHA1 digest based on the value of the URL.
     *
     * @type {Number}
     */
    this.sha1 = null;

    /**
     * The file size, if known.
     *
     * @type {Number}
     */
    this.size = 0;

    /**
     * The file mime type, if known.
     *
     * @type {String}
     */
    this.type = null;

    /**
     * The file URL.
     *
     * @type {String}
     */
    this.url = typeof url === 'string' && url || null;

    // Merge in any passed object properties.
    if (util.isObject(url)) {
      util.extend(this, url);
    }

    if (!this.url || !util.isUrl(this.url)) {
      throw new Error('A DreditorUrl object must be initialized with a valid "url" property.');
    }

    // Fill in the defaults.
    this.extension = util.extension(this.url);
    this.basename = util.basename(this.url, '.' + this.extension);
    this.filename = [this.basename, this.extension].join('.');
    this.sha1 = util.sha1(this.url);
  }

}

/**
 * Creates a new DreditorUrl instance.
 *
 * @param {DreditorUrl|String|{url: String}} url
 *   The URL for the file. Optionally, an object can be passed instead and
 *   its properties will be merged in.
 *
 * @return {DreditorUrl}
 *   A new DreditorFile instance.
 */
DreditorUrl.create = function create(url) {
  return url instanceof DreditorUrl ? url : new DreditorUrl(url);
};
