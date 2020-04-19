/*!
 * html-pdf-adaptive.js v1.0.0
 * (c) 2019-2020 Banny Gao
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var jsPDF = _interopDefault(require('jspdf'));
var html2canvas = _interopDefault(require('html2canvas'));

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction"; // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;

      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  Gp[toStringTagSymbol] = "Generator"; // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined$1,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined$1;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
 module.exports );

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var asyncToGenerator = _asyncToGenerator;

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

var arrayWithHoles = _arrayWithHoles;

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

var iterableToArrayLimit = _iterableToArrayLimit;

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

var arrayLikeToArray = _arrayLikeToArray;

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

var unsupportedIterableToArray = _unsupportedIterableToArray;

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var nonIterableRest = _nonIterableRest;

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

var slicedToArray = _slicedToArray;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var getToggleStyle = (function (element) {
  var _element$getBoundingC = element.getBoundingClientRect(),
      left = _element$getBoundingC.left,
      width = _element$getBoundingC.width,
      height = _element$getBoundingC.height;

  var memoryStyle = _objectSpread({}, element.style);

  var windowScrollY = window.scrollY,
      windowScrollX = window.scrollX;
  var f = true;
  return function () {
    var fixedStyle = {
      width: "".concat(width, "px"),
      height: "".concat(height, "px"),
      boxSizing: "border-box",
      left: "".concat(left, "px"),
      top: 0,
      position: "fixed",
      backgroundColor: "#fff",
      columnFill: "auto",
      zIndex: 100
    };

    if (f) {
      window.scrollTo(0, 0);
      Object.entries(fixedStyle).forEach(function (_ref) {
        var _ref2 = slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        element.style[key] = value;
      });
    } else {
      window.scrollTo(windowScrollX, windowScrollY);
      Object.entries(memoryStyle).forEach(function (_ref3) {
        var _ref4 = slicedToArray(_ref3, 2),
            property = _ref4[0],
            value = _ref4[1];

        element.style.setProperty(property, value);
      });
    }

    f = !f;
  };
});

var getPageSize = (function () {
  var orientation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "p";
  var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "mm";
  var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "a4";
  var pageFormats = {
    a0: [2383.94, 3370.39],
    a1: [1683.78, 2383.94],
    a2: [1190.55, 1683.78],
    a3: [841.89, 1190.55],
    a4: [595.28, 841.89],
    a5: [419.53, 595.28],
    a6: [297.64, 419.53],
    a7: [209.76, 297.64],
    a8: [147.4, 209.76],
    a9: [104.88, 147.4],
    a10: [73.7, 104.88],
    b0: [2834.65, 4008.19],
    b1: [2004.09, 2834.65],
    b2: [1417.32, 2004.09],
    b3: [1000.63, 1417.32],
    b4: [708.66, 1000.63],
    b5: [498.9, 708.66],
    b6: [354.33, 498.9],
    b7: [249.45, 354.33],
    b8: [175.75, 249.45],
    b9: [124.72, 175.75],
    b10: [87.87, 124.72],
    c0: [2599.37, 3676.54],
    c1: [1836.85, 2599.37],
    c2: [1298.27, 1836.85],
    c3: [918.43, 1298.27],
    c4: [649.13, 918.43],
    c5: [459.21, 649.13],
    c6: [323.15, 459.21],
    c7: [229.61, 323.15],
    c8: [161.57, 229.61],
    c9: [113.39, 161.57],
    c10: [79.37, 113.39],
    dl: [311.81, 623.62],
    letter: [612, 792],
    "government-letter": [576, 756],
    legal: [612, 1008],
    "junior-legal": [576, 360],
    ledger: [1224, 792],
    tabloid: [792, 1224],
    "credit-card": [153, 243]
  };
  var k;

  switch (unit) {
    case "pt":
      k = 1;
      break;

    case "mm":
      k = 72 / 25.4;
      break;

    case "cm":
      k = 72 / 2.54;
      break;

    case "in":
      k = 72;
      break;

    case "px":
      k = 72 / 96;
      break;

    case "pc":
      k = 12;
      break;

    case "em":
      k = 12;
      break;

    case "ex":
      k = 6;
      break;

    default:
      throw Error("Invalid unit: ".concat(unit));
  }

  var pageHeight = 0,
      pageWidth = 0;

  if (pageFormats.hasOwnProperty(format)) {
    pageHeight = pageFormats[format][1] / k;
    pageWidth = pageFormats[format][0] / k;
  } else {
    try {
      pageHeight = format[1];
      pageWidth = format[0];
    } catch (err) {
      throw new Error("Invalid format: ".concat(format));
    }
  }

  var tmp;

  if (orientation === "p" || orientation === "portrait") {
    orientation = "p";

    if (pageWidth > pageHeight) {
      tmp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = tmp;
    }
  } else if (orientation === "l" || orientation === "landscape") {
    orientation = "l";

    if (pageHeight > pageWidth) {
      tmp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = tmp;
    }
  } else {
    throw Error("Invalid orientation: ".concat(orientation));
  }

  return {
    width: pageWidth,
    height: pageHeight,
    unit: unit,
    k: k,
    orientation: orientation
  };
});

var bodyObserver = null;

var appendChild = function appendChild(element) {
  var parentNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
  return new Promise(function (resolve) {
    bodyObserver = new MutationObserver(function () {
      resolve();
      bodyObserver = null;
    });
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
    parentNode.append(element);
  });
};

var elementToCanvas = /*#__PURE__*/(function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(element, width) {
    var isAppend,
        useCORS,
        _element$getBoundingC,
        elementWidth,
        elementHeight,
        canvasEl,
        context,
        canvas,
        canvasData,
        height,
        _args = arguments;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            isAppend = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
            useCORS = _args.length > 3 && _args[3] !== undefined ? _args[3] : false;
            _context.t0 = isAppend;

            if (!_context.t0) {
              _context.next = 6;
              break;
            }

            _context.next = 6;
            return appendChild(element);

          case 6:
            _element$getBoundingC = element.getBoundingClientRect(), elementWidth = _element$getBoundingC.width, elementHeight = _element$getBoundingC.height;
            canvasEl = document.createElement("canvas");
            canvasEl.width = elementWidth * 2;
            canvasEl.height = elementHeight * 2;
            context = canvasEl.getContext("2d");
            context.scale(2, 2);
            Array("mozImageSmoothingEnabled", "webkitImageSmoothingEnabled", "msImageSmoothingEnabled", "imageSmoothingEnabled").forEach(function (key) {
              return context[key] = true;
            });
            _context.next = 15;
            return html2canvas(element, {
              useCORS: useCORS,
              allowTaint: useCORS,
              canvas: canvasEl
            });

          case 15:
            canvas = _context.sent;
            canvasData = canvas.toDataURL("image/jpeg", 1.0);
            height = Math.floor(width / elementWidth * elementHeight);
            isAppend && document.body.removeChild(element);
            return _context.abrupt("return", {
              width: width,
              height: height,
              data: canvasData
            });

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

var arrayWithoutHoles = _arrayWithoutHoles;

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

var iterableToArray = _iterableToArray;

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var nonIterableSpread = _nonIterableSpread;

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

var toConsumableArray = _toConsumableArray;

var getNodeComputedStyles = (function (element) {
  var styleAttributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  if (!(element instanceof HTMLElement)) return [];
  var styleDeclaration = window.getComputedStyle(element);
  var boundingClientRect = element.getBoundingClientRect();
  return styleAttributes.map(function (styleAttribute) {
    var styleValue = styleDeclaration[styleAttribute];
    if (["width", "height", "x", "y"].includes(styleAttribute)) styleValue = boundingClientRect[styleAttribute];
    return String.prototype.replace.call(styleValue, /px/, "");
  });
});

var getHeaderAndFooter = /*#__PURE__*/(function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee($header, $footer, pageNum) {
    var isAppend,
        useDefaultFoot,
        headerEl,
        footerEl,
        _getNodeComputedStyle,
        _getNodeComputedStyle2,
        $headerHeight,
        _getNodeComputedStyle3,
        _getNodeComputedStyle4,
        $footerHeight,
        _args = arguments;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            isAppend = _args.length > 3 && _args[3] !== undefined ? _args[3] : false;
            useDefaultFoot = _args.length > 4 ? _args[4] : undefined;
            headerEl = $header;
            footerEl = $footer;
            if ($header instanceof Function) headerEl = $header({
              pageNum: pageNum
            });
            if ($footer instanceof Function) footerEl = $footer({
              pageNum: pageNum,
              _pageNumToInnerHTML: useDefaultFoot
            });

            if (!isAppend) {
              _context.next = 11;
              break;
            }

            _context.next = 9;
            return appendChild(headerEl);

          case 9:
            _context.next = 11;
            return appendChild(footerEl);

          case 11:
            _getNodeComputedStyle = getNodeComputedStyles(headerEl, ["height"]), _getNodeComputedStyle2 = slicedToArray(_getNodeComputedStyle, 1), $headerHeight = _getNodeComputedStyle2[0];
            _getNodeComputedStyle3 = getNodeComputedStyles(footerEl, ["height"]), _getNodeComputedStyle4 = slicedToArray(_getNodeComputedStyle3, 1), $footerHeight = _getNodeComputedStyle4[0];

            if (isAppend) {
              document.body.removeChild(headerEl);
              document.body.removeChild(footerEl);
            }

            return _context.abrupt("return", {
              headerEl: headerEl,
              footerEl: footerEl,
              $headerHeight: $headerHeight,
              $footerHeight: $footerHeight
            });

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

var addBlank = (function (pdf, x, y, width, height) {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(x, y, Math.ceil(width), Math.ceil(height), "F");
});

var headerCache;

var addHeader = /*#__PURE__*/function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(pdf, x, y, width, $header) {
    var isUseCache,
        useCORS,
        header,
        height,
        data,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            isUseCache = _args.length > 5 && _args[5] !== undefined ? _args[5] : false;
            useCORS = _args.length > 6 && _args[6] !== undefined ? _args[6] : false;

            if ($header instanceof HTMLElement) {
              _context.next = 4;
              break;
            }

            throw Error("header must be a HTMLElement");

          case 4:
            if (!(isUseCache && headerCache)) {
              _context.next = 8;
              break;
            }

            _context.t0 = headerCache;
            _context.next = 11;
            break;

          case 8:
            _context.next = 10;
            return elementToCanvas($header, width, true, useCORS);

          case 10:
            _context.t0 = _context.sent;

          case 11:
            header = _context.t0;
            height = header.height, data = header.data;
            if (height) pdf.addImage(data, "JPEG", x, y, width, height);
            headerCache = header;

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function addHeader(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

var footerCache;

var addFooter = /*#__PURE__*/function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(pdf, x, y, width, $footer) {
    var isUseCache,
        useCORS,
        footer,
        height,
        data,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            isUseCache = _args.length > 5 && _args[5] !== undefined ? _args[5] : false;
            useCORS = _args.length > 6 && _args[6] !== undefined ? _args[6] : false;

            if ($footer instanceof HTMLElement) {
              _context.next = 4;
              break;
            }

            throw Error("footer must be a HTMLElement");

          case 4:
            if (!(isUseCache && footerCache)) {
              _context.next = 8;
              break;
            }

            _context.t0 = footerCache;
            _context.next = 11;
            break;

          case 8:
            _context.next = 10;
            return elementToCanvas($footer, width, true, useCORS);

          case 10:
            _context.t0 = _context.sent;

          case 11:
            footer = _context.t0;
            height = footer.height, data = footer.data;

            if (height) {
              // 处理绘制计算经度不可避免产生的误差
              pdf.addImage(data, "JPEG", x, y - height - 1, width, height + 2);
            }

            footerCache = footer;

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function addFooter(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

var drawPage = /*#__PURE__*/(function () {
  var _ref2 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(_ref, fn) {
    var pdf, $header, $footer, pageNum, baseX, baseY, offsetY, imgWidth, imgHeight, pdfWidth, pdfHeight, addImage, useDefaultFoot, useCORS, isUseHeaderCache, isUseFooterCache, _yield$getHeaderAndFo, headerEl, footerEl;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pdf = _ref.pdf, $header = _ref.$header, $footer = _ref.$footer, pageNum = _ref.pageNum, baseX = _ref.baseX, baseY = _ref.baseY, offsetY = _ref.offsetY, imgWidth = _ref.imgWidth, imgHeight = _ref.imgHeight, pdfWidth = _ref.pdfWidth, pdfHeight = _ref.pdfHeight, addImage = _ref.addImage, useDefaultFoot = _ref.useDefaultFoot, useCORS = _ref.useCORS;
            isUseHeaderCache = $header instanceof Function ? false : true;
            isUseFooterCache = $footer instanceof Function ? false : true;
            _context.next = 5;
            return getHeaderAndFooter($header, $footer, pageNum, true, useDefaultFoot);

          case 5:
            _yield$getHeaderAndFo = _context.sent;
            headerEl = _yield$getHeaderAndFo.headerEl;
            footerEl = _yield$getHeaderAndFo.footerEl;
            _context.next = 10;
            return addImage(pdf, baseX, baseY - offsetY, imgHeight);

          case 10:
            _context.next = 12;
            return addBlank(pdf, 0, 0, pdfWidth, baseY);

          case 12:
            _context.next = 14;
            return addBlank(pdf, 0, pdfHeight - baseY, pdfWidth, baseY);

          case 14:
            _context.next = 16;
            return addHeader(pdf, baseX, baseY, imgWidth, headerEl, isUseHeaderCache, useCORS);

          case 16:
            _context.next = 18;
            return addFooter(pdf, baseX, pdfHeight - baseY - 1, imgWidth, footerEl, isUseFooterCache, useCORS);

          case 18:
            if (!(fn instanceof Function)) {
              _context.next = 21;
              break;
            }

            _context.next = 21;
            return fn(pdf);

          case 21:
            return _context.abrupt("return", pdf);

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
})();

var output = (function (pdf) {
  var outputType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "save";
  var filename = arguments.length > 2 ? arguments[2] : undefined;
  var result = null;

  switch (outputType) {
    case "save":
      result = pdf.save(filename);
      break;

    case "file":
      result = new File([pdf.output("blob")], filename, {
        type: "application/pdf",
        lastModified: Date.now()
      });
      break;

    default:
      result = pdf.output(outputType, {
        filename: filename
      });
  }

  return result;
});

var isElementNode = (function (node) {
  return node.nodeType === 1;
});

var formatHiddenElementStyle = (function (element) {
  var style = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  style = Object.assign({
    position: "fixed",
    zIndex: "-1"
  }, style);
  Object.entries(style).forEach(function (_ref) {
    var _ref2 = slicedToArray(_ref, 2),
        key = _ref2[0],
        value = _ref2[1];

    element.style[key] = value;
  });
});

var getTextComputedStyles = /*#__PURE__*/(function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(textNode) {
    var styleAttributes,
        textContent,
        text,
        result,
        _args = arguments;
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            styleAttributes = _args.length > 1 && _args[1] !== undefined ? _args[1] : [];
            textContent = textNode.textContent.replace(/^\s*(.*)\s*$/, "$1");

            if (textContent.length) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", []);

          case 4:
            text = document.createElement("span");
            text.textContent = textContent;
            formatHiddenElementStyle(text, {
              position: "initial",
              display: "inline-block",
              border: "0",
              visibility: "hidden"
            });
            _context.next = 9;
            return appendChild(text, textNode.parentNode);

          case 9:
            result = getNodeComputedStyles(text, styleAttributes);
            text.remove();
            return _context.abrupt("return", result);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

var isTableChild = (function (node) {
  return ["THEAD", "TBODY", "TFOOT", "TR", "TD"].includes(node.nodeName);
});

var strSome = (function (str) {
  for (var _len = arguments.length, words = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    words[_key - 1] = arguments[_key];
  }

  return words.some(function (word) {
    return str.indexOf(word) !== -1;
  });
});

var isTextNode = (function (node) {
  return node.nodeType === 3;
});

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var outputWithAdaptive = /*#__PURE__*/(function () {
  var _ref2 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(_ref) {
    var pdf, addImage, baseX, baseY, imgWidth, imgHeight, contentHeight, $header, $footer, pdfWidth, pdfHeight, outputType, onProgress, pdfOptions, element, useDefaultFoot, useCORS, ratio, nodesArr, pageNum, offsetY, pagesArr, _yield$getHeaderAndFo, $headerHeight, $footerHeight, reallyContentHeight, drawHeight, inlineBlockTotalWidth, inlineBlockHeightBox, memoryInlineBlockWidth, memoryDrawHeight, prevNode, cacheMarginBottom, fatherCacheMaginBottom, fatherMarginTop, drawLine, drawPageParams, onProgressCallback, childIndex, childLength, childLengthBox, childIndexBox, _loop, _ret;

    return regenerator.wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            pdf = _ref.pdf, addImage = _ref.addImage, baseX = _ref.baseX, baseY = _ref.baseY, imgWidth = _ref.imgWidth, imgHeight = _ref.imgHeight, contentHeight = _ref.contentHeight, $header = _ref.$header, $footer = _ref.$footer, pdfWidth = _ref.pdfWidth, pdfHeight = _ref.pdfHeight, outputType = _ref.outputType, onProgress = _ref.onProgress, pdfOptions = _ref.pdfOptions, element = _ref.element, useDefaultFoot = _ref.useDefaultFoot, useCORS = _ref.useCORS;
            ratio = imgWidth / element.offsetWidth;
            nodesArr = Array.from(element.childNodes).map(function (node) {
              node.level = 1;
              return node;
            });
            pageNum = 1, offsetY = 0;
            pagesArr = [];
            _context5.next = 7;
            return getHeaderAndFooter($header, $footer, pageNum, true, useDefaultFoot);

          case 7:
            _yield$getHeaderAndFo = _context5.sent;
            $headerHeight = _yield$getHeaderAndFo.$headerHeight;
            $footerHeight = _yield$getHeaderAndFo.$footerHeight;
            reallyContentHeight = contentHeight;
            reallyContentHeight -= ($headerHeight + $footerHeight) * ratio;
            drawHeight = 0, inlineBlockTotalWidth = 0, inlineBlockHeightBox = [], memoryInlineBlockWidth = 0, memoryDrawHeight = 0, prevNode = nodesArr[1], cacheMarginBottom = 0, fatherCacheMaginBottom = 0, fatherMarginTop = 0;

            drawLine = function drawLine(height, node) {
              var cacheHeight = inlineBlockHeightBox.length ? Math.max.apply(inlineBlockHeightBox, inlineBlockHeightBox) : 0;
              drawHeight += height + cacheHeight;
              inlineBlockTotalWidth = 0;
              inlineBlockHeightBox = [];
              prevNode = node;
            };

            drawPageParams = {
              pdf: pdf,
              $header: $header,
              $footer: $footer,
              pageNum: pageNum,
              baseX: baseX,
              baseY: baseY,
              offsetY: offsetY,
              imgWidth: imgWidth,
              imgHeight: imgHeight,
              pdfWidth: pdfWidth,
              pdfHeight: pdfHeight,
              addImage: addImage,
              useDefaultFoot: useDefaultFoot,
              useCORS: useCORS
            };

            onProgressCallback = /*#__PURE__*/function () {
              var _ref3 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(params, blankHeight) {
                var cloneDrawPageParams, page, percent;
                return regenerator.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (!(onProgress instanceof Function)) {
                          _context2.next = 9;
                          break;
                        }

                        cloneDrawPageParams = _objectSpread$1({}, params);
                        cloneDrawPageParams.pdf = new jsPDF(pdfOptions);
                        _context2.next = 5;
                        return drawPage(cloneDrawPageParams, /*#__PURE__*/asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
                          return regenerator.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  if (!blankHeight) {
                                    _context.next = 3;
                                    break;
                                  }

                                  _context.next = 3;
                                  return addBlank(cloneDrawPageParams.pdf, 0, reallyContentHeight + baseY - blankHeight, pdfWidth, blankHeight + 3);

                                case 3:
                                case "end":
                                  return _context.stop();
                              }
                            }
                          }, _callee);
                        })));

                      case 5:
                        page = _context2.sent;
                        pagesArr.push(page);
                        percent = ((offsetY + memoryDrawHeight * ratio <= imgHeight ? offsetY + memoryDrawHeight * ratio : imgHeight) / imgHeight * 100).toFixed(2);
                        onProgress(percent, pageNum, output(pagesArr[pageNum - 1], outputType));

                      case 9:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function onProgressCallback(_x2, _x3) {
                return _ref3.apply(this, arguments);
              };
            }();

            childIndex = -1, childLength = nodesArr.length;
            childLengthBox = [], childIndexBox = [];
            _loop = /*#__PURE__*/regenerator.mark(function _loop() {
              var index, node, children, childNodes, _getNodeComputedStyle, _getNodeComputedStyle2, display, _getNodeComputedStyle3, width, _getNodeComputedStyle4, height, position, _float, flexFlow, marginTop, marginBottom, isInDomStream, reallyHeight, reallyWidth, reallyMarginTop, reallyMarginBottom, h, parentNodeHeight, _yield$getTextCompute, _yield$getTextCompute2, _yield$getTextCompute3, _width, _yield$getTextCompute4, _height, lastHeight, _height2, pageDrawHeight, blankHeight;

              return regenerator.wrap(function _loop$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      memoryDrawHeight = drawHeight;
                      index = 0;
                      node = nodesArr.shift(), children = node.children;
                      childNodes = Array.from(node.childNodes).map(function (childNode) {
                        childNode.level = node.level + 1;
                        if (isElementNode(childNode)) childNode.index = index++;
                        return childNode;
                      });

                      if (!isElementNode(node)) {
                        _context4.next = 53;
                        break;
                      }

                      if (childIndex === childLength - 1) {
                        childIndex = childIndexBox.pop();
                        childLength = childLengthBox.pop();
                      }

                      childIndex++;
                      _getNodeComputedStyle = getNodeComputedStyles(node, ["display", "width", "height", "position", "float", "flex-flow", "margin-top", "margin-bottom"]), _getNodeComputedStyle2 = slicedToArray(_getNodeComputedStyle, 8), display = _getNodeComputedStyle2[0], _getNodeComputedStyle3 = _getNodeComputedStyle2[1], width = _getNodeComputedStyle3 === void 0 ? 0 : _getNodeComputedStyle3, _getNodeComputedStyle4 = _getNodeComputedStyle2[2], height = _getNodeComputedStyle4 === void 0 ? 0 : _getNodeComputedStyle4, position = _getNodeComputedStyle2[3], _float = _getNodeComputedStyle2[4], flexFlow = _getNodeComputedStyle2[5], marginTop = _getNodeComputedStyle2[6], marginBottom = _getNodeComputedStyle2[7];
                      isInDomStream = ["relative", "static", "initial"].includes(position);

                      if (isInDomStream) {
                        _context4.next = 11;
                        break;
                      }

                      return _context4.abrupt("return", "continue");

                    case 11:
                      reallyHeight = +height, reallyWidth = +width;
                      reallyMarginTop = +marginTop, reallyMarginBottom = +marginBottom;

                      if (childIndex === childLength - 1 || prevNode.level > node.level) {
                        if (node.doBlock === "flex-block") {
                          drawLine(fatherCacheMaginBottom, node);
                          cacheMarginBottom = fatherCacheMaginBottom = 0;
                        } else if (node.nodeName === "TR") {
                          if (isTableChild(node.parentNode) && node.parentNode.index === node.parentNode.parentNode.children.length - 1) {
                            cacheMarginBottom = fatherCacheMaginBottom;
                          } else if (!isTableChild(node.parentNode)) {
                            cacheMarginBottom = fatherCacheMaginBottom;
                          }
                        } else {
                          cacheMarginBottom = cacheMarginBottom > fatherCacheMaginBottom ? cacheMarginBottom : fatherCacheMaginBottom;
                        }
                      }

                      if (!(["inline-block", "inline"].includes(display) || node.doBlock === "flex-block")) {
                        _context4.next = 27;
                        break;
                      }

                      // 处理非同一级遇到block换行
                      if (prevNode.level !== node.level && inlineBlockHeightBox.length && prevNode.doBlock !== "flex-block" && getNodeComputedStyles(prevNode, ["display"])[0] === "block") drawLine(0, node);

                      if (fatherMarginTop) {
                        h = Math.max(cacheMarginBottom, fatherMarginTop);
                        drawHeight += h;
                        fatherMarginTop = 0;
                      }

                      parentNodeHeight = +getNodeComputedStyles(node.parentNode, ["height"])[0];
                      reallyHeight = reallyHeight > parentNodeHeight ? parentNodeHeight : reallyHeight; // 处理图片默认外边距

                      if (node.nodeName === "IMG" && _float === "none" && +getNodeComputedStyles(node.parentNode, ["font-size"])[0] !== 0) {
                        reallyHeight += 3.5;
                        reallyWidth += 3.5;
                      }

                      if (display === "inline-block" || node.doBlock === "flex-block") {
                        reallyHeight += reallyMarginTop + reallyMarginBottom;
                      }

                      inlineBlockTotalWidth += reallyWidth;
                      inlineBlockHeightBox.push(reallyHeight);
                      memoryInlineBlockWidth = reallyWidth;
                      return _context4.abrupt("return", "continue");

                    case 27:
                      if (!(display === "flex")) {
                        _context4.next = 38;
                        break;
                      }

                      childNodes.forEach(function (childNode) {
                        childNode.doBlock = "flex-block";
                        return childNode;
                      });

                      if (strSome(flexFlow, "column")) {
                        _context4.next = 37;
                        break;
                      }

                      if (!strSome(flexFlow, "nowrap", "initial", "unset", "wrap-reverse")) {
                        _context4.next = 35;
                        break;
                      }

                      reallyHeight += Math.max(+cacheMarginBottom, reallyMarginTop);
                      drawLine(reallyHeight, node);
                      cacheMarginBottom = reallyMarginBottom;
                      return _context4.abrupt("return", "continue");

                    case 35:
                      _context4.next = 38;
                      break;

                    case 37:
                      if (strSome(flexFlow, "column") && node.style.height !== "") ;

                    case 38:
                      // block换行，处理此前 inlineBlockHeightBox
                      if (inlineBlockHeightBox.length) drawLine(0, node);

                      if (!(children && children.length && node.nodeName !== "TR")) {
                        _context4.next = 48;
                        break;
                      }

                      prevNode = node;
                      childLengthBox.push(childLength);
                      childIndexBox.push(childIndex);
                      childLength = children.length;
                      childIndex = -1;
                      nodesArr.unshift.apply(nodesArr, toConsumableArray(childNodes));

                      if (!isTableChild(node)) {
                        fatherCacheMaginBottom = reallyMarginBottom;
                        fatherMarginTop = reallyMarginTop;
                      }

                      return _context4.abrupt("return", "continue");

                    case 48:
                      // 处理margin-top，margin-bottom
                      if (fatherMarginTop && !isTableChild(node)) {
                        reallyHeight += Math.max(cacheMarginBottom, fatherMarginTop, reallyMarginTop);
                        fatherMarginTop = 0;
                      } else if (fatherMarginTop && isTableChild(node)) {
                        reallyHeight += Math.max(cacheMarginBottom, fatherMarginTop);
                        fatherMarginTop = 0;
                        cacheMarginBottom = 0;
                      } else if (!fatherMarginTop && !isTableChild(node)) {
                        reallyHeight += Math.max(cacheMarginBottom, reallyMarginTop);
                      }

                      drawLine(reallyHeight, node);
                      if (!isTableChild(node)) cacheMarginBottom = reallyMarginBottom;
                      _context4.next = 64;
                      break;

                    case 53:
                      if (!isTextNode(node)) {
                        _context4.next = 64;
                        break;
                      }

                      _context4.next = 56;
                      return getTextComputedStyles(node, ["width", "height"]);

                    case 56:
                      _yield$getTextCompute = _context4.sent;
                      _yield$getTextCompute2 = slicedToArray(_yield$getTextCompute, 2);
                      _yield$getTextCompute3 = _yield$getTextCompute2[0];
                      _width = _yield$getTextCompute3 === void 0 ? 0 : _yield$getTextCompute3;
                      _yield$getTextCompute4 = _yield$getTextCompute2[1];
                      _height = _yield$getTextCompute4 === void 0 ? 0 : _yield$getTextCompute4;
                      if (prevNode.level !== node.level && +_width !== 0) drawLine(0, node);

                      if (+_width) {
                        inlineBlockTotalWidth += +_width + 3;
                        inlineBlockHeightBox.push(+_height);
                      }

                    case 64:
                      if (inlineBlockTotalWidth >= element.offsetWidth) {
                        inlineBlockTotalWidth = memoryInlineBlockWidth;
                        lastHeight = inlineBlockHeightBox.pop() || 0;
                        _height2 = inlineBlockHeightBox.length ? Math.max.apply(inlineBlockHeightBox, inlineBlockHeightBox) : 0;
                        drawHeight += _height2;
                        inlineBlockHeightBox = [lastHeight];
                      }

                      if (!(drawHeight * ratio > reallyContentHeight)) {
                        _context4.next = 78;
                        break;
                      }

                      pageDrawHeight = memoryDrawHeight * ratio;
                      blankHeight = reallyContentHeight - pageDrawHeight;
                      drawPageParams.pageNum = pageNum;
                      drawPageParams.offsetY = offsetY;
                      _context4.next = 72;
                      return drawPage(drawPageParams, /*#__PURE__*/asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
                        return regenerator.wrap(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                if (!blankHeight) {
                                  _context3.next = 3;
                                  break;
                                }

                                _context3.next = 3;
                                return addBlank(pdf, 0, reallyContentHeight + baseY - blankHeight, pdfWidth, blankHeight + 3);

                              case 3:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, _callee3);
                      })));

                    case 72:
                      _context4.next = 74;
                      return onProgressCallback(drawPageParams, blankHeight);

                    case 74:
                      offsetY += pageDrawHeight;
                      drawHeight -= memoryDrawHeight;
                      pageNum++;
                      pdf.addPage();

                    case 78:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _loop);
            });

          case 19:
            if (!nodesArr.length) {
              _context5.next = 26;
              break;
            }

            return _context5.delegateYield(_loop(), "t0", 21);

          case 21:
            _ret = _context5.t0;

            if (!(_ret === "continue")) {
              _context5.next = 24;
              break;
            }

            return _context5.abrupt("continue", 19);

          case 24:
            _context5.next = 19;
            break;

          case 26:
            drawPageParams.pageNum = pageNum;
            drawPageParams.offsetY = offsetY;
            _context5.next = 30;
            return drawPage(drawPageParams);

          case 30:
            _context5.next = 32;
            return onProgressCallback(drawPageParams);

          case 32:
            return _context5.abrupt("return", pdf);

          case 33:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
})();

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var outputWithFixedSize = /*#__PURE__*/(function () {
  var _ref2 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(_ref) {
    var pdf, addImage, baseX, baseY, imgWidth, imgHeight, contentHeight, $header, $footer, pdfWidth, pdfHeight, outputType, onProgress, pdfOptions, element, useDefaultFoot, useCORS, ratio, pageNum, offsetY, pagesArr, _yield$getHeaderAndFo, $headerHeight, $footerHeight, reallyContentHeight, drawPageParams, onProgressCallback;

    return regenerator.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pdf = _ref.pdf, addImage = _ref.addImage, baseX = _ref.baseX, baseY = _ref.baseY, imgWidth = _ref.imgWidth, imgHeight = _ref.imgHeight, contentHeight = _ref.contentHeight, $header = _ref.$header, $footer = _ref.$footer, pdfWidth = _ref.pdfWidth, pdfHeight = _ref.pdfHeight, outputType = _ref.outputType, onProgress = _ref.onProgress, pdfOptions = _ref.pdfOptions, element = _ref.element, useDefaultFoot = _ref.useDefaultFoot, useCORS = _ref.useCORS;
            ratio = imgWidth / element.offsetWidth;
            pageNum = 1;
            offsetY = 0;
            pagesArr = [];
            _context2.next = 7;
            return getHeaderAndFooter($header, $footer, pageNum, true, useDefaultFoot);

          case 7:
            _yield$getHeaderAndFo = _context2.sent;
            $headerHeight = _yield$getHeaderAndFo.$headerHeight;
            $footerHeight = _yield$getHeaderAndFo.$footerHeight;
            reallyContentHeight = contentHeight;
            reallyContentHeight -= ($headerHeight + $footerHeight) * ratio;
            drawPageParams = {
              pdf: pdf,
              $header: $header,
              $footer: $footer,
              pageNum: pageNum,
              baseX: baseX,
              baseY: baseY,
              offsetY: offsetY,
              imgWidth: imgWidth,
              imgHeight: imgHeight,
              pdfWidth: pdfWidth,
              pdfHeight: pdfHeight,
              addImage: addImage,
              useDefaultFoot: useDefaultFoot,
              useCORS: useCORS
            };

            onProgressCallback = /*#__PURE__*/function () {
              var _ref3 = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
                var cloneDrawPageParams, page, percent;
                return regenerator.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!(onProgress instanceof Function)) {
                          _context.next = 9;
                          break;
                        }

                        cloneDrawPageParams = _objectSpread$2({}, drawPageParams);
                        cloneDrawPageParams.pdf = new jsPDF(pdfOptions);
                        _context.next = 5;
                        return drawPage(cloneDrawPageParams);

                      case 5:
                        page = _context.sent;
                        pagesArr.push(page);
                        percent = ((offsetY + reallyContentHeight <= imgHeight ? offsetY + reallyContentHeight : imgHeight) / imgHeight * 100).toFixed(2);
                        onProgress(percent, pageNum, output(pagesArr[pageNum - 1], outputType));

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function onProgressCallback() {
                return _ref3.apply(this, arguments);
              };
            }();

          case 14:
            if (!(offsetY < imgHeight)) {
              _context2.next = 25;
              break;
            }

            drawPageParams.pageNum = pageNum;
            drawPageParams.offsetY = offsetY;
            _context2.next = 19;
            return drawPage(drawPageParams);

          case 19:
            _context2.next = 21;
            return onProgressCallback();

          case 21:
            offsetY += reallyContentHeight;

            if (offsetY < imgHeight) {
              pageNum++;
              pdf.addPage();
            }

            _context2.next = 14;
            break;

          case 25:
            return _context2.abrupt("return", pdf);

          case 26:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
})();

var createHeaderAndFooterElement = (function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$tagName = _ref.tagName,
      tagName = _ref$tagName === void 0 ? "div" : _ref$tagName,
      _ref$style = _ref.style,
      style = _ref$style === void 0 ? {} : _ref$style,
      _ref$classNames = _ref.classNames,
      classNames = _ref$classNames === void 0 ? [] : _ref$classNames,
      _ref$innerHTML = _ref.innerHTML,
      innerHTML = _ref$innerHTML === void 0 ? "" : _ref$innerHTML,
      pageNum = _ref.pageNum,
      _ref$_pageNumToInnerH = _ref._pageNumToInnerHTML,
      _pageNumToInnerHTML = _ref$_pageNumToInnerH === void 0 ? false : _ref$_pageNumToInnerH;

  var el = document.createElement(tagName);
  formatHiddenElementStyle(el, style);
  Object.entries({
    width: "100%",
    textAlign: "center",
    lineHeight: "36px"
  }).forEach(function (_ref2) {
    var _ref3 = slicedToArray(_ref2, 2),
        key = _ref3[0],
        value = _ref3[1];

    return el.style[key] = value;
  });
  classNames.forEach(function (className) {
    return el.classList.add(className);
  });
  if (!innerHTML && pageNum && _pageNumToInnerHTML) innerHTML = "<p>- ".concat(pageNum, "</p>");
  el.innerHTML = innerHTML;
  return el;
});

var html2pdf = /*#__PURE__*/(function () {
  var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(element) {
    var _ref2,
        _ref2$pagesplit,
        pagesplit,
        _ref2$orientation,
        orientation,
        _ref2$unit,
        unit,
        _ref2$format,
        format,
        _ref2$offset,
        offset,
        _ref2$outputType,
        outputType,
        _ref2$header,
        header,
        _ref2$footer,
        footer,
        _ref2$mode,
        mode,
        _ref2$filename,
        filename,
        onProgress,
        onComplete,
        _ref2$isToggleStyle,
        isToggleStyle,
        _ref2$useDefaultFoot,
        useDefaultFoot,
        _ref2$useCORS,
        useCORS,
        toggleStyle,
        _getPageSize,
        pdfWidth,
        pdfHeight,
        imgWidth,
        _yield$elementToCanva,
        imgHeight,
        pageData,
        contentHeight,
        pdf,
        imageCompression,
        alias,
        addImage,
        args,
        result,
        _args = arguments;

    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref2 = _args.length > 1 && _args[1] !== undefined ? _args[1] : {}, _ref2$pagesplit = _ref2.pagesplit, pagesplit = _ref2$pagesplit === void 0 ? false : _ref2$pagesplit, _ref2$orientation = _ref2.orientation, orientation = _ref2$orientation === void 0 ? "p" : _ref2$orientation, _ref2$unit = _ref2.unit, unit = _ref2$unit === void 0 ? "pt" : _ref2$unit, _ref2$format = _ref2.format, format = _ref2$format === void 0 ? "a4" : _ref2$format, _ref2$offset = _ref2.offset, offset = _ref2$offset === void 0 ? {} : _ref2$offset, _ref2$outputType = _ref2.outputType, outputType = _ref2$outputType === void 0 ? "save" : _ref2$outputType, _ref2$header = _ref2.header, header = _ref2$header === void 0 ? createHeaderAndFooterElement : _ref2$header, _ref2$footer = _ref2.footer, footer = _ref2$footer === void 0 ? createHeaderAndFooterElement : _ref2$footer, _ref2$mode = _ref2.mode, mode = _ref2$mode === void 0 ? "adaptive" : _ref2$mode, _ref2$filename = _ref2.filename, filename = _ref2$filename === void 0 ? "demo" : _ref2$filename, onProgress = _ref2.onProgress, onComplete = _ref2.onComplete, _ref2$isToggleStyle = _ref2.isToggleStyle, isToggleStyle = _ref2$isToggleStyle === void 0 ? false : _ref2$isToggleStyle, _ref2$useDefaultFoot = _ref2.useDefaultFoot, useDefaultFoot = _ref2$useDefaultFoot === void 0 ? true : _ref2$useDefaultFoot, _ref2$useCORS = _ref2.useCORS, useCORS = _ref2$useCORS === void 0 ? false : _ref2$useCORS;
            toggleStyle = null;
            if (isToggleStyle) toggleStyle = getToggleStyle(element);
            if (toggleStyle instanceof Function) toggleStyle();
            _getPageSize = getPageSize(orientation, unit, format), pdfWidth = _getPageSize.width, pdfHeight = _getPageSize.height;
            offset = Object.assign({
              x: 0,
              y: 0
            }, offset);
            imgWidth = pdfWidth - offset.x * 2;
            _context.next = 9;
            return elementToCanvas(element, imgWidth, false, useCORS);

          case 9:
            _yield$elementToCanva = _context.sent;
            imgHeight = _yield$elementToCanva.height;
            pageData = _yield$elementToCanva.data;
            // 生成一页pdf的内容的高度
            contentHeight = pdfHeight - offset.y * 2;
            pdf = new jsPDF({
              orientation: orientation,
              unit: unit,
              format: format
            });
            imageCompression = "SLOW";
            alias = Math.random().toString(35);

            addImage = function addImage(pdfObj, _x, _y, height) {
              pdfObj.addImage(pageData, "JPEG", _x, _y, imgWidth, Math.floor(height), alias, imageCompression);
            };

            if (!(pagesplit && imgHeight > contentHeight)) {
              _context.next = 31;
              break;
            }

            args = {
              pdf: pdf,
              addImage: addImage,
              baseX: offset.x,
              baseY: offset.y,
              imgWidth: imgWidth,
              imgHeight: imgHeight,
              contentHeight: contentHeight,
              $header: header,
              $footer: footer,
              pdfWidth: pdfWidth,
              pdfHeight: pdfHeight,
              outputType: outputType,
              onProgress: onProgress,
              pdfOptions: {
                orientation: orientation,
                unit: unit,
                format: format
              },
              element: element,
              useDefaultFoot: useDefaultFoot
            };
            _context.t0 = mode;
            _context.next = _context.t0 === "adaptive" ? 22 : _context.t0 === "fixed" ? 25 : 28;
            break;

          case 22:
            _context.next = 24;
            return outputWithAdaptive.call(null, args);

          case 24:
            return _context.abrupt("break", 29);

          case 25:
            _context.next = 27;
            return outputWithFixedSize.call(null, args);

          case 27:
            return _context.abrupt("break", 29);

          case 28:
            outputWithAdaptive.call(null, args);

          case 29:
            _context.next = 32;
            break;

          case 31:
            addImage(pdf, offset.x, offset.y, imgHeight < contentHeight ? imgHeight : contentHeight);

          case 32:
            if (toggleStyle instanceof Function) toggleStyle();
            result = output(pdf, outputType, filename);
            if (onComplete instanceof Function) onComplete(result);
            return _context.abrupt("return", result);

          case 36:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x2) {
    return _ref.apply(this, arguments);
  };
})();

module.exports = html2pdf;
