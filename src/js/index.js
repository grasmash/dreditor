import 'setimmediate';
import Dreditor from './Dreditor';
import Attributes from './Attributes';
import Base from './Base';
import Diff from './Diff';
import Element from './Element';
import Emitter from './Emitter';
import Event from './Event';
import File from './File';
import Hunk from './Hunk';
import Line from './Line';
import LocaleBase from './LocaleBase';
import Parser from './Parser';
import Patch from './Patch';
import Proxy from './Proxy';
import Renderable from './Renderable';
import Url from './Url';
import Utility from './Utility';

module.exports = function (options) {
  return new Dreditor(options);
};

module.exports.__version__ = Dreditor.__version__;
module.exports.__defaultOptions__ = Dreditor.__defaultOptions__;
module.exports.Attributes = Attributes;
module.exports.Base = Base;
module.exports.Diff = Diff;
module.exports.Dreditor = Dreditor;
module.exports.Element = Element;
module.exports.Emitter = Emitter;
module.exports.Event = Event;
module.exports.File = File;
module.exports.Hunk = Hunk;
module.exports.Line = Line;
module.exports.LocaleBase = LocaleBase;
module.exports.Parser = Parser;
module.exports.Patch = Patch;
module.exports.Proxy = Proxy;
module.exports.Renderable = Renderable;
module.exports.Url = Url;
module.exports.Utility = Utility;
