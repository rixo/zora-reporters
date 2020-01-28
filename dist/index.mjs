import { EOL } from 'os';

const TestFilePrototype = {
    [Symbol.iterator]() {
        return this.failureList[Symbol.iterator]();
    },
    incrementSuccess() {
        this.success++;
    },
    incrementFailure() {
        this.failure++;
    },
    incrementSkip() {
        this.skip++;
    },
    writeLine() {
        this.out.clearLine(0);
        this.out.cursorTo(0);
        const statusSymbol = (this.failure > 0 ? ' ✖' : (this.skip > 0 ? ' ⚠' : ' ✔'));
        const style = (this.failure > 0 ? 'failureBadge' : (this.skip > 0 ? 'skipBadge' : 'successBadge'));
        let summaryString = `${this.success}/${this.total} `;
        summaryString = `${statusSymbol}${summaryString.padStart(8)}`;
        this.out.writeLine(`${this.out[style](summaryString)} ${this.out.path(this.file)}`, 1);
    },
    goIn(path) {
        this.path.push(path);
    },
    goOut() {
        this.path.pop();
    },
    addFailure(data) {
        const path = [...this.path];
        this.failureList.push({ path, data });
    }
};
const test = (file, out) => {
    let success = 0;
    let failure = 0;
    let skip = 0;
    const path = [file];
    const failureList = [];
    return Object.create(TestFilePrototype, {
        file: {
            value: file
        },
        out: {
            value: out
        },
        total: {
            get() {
                return success + failure + skip;
            }
        },
        success: {
            get() {
                return success;
            },
            set(val) {
                success = val;
            }
        },
        failure: {
            get() {
                return failure;
            },
            set(val) {
                failure = val;
            }
        },
        skip: {
            get() {
                return skip;
            },
            set(val) {
                skip = val;
            }
        },
        path: { value: path },
        failureList: { value: failureList }
    });
};

const delegate = (...methods) => (target) => {
    const output = {};
    for (const m of methods) {
        // @ts-ignore
        output[m] = (...args) => target[m](...args);
    }
    return output;
};
// @ts-ignore
const delegateTTY = delegate('write', 'clearLine', 'cursorTo', 'moveCursor');
const output = (stream) => {
    return Object.assign(delegateTTY(stream), {
        writeLine(message = '', padding = 0) {
            this.write(' '.repeat(padding) + message + EOL);
        },
        writeBlock(message, padding = 0) {
            this.writeLine();
            this.writeLine(message, padding);
        }
    });
};

const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

const $ = {
	enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

	// modifiers
	reset: init(0, 0),
	bold: init(1, 22),
	dim: init(2, 22),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),

	// colors
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	grey: init(90, 39),

	// background colors
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49)
};

function run(arr, str) {
	let i=0, tmp, beg='', end='';
	for (; i < arr.length; i++) {
		tmp = arr[i];
		beg += tmp.open;
		end += tmp.close;
		if (str.includes(tmp.close)) {
			str = str.replace(tmp.rgx, tmp.close + tmp.open);
		}
	}
	return beg + str + end;
}

function chain(has, keys) {
	let ctx = { has, keys };

	ctx.reset = $.reset.bind(ctx);
	ctx.bold = $.bold.bind(ctx);
	ctx.dim = $.dim.bind(ctx);
	ctx.italic = $.italic.bind(ctx);
	ctx.underline = $.underline.bind(ctx);
	ctx.inverse = $.inverse.bind(ctx);
	ctx.hidden = $.hidden.bind(ctx);
	ctx.strikethrough = $.strikethrough.bind(ctx);

	ctx.black = $.black.bind(ctx);
	ctx.red = $.red.bind(ctx);
	ctx.green = $.green.bind(ctx);
	ctx.yellow = $.yellow.bind(ctx);
	ctx.blue = $.blue.bind(ctx);
	ctx.magenta = $.magenta.bind(ctx);
	ctx.cyan = $.cyan.bind(ctx);
	ctx.white = $.white.bind(ctx);
	ctx.gray = $.gray.bind(ctx);
	ctx.grey = $.grey.bind(ctx);

	ctx.bgBlack = $.bgBlack.bind(ctx);
	ctx.bgRed = $.bgRed.bind(ctx);
	ctx.bgGreen = $.bgGreen.bind(ctx);
	ctx.bgYellow = $.bgYellow.bind(ctx);
	ctx.bgBlue = $.bgBlue.bind(ctx);
	ctx.bgMagenta = $.bgMagenta.bind(ctx);
	ctx.bgCyan = $.bgCyan.bind(ctx);
	ctx.bgWhite = $.bgWhite.bind(ctx);

	return ctx;
}

function init(open, close) {
	let blk = {
		open: `\x1b[${open}m`,
		close: `\x1b[${close}m`,
		rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
	};
	return function (txt) {
		if (this !== void 0 && this.has !== void 0) {
			this.has.includes(open) || (this.has.push(open),this.keys.push(blk));
			return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
		}
		return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
	};
}

var kleur = $;

const theme = ({ bgGreen, bgRed, bgYellow, green, red, cyan, gray, yellow, bold, underline } = kleur) => ({
    emphasis(message) {
        return underline().bold(message);
    },
    successBadge(message) {
        return bgGreen().black().bold(message);
    },
    failureBadge(message) {
        return bgRed().black().bold(message);
    },
    skipBadge(m) {
        return bgYellow().black().bold(m);
    },
    path(message) {
        const [first, ...rest] = message.split('/').reverse();
        return underline(gray(rest.reverse().join('/')) + '/' + first);
    },
    operator(operator) {
        return yellow(`${gray('[')} ${operator} ${gray(']')}`);
    },
    adornment(symbol) {
        return gray(symbol);
    },
    stackTrace(stack) {
        return cyan().underline(stack.trim());
    },
    summaryPass(count) {
        return green(`${bold('✔ PASS')}: ${count}`);
    },
    summarySkip(count) {
        return yellow(`${bold('⚠ SKIP')}: ${count}`);
    },
    summaryFail(count) {
        return red(`${bold('✔ FAIL')}: ${count}`);
    },
    error(value) {
        return red(value);
    },
    success(value) {
        return green(value);
    },
    diffSame(val) {
        return gray(val);
    },
    diffRemove(val) {
        return bgRed().black(val);
    },
    diffAdd(val) {
        return bgGreen().black(val);
    }
});
const paint = theme();

const isAssertionResult = (result) => {
    return 'operator' in result;
};

function Diff() {}
Diff.prototype = {
  diff: function diff(oldString, newString) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var callback = options.callback;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    this.options = options;
    var self = this;

    function done(value) {
      if (callback) {
        setTimeout(function () {
          callback(undefined, value);
        }, 0);
        return true;
      } else {
        return value;
      }
    } // Allow subclasses to massage the input prior to running


    oldString = this.castInput(oldString);
    newString = this.castInput(newString);
    oldString = this.removeEmpty(this.tokenize(oldString));
    newString = this.removeEmpty(this.tokenize(newString));
    var newLen = newString.length,
        oldLen = oldString.length;
    var editLength = 1;
    var maxEditLength = newLen + oldLen;
    var bestPath = [{
      newPos: -1,
      components: []
    }]; // Seed editLength = 0, i.e. the content starts with the same values

    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);

    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
      // Identity per the equality and tokenizer
      return done([{
        value: this.join(newString),
        count: newString.length
      }]);
    } // Main worker method. checks all permutations of a given edit length for acceptance.


    function execEditLength() {
      for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
        var basePath = void 0;

        var addPath = bestPath[diagonalPath - 1],
            removePath = bestPath[diagonalPath + 1],
            _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

        if (addPath) {
          // No one else is going to attempt to use this value, clear it
          bestPath[diagonalPath - 1] = undefined;
        }

        var canAdd = addPath && addPath.newPos + 1 < newLen,
            canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

        if (!canAdd && !canRemove) {
          // If this path is a terminal then prune
          bestPath[diagonalPath] = undefined;
          continue;
        } // Select the diagonal that we want to branch from. We select the prior
        // path whose position in the new string is the farthest from the origin
        // and does not pass the bounds of the diff graph


        if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
          basePath = clonePath(removePath);
          self.pushComponent(basePath.components, undefined, true);
        } else {
          basePath = addPath; // No need to clone, we've pulled it from the list

          basePath.newPos++;
          self.pushComponent(basePath.components, true, undefined);
        }

        _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath); // If we have hit the end of both strings, then we are done

        if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
          return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
        } else {
          // Otherwise track this path as a potential candidate and continue.
          bestPath[diagonalPath] = basePath;
        }
      }

      editLength++;
    } // Performs the length of edit iteration. Is a bit fugly as this has to support the
    // sync and async mode which is never fun. Loops over execEditLength until a value
    // is produced.


    if (callback) {
      (function exec() {
        setTimeout(function () {
          // This should not happen, but we want to be safe.

          /* istanbul ignore next */
          if (editLength > maxEditLength) {
            return callback();
          }

          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength) {
        var ret = execEditLength();

        if (ret) {
          return ret;
        }
      }
    }
  },
  pushComponent: function pushComponent(components, added, removed) {
    var last = components[components.length - 1];

    if (last && last.added === added && last.removed === removed) {
      // We need to clone here as the component clone operation is just
      // as shallow array clone
      components[components.length - 1] = {
        count: last.count + 1,
        added: added,
        removed: removed
      };
    } else {
      components.push({
        count: 1,
        added: added,
        removed: removed
      });
    }
  },
  extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
    var newLen = newString.length,
        oldLen = oldString.length,
        newPos = basePath.newPos,
        oldPos = newPos - diagonalPath,
        commonCount = 0;

    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }

    if (commonCount) {
      basePath.components.push({
        count: commonCount
      });
    }

    basePath.newPos = newPos;
    return oldPos;
  },
  equals: function equals(left, right) {
    if (this.options.comparator) {
      return this.options.comparator(left, right);
    } else {
      return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  },
  removeEmpty: function removeEmpty(array) {
    var ret = [];

    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }

    return ret;
  },
  castInput: function castInput(value) {
    return value;
  },
  tokenize: function tokenize(value) {
    return value.split('');
  },
  join: function join(chars) {
    return chars.join('');
  }
};

function buildValues(diff, components, newString, oldString, useLongestToken) {
  var componentPos = 0,
      componentLen = components.length,
      newPos = 0,
      oldPos = 0;

  for (; componentPos < componentLen; componentPos++) {
    var component = components[componentPos];

    if (!component.removed) {
      if (!component.added && useLongestToken) {
        var value = newString.slice(newPos, newPos + component.count);
        value = value.map(function (value, i) {
          var oldValue = oldString[oldPos + i];
          return oldValue.length > value.length ? oldValue : value;
        });
        component.value = diff.join(value);
      } else {
        component.value = diff.join(newString.slice(newPos, newPos + component.count));
      }

      newPos += component.count; // Common case

      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.

      if (componentPos && components[componentPos - 1].added) {
        var tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  } // Special case handle for when one terminal is ignored (i.e. whitespace).
  // For this case we merge the terminal into the prior string and drop the change.
  // This is only available for string mode.


  var lastComponent = components[componentLen - 1];

  if (componentLen > 1 && typeof lastComponent.value === 'string' && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }

  return components;
}

function clonePath(path) {
  return {
    newPos: path.newPos,
    components: path.components.slice(0)
  };
}

var characterDiff = new Diff();
function diffChars(oldStr, newStr, options) {
  return characterDiff.diff(oldStr, newStr, options);
}

//
// Ranges and exceptions:
// Latin-1 Supplement, 0080–00FF
//  - U+00D7  × Multiplication sign
//  - U+00F7  ÷ Division sign
// Latin Extended-A, 0100–017F
// Latin Extended-B, 0180–024F
// IPA Extensions, 0250–02AF
// Spacing Modifier Letters, 02B0–02FF
//  - U+02C7  ˇ &#711;  Caron
//  - U+02D8  ˘ &#728;  Breve
//  - U+02D9  ˙ &#729;  Dot Above
//  - U+02DA  ˚ &#730;  Ring Above
//  - U+02DB  ˛ &#731;  Ogonek
//  - U+02DC  ˜ &#732;  Small Tilde
//  - U+02DD  ˝ &#733;  Double Acute Accent
// Latin Extended Additional, 1E00–1EFF

var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
var reWhitespace = /\S/;
var wordDiff = new Diff();

wordDiff.equals = function (left, right) {
  if (this.options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  }

  return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
};

wordDiff.tokenize = function (value) {
  var tokens = value.split(/(\s+|[()[\]{}'"]|\b)/); // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.

  for (var i = 0; i < tokens.length - 1; i++) {
    // If we have an empty string in the next field and we have only word chars before and after, merge
    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
      tokens[i] += tokens[i + 2];
      tokens.splice(i + 1, 2);
      i--;
    }
  }

  return tokens;
};

var lineDiff = new Diff();

lineDiff.tokenize = function (value) {
  var retLines = [],
      linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  } // Merge the content and line separators into single tokens


  for (var i = 0; i < linesAndNewlines.length; i++) {
    var line = linesAndNewlines[i];

    if (i % 2 && !this.options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      if (this.options.ignoreWhitespace) {
        line = line.trim();
      }

      retLines.push(line);
    }
  }

  return retLines;
};

var sentenceDiff = new Diff();

sentenceDiff.tokenize = function (value) {
  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
};

var cssDiff = new Diff();

cssDiff.tokenize = function (value) {
  return value.split(/([{}:;,]|\s+)/);
};

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var objectPrototypeToString = Object.prototype.toString;
var jsonDiff = new Diff(); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
// dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

jsonDiff.useLongestToken = true;
jsonDiff.tokenize = lineDiff.tokenize;

jsonDiff.castInput = function (value) {
  var _this$options = this.options,
      undefinedReplacement = _this$options.undefinedReplacement,
      _this$options$stringi = _this$options.stringifyReplacer,
      stringifyReplacer = _this$options$stringi === void 0 ? function (k, v) {
    return typeof v === 'undefined' ? undefinedReplacement : v;
  } : _this$options$stringi;
  return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
};

jsonDiff.equals = function (left, right) {
  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
};

function diffJson(oldObj, newObj, options) {
  return jsonDiff.diff(oldObj, newObj, options);
} // This function handles the presence of circular references by bailing out when encountering an
// object that is already on the "stack" of items being processed. Accepts an optional replacer

function canonicalize(obj, stack, replacementStack, replacer, key) {
  stack = stack || [];
  replacementStack = replacementStack || [];

  if (replacer) {
    obj = replacer(key, obj);
  }

  var i;

  for (i = 0; i < stack.length; i += 1) {
    if (stack[i] === obj) {
      return replacementStack[i];
    }
  }

  var canonicalizedObj;

  if ('[object Array]' === objectPrototypeToString.call(obj)) {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);

    for (i = 0; i < obj.length; i += 1) {
      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
    }

    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  }

  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }

  if (_typeof(obj) === 'object' && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);

    var sortedKeys = [],
        _key;

    for (_key in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(_key)) {
        sortedKeys.push(_key);
      }
    }

    sortedKeys.sort();

    for (i = 0; i < sortedKeys.length; i += 1) {
      _key = sortedKeys[i];
      canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
    }

    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  }

  return canonicalizedObj;
}

var arrayDiff = new Diff();

arrayDiff.tokenize = function (value) {
  return value.slice();
};

arrayDiff.join = arrayDiff.removeEmpty = function (value) {
  return value;
};

// todo
const valToTypeString = (val) => {
    const type = typeof val;
    switch (type) {
        case 'object': {
            if (val === null) {
                return null;
            }
            if (Array.isArray(val)) {
                return 'array';
            }
            return type;
        }
        default:
            return type;
    }
};
const truthyDiagnostic = (diag) => ({
    report(out) {
        let val = diag.actual;
        if (val === '') {
            val = '""';
        }
        if (val === undefined) {
            val = 'undefined';
        }
        out.writeBlock(`expected a ${out.operator('TRUTHY')} value but got ${out.error(val)}`, 4);
    }
});
const falsyDiagnostic = (diag) => ({
    report(out) {
        out.writeBlock(`expected a ${out.operator('FALSY')} value but got ${out.error(JSON.stringify(diag.actual))}`, 4);
    }
});
const notEqualDiagnostic = () => ({
    report(out) {
        out.writeBlock(`expected values ${out.operator('NOT TO BE EQUIVALENT')} but they are`, 4);
    }
});
const unknownOperatorDiagnostic = (diag) => ({
    report(out) {
        out.writeBlock(`(unknown operator: ${diag.operator})`, 4);
    }
});
const isDiagnostic = () => ({
    report(out) {
        out.writeBlock(`expected values to point the ${out.operator('SAME REFERENCE')} but they don't`, 4);
    }
});
const isNotDiagnostic = () => ({
    report(out) {
        out.writeBlock(`expected values to point ${out.operator('DIFFERENT REFERENCES')} but they point the same`, 4);
    }
});
const errorDiagnostic = (diag) => ({
    report(out) {
        const error = diag.actual;
        const stack = String(error && error.stack || error)
            .split('\n').map(s => '    ' + s).join('\n');
        out.writeBlock(stack, 0);
    }
});
const countPadding = (string) => {
    let counter = 0;
    let i = 0;
    if (typeof string !== 'string') {
        return 0;
    }
    for (i; i < string.length; i++) {
        if (string[i] !== ' ') {
            return counter;
        }
        counter++;
    }
    return counter;
};
const writeNumberDifference = (out, actual, expected) => {
    out.writeBlock(`expected ${out.emphasis('number')} to be ${out.operator(expected)} but got ${out.error(actual)}`, 4);
};
const writeStringDifference = (out, actual, expected) => {
    const charDiffs = diffChars(actual, expected);
    const toRemove = charDiffs
        .filter((diff) => !diff.added)
        .map((d) => d.removed ? out.diffRemove(d.value) : out.diffSame(d.value))
        .join('');
    const toAdd = charDiffs
        .filter((diff) => !diff.removed)
        .map(d => d.added ? out.diffAdd(d.value) : out.diffSame(d.value))
        .join('');
    out.writeBlock(`expected ${out.emphasis('string')} to be ${out.operator(expected)} but got the following differences:`, 4);
    out.writeBlock(`${out.error('-')} ${toRemove}`, 4);
    out.writeLine(`${out.success('+')} ${toAdd}`, 4);
};
const writeBooleanDifference = (out, actual, expected) => {
    out.writeBlock(`expected ${out.emphasis('boolean')} to be ${out.operator(expected)} but got ${out.error(actual)}`, 4);
};
const expandNewLines = (val, curr) => {
    const { value } = curr;
    const flatten = value
        .split(EOL)
        .filter(v => v !== '')
        .map(p => Object.assign({}, curr, {
        value: p.trim(),
        padding: countPadding(p)
    }));
    val.push(...flatten);
    return val;
};
const writeObjectLikeDifference = (type) => (out, actual, expected) => {
    const diff = diffJson(actual, expected);
    const printDiffLines = ((diff) => {
        if (diff.added) {
            return `${out.success('+')} ${' '.repeat(diff.padding)}${out.diffAdd(diff.value)}`;
        }
        if (diff.removed) {
            return `${out.error('-')} ${' '.repeat(diff.padding)}${out.diffRemove(diff.value)}`;
        }
        return `  ${' '.repeat(diff.padding)}${out.diffSame(diff.value)}`;
    });
    const lineDiffs = diff
        .reduce(expandNewLines, [])
        .map(printDiffLines);
    out.writeBlock(`expected ${out.emphasis(type)} to be ${out.operator('EQUIVALENT')} but got the following differences:`, 4);
    out.writeLine('');
    for (const l of lineDiffs) {
        out.writeLine(l, 2);
    }
};
const writeObjectDifference = writeObjectLikeDifference('objects');
const writeArrayDifference = writeObjectLikeDifference('arrays');
const equalDiagnostic = (diag) => {
    const { actual, expected } = diag;
    const expectedType = valToTypeString(expected);
    const actualType = valToTypeString(actual);
    const isSameType = actualType === expectedType;
    return {
        report(out) {
            if (isSameType === false) {
                out.writeBlock(`expected ${out.operator(`${expectedType} (${expected})`)} but got ${out.error(actualType)}`, 4);
            }
            else {
                switch (expectedType) {
                    case 'number':
                        writeNumberDifference(out, actual, expected);
                        break;
                    case 'string':
                        writeStringDifference(out, actual, expected);
                        break;
                    case 'boolean':
                        writeBooleanDifference(out, actual, expected);
                        break;
                    case 'object':
                        writeObjectDifference(out, actual, expected);
                        break;
                    case 'array':
                        writeArrayDifference(out, actual, expected);
                        break;
                    default:
                        out.writeBlock(`expected ${out.emphasis(expectedType)} to be ${out.operator('EQUIVALENT')} but they are not`, 4);
                }
            }
        }
    };
};
const getDiagnosticReporter = (diag) => {
    switch (diag.operator) {
        case "ok" /* OK */:
            return truthyDiagnostic(diag);
        case "notOk" /* NOT_OK */:
            return falsyDiagnostic(diag);
        case "notEqual" /* NOT_EQUAL */:
            return notEqualDiagnostic();
        case "is" /* IS */:
            return isDiagnostic();
        case "isNot" /* IS_NOT */:
            return isNotDiagnostic();
        case "equal" /* EQUAL */:
            return equalDiagnostic(diag);
        case "doesNotThrow" /* DOES_NOT_THROW */:
            return errorDiagnostic(diag);
        default:
            return unknownOperatorDiagnostic(diag);
    }
};

const printHeader = (message, out) => {
    const header = message.toUpperCase();
    out.writeBlock(out.emphasis(header), 1);
};
const printFailures = (tests, out) => {
    const failing = tests
        .filter(t => t.failure)
        .reduce((acc, curr) => acc.concat([...curr]), []);
    if (failing.length === 0) {
        out.writeLine('N/A', 2);
        return;
    }
    failing.forEach((failure, index) => {
        const data = failure.data;
        const [file, ...testPath] = failure.path;
        const header = testPath.concat(out.emphasis(data.description)).join(out.adornment(' > '));
        out.writeBlock((`${paint.adornment(`${index + 1}.`)} ${header} ${out.adornment('<--')} ${out.operator(data.operator)}`));
        out.writeLine(`${paint.adornment('at')} ${paint.stackTrace(data.at)}`, 4);
        getDiagnosticReporter(data).report(out);
        out.writeLine(out.adornment('_'.repeat(out.width)));
    });
};
const printFooter = (tests, out) => {
    const skipped = tests.reduce((acc, curr) => acc + curr.skip, 0);
    const failure = tests.reduce((acc, curr) => acc + curr.failure, 0);
    const success = tests.reduce((acc, curr) => acc + curr.success, 0);
    out.writeLine(paint.summaryPass(success), 1);
    out.writeLine(paint.summarySkip(skipped), 1);
    out.writeLine(paint.summaryFail(failure), 1);
    out.writeLine(`${EOL}`);
};
const reporter = (theme = paint, stream = process.stdout) => {
    const out = Object.assign(output(stream), theme, {
        width: stream.columns || 80
    });
    return async (stream) => {
        const tests = [];
        let pass = true;
        printHeader('tests files', out);
        out.writeLine('');
        for await (const message of stream) {
            const current = tests[tests.length - 1];
            const { data, offset, type } = message;
            if (type === "BAIL_OUT" /* BAIL_OUT */) {
                throw data;
            }
            if (type === "TEST_END" /* TEST_END */ && offset > 0) {
                current.goOut();
            }
            if (type === "TEST_START" /* TEST_START */) {
                if (offset === 0) {
                    const newTest = test(data.description, out);
                    newTest.writeLine();
                    tests.push(newTest);
                }
                else {
                    current.goIn(data.description);
                }
            }
            if (type === "ASSERTION" /* ASSERTION */) {
                if (isAssertionResult(data) || data.skip) {
                    pass = pass && data.pass;
                    if (data.pass === false) {
                        current.incrementFailure();
                        current.addFailure(data);
                    }
                    else if (data.skip) {
                        current.incrementSkip();
                    }
                    else {
                        current.incrementSuccess();
                    }
                    out.moveCursor(0, -1);
                    out.clearLine(0);
                    tests[tests.length - 1].writeLine();
                }
            }
        }
        printHeader('failures', out);
        printFailures(tests, out);
        printHeader('summary', out);
        out.writeLine('');
        printFooter(tests, out);
    };
};

export { reporter };