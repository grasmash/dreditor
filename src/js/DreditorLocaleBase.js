import DreditorBase from './DreditorBase';
import util from './DreditorUtility';

export default class DreditorLocaleBase extends DreditorBase {

  constructor(options = {}) {
    super(util.extend(true, {}, DreditorLocaleBase.__defaultOptions__, options));

    /**
     * The current language code.
     *
     * @type {String}
     */
    this.langCode = this.getOption('langCode', 'en-US');

    /**
     * The locale object.
     *
     * @type {Object}
     */
    this.locale = this.getOption('locale', {});
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
    if (this.locale[langCode] && this.locale[langCode].hasOwnProperty(text)) {
      return this.locale[langCode][text];
    }
    return text;
  }

}

DreditorLocaleBase.__defaultOptions__ = {
  locale: {}
};
