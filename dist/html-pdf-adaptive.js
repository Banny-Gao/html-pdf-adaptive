/*!
 * html-pdf-adaptive.js v1.0.0
 * (c) 2019-2020 Banny Gao
 */
'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

var jspdf_min = createCommonjsModule(function (module, exports) {
!function (t) {
   t();
}(function () {
  /** @license
     * jsPDF - PDF Document creation from JavaScript
     * Version 1.5.3 Built on 2018-12-27T14:11:42.696Z
     *                      CommitID d93d28db14
     *
     * Copyright (c) 2010-2016 James Hall <james@parall.ax>, https://github.com/MrRio/jsPDF
     *               2010 Aaron Spike, https://github.com/acspike
     *               2012 Willow Systems Corporation, willow-systems.com
     *               2012 Pablo Hess, https://github.com/pablohess
     *               2012 Florian Jenett, https://github.com/fjenett
     *               2013 Warren Weckesser, https://github.com/warrenweckesser
     *               2013 Youssef Beddad, https://github.com/lifof
     *               2013 Lee Driscoll, https://github.com/lsdriscoll
     *               2013 Stefan Slonevskiy, https://github.com/stefslon
     *               2013 Jeremy Morel, https://github.com/jmorel
     *               2013 Christoph Hartmann, https://github.com/chris-rock
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 James Makes, https://github.com/dollaruw
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 Steven Spungin, https://github.com/Flamenco
     *               2014 Kenneth Glassey, https://github.com/Gavvers
     *
     * Licensed under the MIT License
     *
     * Contributor(s):
     *    siefkenj, ahwolf, rickygu, Midnith, saintclair, eaparango,
     *    kim3er, mfo, alnorth, Flamenco
     */

  function se(t) {
    return (se = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
      return typeof t;
    } : function (t) {
      return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
    })(t);
  }

  !function (t) {
    if ("object" !== se(t.console)) {
      t.console = {};

      for (var e, n, r = t.console, i = function () {}, o = ["memory"], a = "assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(","); e = o.pop();) r[e] || (r[e] = {});

      for (; n = a.pop();) r[n] || (r[n] = i);
    }

    var s,
        l,
        h,
        u,
        c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    void 0 === t.btoa && (t.btoa = function (t) {
      var e,
          n,
          r,
          i,
          o,
          a = 0,
          s = 0,
          l = "",
          h = [];
      if (!t) return t;

      for (; e = (o = t.charCodeAt(a++) << 16 | t.charCodeAt(a++) << 8 | t.charCodeAt(a++)) >> 18 & 63, n = o >> 12 & 63, r = o >> 6 & 63, i = 63 & o, h[s++] = c.charAt(e) + c.charAt(n) + c.charAt(r) + c.charAt(i), a < t.length;);

      l = h.join("");
      var u = t.length % 3;
      return (u ? l.slice(0, u - 3) : l) + "===".slice(u || 3);
    }), void 0 === t.atob && (t.atob = function (t) {
      var e,
          n,
          r,
          i,
          o,
          a,
          s = 0,
          l = 0,
          h = [];
      if (!t) return t;

      for (t += ""; e = (a = c.indexOf(t.charAt(s++)) << 18 | c.indexOf(t.charAt(s++)) << 12 | (i = c.indexOf(t.charAt(s++))) << 6 | (o = c.indexOf(t.charAt(s++)))) >> 16 & 255, n = a >> 8 & 255, r = 255 & a, h[l++] = 64 == i ? String.fromCharCode(e) : 64 == o ? String.fromCharCode(e, n) : String.fromCharCode(e, n, r), s < t.length;);

      return h.join("");
    }), Array.prototype.map || (Array.prototype.map = function (t) {
      if (null == this || "function" != typeof t) throw new TypeError();

      for (var e = Object(this), n = e.length >>> 0, r = new Array(n), i = 1 < arguments.length ? arguments[1] : void 0, o = 0; o < n; o++) o in e && (r[o] = t.call(i, e[o], o, e));

      return r;
    }), Array.isArray || (Array.isArray = function (t) {
      return "[object Array]" === Object.prototype.toString.call(t);
    }), Array.prototype.forEach || (Array.prototype.forEach = function (t, e) {
      if (null == this || "function" != typeof t) throw new TypeError();

      for (var n = Object(this), r = n.length >>> 0, i = 0; i < r; i++) i in n && t.call(e, n[i], i, n);
    }), Array.prototype.find || Object.defineProperty(Array.prototype, "find", {
      value: function (t) {
        if (null == this) throw new TypeError('"this" is null or not defined');
        var e = Object(this),
            n = e.length >>> 0;
        if ("function" != typeof t) throw new TypeError("predicate must be a function");

        for (var r = arguments[1], i = 0; i < n;) {
          var o = e[i];
          if (t.call(r, o, i, e)) return o;
          i++;
        }
      },
      configurable: !0,
      writable: !0
    }), Object.keys || (Object.keys = (s = Object.prototype.hasOwnProperty, l = !{
      toString: null
    }.propertyIsEnumerable("toString"), u = (h = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"]).length, function (t) {
      if ("object" !== se(t) && ("function" != typeof t || null === t)) throw new TypeError();
      var e,
          n,
          r = [];

      for (e in t) s.call(t, e) && r.push(e);

      if (l) for (n = 0; n < u; n++) s.call(t, h[n]) && r.push(h[n]);
      return r;
    })), "function" != typeof Object.assign && (Object.assign = function (t) {
      if (null == t) throw new TypeError("Cannot convert undefined or null to object");
      t = Object(t);

      for (var e = 1; e < arguments.length; e++) {
        var n = arguments[e];
        if (null != n) for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (t[r] = n[r]);
      }

      return t;
    }), String.prototype.trim || (String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
    }), String.prototype.trimLeft || (String.prototype.trimLeft = function () {
      return this.replace(/^\s+/g, "");
    }), String.prototype.trimRight || (String.prototype.trimRight = function () {
      return this.replace(/\s+$/g, "");
    }), Number.isInteger = Number.isInteger || function (t) {
      return "number" == typeof t && isFinite(t) && Math.floor(t) === t;
    };
  }("undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")());

  var t,
      e,
      n,
      _,
      l,
      F,
      P,
      p,
      d,
      k,
      a,
      o,
      s,
      h,
      u,
      c,
      r,
      i,
      f,
      g,
      m,
      y,
      v,
      w,
      b,
      x,
      I,
      C,
      B,
      N,
      L,
      A,
      S,
      j,
      E,
      M,
      O,
      q,
      T,
      R,
      D,
      U,
      z,
      H,
      W,
      V,
      G,
      Y,
      J,
      X,
      K,
      Z,
      Q,
      $,
      tt,
      et,
      nt,
      rt,
      it,
      ot,
      at,
      st,
      lt = function (ie) {
    function oe(o) {
      if ("object" !== se(o)) throw new Error("Invalid Context passed to initialize PubSub (jsPDF-module)");
      var a = {};
      this.subscribe = function (t, e, n) {
        if (n = n || !1, "string" != typeof t || "function" != typeof e || "boolean" != typeof n) throw new Error("Invalid arguments passed to PubSub.subscribe (jsPDF-module)");
        a.hasOwnProperty(t) || (a[t] = {});
        var r = Math.random().toString(35);
        return a[t][r] = [e, !!n], r;
      }, this.unsubscribe = function (t) {
        for (var e in a) if (a[e][t]) return delete a[e][t], 0 === Object.keys(a[e]).length && delete a[e], !0;

        return !1;
      }, this.publish = function (t) {
        if (a.hasOwnProperty(t)) {
          var e = Array.prototype.slice.call(arguments, 1),
              n = [];

          for (var r in a[t]) {
            var i = a[t][r];

            try {
              i[0].apply(o, e);
            } catch (t) {
              ie.console && console.error("jsPDF PubSub Error", t.message, t);
            }

            i[1] && n.push(r);
          }

          n.length && n.forEach(this.unsubscribe);
        }
      }, this.getTopics = function () {
        return a;
      };
    }

    function ae(t, e, i, n) {
      var r = {},
          o = [],
          a = 1;
      "object" === se(t) && (t = (r = t).orientation, e = r.unit || e, i = r.format || i, n = r.compress || r.compressPdf || n, o = r.filters || (!0 === n ? ["FlateEncode"] : o), a = "number" == typeof r.userUnit ? Math.abs(r.userUnit) : 1), e = e || "mm", t = ("" + (t || "P")).toLowerCase();
      var s = r.putOnlyUsedFonts || !0,
          K = {},
          l = {
        internal: {},
        __private__: {}
      };
      l.__private__.PubSub = oe;

      var h = "1.3",
          u = l.__private__.getPdfVersion = function () {
        return h;
      },
          c = (l.__private__.setPdfVersion = function (t) {
        h = t;
      }, {
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
      }),
          f = (l.__private__.getPageFormats = function () {
        return c;
      }, l.__private__.getPageFormat = function (t) {
        return c[t];
      });

      "string" == typeof i && (i = f(i)), i = i || f("a4");

      var p,
          Z = l.f2 = l.__private__.f2 = function (t) {
        if (isNaN(t)) throw new Error("Invalid argument passed to jsPDF.f2");
        return t.toFixed(2);
      },
          Q = l.__private__.f3 = function (t) {
        if (isNaN(t)) throw new Error("Invalid argument passed to jsPDF.f3");
        return t.toFixed(3);
      },
          d = "00000000000000000000000000000000",
          g = l.__private__.getFileId = function () {
        return d;
      },
          m = l.__private__.setFileId = function (t) {
        return t = t || "12345678901234567890123456789012".split("").map(function () {
          return "ABCDEF0123456789".charAt(Math.floor(16 * Math.random()));
        }).join(""), d = t;
      };

      l.setFileId = function (t) {
        return m(t), this;
      }, l.getFileId = function () {
        return g();
      };

      var y = l.__private__.convertDateToPDFDate = function (t) {
        var e = t.getTimezoneOffset(),
            n = e < 0 ? "+" : "-",
            r = Math.floor(Math.abs(e / 60)),
            i = Math.abs(e % 60),
            o = [n, P(r), "'", P(i), "'"].join("");
        return ["D:", t.getFullYear(), P(t.getMonth() + 1), P(t.getDate()), P(t.getHours()), P(t.getMinutes()), P(t.getSeconds()), o].join("");
      },
          v = l.__private__.convertPDFDateToDate = function (t) {
        var e = parseInt(t.substr(2, 4), 10),
            n = parseInt(t.substr(6, 2), 10) - 1,
            r = parseInt(t.substr(8, 2), 10),
            i = parseInt(t.substr(10, 2), 10),
            o = parseInt(t.substr(12, 2), 10),
            a = parseInt(t.substr(14, 2), 10);
        parseInt(t.substr(16, 2), 10), parseInt(t.substr(20, 2), 10);
        return new Date(e, n, r, i, o, a, 0);
      },
          w = l.__private__.setCreationDate = function (t) {
        var e;
        if (void 0 === t && (t = new Date()), "object" === se(t) && "[object Date]" === Object.prototype.toString.call(t)) e = y(t);else {
          if (!/^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|\-0[0-9]|\-1[0-1])\'(0[0-9]|[1-5][0-9])\'?$/.test(t)) throw new Error("Invalid argument passed to jsPDF.setCreationDate");
          e = t;
        }
        return p = e;
      },
          b = l.__private__.getCreationDate = function (t) {
        var e = p;
        return "jsDate" === t && (e = v(p)), e;
      };

      l.setCreationDate = function (t) {
        return w(t), this;
      }, l.getCreationDate = function (t) {
        return b(t);
      };

      var x,
          N,
          L,
          A,
          S,
          $,
          _,
          F,
          P = l.__private__.padd2 = function (t) {
        return ("0" + parseInt(t)).slice(-2);
      },
          k = !1,
          I = [],
          C = [],
          B = 0,
          tt = (l.__private__.setCustomOutputDestination = function (t) {
        N = t;
      }, l.__private__.resetCustomOutputDestination = function (t) {
        N = void 0;
      }, l.__private__.out = function (t) {
        var e;
        return t = "string" == typeof t ? t : t.toString(), (e = void 0 === N ? k ? I[x] : C : N).push(t), k || (B += t.length + 1), e;
      }),
          j = l.__private__.write = function (t) {
        return tt(1 === arguments.length ? t.toString() : Array.prototype.join.call(arguments, " "));
      },
          E = l.__private__.getArrayBuffer = function (t) {
        for (var e = t.length, n = new ArrayBuffer(e), r = new Uint8Array(n); e--;) r[e] = t.charCodeAt(e);

        return n;
      },
          M = [["Helvetica", "helvetica", "normal", "WinAnsiEncoding"], ["Helvetica-Bold", "helvetica", "bold", "WinAnsiEncoding"], ["Helvetica-Oblique", "helvetica", "italic", "WinAnsiEncoding"], ["Helvetica-BoldOblique", "helvetica", "bolditalic", "WinAnsiEncoding"], ["Courier", "courier", "normal", "WinAnsiEncoding"], ["Courier-Bold", "courier", "bold", "WinAnsiEncoding"], ["Courier-Oblique", "courier", "italic", "WinAnsiEncoding"], ["Courier-BoldOblique", "courier", "bolditalic", "WinAnsiEncoding"], ["Times-Roman", "times", "normal", "WinAnsiEncoding"], ["Times-Bold", "times", "bold", "WinAnsiEncoding"], ["Times-Italic", "times", "italic", "WinAnsiEncoding"], ["Times-BoldItalic", "times", "bolditalic", "WinAnsiEncoding"], ["ZapfDingbats", "zapfdingbats", "normal", null], ["Symbol", "symbol", "normal", null]],
          et = (l.__private__.getStandardFonts = function (t) {
        return M;
      }, r.fontSize || 16),
          O = (l.__private__.setFontSize = l.setFontSize = function (t) {
        return et = t, this;
      }, l.__private__.getFontSize = l.getFontSize = function () {
        return et;
      }),
          nt = r.R2L || !1,
          q = (l.__private__.setR2L = l.setR2L = function (t) {
        return nt = t, this;
      }, l.__private__.getR2L = l.getR2L = function (t) {
        return nt;
      }, l.__private__.setZoomMode = function (t) {
        var e = [void 0, null, "fullwidth", "fullheight", "fullpage", "original"];
        if (/^\d*\.?\d*\%$/.test(t)) L = t;else if (isNaN(t)) {
          if (-1 === e.indexOf(t)) throw new Error('zoom must be Integer (e.g. 2), a percentage Value (e.g. 300%) or fullwidth, fullheight, fullpage, original. "' + t + '" is not recognized.');
          L = t;
        } else L = parseInt(t, 10);
      }),
          T = (l.__private__.getZoomMode = function () {
        return L;
      }, l.__private__.setPageMode = function (t) {
        if (-1 == [void 0, null, "UseNone", "UseOutlines", "UseThumbs", "FullScreen"].indexOf(t)) throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "' + t + '" is not recognized.');
        A = t;
      }),
          R = (l.__private__.getPageMode = function () {
        return A;
      }, l.__private__.setLayoutMode = function (t) {
        if (-1 == [void 0, null, "continuous", "single", "twoleft", "tworight", "two"].indexOf(t)) throw new Error('Layout mode must be one of continuous, single, twoleft, tworight. "' + t + '" is not recognized.');
        S = t;
      }),
          D = (l.__private__.getLayoutMode = function () {
        return S;
      }, l.__private__.setDisplayMode = l.setDisplayMode = function (t, e, n) {
        return q(t), R(e), T(n), this;
      }, {
        title: "",
        subject: "",
        author: "",
        keywords: "",
        creator: ""
      }),
          U = (l.__private__.getDocumentProperty = function (t) {
        if (-1 === Object.keys(D).indexOf(t)) throw new Error("Invalid argument passed to jsPDF.getDocumentProperty");
        return D[t];
      }, l.__private__.getDocumentProperties = function (t) {
        return D;
      }, l.__private__.setDocumentProperties = l.setProperties = l.setDocumentProperties = function (t) {
        for (var e in D) D.hasOwnProperty(e) && t[e] && (D[e] = t[e]);

        return this;
      }, l.__private__.setDocumentProperty = function (t, e) {
        if (-1 === Object.keys(D).indexOf(t)) throw new Error("Invalid arguments passed to jsPDF.setDocumentProperty");
        return D[t] = e;
      }, 0),
          z = [],
          rt = {},
          H = {},
          W = 0,
          V = [],
          G = [],
          it = new oe(l),
          Y = r.hotfixes || [],
          J = l.__private__.newObject = function () {
        var t = X();
        return ot(t, !0), t;
      },
          X = l.__private__.newObjectDeferred = function () {
        return z[++U] = function () {
          return B;
        }, U;
      },
          ot = function (t, e) {
        return e = "boolean" == typeof e && e, z[t] = B, e && tt(t + " 0 obj"), t;
      },
          at = l.__private__.newAdditionalObject = function () {
        var t = {
          objId: X(),
          content: ""
        };
        return G.push(t), t;
      },
          st = X(),
          lt = X(),
          ht = l.__private__.decodeColorString = function (t) {
        var e = t.split(" ");

        if (2 === e.length && ("g" === e[1] || "G" === e[1])) {
          var n = parseFloat(e[0]);
          e = [n, n, n, "r"];
        }

        for (var r = "#", i = 0; i < 3; i++) r += ("0" + Math.floor(255 * parseFloat(e[i])).toString(16)).slice(-2);

        return r;
      },
          ut = l.__private__.encodeColorString = function (t) {
        var e;
        "string" == typeof t && (t = {
          ch1: t
        });
        var n = t.ch1,
            r = t.ch2,
            i = t.ch3,
            o = t.ch4,
            a = (t.precision, "draw" === t.pdfColorType ? ["G", "RG", "K"] : ["g", "rg", "k"]);

        if ("string" == typeof n && "#" !== n.charAt(0)) {
          var s = new RGBColor(n);
          if (s.ok) n = s.toHex();else if (!/^\d*\.?\d*$/.test(n)) throw new Error('Invalid color "' + n + '" passed to jsPDF.encodeColorString.');
        }

        if ("string" == typeof n && /^#[0-9A-Fa-f]{3}$/.test(n) && (n = "#" + n[1] + n[1] + n[2] + n[2] + n[3] + n[3]), "string" == typeof n && /^#[0-9A-Fa-f]{6}$/.test(n)) {
          var l = parseInt(n.substr(1), 16);
          n = l >> 16 & 255, r = l >> 8 & 255, i = 255 & l;
        }

        if (void 0 === r || void 0 === o && n === r && r === i) {
          if ("string" == typeof n) e = n + " " + a[0];else switch (t.precision) {
            case 2:
              e = Z(n / 255) + " " + a[0];
              break;

            case 3:
            default:
              e = Q(n / 255) + " " + a[0];
          }
        } else if (void 0 === o || "object" === se(o)) {
          if (o && !isNaN(o.a) && 0 === o.a) return e = ["1.000", "1.000", "1.000", a[1]].join(" ");
          if ("string" == typeof n) e = [n, r, i, a[1]].join(" ");else switch (t.precision) {
            case 2:
              e = [Z(n / 255), Z(r / 255), Z(i / 255), a[1]].join(" ");
              break;

            default:
            case 3:
              e = [Q(n / 255), Q(r / 255), Q(i / 255), a[1]].join(" ");
          }
        } else if ("string" == typeof n) e = [n, r, i, o, a[2]].join(" ");else switch (t.precision) {
          case 2:
            e = [Z(n / 255), Z(r / 255), Z(i / 255), Z(o / 255), a[2]].join(" ");
            break;

          case 3:
          default:
            e = [Q(n / 255), Q(r / 255), Q(i / 255), Q(o / 255), a[2]].join(" ");
        }
        return e;
      },
          ct = l.__private__.getFilters = function () {
        return o;
      },
          ft = l.__private__.putStream = function (t) {
        var e = (t = t || {}).data || "",
            n = t.filters || ct(),
            r = t.alreadyAppliedFilters || [],
            i = t.addLength1 || !1,
            o = e.length,
            a = {};
        !0 === n && (n = ["FlateEncode"]);
        var s = t.additionalKeyValues || [],
            l = (a = void 0 !== ae.API.processDataByFilters ? ae.API.processDataByFilters(e, n) : {
          data: e,
          reverseChain: []
        }).reverseChain + (Array.isArray(r) ? r.join(" ") : r.toString());
        0 !== a.data.length && (s.push({
          key: "Length",
          value: a.data.length
        }), !0 === i && s.push({
          key: "Length1",
          value: o
        })), 0 != l.length && (l.split("/").length - 1 == 1 ? s.push({
          key: "Filter",
          value: l
        }) : s.push({
          key: "Filter",
          value: "[" + l + "]"
        })), tt("<<");

        for (var h = 0; h < s.length; h++) tt("/" + s[h].key + " " + s[h].value);

        tt(">>"), 0 !== a.data.length && (tt("stream"), tt(a.data), tt("endstream"));
      },
          pt = l.__private__.putPage = function (t) {
        t.mediaBox;
        var e = t.number,
            n = t.data,
            r = t.objId,
            i = t.contentsObjId;
        ot(r, !0);
        V[x].mediaBox.topRightX, V[x].mediaBox.bottomLeftX, V[x].mediaBox.topRightY, V[x].mediaBox.bottomLeftY;
        tt("<</Type /Page"), tt("/Parent " + t.rootDictionaryObjId + " 0 R"), tt("/Resources " + t.resourceDictionaryObjId + " 0 R"), tt("/MediaBox [" + parseFloat(Z(t.mediaBox.bottomLeftX)) + " " + parseFloat(Z(t.mediaBox.bottomLeftY)) + " " + Z(t.mediaBox.topRightX) + " " + Z(t.mediaBox.topRightY) + "]"), null !== t.cropBox && tt("/CropBox [" + Z(t.cropBox.bottomLeftX) + " " + Z(t.cropBox.bottomLeftY) + " " + Z(t.cropBox.topRightX) + " " + Z(t.cropBox.topRightY) + "]"), null !== t.bleedBox && tt("/BleedBox [" + Z(t.bleedBox.bottomLeftX) + " " + Z(t.bleedBox.bottomLeftY) + " " + Z(t.bleedBox.topRightX) + " " + Z(t.bleedBox.topRightY) + "]"), null !== t.trimBox && tt("/TrimBox [" + Z(t.trimBox.bottomLeftX) + " " + Z(t.trimBox.bottomLeftY) + " " + Z(t.trimBox.topRightX) + " " + Z(t.trimBox.topRightY) + "]"), null !== t.artBox && tt("/ArtBox [" + Z(t.artBox.bottomLeftX) + " " + Z(t.artBox.bottomLeftY) + " " + Z(t.artBox.topRightX) + " " + Z(t.artBox.topRightY) + "]"), "number" == typeof t.userUnit && 1 !== t.userUnit && tt("/UserUnit " + t.userUnit), it.publish("putPage", {
          objId: r,
          pageContext: V[e],
          pageNumber: e,
          page: n
        }), tt("/Contents " + i + " 0 R"), tt(">>"), tt("endobj");
        var o = n.join("\n");
        return ot(i, !0), ft({
          data: o,
          filters: ct()
        }), tt("endobj"), r;
      },
          dt = l.__private__.putPages = function () {
        var t,
            e,
            n = [];

        for (t = 1; t <= W; t++) V[t].objId = X(), V[t].contentsObjId = X();

        for (t = 1; t <= W; t++) n.push(pt({
          number: t,
          data: I[t],
          objId: V[t].objId,
          contentsObjId: V[t].contentsObjId,
          mediaBox: V[t].mediaBox,
          cropBox: V[t].cropBox,
          bleedBox: V[t].bleedBox,
          trimBox: V[t].trimBox,
          artBox: V[t].artBox,
          userUnit: V[t].userUnit,
          rootDictionaryObjId: st,
          resourceDictionaryObjId: lt
        }));

        ot(st, !0), tt("<</Type /Pages");
        var r = "/Kids [";

        for (e = 0; e < W; e++) r += n[e] + " 0 R ";

        tt(r + "]"), tt("/Count " + W), tt(">>"), tt("endobj"), it.publish("postPutPages");
      },
          gt = function () {
        !function () {
          for (var t in rt) rt.hasOwnProperty(t) && (!1 === s || !0 === s && K.hasOwnProperty(t)) && (e = rt[t], it.publish("putFont", {
            font: e,
            out: tt,
            newObject: J,
            putStream: ft
          }), !0 !== e.isAlreadyPutted && (e.objectNumber = J(), tt("<<"), tt("/Type /Font"), tt("/BaseFont /" + e.postScriptName), tt("/Subtype /Type1"), "string" == typeof e.encoding && tt("/Encoding /" + e.encoding), tt("/FirstChar 32"), tt("/LastChar 255"), tt(">>"), tt("endobj")));

          var e;
        }(), it.publish("putResources"), ot(lt, !0), tt("<<"), function () {
          for (var t in tt("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]"), tt("/Font <<"), rt) rt.hasOwnProperty(t) && (!1 === s || !0 === s && K.hasOwnProperty(t)) && tt("/" + t + " " + rt[t].objectNumber + " 0 R");

          tt(">>"), tt("/XObject <<"), it.publish("putXobjectDict"), tt(">>");
        }(), tt(">>"), tt("endobj"), it.publish("postPutResources");
      },
          mt = function (t, e, n) {
        H.hasOwnProperty(e) || (H[e] = {}), H[e][n] = t;
      },
          yt = function (t, e, n, r, i) {
        i = i || !1;
        var o = "F" + (Object.keys(rt).length + 1).toString(10),
            a = {
          id: o,
          postScriptName: t,
          fontName: e,
          fontStyle: n,
          encoding: r,
          isStandardFont: i,
          metadata: {}
        };
        return it.publish("addFont", {
          font: a,
          instance: this
        }), void 0 !== o && (rt[o] = a, mt(o, e, n)), o;
      },
          vt = l.__private__.pdfEscape = l.pdfEscape = function (t, e) {
        return function (t, e) {
          var n, r, i, o, a, s, l, h, u;

          if (i = (e = e || {}).sourceEncoding || "Unicode", a = e.outputEncoding, (e.autoencode || a) && rt[$].metadata && rt[$].metadata[i] && rt[$].metadata[i].encoding && (o = rt[$].metadata[i].encoding, !a && rt[$].encoding && (a = rt[$].encoding), !a && o.codePages && (a = o.codePages[0]), "string" == typeof a && (a = o[a]), a)) {
            for (l = !1, s = [], n = 0, r = t.length; n < r; n++) (h = a[t.charCodeAt(n)]) ? s.push(String.fromCharCode(h)) : s.push(t[n]), s[n].charCodeAt(0) >> 8 && (l = !0);

            t = s.join("");
          }

          for (n = t.length; void 0 === l && 0 !== n;) t.charCodeAt(n - 1) >> 8 && (l = !0), n--;

          if (!l) return t;

          for (s = e.noBOM ? [] : [254, 255], n = 0, r = t.length; n < r; n++) {
            if ((u = (h = t.charCodeAt(n)) >> 8) >> 8) throw new Error("Character at position " + n + " of string '" + t + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
            s.push(u), s.push(h - (u << 8));
          }

          return String.fromCharCode.apply(void 0, s);
        }(t, e).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      },
          wt = l.__private__.beginPage = function (t, e) {
        var n,
            r = "string" == typeof e && e.toLowerCase();

        if ("string" == typeof t && (n = f(t.toLowerCase())) && (t = n[0], e = n[1]), Array.isArray(t) && (e = t[1], t = t[0]), (isNaN(t) || isNaN(e)) && (t = i[0], e = i[1]), r) {
          switch (r.substr(0, 1)) {
            case "l":
              t < e && (r = "s");
              break;

            case "p":
              e < t && (r = "s");
          }

          "s" === r && (n = t, t = e, e = n);
        }

        (14400 < t || 14400 < e) && (console.warn("A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400"), t = Math.min(14400, t), e = Math.min(14400, e)), i = [t, e], k = !0, I[++W] = [], V[W] = {
          objId: 0,
          contentsObjId: 0,
          userUnit: Number(a),
          artBox: null,
          bleedBox: null,
          cropBox: null,
          trimBox: null,
          mediaBox: {
            bottomLeftX: 0,
            bottomLeftY: 0,
            topRightX: Number(t),
            topRightY: Number(e)
          }
        }, xt(W);
      },
          bt = function () {
        wt.apply(this, arguments), Dt(Rt), tt(Jt), 0 !== te && tt(te + " J"), 0 !== ne && tt(ne + " j"), it.publish("addPage", {
          pageNumber: W
        });
      },
          xt = function (t) {
        0 < t && t <= W && (x = t);
      },
          Nt = l.__private__.getNumberOfPages = l.getNumberOfPages = function () {
        return I.length - 1;
      },
          Lt = function (t, e, n) {
        var r,
            i = void 0;
        return n = n || {}, t = void 0 !== t ? t : rt[$].fontName, e = void 0 !== e ? e : rt[$].fontStyle, r = t.toLowerCase(), void 0 !== H[r] && void 0 !== H[r][e] ? i = H[r][e] : void 0 !== H[t] && void 0 !== H[t][e] ? i = H[t][e] : !1 === n.disableWarning && console.warn("Unable to look up font label for font '" + t + "', '" + e + "'. Refer to getFontList() for available fonts."), i || n.noFallback || null == (i = H.times[e]) && (i = H.times.normal), i;
      },
          At = l.__private__.putInfo = function () {
        for (var t in J(), tt("<<"), tt("/Producer (jsPDF " + ae.version + ")"), D) D.hasOwnProperty(t) && D[t] && tt("/" + t.substr(0, 1).toUpperCase() + t.substr(1) + " (" + vt(D[t]) + ")");

        tt("/CreationDate (" + p + ")"), tt(">>"), tt("endobj");
      },
          St = l.__private__.putCatalog = function (t) {
        var e = (t = t || {}).rootDictionaryObjId || st;

        switch (J(), tt("<<"), tt("/Type /Catalog"), tt("/Pages " + e + " 0 R"), L || (L = "fullwidth"), L) {
          case "fullwidth":
            tt("/OpenAction [3 0 R /FitH null]");
            break;

          case "fullheight":
            tt("/OpenAction [3 0 R /FitV null]");
            break;

          case "fullpage":
            tt("/OpenAction [3 0 R /Fit]");
            break;

          case "original":
            tt("/OpenAction [3 0 R /XYZ null null 1]");
            break;

          default:
            var n = "" + L;
            "%" === n.substr(n.length - 1) && (L = parseInt(L) / 100), "number" == typeof L && tt("/OpenAction [3 0 R /XYZ null null " + Z(L) + "]");
        }

        switch (S || (S = "continuous"), S) {
          case "continuous":
            tt("/PageLayout /OneColumn");
            break;

          case "single":
            tt("/PageLayout /SinglePage");
            break;

          case "two":
          case "twoleft":
            tt("/PageLayout /TwoColumnLeft");
            break;

          case "tworight":
            tt("/PageLayout /TwoColumnRight");
        }

        A && tt("/PageMode /" + A), it.publish("putCatalog"), tt(">>"), tt("endobj");
      },
          _t = l.__private__.putTrailer = function () {
        tt("trailer"), tt("<<"), tt("/Size " + (U + 1)), tt("/Root " + U + " 0 R"), tt("/Info " + (U - 1) + " 0 R"), tt("/ID [ <" + d + "> <" + d + "> ]"), tt(">>");
      },
          Ft = l.__private__.putHeader = function () {
        tt("%PDF-" + h), tt("%ºß¬à");
      },
          Pt = l.__private__.putXRef = function () {
        var t = 1,
            e = "0000000000";

        for (tt("xref"), tt("0 " + (U + 1)), tt("0000000000 65535 f "), t = 1; t <= U; t++) {
          "function" == typeof z[t] ? tt((e + z[t]()).slice(-10) + " 00000 n ") : void 0 !== z[t] ? tt((e + z[t]).slice(-10) + " 00000 n ") : tt("0000000000 00000 n ");
        }
      },
          kt = l.__private__.buildDocument = function () {
        k = !1, B = U = 0, C = [], z = [], G = [], st = X(), lt = X(), it.publish("buildDocument"), Ft(), dt(), function () {
          it.publish("putAdditionalObjects");

          for (var t = 0; t < G.length; t++) {
            var e = G[t];
            ot(e.objId, !0), tt(e.content), tt("endobj");
          }

          it.publish("postPutAdditionalObjects");
        }(), gt(), At(), St();
        var t = B;
        return Pt(), _t(), tt("startxref"), tt("" + t), tt("%%EOF"), k = !0, C.join("\n");
      },
          It = l.__private__.getBlob = function (t) {
        return new Blob([E(t)], {
          type: "application/pdf"
        });
      },
          Ct = l.output = l.__private__.output = ((F = function (t, e) {
        e = e || {};
        var n = kt();

        switch ("string" == typeof e ? e = {
          filename: e
        } : e.filename = e.filename || "generated.pdf", t) {
          case void 0:
            return n;

          case "save":
            l.save(e.filename);
            break;

          case "arraybuffer":
            return E(n);

          case "blob":
            return It(n);

          case "bloburi":
          case "bloburl":
            if (void 0 !== ie.URL && "function" == typeof ie.URL.createObjectURL) return ie.URL && ie.URL.createObjectURL(It(n)) || void 0;
            console.warn("bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.");
            break;

          case "datauristring":
          case "dataurlstring":
            return "data:application/pdf;filename=" + e.filename + ";base64," + btoa(n);

          case "dataurlnewwindow":
            var r = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe src="' + this.output("datauristring") + '"></iframe></body></html>',
                i = ie.open();
            if (null !== i && i.document.write(r), i || "undefined" == typeof safari) return i;

          case "datauri":
          case "dataurl":
            return ie.document.location.href = "data:application/pdf;filename=" + e.filename + ";base64," + btoa(n);

          default:
            return null;
        }
      }).foo = function () {
        try {
          return F.apply(this, arguments);
        } catch (t) {
          var e = t.stack || "";
          ~e.indexOf(" at ") && (e = e.split(" at ")[1]);
          var n = "Error in function " + e.split("\n")[0].split("<")[0] + ": " + t.message;
          if (!ie.console) throw new Error(n);
          ie.console.error(n, t), ie.alert && alert(n);
        }
      }, (F.foo.bar = F).foo),
          Bt = function (t) {
        return !0 === Array.isArray(Y) && -1 < Y.indexOf(t);
      };

      switch (e) {
        case "pt":
          _ = 1;
          break;

        case "mm":
          _ = 72 / 25.4;
          break;

        case "cm":
          _ = 72 / 2.54;
          break;

        case "in":
          _ = 72;
          break;

        case "px":
          _ = 1 == Bt("px_scaling") ? .75 : 96 / 72;
          break;

        case "pc":
        case "em":
          _ = 12;
          break;

        case "ex":
          _ = 6;
          break;

        default:
          throw new Error("Invalid unit: " + e);
      }

      w(), m();

      var jt = l.__private__.getPageInfo = function (t) {
        if (isNaN(t) || t % 1 != 0) throw new Error("Invalid argument passed to jsPDF.getPageInfo");
        return {
          objId: V[t].objId,
          pageNumber: t,
          pageContext: V[t]
        };
      },
          Et = l.__private__.getPageInfoByObjId = function (t) {
        for (var e in V) if (V[e].objId === t) break;

        if (isNaN(t) || t % 1 != 0) throw new Error("Invalid argument passed to jsPDF.getPageInfoByObjId");
        return jt(e);
      },
          Mt = l.__private__.getCurrentPageInfo = function () {
        return {
          objId: V[x].objId,
          pageNumber: x,
          pageContext: V[x]
        };
      };

      l.addPage = function () {
        return bt.apply(this, arguments), this;
      }, l.setPage = function () {
        return xt.apply(this, arguments), this;
      }, l.insertPage = function (t) {
        return this.addPage(), this.movePage(x, t), this;
      }, l.movePage = function (t, e) {
        if (e < t) {
          for (var n = I[t], r = V[t], i = t; e < i; i--) I[i] = I[i - 1], V[i] = V[i - 1];

          I[e] = n, V[e] = r, this.setPage(e);
        } else if (t < e) {
          for (n = I[t], r = V[t], i = t; i < e; i++) I[i] = I[i + 1], V[i] = V[i + 1];

          I[e] = n, V[e] = r, this.setPage(e);
        }

        return this;
      }, l.deletePage = function () {
        return function (t) {
          0 < t && t <= W && (I.splice(t, 1), --W < x && (x = W), this.setPage(x));
        }.apply(this, arguments), this;
      };
      l.__private__.text = l.text = function (t, e, n, i) {
        var r;
        "number" != typeof t || "number" != typeof e || "string" != typeof n && !Array.isArray(n) || (r = n, n = e, e = t, t = r);
        var o = arguments[3],
            a = arguments[4],
            s = arguments[5];
        if ("object" === se(o) && null !== o || ("string" == typeof a && (s = a, a = null), "string" == typeof o && (s = o, o = null), "number" == typeof o && (a = o, o = null), i = {
          flags: o,
          angle: a,
          align: s
        }), (o = o || {}).noBOM = o.noBOM || !0, o.autoencode = o.autoencode || !0, isNaN(e) || isNaN(n) || null == t) throw new Error("Invalid arguments passed to jsPDF.text");
        if (0 === t.length) return c;
        var l,
            h = "",
            u = "number" == typeof i.lineHeightFactor ? i.lineHeightFactor : Tt,
            c = i.scope || this;

        function f(t) {
          for (var e, n = t.concat(), r = [], i = n.length; i--;) "string" == typeof (e = n.shift()) ? r.push(e) : Array.isArray(t) && 1 === e.length ? r.push(e[0]) : r.push([e[0], e[1], e[2]]);

          return r;
        }

        function p(t, e) {
          var n;
          if ("string" == typeof t) n = e(t)[0];else if (Array.isArray(t)) {
            for (var r, i, o = t.concat(), a = [], s = o.length; s--;) "string" == typeof (r = o.shift()) ? a.push(e(r)[0]) : Array.isArray(r) && "string" === r[0] && (i = e(r[0], r[1], r[2]), a.push([i[0], i[1], i[2]]));

            n = a;
          }
          return n;
        }

        var d = !1,
            g = !0;
        if ("string" == typeof t) d = !0;else if (Array.isArray(t)) {
          for (var m, y = t.concat(), v = [], w = y.length; w--;) ("string" != typeof (m = y.shift()) || Array.isArray(m) && "string" != typeof m[0]) && (g = !1);

          d = g;
        }
        if (!1 === d) throw new Error('Type of text must be string or Array. "' + t + '" is not recognized.');
        var b = rt[$].encoding;
        "WinAnsiEncoding" !== b && "StandardEncoding" !== b || (t = p(t, function (t, e, n) {
          return [(r = t, r = r.split("\t").join(Array(i.TabLen || 9).join(" ")), vt(r, o)), e, n];
          var r;
        })), "string" == typeof t && (t = t.match(/[\r?\n]/) ? t.split(/\r\n|\r|\n/g) : [t]);
        var x = et / c.internal.scaleFactor,
            N = x * (Tt - 1);

        switch (i.baseline) {
          case "bottom":
            n -= N;
            break;

          case "top":
            n += x - N;
            break;

          case "hanging":
            n += x - 2 * N;
            break;

          case "middle":
            n += x / 2 - N;
        }

        0 < (O = i.maxWidth || 0) && ("string" == typeof t ? t = c.splitTextToSize(t, O) : "[object Array]" === Object.prototype.toString.call(t) && (t = c.splitTextToSize(t.join(" "), O)));
        var L = {
          text: t,
          x: e,
          y: n,
          options: i,
          mutex: {
            pdfEscape: vt,
            activeFontKey: $,
            fonts: rt,
            activeFontSize: et
          }
        };
        it.publish("preProcessText", L), t = L.text;
        a = (i = L.options).angle;
        var A = c.internal.scaleFactor,
            S = [];

        if (a) {
          a *= Math.PI / 180;

          var _ = Math.cos(a),
              F = Math.sin(a);

          S = [Z(_), Z(F), Z(-1 * F), Z(_)];
        }

        void 0 !== (M = i.charSpace) && (h += Q(M * A) + " Tc\n");
        i.lang;
        var P = -1,
            k = void 0 !== i.renderingMode ? i.renderingMode : i.stroke,
            I = c.internal.getCurrentPageInfo().pageContext;

        switch (k) {
          case 0:
          case !1:
          case "fill":
            P = 0;
            break;

          case 1:
          case !0:
          case "stroke":
            P = 1;
            break;

          case 2:
          case "fillThenStroke":
            P = 2;
            break;

          case 3:
          case "invisible":
            P = 3;
            break;

          case 4:
          case "fillAndAddForClipping":
            P = 4;
            break;

          case 5:
          case "strokeAndAddPathForClipping":
            P = 5;
            break;

          case 6:
          case "fillThenStrokeAndAddToPathForClipping":
            P = 6;
            break;

          case 7:
          case "addToPathForClipping":
            P = 7;
        }

        var C = void 0 !== I.usedRenderingMode ? I.usedRenderingMode : -1;
        -1 !== P ? h += P + " Tr\n" : -1 !== C && (h += "0 Tr\n"), -1 !== P && (I.usedRenderingMode = P);
        s = i.align || "left";
        var B = et * u,
            j = c.internal.pageSize.getWidth(),
            E = (A = c.internal.scaleFactor, rt[$]),
            M = i.charSpace || Qt,
            O = i.maxWidth || 0,
            q = (o = {}, []);

        if ("[object Array]" === Object.prototype.toString.call(t)) {
          var T, R;
          v = f(t);
          "left" !== s && (R = v.map(function (t) {
            return c.getStringUnitWidth(t, {
              font: E,
              charSpace: M,
              fontSize: et
            }) * et / A;
          }));
          var D,
              U = Math.max.apply(Math, R),
              z = 0;

          if ("right" === s) {
            e -= R[0], t = [];
            var H = 0;

            for (w = v.length; H < w; H++) U - R[H], T = 0 === H ? (D = Wt(e), Vt(n)) : (D = (z - R[H]) * A, -B), t.push([v[H], D, T]), z = R[H];
          } else if ("center" === s) {
            e -= R[0] / 2, t = [];

            for (H = 0, w = v.length; H < w; H++) (U - R[H]) / 2, T = 0 === H ? (D = Wt(e), Vt(n)) : (D = (z - R[H]) / 2 * A, -B), t.push([v[H], D, T]), z = R[H];
          } else if ("left" === s) {
            t = [];

            for (H = 0, w = v.length; H < w; H++) T = 0 === H ? Vt(n) : -B, D = 0 === H ? Wt(e) : 0, t.push(v[H]);
          } else {
            if ("justify" !== s) throw new Error('Unrecognized alignment option, use "left", "center", "right" or "justify".');
            t = [];

            for (O = 0 !== O ? O : j, H = 0, w = v.length; H < w; H++) T = 0 === H ? Vt(n) : -B, D = 0 === H ? Wt(e) : 0, H < w - 1 && q.push(((O - R[H]) / (v[H].split(" ").length - 1) * A).toFixed(2)), t.push([v[H], D, T]);
          }
        }

        !0 === ("boolean" == typeof i.R2L ? i.R2L : nt) && (t = p(t, function (t, e, n) {
          return [t.split("").reverse().join(""), e, n];
        }));
        L = {
          text: t,
          x: e,
          y: n,
          options: i,
          mutex: {
            pdfEscape: vt,
            activeFontKey: $,
            fonts: rt,
            activeFontSize: et
          }
        };
        it.publish("postProcessText", L), t = L.text, l = L.mutex.isHex;
        v = f(t);
        t = [];
        var W,
            V,
            G,
            Y = 0,
            J = (w = v.length, "");

        for (H = 0; H < w; H++) J = "", Array.isArray(v[H]) ? (W = parseFloat(v[H][1]), V = parseFloat(v[H][2]), G = (l ? "<" : "(") + v[H][0] + (l ? ">" : ")"), Y = 1) : (W = Wt(e), V = Vt(n), G = (l ? "<" : "(") + v[H] + (l ? ">" : ")")), void 0 !== q && void 0 !== q[H] && (J = q[H] + " Tw\n"), 0 !== S.length && 0 === H ? t.push(J + S.join(" ") + " " + W.toFixed(2) + " " + V.toFixed(2) + " Tm\n" + G) : 1 === Y || 0 === Y && 0 === H ? t.push(J + W.toFixed(2) + " " + V.toFixed(2) + " Td\n" + G) : t.push(J + G);

        t = 0 === Y ? t.join(" Tj\nT* ") : t.join(" Tj\n"), t += " Tj\n";
        var X = "BT\n/" + $ + " " + et + " Tf\n" + (et * u).toFixed(2) + " TL\n" + Kt + "\n";
        return X += h, X += t, tt(X += "ET"), K[$] = !0, c;
      }, l.__private__.lstext = l.lstext = function (t, e, n, r) {
        return console.warn("jsPDF.lstext is deprecated"), this.text(t, e, n, {
          charSpace: r
        });
      }, l.__private__.clip = l.clip = function (t) {
        tt("evenodd" === t ? "W*" : "W"), tt("n");
      }, l.__private__.clip_fixed = l.clip_fixed = function (t) {
        console.log("clip_fixed is deprecated"), l.clip(t);
      };

      var Ot = l.__private__.isValidStyle = function (t) {
        var e = !1;
        return -1 !== [void 0, null, "S", "F", "DF", "FD", "f", "f*", "B", "B*"].indexOf(t) && (e = !0), e;
      },
          qt = l.__private__.getStyle = function (t) {
        var e = "S";
        return "F" === t ? e = "f" : "FD" === t || "DF" === t ? e = "B" : "f" !== t && "f*" !== t && "B" !== t && "B*" !== t || (e = t), e;
      };

      l.__private__.line = l.line = function (t, e, n, r) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw new Error("Invalid arguments passed to jsPDF.line");
        return this.lines([[n - t, r - e]], t, e);
      }, l.__private__.lines = l.lines = function (t, e, n, r, i, o) {
        var a, s, l, h, u, c, f, p, d, g, m, y;
        if ("number" == typeof t && (y = n, n = e, e = t, t = y), r = r || [1, 1], o = o || !1, isNaN(e) || isNaN(n) || !Array.isArray(t) || !Array.isArray(r) || !Ot(i) || "boolean" != typeof o) throw new Error("Invalid arguments passed to jsPDF.lines");

        for (tt(Q(Wt(e)) + " " + Q(Vt(n)) + " m "), a = r[0], s = r[1], h = t.length, g = e, m = n, l = 0; l < h; l++) 2 === (u = t[l]).length ? (g = u[0] * a + g, m = u[1] * s + m, tt(Q(Wt(g)) + " " + Q(Vt(m)) + " l")) : (c = u[0] * a + g, f = u[1] * s + m, p = u[2] * a + g, d = u[3] * s + m, g = u[4] * a + g, m = u[5] * s + m, tt(Q(Wt(c)) + " " + Q(Vt(f)) + " " + Q(Wt(p)) + " " + Q(Vt(d)) + " " + Q(Wt(g)) + " " + Q(Vt(m)) + " c"));

        return o && tt(" h"), null !== i && tt(qt(i)), this;
      }, l.__private__.rect = l.rect = function (t, e, n, r, i) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || !Ot(i)) throw new Error("Invalid arguments passed to jsPDF.rect");
        return tt([Z(Wt(t)), Z(Vt(e)), Z(n * _), Z(-r * _), "re"].join(" ")), null !== i && tt(qt(i)), this;
      }, l.__private__.triangle = l.triangle = function (t, e, n, r, i, o, a) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || isNaN(i) || isNaN(o) || !Ot(a)) throw new Error("Invalid arguments passed to jsPDF.triangle");
        return this.lines([[n - t, r - e], [i - n, o - r], [t - i, e - o]], t, e, [1, 1], a, !0), this;
      }, l.__private__.roundedRect = l.roundedRect = function (t, e, n, r, i, o, a) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || isNaN(i) || isNaN(o) || !Ot(a)) throw new Error("Invalid arguments passed to jsPDF.roundedRect");
        var s = 4 / 3 * (Math.SQRT2 - 1);
        return this.lines([[n - 2 * i, 0], [i * s, 0, i, o - o * s, i, o], [0, r - 2 * o], [0, o * s, -i * s, o, -i, o], [2 * i - n, 0], [-i * s, 0, -i, -o * s, -i, -o], [0, 2 * o - r], [0, -o * s, i * s, -o, i, -o]], t + i, e, [1, 1], a), this;
      }, l.__private__.ellipse = l.ellipse = function (t, e, n, r, i) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || !Ot(i)) throw new Error("Invalid arguments passed to jsPDF.ellipse");
        var o = 4 / 3 * (Math.SQRT2 - 1) * n,
            a = 4 / 3 * (Math.SQRT2 - 1) * r;
        return tt([Z(Wt(t + n)), Z(Vt(e)), "m", Z(Wt(t + n)), Z(Vt(e - a)), Z(Wt(t + o)), Z(Vt(e - r)), Z(Wt(t)), Z(Vt(e - r)), "c"].join(" ")), tt([Z(Wt(t - o)), Z(Vt(e - r)), Z(Wt(t - n)), Z(Vt(e - a)), Z(Wt(t - n)), Z(Vt(e)), "c"].join(" ")), tt([Z(Wt(t - n)), Z(Vt(e + a)), Z(Wt(t - o)), Z(Vt(e + r)), Z(Wt(t)), Z(Vt(e + r)), "c"].join(" ")), tt([Z(Wt(t + o)), Z(Vt(e + r)), Z(Wt(t + n)), Z(Vt(e + a)), Z(Wt(t + n)), Z(Vt(e)), "c"].join(" ")), null !== i && tt(qt(i)), this;
      }, l.__private__.circle = l.circle = function (t, e, n, r) {
        if (isNaN(t) || isNaN(e) || isNaN(n) || !Ot(r)) throw new Error("Invalid arguments passed to jsPDF.circle");
        return this.ellipse(t, e, n, n, r);
      };
      l.setFont = function (t, e) {
        return $ = Lt(t, e, {
          disableWarning: !1
        }), this;
      }, l.setFontStyle = l.setFontType = function (t) {
        return $ = Lt(void 0, t), this;
      };

      l.__private__.getFontList = l.getFontList = function () {
        var t,
            e,
            n,
            r = {};

        for (t in H) if (H.hasOwnProperty(t)) for (e in r[t] = n = [], H[t]) H[t].hasOwnProperty(e) && n.push(e);

        return r;
      };

      l.addFont = function (t, e, n, r) {
        yt.call(this, t, e, n, r = r || "Identity-H");
      };

      var Tt,
          Rt = r.lineWidth || .200025,
          Dt = l.__private__.setLineWidth = l.setLineWidth = function (t) {
        return tt((t * _).toFixed(2) + " w"), this;
      },
          Ut = (l.__private__.setLineDash = ae.API.setLineDash = function (t, e) {
        if (t = t || [], e = e || 0, isNaN(e) || !Array.isArray(t)) throw new Error("Invalid arguments passed to jsPDF.setLineDash");
        return t = t.map(function (t) {
          return (t * _).toFixed(3);
        }).join(" "), e = parseFloat((e * _).toFixed(3)), tt("[" + t + "] " + e + " d"), this;
      }, l.__private__.getLineHeight = l.getLineHeight = function () {
        return et * Tt;
      }),
          zt = (Ut = l.__private__.getLineHeight = l.getLineHeight = function () {
        return et * Tt;
      }, l.__private__.setLineHeightFactor = l.setLineHeightFactor = function (t) {
        return "number" == typeof (t = t || 1.15) && (Tt = t), this;
      }),
          Ht = l.__private__.getLineHeightFactor = l.getLineHeightFactor = function () {
        return Tt;
      };

      zt(r.lineHeight);

      var Wt = l.__private__.getHorizontalCoordinate = function (t) {
        return t * _;
      },
          Vt = l.__private__.getVerticalCoordinate = function (t) {
        return V[x].mediaBox.topRightY - V[x].mediaBox.bottomLeftY - t * _;
      },
          Gt = l.__private__.getHorizontalCoordinateString = function (t) {
        return Z(t * _);
      },
          Yt = l.__private__.getVerticalCoordinateString = function (t) {
        return Z(V[x].mediaBox.topRightY - V[x].mediaBox.bottomLeftY - t * _);
      },
          Jt = r.strokeColor || "0 G",
          Xt = (l.__private__.getStrokeColor = l.getDrawColor = function () {
        return ht(Jt);
      }, l.__private__.setStrokeColor = l.setDrawColor = function (t, e, n, r) {
        return Jt = ut({
          ch1: t,
          ch2: e,
          ch3: n,
          ch4: r,
          pdfColorType: "draw",
          precision: 2
        }), tt(Jt), this;
      }, r.fillColor || "0 g"),
          Kt = (l.__private__.getFillColor = l.getFillColor = function () {
        return ht(Xt);
      }, l.__private__.setFillColor = l.setFillColor = function (t, e, n, r) {
        return Xt = ut({
          ch1: t,
          ch2: e,
          ch3: n,
          ch4: r,
          pdfColorType: "fill",
          precision: 2
        }), tt(Xt), this;
      }, r.textColor || "0 g"),
          Zt = l.__private__.getTextColor = l.getTextColor = function () {
        return ht(Kt);
      },
          Qt = (l.__private__.setTextColor = l.setTextColor = function (t, e, n, r) {
        return Kt = ut({
          ch1: t,
          ch2: e,
          ch3: n,
          ch4: r,
          pdfColorType: "text",
          precision: 3
        }), this;
      }, r.charSpace || 0),
          $t = l.__private__.getCharSpace = l.getCharSpace = function () {
        return Qt;
      },
          te = (l.__private__.setCharSpace = l.setCharSpace = function (t) {
        if (isNaN(t)) throw new Error("Invalid argument passed to jsPDF.setCharSpace");
        return Qt = t, this;
      }, 0);

      l.CapJoinStyles = {
        0: 0,
        butt: 0,
        but: 0,
        miter: 0,
        1: 1,
        round: 1,
        rounded: 1,
        circle: 1,
        2: 2,
        projecting: 2,
        project: 2,
        square: 2,
        bevel: 2
      };

      l.__private__.setLineCap = l.setLineCap = function (t) {
        var e = l.CapJoinStyles[t];
        if (void 0 === e) throw new Error("Line cap style of '" + t + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
        return tt((te = e) + " J"), this;
      };

      var ee,
          ne = 0;
      l.__private__.setLineJoin = l.setLineJoin = function (t) {
        var e = l.CapJoinStyles[t];
        if (void 0 === e) throw new Error("Line join style of '" + t + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
        return tt((ne = e) + " j"), this;
      }, l.__private__.setMiterLimit = l.setMiterLimit = function (t) {
        if (t = t || 0, isNaN(t)) throw new Error("Invalid argument passed to jsPDF.setMiterLimit");
        return ee = parseFloat(Z(t * _)), tt(ee + " M"), this;
      };

      for (var re in l.save = function (r, t) {
        if (r = r || "generated.pdf", (t = t || {}).returnPromise = t.returnPromise || !1, !1 !== t.returnPromise) return new Promise(function (t, e) {
          try {
            var n = le(It(kt()), r);
            "function" == typeof le.unload && ie.setTimeout && setTimeout(le.unload, 911), t(n);
          } catch (t) {
            e(t.message);
          }
        });
        le(It(kt()), r), "function" == typeof le.unload && ie.setTimeout && setTimeout(le.unload, 911);
      }, ae.API) ae.API.hasOwnProperty(re) && ("events" === re && ae.API.events.length ? function (t, e) {
        var n, r, i;

        for (i = e.length - 1; -1 !== i; i--) n = e[i][0], r = e[i][1], t.subscribe.apply(t, [n].concat("function" == typeof r ? [r] : r));
      }(it, ae.API.events) : l[re] = ae.API[re]);

      return l.internal = {
        pdfEscape: vt,
        getStyle: qt,
        getFont: function () {
          return rt[Lt.apply(l, arguments)];
        },
        getFontSize: O,
        getCharSpace: $t,
        getTextColor: Zt,
        getLineHeight: Ut,
        getLineHeightFactor: Ht,
        write: j,
        getHorizontalCoordinate: Wt,
        getVerticalCoordinate: Vt,
        getCoordinateString: Gt,
        getVerticalCoordinateString: Yt,
        collections: {},
        newObject: J,
        newAdditionalObject: at,
        newObjectDeferred: X,
        newObjectDeferredBegin: ot,
        getFilters: ct,
        putStream: ft,
        events: it,
        scaleFactor: _,
        pageSize: {
          getWidth: function () {
            return (V[x].mediaBox.topRightX - V[x].mediaBox.bottomLeftX) / _;
          },
          setWidth: function (t) {
            V[x].mediaBox.topRightX = t * _ + V[x].mediaBox.bottomLeftX;
          },
          getHeight: function () {
            return (V[x].mediaBox.topRightY - V[x].mediaBox.bottomLeftY) / _;
          },
          setHeight: function (t) {
            V[x].mediaBox.topRightY = t * _ + V[x].mediaBox.bottomLeftY;
          }
        },
        output: Ct,
        getNumberOfPages: Nt,
        pages: I,
        out: tt,
        f2: Z,
        f3: Q,
        getPageInfo: jt,
        getPageInfoByObjId: Et,
        getCurrentPageInfo: Mt,
        getPDFVersion: u,
        hasHotfix: Bt
      }, Object.defineProperty(l.internal.pageSize, "width", {
        get: function () {
          return (V[x].mediaBox.topRightX - V[x].mediaBox.bottomLeftX) / _;
        },
        set: function (t) {
          V[x].mediaBox.topRightX = t * _ + V[x].mediaBox.bottomLeftX;
        },
        enumerable: !0,
        configurable: !0
      }), Object.defineProperty(l.internal.pageSize, "height", {
        get: function () {
          return (V[x].mediaBox.topRightY - V[x].mediaBox.bottomLeftY) / _;
        },
        set: function (t) {
          V[x].mediaBox.topRightY = t * _ + V[x].mediaBox.bottomLeftY;
        },
        enumerable: !0,
        configurable: !0
      }), function (t) {
        for (var e = 0, n = M.length; e < n; e++) {
          var r = yt(t[e][0], t[e][1], t[e][2], M[e][3], !0);
          K[r] = !0;
          var i = t[e][0].split("-");
          mt(r, i[0], i[1] || "");
        }

        it.publish("addFonts", {
          fonts: rt,
          dictionary: H
        });
      }(M), $ = "F1", bt(i, t), it.publish("initialized"), l;
    }

    return ae.API = {
      events: []
    }, ae.version = "1.5.3",   module.exports ? (module.exports = ae, module.exports.jsPDF = ae) : ie.jsPDF = ae, ae;
  }("undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")());
  /**
     * @license
     * Copyright (c) 2016 Alexander Weidt,
     * https://github.com/BiggA94
     * 
     * Licensed under the MIT License. http://opensource.org/licenses/mit-license
     */


  (function (t, e) {
    var A,
        n = 1,
        S = function (t) {
      return t.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    },
        y = function (t) {
      return t.replace(/\\\\/g, "\\").replace(/\\\(/g, "(").replace(/\\\)/g, ")");
    },
        _ = function (t) {
      if (isNaN(t)) throw new Error("Invalid argument passed to jsPDF.f2");
      return t.toFixed(2);
    },
        s = function (t) {
      if (isNaN(t)) throw new Error("Invalid argument passed to jsPDF.f2");
      return t.toFixed(5);
    };

    t.__acroform__ = {};

    var r = function (t, e) {
      t.prototype = Object.create(e.prototype), t.prototype.constructor = t;
    },
        v = function (t) {
      return t * n;
    },
        w = function (t) {
      return t / n;
    },
        l = function (t) {
      var e = new j(),
          n = Y.internal.getHeight(t) || 0,
          r = Y.internal.getWidth(t) || 0;
      return e.BBox = [0, 0, Number(_(r)), Number(_(n))], e;
    },
        i = t.__acroform__.setBit = function (t, e) {
      if (t = t || 0, e = e || 0, isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBit");
      return t |= 1 << e;
    },
        o = t.__acroform__.clearBit = function (t, e) {
      if (t = t || 0, e = e || 0, isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBit");
      return t &= ~(1 << e);
    },
        a = t.__acroform__.getBit = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBit");
      return 0 == (t & 1 << e) ? 0 : 1;
    },
        b = t.__acroform__.getBitForPdf = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBitForPdf");
      return a(t, e - 1);
    },
        x = t.__acroform__.setBitForPdf = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBitForPdf");
      return i(t, e - 1);
    },
        N = t.__acroform__.clearBitForPdf = function (t, e, n) {
      if (isNaN(t) || isNaN(e)) throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBitForPdf");
      return o(t, e - 1);
    },
        c = t.__acroform__.calculateCoordinates = function (t) {
      var e = this.internal.getHorizontalCoordinate,
          n = this.internal.getVerticalCoordinate,
          r = t[0],
          i = t[1],
          o = t[2],
          a = t[3],
          s = {};
      return s.lowerLeft_X = e(r) || 0, s.lowerLeft_Y = n(i + a) || 0, s.upperRight_X = e(r + o) || 0, s.upperRight_Y = n(i) || 0, [Number(_(s.lowerLeft_X)), Number(_(s.lowerLeft_Y)), Number(_(s.upperRight_X)), Number(_(s.upperRight_Y))];
    },
        f = function (t) {
      if (t.appearanceStreamContent) return t.appearanceStreamContent;

      if (t.V || t.DV) {
        var e = [],
            n = t.V || t.DV,
            r = h(t, n),
            i = A.internal.getFont(t.fontName, t.fontStyle).id;
        e.push("/Tx BMC"), e.push("q"), e.push("BT"), e.push(A.__private__.encodeColorString(t.color)), e.push("/" + i + " " + _(r.fontSize) + " Tf"), e.push("1 0 0 1 0 0 Tm"), e.push(r.text), e.push("ET"), e.push("Q"), e.push("EMC");
        var o = new l(t);
        return o.stream = e.join("\n"), o;
      }
    },
        h = function (i, t) {
      var e = i.maxFontSize || 12,
          n = (i.fontName, {
        text: "",
        fontSize: ""
      }),
          o = (t = ")" == (t = "(" == t.substr(0, 1) ? t.substr(1) : t).substr(t.length - 1) ? t.substr(0, t.length - 1) : t).split(" "),
          r = (A.__private__.encodeColorString(i.color), e),
          a = Y.internal.getHeight(i) || 0;
      a = a < 0 ? -a : a;
      var s = Y.internal.getWidth(i) || 0;
      s = s < 0 ? -s : s;

      var l = function (t, e, n) {
        if (t + 1 < o.length) {
          var r = e + " " + o[t + 1];
          return F(r, i, n).width <= s - 4;
        }

        return !1;
      };

      r++;

      t: for (;;) {
        t = "";
        var h = F("3", i, --r).height,
            u = i.multiline ? a - r : (a - h) / 2,
            c = -2,
            f = u += 2,
            p = 0,
            d = 0,
            g = 0;

        if (r <= 0) {
          t = "(...) Tj\n", t += "% Width of Text: " + F(t, i, r = 12).width + ", FieldWidth:" + s + "\n";
          break;
        }

        g = F(o[0] + " ", i, r).width;
        var m = "",
            y = 0;

        for (var v in o) if (o.hasOwnProperty(v)) {
          m = " " == (m += o[v] + " ").substr(m.length - 1) ? m.substr(0, m.length - 1) : m;
          var w = parseInt(v);
          g = F(m + " ", i, r).width;
          var b = l(w, m, r),
              x = v >= o.length - 1;

          if (b && !x) {
            m += " ";
            continue;
          }

          if (b || x) {
            if (x) d = w;else if (i.multiline && a < (h + 2) * (y + 2) + 2) continue t;
          } else {
            if (!i.multiline) continue t;
            if (a < (h + 2) * (y + 2) + 2) continue t;
            d = w;
          }

          for (var N = "", L = p; L <= d; L++) N += o[L] + " ";

          switch (N = " " == N.substr(N.length - 1) ? N.substr(0, N.length - 1) : N, g = F(N, i, r).width, i.textAlign) {
            case "right":
              c = s - g - 2;
              break;

            case "center":
              c = (s - g) / 2;
              break;

            case "left":
            default:
              c = 2;
          }

          t += _(c) + " " + _(f) + " Td\n", t += "(" + S(N) + ") Tj\n", t += -_(c) + " 0 Td\n", f = -(r + 2), g = 0, p = d + 1, y++, m = "";
        }

        break;
      }

      return n.text = t, n.fontSize = r, n;
    },
        F = function (t, e, n) {
      var r = A.internal.getFont(e.fontName, e.fontStyle),
          i = A.getStringUnitWidth(t, {
        font: r,
        fontSize: parseFloat(n),
        charSpace: 0
      }) * parseFloat(n);
      return {
        height: A.getStringUnitWidth("3", {
          font: r,
          fontSize: parseFloat(n),
          charSpace: 0
        }) * parseFloat(n) * 1.5,
        width: i
      };
    },
        u = {
      fields: [],
      xForms: [],
      acroFormDictionaryRoot: null,
      printedOut: !1,
      internal: null,
      isInitialized: !1
    },
        p = function () {
      A.internal.acroformPlugin.acroFormDictionaryRoot.objId = void 0;
      var t = A.internal.acroformPlugin.acroFormDictionaryRoot.Fields;

      for (var e in t) if (t.hasOwnProperty(e)) {
        var n = t[e];
        n.objId = void 0, n.hasAnnotation && d.call(A, n);
      }
    },
        d = function (t) {
      var e = {
        type: "reference",
        object: t
      };
      void 0 === A.internal.getPageInfo(t.page).pageContext.annotations.find(function (t) {
        return t.type === e.type && t.object === e.object;
      }) && A.internal.getPageInfo(t.page).pageContext.annotations.push(e);
    },
        g = function () {
      if (void 0 === A.internal.acroformPlugin.acroFormDictionaryRoot) throw new Error("putCatalogCallback: Root missing.");
      A.internal.write("/AcroForm " + A.internal.acroformPlugin.acroFormDictionaryRoot.objId + " 0 R");
    },
        m = function () {
      A.internal.events.unsubscribe(A.internal.acroformPlugin.acroFormDictionaryRoot._eventID), delete A.internal.acroformPlugin.acroFormDictionaryRoot._eventID, A.internal.acroformPlugin.printedOut = !0;
    },
        L = function (t) {
      var e = !t;
      t || (A.internal.newObjectDeferredBegin(A.internal.acroformPlugin.acroFormDictionaryRoot.objId, !0), A.internal.acroformPlugin.acroFormDictionaryRoot.putStream());
      t = t || A.internal.acroformPlugin.acroFormDictionaryRoot.Kids;

      for (var n in t) if (t.hasOwnProperty(n)) {
        var r = t[n],
            i = [],
            o = r.Rect;

        if (r.Rect && (r.Rect = c.call(this, r.Rect)), A.internal.newObjectDeferredBegin(r.objId, !0), r.DA = Y.createDefaultAppearanceStream(r), "object" === se(r) && "function" == typeof r.getKeyValueListForStream && (i = r.getKeyValueListForStream()), r.Rect = o, r.hasAppearanceStream && !r.appearanceStreamContent) {
          var a = f.call(this, r);
          i.push({
            key: "AP",
            value: "<</N " + a + ">>"
          }), A.internal.acroformPlugin.xForms.push(a);
        }

        if (r.appearanceStreamContent) {
          var s = "";

          for (var l in r.appearanceStreamContent) if (r.appearanceStreamContent.hasOwnProperty(l)) {
            var h = r.appearanceStreamContent[l];
            if (s += "/" + l + " ", s += "<<", 1 <= Object.keys(h).length || Array.isArray(h)) for (var n in h) {
              var u;
              if (h.hasOwnProperty(n)) "function" == typeof (u = h[n]) && (u = u.call(this, r)), s += "/" + n + " " + u + " ", 0 <= A.internal.acroformPlugin.xForms.indexOf(u) || A.internal.acroformPlugin.xForms.push(u);
            } else "function" == typeof (u = h) && (u = u.call(this, r)), s += "/" + n + " " + u, 0 <= A.internal.acroformPlugin.xForms.indexOf(u) || A.internal.acroformPlugin.xForms.push(u);
            s += ">>";
          }

          i.push({
            key: "AP",
            value: "<<\n" + s + ">>"
          });
        }

        A.internal.putStream({
          additionalKeyValues: i
        }), A.internal.out("endobj");
      }

      e && P.call(this, A.internal.acroformPlugin.xForms);
    },
        P = function (t) {
      for (var e in t) if (t.hasOwnProperty(e)) {
        var n = e,
            r = t[e];
        A.internal.newObjectDeferredBegin(r && r.objId, !0), "object" === se(r) && "function" == typeof r.putStream && r.putStream(), delete t[n];
      }
    },
        k = function () {
      if (void 0 !== this.internal && (void 0 === this.internal.acroformPlugin || !1 === this.internal.acroformPlugin.isInitialized)) {
        if (A = this, M.FieldNum = 0, this.internal.acroformPlugin = JSON.parse(JSON.stringify(u)), this.internal.acroformPlugin.acroFormDictionaryRoot) throw new Error("Exception while creating AcroformDictionary");
        n = A.internal.scaleFactor, A.internal.acroformPlugin.acroFormDictionaryRoot = new E(), A.internal.acroformPlugin.acroFormDictionaryRoot._eventID = A.internal.events.subscribe("postPutResources", m), A.internal.events.subscribe("buildDocument", p), A.internal.events.subscribe("putCatalog", g), A.internal.events.subscribe("postPutPages", L), A.internal.acroformPlugin.isInitialized = !0;
      }
    },
        I = t.__acroform__.arrayToPdfArray = function (t) {
      if (Array.isArray(t)) {
        for (var e = "[", n = 0; n < t.length; n++) switch (0 !== n && (e += " "), se(t[n])) {
          case "boolean":
          case "number":
          case "object":
            e += t[n].toString();
            break;

          case "string":
            "/" !== t[n].substr(0, 1) ? e += "(" + S(t[n].toString()) + ")" : e += t[n].toString();
        }

        return e += "]";
      }

      throw new Error("Invalid argument passed to jsPDF.__acroform__.arrayToPdfArray");
    };

    var C = function (t) {
      return (t = t || "").toString(), t = "(" + S(t) + ")";
    },
        B = function () {
      var e;
      Object.defineProperty(this, "objId", {
        configurable: !0,
        get: function () {
          if (e || (e = A.internal.newObjectDeferred()), !e) throw new Error("AcroFormPDFObject: Couldn't create Object ID");
          return e;
        },
        set: function (t) {
          e = t;
        }
      });
    };

    B.prototype.toString = function () {
      return this.objId + " 0 R";
    }, B.prototype.putStream = function () {
      var t = this.getKeyValueListForStream();
      A.internal.putStream({
        data: this.stream,
        additionalKeyValues: t
      }), A.internal.out("endobj");
    }, B.prototype.getKeyValueListForStream = function () {
      return function (t) {
        var e = [],
            n = Object.getOwnPropertyNames(t).filter(function (t) {
          return "content" != t && "appearanceStreamContent" != t && "_" != t.substring(0, 1);
        });

        for (var r in n) if (!1 === Object.getOwnPropertyDescriptor(t, n[r]).configurable) {
          var i = n[r],
              o = t[i];
          o && (Array.isArray(o) ? e.push({
            key: i,
            value: I(o)
          }) : o instanceof B ? e.push({
            key: i,
            value: o.objId + " 0 R"
          }) : "function" != typeof o && e.push({
            key: i,
            value: o
          }));
        }

        return e;
      }(this);
    };

    var j = function () {
      B.call(this), Object.defineProperty(this, "Type", {
        value: "/XObject",
        configurable: !1,
        writeable: !0
      }), Object.defineProperty(this, "Subtype", {
        value: "/Form",
        configurable: !1,
        writeable: !0
      }), Object.defineProperty(this, "FormType", {
        value: 1,
        configurable: !1,
        writeable: !0
      });
      var e,
          n = [];
      Object.defineProperty(this, "BBox", {
        configurable: !1,
        writeable: !0,
        get: function () {
          return n;
        },
        set: function (t) {
          n = t;
        }
      }), Object.defineProperty(this, "Resources", {
        value: "2 0 R",
        configurable: !1,
        writeable: !0
      }), Object.defineProperty(this, "stream", {
        enumerable: !1,
        configurable: !0,
        set: function (t) {
          e = t.trim();
        },
        get: function () {
          return e || null;
        }
      });
    };

    r(j, B);

    var E = function () {
      B.call(this);
      var e,
          t = [];
      Object.defineProperty(this, "Kids", {
        enumerable: !1,
        configurable: !0,
        get: function () {
          return 0 < t.length ? t : void 0;
        }
      }), Object.defineProperty(this, "Fields", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return t;
        }
      }), Object.defineProperty(this, "DA", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          if (e) return "(" + e + ")";
        },
        set: function (t) {
          e = t;
        }
      });
    };

    r(E, B);

    var M = function t() {
      B.call(this);
      var e = 4;
      Object.defineProperty(this, "F", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          if (isNaN(t)) throw new Error('Invalid value "' + t + '" for attribute F supplied.');
          e = t;
        }
      }), Object.defineProperty(this, "showWhenPrinted", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(e, 3));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.F = x(e, 3) : this.F = N(e, 3);
        }
      });
      var n = 0;
      Object.defineProperty(this, "Ff", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return n;
        },
        set: function (t) {
          if (isNaN(t)) throw new Error('Invalid value "' + t + '" for attribute Ff supplied.');
          n = t;
        }
      });
      var r = [];
      Object.defineProperty(this, "Rect", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          if (0 !== r.length) return r;
        },
        set: function (t) {
          r = void 0 !== t ? t : [];
        }
      }), Object.defineProperty(this, "x", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return !r || isNaN(r[0]) ? 0 : w(r[0]);
        },
        set: function (t) {
          r[0] = v(t);
        }
      }), Object.defineProperty(this, "y", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return !r || isNaN(r[1]) ? 0 : w(r[1]);
        },
        set: function (t) {
          r[1] = v(t);
        }
      }), Object.defineProperty(this, "width", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return !r || isNaN(r[2]) ? 0 : w(r[2]);
        },
        set: function (t) {
          r[2] = v(t);
        }
      }), Object.defineProperty(this, "height", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return !r || isNaN(r[3]) ? 0 : w(r[3]);
        },
        set: function (t) {
          r[3] = v(t);
        }
      });
      var i = "";
      Object.defineProperty(this, "FT", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return i;
        },
        set: function (t) {
          switch (t) {
            case "/Btn":
            case "/Tx":
            case "/Ch":
            case "/Sig":
              i = t;
              break;

            default:
              throw new Error('Invalid value "' + t + '" for attribute FT supplied.');
          }
        }
      });
      var o = null;
      Object.defineProperty(this, "T", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          if (!o || o.length < 1) {
            if (this instanceof H) return;
            o = "FieldObject" + t.FieldNum++;
          }

          return "(" + S(o) + ")";
        },
        set: function (t) {
          o = t.toString();
        }
      }), Object.defineProperty(this, "fieldName", {
        configurable: !0,
        enumerable: !0,
        get: function () {
          return o;
        },
        set: function (t) {
          o = t;
        }
      });
      var a = "helvetica";
      Object.defineProperty(this, "fontName", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return a;
        },
        set: function (t) {
          a = t;
        }
      });
      var s = "normal";
      Object.defineProperty(this, "fontStyle", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return s;
        },
        set: function (t) {
          s = t;
        }
      });
      var l = 0;
      Object.defineProperty(this, "fontSize", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return w(l);
        },
        set: function (t) {
          l = v(t);
        }
      });
      var h = 50;
      Object.defineProperty(this, "maxFontSize", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return w(h);
        },
        set: function (t) {
          h = v(t);
        }
      });
      var u = "black";
      Object.defineProperty(this, "color", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return u;
        },
        set: function (t) {
          u = t;
        }
      });
      var c = "/F1 0 Tf 0 g";
      Object.defineProperty(this, "DA", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          if (!(!c || this instanceof H || this instanceof V)) return C(c);
        },
        set: function (t) {
          t = t.toString(), c = t;
        }
      });
      var f = null;
      Object.defineProperty(this, "DV", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          if (f) return this instanceof D == !1 ? C(f) : f;
        },
        set: function (t) {
          t = t.toString(), f = this instanceof D == !1 ? "(" === t.substr(0, 1) ? y(t.substr(1, t.length - 2)) : y(t) : t;
        }
      }), Object.defineProperty(this, "defaultValue", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return this instanceof D == !0 ? y(f.substr(1, f.length - 1)) : f;
        },
        set: function (t) {
          t = t.toString(), f = this instanceof D == !0 ? "/" + t : t;
        }
      });
      var p = null;
      Object.defineProperty(this, "V", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          if (p) return this instanceof D == !1 ? C(p) : p;
        },
        set: function (t) {
          t = t.toString(), p = this instanceof D == !1 ? "(" === t.substr(0, 1) ? y(t.substr(1, t.length - 2)) : y(t) : t;
        }
      }), Object.defineProperty(this, "value", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return this instanceof D == !0 ? y(p.substr(1, p.length - 1)) : p;
        },
        set: function (t) {
          t = t.toString(), p = this instanceof D == !0 ? "/" + t : t;
        }
      }), Object.defineProperty(this, "hasAnnotation", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return this.Rect;
        }
      }), Object.defineProperty(this, "Type", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return this.hasAnnotation ? "/Annot" : null;
        }
      }), Object.defineProperty(this, "Subtype", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return this.hasAnnotation ? "/Widget" : null;
        }
      });
      var d,
          g = !1;
      Object.defineProperty(this, "hasAppearanceStream", {
        enumerable: !0,
        configurable: !0,
        writeable: !0,
        get: function () {
          return g;
        },
        set: function (t) {
          t = Boolean(t), g = t;
        }
      }), Object.defineProperty(this, "page", {
        enumerable: !0,
        configurable: !0,
        writeable: !0,
        get: function () {
          if (d) return d;
        },
        set: function (t) {
          d = t;
        }
      }), Object.defineProperty(this, "readOnly", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 1));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 1) : this.Ff = N(this.Ff, 1);
        }
      }), Object.defineProperty(this, "required", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 2));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 2) : this.Ff = N(this.Ff, 2);
        }
      }), Object.defineProperty(this, "noExport", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 3));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 3) : this.Ff = N(this.Ff, 3);
        }
      });
      var m = null;
      Object.defineProperty(this, "Q", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          if (null !== m) return m;
        },
        set: function (t) {
          if (-1 === [0, 1, 2].indexOf(t)) throw new Error('Invalid value "' + t + '" for attribute Q supplied.');
          m = t;
        }
      }), Object.defineProperty(this, "textAlign", {
        get: function () {
          var t = "left";

          switch (m) {
            case 0:
            default:
              t = "left";
              break;

            case 1:
              t = "center";
              break;

            case 2:
              t = "right";
          }

          return t;
        },
        configurable: !0,
        enumerable: !0,
        set: function (t) {
          switch (t) {
            case "right":
            case 2:
              m = 2;
              break;

            case "center":
            case 1:
              m = 1;
              break;

            case "left":
            case 0:
            default:
              m = 0;
          }
        }
      });
    };

    r(M, B);

    var O = function () {
      M.call(this), this.FT = "/Ch", this.V = "()", this.fontName = "zapfdingbats";
      var e = 0;
      Object.defineProperty(this, "TI", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          e = t;
        }
      }), Object.defineProperty(this, "topIndex", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return e;
        },
        set: function (t) {
          e = t;
        }
      });
      var r = [];
      Object.defineProperty(this, "Opt", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return I(r);
        },
        set: function (t) {
          var e, n;
          n = [], "string" == typeof (e = t) && (n = function (t, e, n) {
            n || (n = 1);

            for (var r, i = []; r = e.exec(t);) i.push(r[n]);

            return i;
          }(e, /\((.*?)\)/g)), r = n;
        }
      }), this.getOptions = function () {
        return r;
      }, this.setOptions = function (t) {
        r = t, this.sort && r.sort();
      }, this.addOption = function (t) {
        t = (t = t || "").toString(), r.push(t), this.sort && r.sort();
      }, this.removeOption = function (t, e) {
        for (e = e || !1, t = (t = t || "").toString(); -1 !== r.indexOf(t) && (r.splice(r.indexOf(t), 1), !1 !== e););
      }, Object.defineProperty(this, "combo", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 18));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 18) : this.Ff = N(this.Ff, 18);
        }
      }), Object.defineProperty(this, "edit", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 19));
        },
        set: function (t) {
          !0 === this.combo && (!0 === Boolean(t) ? this.Ff = x(this.Ff, 19) : this.Ff = N(this.Ff, 19));
        }
      }), Object.defineProperty(this, "sort", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 20));
        },
        set: function (t) {
          !0 === Boolean(t) ? (this.Ff = x(this.Ff, 20), r.sort()) : this.Ff = N(this.Ff, 20);
        }
      }), Object.defineProperty(this, "multiSelect", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 22));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 22) : this.Ff = N(this.Ff, 22);
        }
      }), Object.defineProperty(this, "doNotSpellCheck", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 23));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 23) : this.Ff = N(this.Ff, 23);
        }
      }), Object.defineProperty(this, "commitOnSelChange", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 27));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 27) : this.Ff = N(this.Ff, 27);
        }
      }), this.hasAppearanceStream = !1;
    };

    r(O, M);

    var q = function () {
      O.call(this), this.fontName = "helvetica", this.combo = !1;
    };

    r(q, O);

    var T = function () {
      q.call(this), this.combo = !0;
    };

    r(T, q);

    var R = function () {
      T.call(this), this.edit = !0;
    };

    r(R, T);

    var D = function () {
      M.call(this), this.FT = "/Btn", Object.defineProperty(this, "noToggleToOff", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 15));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 15) : this.Ff = N(this.Ff, 15);
        }
      }), Object.defineProperty(this, "radio", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 16));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 16) : this.Ff = N(this.Ff, 16);
        }
      }), Object.defineProperty(this, "pushButton", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 17));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 17) : this.Ff = N(this.Ff, 17);
        }
      }), Object.defineProperty(this, "radioIsUnison", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 26));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 26) : this.Ff = N(this.Ff, 26);
        }
      });
      var e,
          n = {};
      Object.defineProperty(this, "MK", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          if (0 !== Object.keys(n).length) {
            var t,
                e = [];

            for (t in e.push("<<"), n) e.push("/" + t + " (" + n[t] + ")");

            return e.push(">>"), e.join("\n");
          }
        },
        set: function (t) {
          "object" === se(t) && (n = t);
        }
      }), Object.defineProperty(this, "caption", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return n.CA || "";
        },
        set: function (t) {
          "string" == typeof t && (n.CA = t);
        }
      }), Object.defineProperty(this, "AS", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          e = t;
        }
      }), Object.defineProperty(this, "appearanceState", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return e.substr(1, e.length - 1);
        },
        set: function (t) {
          e = "/" + t;
        }
      });
    };

    r(D, M);

    var U = function () {
      D.call(this), this.pushButton = !0;
    };

    r(U, D);

    var z = function () {
      D.call(this), this.radio = !0, this.pushButton = !1;
      var e = [];
      Object.defineProperty(this, "Kids", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          e = void 0 !== t ? t : [];
        }
      });
    };

    r(z, D);

    var H = function () {
      var e, n;
      M.call(this), Object.defineProperty(this, "Parent", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          e = t;
        }
      }), Object.defineProperty(this, "optionName", {
        enumerable: !1,
        configurable: !0,
        get: function () {
          return n;
        },
        set: function (t) {
          n = t;
        }
      });
      var r,
          i = {};
      Object.defineProperty(this, "MK", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          var t,
              e = [];

          for (t in e.push("<<"), i) e.push("/" + t + " (" + i[t] + ")");

          return e.push(">>"), e.join("\n");
        },
        set: function (t) {
          "object" === se(t) && (i = t);
        }
      }), Object.defineProperty(this, "caption", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return i.CA || "";
        },
        set: function (t) {
          "string" == typeof t && (i.CA = t);
        }
      }), Object.defineProperty(this, "AS", {
        enumerable: !1,
        configurable: !1,
        get: function () {
          return r;
        },
        set: function (t) {
          r = t;
        }
      }), Object.defineProperty(this, "appearanceState", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return r.substr(1, r.length - 1);
        },
        set: function (t) {
          r = "/" + t;
        }
      }), this.optionName = name, this.caption = "l", this.appearanceState = "Off", this._AppearanceType = Y.RadioButton.Circle, this.appearanceStreamContent = this._AppearanceType.createAppearanceStream(name);
    };

    r(H, M), z.prototype.setAppearance = function (t) {
      if (!("createAppearanceStream" in t && "getCA" in t)) throw new Error("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");

      for (var e in this.Kids) if (this.Kids.hasOwnProperty(e)) {
        var n = this.Kids[e];
        n.appearanceStreamContent = t.createAppearanceStream(n.optionName), n.caption = t.getCA();
      }
    }, z.prototype.createOption = function (t) {
      this.Kids.length;
      var e = new H();
      return e.Parent = this, e.optionName = t, this.Kids.push(e), J.call(this, e), e;
    };

    var W = function () {
      D.call(this), this.fontName = "zapfdingbats", this.caption = "3", this.appearanceState = "On", this.value = "On", this.textAlign = "center", this.appearanceStreamContent = Y.CheckBox.createAppearanceStream();
    };

    r(W, D);

    var V = function () {
      M.call(this), this.FT = "/Tx", Object.defineProperty(this, "multiline", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 13));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 13) : this.Ff = N(this.Ff, 13);
        }
      }), Object.defineProperty(this, "fileSelect", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 21));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 21) : this.Ff = N(this.Ff, 21);
        }
      }), Object.defineProperty(this, "doNotSpellCheck", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 23));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 23) : this.Ff = N(this.Ff, 23);
        }
      }), Object.defineProperty(this, "doNotScroll", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 24));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 24) : this.Ff = N(this.Ff, 24);
        }
      }), Object.defineProperty(this, "comb", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 25));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 25) : this.Ff = N(this.Ff, 25);
        }
      }), Object.defineProperty(this, "richText", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 26));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 26) : this.Ff = N(this.Ff, 26);
        }
      });
      var e = null;
      Object.defineProperty(this, "MaxLen", {
        enumerable: !0,
        configurable: !1,
        get: function () {
          return e;
        },
        set: function (t) {
          e = t;
        }
      }), Object.defineProperty(this, "maxLength", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return e;
        },
        set: function (t) {
          Number.isInteger(t) && (e = t);
        }
      }), Object.defineProperty(this, "hasAppearanceStream", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return this.V || this.DV;
        }
      });
    };

    r(V, M);

    var G = function () {
      V.call(this), Object.defineProperty(this, "password", {
        enumerable: !0,
        configurable: !0,
        get: function () {
          return Boolean(b(this.Ff, 14));
        },
        set: function (t) {
          !0 === Boolean(t) ? this.Ff = x(this.Ff, 14) : this.Ff = N(this.Ff, 14);
        }
      }), this.password = !0;
    };

    r(G, V);
    var Y = {
      CheckBox: {
        createAppearanceStream: function () {
          return {
            N: {
              On: Y.CheckBox.YesNormal
            },
            D: {
              On: Y.CheckBox.YesPushDown,
              Off: Y.CheckBox.OffPushDown
            }
          };
        },
        YesPushDown: function (t) {
          var e = l(t),
              n = [],
              r = A.internal.getFont(t.fontName, t.fontStyle).id,
              i = A.__private__.encodeColorString(t.color),
              o = h(t, t.caption);

          return n.push("0.749023 g"), n.push("0 0 " + _(Y.internal.getWidth(t)) + " " + _(Y.internal.getHeight(t)) + " re"), n.push("f"), n.push("BMC"), n.push("q"), n.push("0 0 1 rg"), n.push("/" + r + " " + _(o.fontSize) + " Tf " + i), n.push("BT"), n.push(o.text), n.push("ET"), n.push("Q"), n.push("EMC"), e.stream = n.join("\n"), e;
        },
        YesNormal: function (t) {
          var e = l(t),
              n = A.internal.getFont(t.fontName, t.fontStyle).id,
              r = A.__private__.encodeColorString(t.color),
              i = [],
              o = Y.internal.getHeight(t),
              a = Y.internal.getWidth(t),
              s = h(t, t.caption);

          return i.push("1 g"), i.push("0 0 " + _(a) + " " + _(o) + " re"), i.push("f"), i.push("q"), i.push("0 0 1 rg"), i.push("0 0 " + _(a - 1) + " " + _(o - 1) + " re"), i.push("W"), i.push("n"), i.push("0 g"), i.push("BT"), i.push("/" + n + " " + _(s.fontSize) + " Tf " + r), i.push(s.text), i.push("ET"), i.push("Q"), e.stream = i.join("\n"), e;
        },
        OffPushDown: function (t) {
          var e = l(t),
              n = [];
          return n.push("0.749023 g"), n.push("0 0 " + _(Y.internal.getWidth(t)) + " " + _(Y.internal.getHeight(t)) + " re"), n.push("f"), e.stream = n.join("\n"), e;
        }
      },
      RadioButton: {
        Circle: {
          createAppearanceStream: function (t) {
            var e = {
              D: {
                Off: Y.RadioButton.Circle.OffPushDown
              },
              N: {}
            };
            return e.N[t] = Y.RadioButton.Circle.YesNormal, e.D[t] = Y.RadioButton.Circle.YesPushDown, e;
          },
          getCA: function () {
            return "l";
          },
          YesNormal: function (t) {
            var e = l(t),
                n = [],
                r = Y.internal.getWidth(t) <= Y.internal.getHeight(t) ? Y.internal.getWidth(t) / 4 : Y.internal.getHeight(t) / 4;
            r = Number((.9 * r).toFixed(5));
            var i = Y.internal.Bezier_C,
                o = Number((r * i).toFixed(5));
            return n.push("q"), n.push("1 0 0 1 " + s(Y.internal.getWidth(t) / 2) + " " + s(Y.internal.getHeight(t) / 2) + " cm"), n.push(r + " 0 m"), n.push(r + " " + o + " " + o + " " + r + " 0 " + r + " c"), n.push("-" + o + " " + r + " -" + r + " " + o + " -" + r + " 0 c"), n.push("-" + r + " -" + o + " -" + o + " -" + r + " 0 -" + r + " c"), n.push(o + " -" + r + " " + r + " -" + o + " " + r + " 0 c"), n.push("f"), n.push("Q"), e.stream = n.join("\n"), e;
          },
          YesPushDown: function (t) {
            var e = l(t),
                n = [],
                r = Y.internal.getWidth(t) <= Y.internal.getHeight(t) ? Y.internal.getWidth(t) / 4 : Y.internal.getHeight(t) / 4,
                i = (r = Number((.9 * r).toFixed(5)), Number((2 * r).toFixed(5))),
                o = Number((i * Y.internal.Bezier_C).toFixed(5)),
                a = Number((r * Y.internal.Bezier_C).toFixed(5));
            return n.push("0.749023 g"), n.push("q"), n.push("1 0 0 1 " + s(Y.internal.getWidth(t) / 2) + " " + s(Y.internal.getHeight(t) / 2) + " cm"), n.push(i + " 0 m"), n.push(i + " " + o + " " + o + " " + i + " 0 " + i + " c"), n.push("-" + o + " " + i + " -" + i + " " + o + " -" + i + " 0 c"), n.push("-" + i + " -" + o + " -" + o + " -" + i + " 0 -" + i + " c"), n.push(o + " -" + i + " " + i + " -" + o + " " + i + " 0 c"), n.push("f"), n.push("Q"), n.push("0 g"), n.push("q"), n.push("1 0 0 1 " + s(Y.internal.getWidth(t) / 2) + " " + s(Y.internal.getHeight(t) / 2) + " cm"), n.push(r + " 0 m"), n.push(r + " " + a + " " + a + " " + r + " 0 " + r + " c"), n.push("-" + a + " " + r + " -" + r + " " + a + " -" + r + " 0 c"), n.push("-" + r + " -" + a + " -" + a + " -" + r + " 0 -" + r + " c"), n.push(a + " -" + r + " " + r + " -" + a + " " + r + " 0 c"), n.push("f"), n.push("Q"), e.stream = n.join("\n"), e;
          },
          OffPushDown: function (t) {
            var e = l(t),
                n = [],
                r = Y.internal.getWidth(t) <= Y.internal.getHeight(t) ? Y.internal.getWidth(t) / 4 : Y.internal.getHeight(t) / 4,
                i = (r = Number((.9 * r).toFixed(5)), Number((2 * r).toFixed(5))),
                o = Number((i * Y.internal.Bezier_C).toFixed(5));
            return n.push("0.749023 g"), n.push("q"), n.push("1 0 0 1 " + s(Y.internal.getWidth(t) / 2) + " " + s(Y.internal.getHeight(t) / 2) + " cm"), n.push(i + " 0 m"), n.push(i + " " + o + " " + o + " " + i + " 0 " + i + " c"), n.push("-" + o + " " + i + " -" + i + " " + o + " -" + i + " 0 c"), n.push("-" + i + " -" + o + " -" + o + " -" + i + " 0 -" + i + " c"), n.push(o + " -" + i + " " + i + " -" + o + " " + i + " 0 c"), n.push("f"), n.push("Q"), e.stream = n.join("\n"), e;
          }
        },
        Cross: {
          createAppearanceStream: function (t) {
            var e = {
              D: {
                Off: Y.RadioButton.Cross.OffPushDown
              },
              N: {}
            };
            return e.N[t] = Y.RadioButton.Cross.YesNormal, e.D[t] = Y.RadioButton.Cross.YesPushDown, e;
          },
          getCA: function () {
            return "8";
          },
          YesNormal: function (t) {
            var e = l(t),
                n = [],
                r = Y.internal.calculateCross(t);
            return n.push("q"), n.push("1 1 " + _(Y.internal.getWidth(t) - 2) + " " + _(Y.internal.getHeight(t) - 2) + " re"), n.push("W"), n.push("n"), n.push(_(r.x1.x) + " " + _(r.x1.y) + " m"), n.push(_(r.x2.x) + " " + _(r.x2.y) + " l"), n.push(_(r.x4.x) + " " + _(r.x4.y) + " m"), n.push(_(r.x3.x) + " " + _(r.x3.y) + " l"), n.push("s"), n.push("Q"), e.stream = n.join("\n"), e;
          },
          YesPushDown: function (t) {
            var e = l(t),
                n = Y.internal.calculateCross(t),
                r = [];
            return r.push("0.749023 g"), r.push("0 0 " + _(Y.internal.getWidth(t)) + " " + _(Y.internal.getHeight(t)) + " re"), r.push("f"), r.push("q"), r.push("1 1 " + _(Y.internal.getWidth(t) - 2) + " " + _(Y.internal.getHeight(t) - 2) + " re"), r.push("W"), r.push("n"), r.push(_(n.x1.x) + " " + _(n.x1.y) + " m"), r.push(_(n.x2.x) + " " + _(n.x2.y) + " l"), r.push(_(n.x4.x) + " " + _(n.x4.y) + " m"), r.push(_(n.x3.x) + " " + _(n.x3.y) + " l"), r.push("s"), r.push("Q"), e.stream = r.join("\n"), e;
          },
          OffPushDown: function (t) {
            var e = l(t),
                n = [];
            return n.push("0.749023 g"), n.push("0 0 " + _(Y.internal.getWidth(t)) + " " + _(Y.internal.getHeight(t)) + " re"), n.push("f"), e.stream = n.join("\n"), e;
          }
        }
      },
      createDefaultAppearanceStream: function (t) {
        var e = A.internal.getFont(t.fontName, t.fontStyle).id,
            n = A.__private__.encodeColorString(t.color);

        return "/" + e + " " + t.fontSize + " Tf " + n;
      }
    };
    Y.internal = {
      Bezier_C: .551915024494,
      calculateCross: function (t) {
        var e = Y.internal.getWidth(t),
            n = Y.internal.getHeight(t),
            r = Math.min(e, n);
        return {
          x1: {
            x: (e - r) / 2,
            y: (n - r) / 2 + r
          },
          x2: {
            x: (e - r) / 2 + r,
            y: (n - r) / 2
          },
          x3: {
            x: (e - r) / 2,
            y: (n - r) / 2
          },
          x4: {
            x: (e - r) / 2 + r,
            y: (n - r) / 2 + r
          }
        };
      }
    }, Y.internal.getWidth = function (t) {
      var e = 0;
      return "object" === se(t) && (e = v(t.Rect[2])), e;
    }, Y.internal.getHeight = function (t) {
      var e = 0;
      return "object" === se(t) && (e = v(t.Rect[3])), e;
    };

    var J = t.addField = function (t) {
      if (k.call(this), !(t instanceof M)) throw new Error("Invalid argument passed to jsPDF.addField.");
      return function (t) {
        A.internal.acroformPlugin.printedOut && (A.internal.acroformPlugin.printedOut = !1, A.internal.acroformPlugin.acroFormDictionaryRoot = null), A.internal.acroformPlugin.acroFormDictionaryRoot || k.call(A), A.internal.acroformPlugin.acroFormDictionaryRoot.Fields.push(t);
      }.call(this, t), t.page = A.internal.getCurrentPageInfo().pageNumber, this;
    };

    t.addButton = function (t) {
      if (t instanceof D == !1) throw new Error("Invalid argument passed to jsPDF.addButton.");
      return J.call(this, t);
    }, t.addTextField = function (t) {
      if (t instanceof V == !1) throw new Error("Invalid argument passed to jsPDF.addTextField.");
      return J.call(this, t);
    }, t.addChoiceField = function (t) {
      if (t instanceof O == !1) throw new Error("Invalid argument passed to jsPDF.addChoiceField.");
      return J.call(this, t);
    };
    "object" == se(e) && void 0 === e.ChoiceField && void 0 === e.ListBox && void 0 === e.ComboBox && void 0 === e.EditBox && void 0 === e.Button && void 0 === e.PushButton && void 0 === e.RadioButton && void 0 === e.CheckBox && void 0 === e.TextField && void 0 === e.PasswordField ? (e.ChoiceField = O, e.ListBox = q, e.ComboBox = T, e.EditBox = R, e.Button = D, e.PushButton = U, e.RadioButton = z, e.CheckBox = W, e.TextField = V, e.PasswordField = G, e.AcroForm = {
      Appearance: Y
    }) : console.warn("AcroForm-Classes are not populated into global-namespace, because the class-Names exist already."), t.AcroFormChoiceField = O, t.AcroFormListBox = q, t.AcroFormComboBox = T, t.AcroFormEditBox = R, t.AcroFormButton = D, t.AcroFormPushButton = U, t.AcroFormRadioButton = z, t.AcroFormCheckBox = W, t.AcroFormTextField = V, t.AcroFormPasswordField = G, t.AcroFormAppearance = Y, t.AcroForm = {
      ChoiceField: O,
      ListBox: q,
      ComboBox: T,
      EditBox: R,
      Button: D,
      PushButton: U,
      RadioButton: z,
      CheckBox: W,
      TextField: V,
      PasswordField: G,
      Appearance: Y
    };
  })((window.tmp = lt).API, "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal),
  /** @license
     * jsPDF addImage plugin
     * Copyright (c) 2012 Jason Siefken, https://github.com/siefkenj/
     *               2013 Chris Dowling, https://github.com/gingerchris
     *               2013 Trinh Ho, https://github.com/ineedfat
     *               2013 Edwin Alejandro Perez, https://github.com/eaparango
     *               2013 Norah Smith, https://github.com/burnburnrocket
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 James Robb, https://github.com/jamesbrobb
     *
     * 
     */
  function (x) {
    var N = "addImage_",
        l = {
      PNG: [[137, 80, 78, 71]],
      TIFF: [[77, 77, 0, 42], [73, 73, 42, 0]],
      JPEG: [[255, 216, 255, 224, void 0, void 0, 74, 70, 73, 70, 0], [255, 216, 255, 225, void 0, void 0, 69, 120, 105, 102, 0, 0]],
      JPEG2000: [[0, 0, 0, 12, 106, 80, 32, 32]],
      GIF87a: [[71, 73, 70, 56, 55, 97]],
      GIF89a: [[71, 73, 70, 56, 57, 97]],
      BMP: [[66, 77], [66, 65], [67, 73], [67, 80], [73, 67], [80, 84]]
    },
        h = x.getImageFileTypeByImageData = function (t, e) {
      var n, r;
      e = e || "UNKNOWN";
      var i,
          o,
          a,
          s = "UNKNOWN";

      for (a in x.isArrayBufferView(t) && (t = x.arrayBufferToBinaryString(t)), l) for (i = l[a], n = 0; n < i.length; n += 1) {
        for (o = !0, r = 0; r < i[n].length; r += 1) if (void 0 !== i[n][r] && i[n][r] !== t.charCodeAt(r)) {
          o = !1;
          break;
        }

        if (!0 === o) {
          s = a;
          break;
        }
      }

      return "UNKNOWN" === s && "UNKNOWN" !== e && (console.warn('FileType of Image not recognized. Processing image as "' + e + '".'), s = e), s;
    },
        n = function t(e) {
      for (var n = this.internal.newObject(), r = this.internal.write, i = this.internal.putStream, o = (0, this.internal.getFilters)(); -1 !== o.indexOf("FlateEncode");) o.splice(o.indexOf("FlateEncode"), 1);

      e.n = n;
      var a = [];

      if (a.push({
        key: "Type",
        value: "/XObject"
      }), a.push({
        key: "Subtype",
        value: "/Image"
      }), a.push({
        key: "Width",
        value: e.w
      }), a.push({
        key: "Height",
        value: e.h
      }), e.cs === this.color_spaces.INDEXED ? a.push({
        key: "ColorSpace",
        value: "[/Indexed /DeviceRGB " + (e.pal.length / 3 - 1) + " " + ("smask" in e ? n + 2 : n + 1) + " 0 R]"
      }) : (a.push({
        key: "ColorSpace",
        value: "/" + e.cs
      }), e.cs === this.color_spaces.DEVICE_CMYK && a.push({
        key: "Decode",
        value: "[1 0 1 0 1 0 1 0]"
      })), a.push({
        key: "BitsPerComponent",
        value: e.bpc
      }), "dp" in e && a.push({
        key: "DecodeParms",
        value: "<<" + e.dp + ">>"
      }), "trns" in e && e.trns.constructor == Array) {
        for (var s = "", l = 0, h = e.trns.length; l < h; l++) s += e.trns[l] + " " + e.trns[l] + " ";

        a.push({
          key: "Mask",
          value: "[" + s + "]"
        });
      }

      "smask" in e && a.push({
        key: "SMask",
        value: n + 1 + " 0 R"
      });
      var u = void 0 !== e.f ? ["/" + e.f] : void 0;

      if (i({
        data: e.data,
        additionalKeyValues: a,
        alreadyAppliedFilters: u
      }), r("endobj"), "smask" in e) {
        var c = "/Predictor " + e.p + " /Colors 1 /BitsPerComponent " + e.bpc + " /Columns " + e.w,
            f = {
          w: e.w,
          h: e.h,
          cs: "DeviceGray",
          bpc: e.bpc,
          dp: c,
          data: e.smask
        };
        "f" in e && (f.f = e.f), t.call(this, f);
      }

      e.cs === this.color_spaces.INDEXED && (this.internal.newObject(), i({
        data: this.arrayBufferToBinaryString(new Uint8Array(e.pal))
      }), r("endobj"));
    },
        L = function () {
      var t = this.internal.collections[N + "images"];

      for (var e in t) n.call(this, t[e]);
    },
        A = function () {
      var t,
          e = this.internal.collections[N + "images"],
          n = this.internal.write;

      for (var r in e) n("/I" + (t = e[r]).i, t.n, "0", "R");
    },
        S = function (t) {
      return "function" == typeof x["process" + t.toUpperCase()];
    },
        _ = function (t) {
      return "object" === se(t) && 1 === t.nodeType;
    },
        F = function (t, e) {
      if ("IMG" === t.nodeName && t.hasAttribute("src")) {
        var n = "" + t.getAttribute("src");
        if (0 === n.indexOf("data:image/")) return unescape(n);
        var r = x.loadFile(n);
        if (void 0 !== r) return btoa(r);
      }

      if ("CANVAS" === t.nodeName) {
        var i = t;
        return t.toDataURL("image/jpeg", 1);
      }

      (i = document.createElement("canvas")).width = t.clientWidth || t.width, i.height = t.clientHeight || t.height;
      var o = i.getContext("2d");
      if (!o) throw "addImage requires canvas to be supported by browser.";
      return o.drawImage(t, 0, 0, i.width, i.height), i.toDataURL("png" == ("" + e).toLowerCase() ? "image/png" : "image/jpeg");
    },
        P = function (t, e) {
      var n;
      if (e) for (var r in e) if (t === e[r].alias) {
        n = e[r];
        break;
      }
      return n;
    };

    x.color_spaces = {
      DEVICE_RGB: "DeviceRGB",
      DEVICE_GRAY: "DeviceGray",
      DEVICE_CMYK: "DeviceCMYK",
      CAL_GREY: "CalGray",
      CAL_RGB: "CalRGB",
      LAB: "Lab",
      ICC_BASED: "ICCBased",
      INDEXED: "Indexed",
      PATTERN: "Pattern",
      SEPARATION: "Separation",
      DEVICE_N: "DeviceN"
    }, x.decode = {
      DCT_DECODE: "DCTDecode",
      FLATE_DECODE: "FlateDecode",
      LZW_DECODE: "LZWDecode",
      JPX_DECODE: "JPXDecode",
      JBIG2_DECODE: "JBIG2Decode",
      ASCII85_DECODE: "ASCII85Decode",
      ASCII_HEX_DECODE: "ASCIIHexDecode",
      RUN_LENGTH_DECODE: "RunLengthDecode",
      CCITT_FAX_DECODE: "CCITTFaxDecode"
    }, x.image_compression = {
      NONE: "NONE",
      FAST: "FAST",
      MEDIUM: "MEDIUM",
      SLOW: "SLOW"
    }, x.sHashCode = function (t) {
      var e,
          n = 0;
      if (0 === (t = t || "").length) return n;

      for (e = 0; e < t.length; e++) n = (n << 5) - n + t.charCodeAt(e), n |= 0;

      return n;
    }, x.isString = function (t) {
      return "string" == typeof t;
    }, x.validateStringAsBase64 = function (t) {
      (t = t || "").toString().trim();
      var e = !0;
      return 0 === t.length && (e = !1), t.length % 4 != 0 && (e = !1), !1 === /^[A-Za-z0-9+\/]+$/.test(t.substr(0, t.length - 2)) && (e = !1), !1 === /^[A-Za-z0-9\/][A-Za-z0-9+\/]|[A-Za-z0-9+\/]=|==$/.test(t.substr(-2)) && (e = !1), e;
    }, x.extractInfoFromBase64DataURI = function (t) {
      return /^data:([\w]+?\/([\w]+?));\S*;*base64,(.+)$/g.exec(t);
    }, x.extractImageFromDataUrl = function (t) {
      var e = (t = t || "").split("base64,"),
          n = null;

      if (2 === e.length) {
        var r = /^data:(\w*\/\w*);*(charset=[\w=-]*)*;*$/.exec(e[0]);
        Array.isArray(r) && (n = {
          mimeType: r[1],
          charset: r[2],
          data: e[1]
        });
      }

      return n;
    }, x.supportsArrayBuffer = function () {
      return "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array;
    }, x.isArrayBuffer = function (t) {
      return !!this.supportsArrayBuffer() && t instanceof ArrayBuffer;
    }, x.isArrayBufferView = function (t) {
      return !!this.supportsArrayBuffer() && "undefined" != typeof Uint32Array && (t instanceof Int8Array || t instanceof Uint8Array || "undefined" != typeof Uint8ClampedArray && t instanceof Uint8ClampedArray || t instanceof Int16Array || t instanceof Uint16Array || t instanceof Int32Array || t instanceof Uint32Array || t instanceof Float32Array || t instanceof Float64Array);
    }, x.binaryStringToUint8Array = function (t) {
      for (var e = t.length, n = new Uint8Array(e), r = 0; r < e; r++) n[r] = t.charCodeAt(r);

      return n;
    }, x.arrayBufferToBinaryString = function (t) {
      if ("function" == typeof atob) return atob(this.arrayBufferToBase64(t));
    }, x.arrayBufferToBase64 = function (t) {
      for (var e, n = "", r = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = new Uint8Array(t), o = i.byteLength, a = o % 3, s = o - a, l = 0; l < s; l += 3) n += r[(16515072 & (e = i[l] << 16 | i[l + 1] << 8 | i[l + 2])) >> 18] + r[(258048 & e) >> 12] + r[(4032 & e) >> 6] + r[63 & e];

      return 1 == a ? n += r[(252 & (e = i[s])) >> 2] + r[(3 & e) << 4] + "==" : 2 == a && (n += r[(64512 & (e = i[s] << 8 | i[s + 1])) >> 10] + r[(1008 & e) >> 4] + r[(15 & e) << 2] + "="), n;
    }, x.createImageInfo = function (t, e, n, r, i, o, a, s, l, h, u, c, f) {
      var p = {
        alias: s,
        w: e,
        h: n,
        cs: r,
        bpc: i,
        i: a,
        data: t
      };
      return o && (p.f = o), l && (p.dp = l), h && (p.trns = h), u && (p.pal = u), c && (p.smask = c), f && (p.p = f), p;
    }, x.addImage = function (t, e, n, r, i, o, a, s, l) {
      var h = "";

      if ("string" != typeof e) {
        var u = o;
        o = i, i = r, r = n, n = e, e = u;
      }

      if ("object" === se(t) && !_(t) && "imageData" in t) {
        var c = t;
        t = c.imageData, e = c.format || e || "UNKNOWN", n = c.x || n || 0, r = c.y || r || 0, i = c.w || i, o = c.h || o, a = c.alias || a, s = c.compression || s, l = c.rotation || c.angle || l;
      }

      var f = this.internal.getFilters();
      if (void 0 === s && -1 !== f.indexOf("FlateEncode") && (s = "SLOW"), "string" == typeof t && (t = unescape(t)), isNaN(n) || isNaN(r)) throw console.error("jsPDF.addImage: Invalid coordinates", arguments), new Error("Invalid coordinates passed to jsPDF.addImage");

      var p,
          d,
          g,
          m,
          y,
          v,
          w,
          b = function () {
        var t = this.internal.collections[N + "images"];
        return t || (this.internal.collections[N + "images"] = t = {}, this.internal.events.subscribe("putResources", L), this.internal.events.subscribe("putXobjectDict", A)), t;
      }.call(this);

      if (!((p = P(t, b)) || (_(t) && (t = F(t, e)), (null == (w = a) || 0 === w.length) && (a = "string" == typeof (v = t) ? x.sHashCode(v) : x.isArrayBufferView(v) ? x.sHashCode(x.arrayBufferToBinaryString(v)) : null), p = P(a, b)))) {
        if (this.isString(t) && ("" !== (h = this.convertStringToImageData(t)) ? t = h : void 0 !== (h = x.loadFile(t)) && (t = h)), e = this.getImageFileTypeByImageData(t, e), !S(e)) throw new Error("addImage does not support files of type '" + e + "', please ensure that a plugin for '" + e + "' support is added.");
        if (this.supportsArrayBuffer() && (t instanceof Uint8Array || (d = t, t = this.binaryStringToUint8Array(t))), !(p = this["process" + e.toUpperCase()](t, (y = 0, (m = b) && (y = Object.keys ? Object.keys(m).length : function (t) {
          var e = 0;

          for (var n in t) t.hasOwnProperty(n) && e++;

          return e;
        }(m)), y), a, ((g = s) && "string" == typeof g && (g = g.toUpperCase()), g in x.image_compression ? g : x.image_compression.NONE), d))) throw new Error("An unknown error occurred whilst processing the image");
      }

      return function (t, e, n, r, i, o, a, s) {
        var l = function (t, e, n) {
          return t || e || (e = t = -96), t < 0 && (t = -1 * n.w * 72 / t / this.internal.scaleFactor), e < 0 && (e = -1 * n.h * 72 / e / this.internal.scaleFactor), 0 === t && (t = e * n.w / n.h), 0 === e && (e = t * n.h / n.w), [t, e];
        }.call(this, n, r, i),
            h = this.internal.getCoordinateString,
            u = this.internal.getVerticalCoordinateString;

        if (n = l[0], r = l[1], a[o] = i, s) {
          s *= Math.PI / 180;

          var c = Math.cos(s),
              f = Math.sin(s),
              p = function (t) {
            return t.toFixed(4);
          },
              d = [p(c), p(f), p(-1 * f), p(c), 0, 0, "cm"];
        }

        this.internal.write("q"), s ? (this.internal.write([1, "0", "0", 1, h(t), u(e + r), "cm"].join(" ")), this.internal.write(d.join(" ")), this.internal.write([h(n), "0", "0", h(r), "0", "0", "cm"].join(" "))) : this.internal.write([h(n), "0", "0", h(r), h(t), u(e + r), "cm"].join(" ")), this.internal.write("/I" + i.i + " Do"), this.internal.write("Q");
      }.call(this, n, r, i, o, p, p.i, b, l), this;
    }, x.convertStringToImageData = function (t) {
      var e,
          n = "";

      if (this.isString(t)) {
        var r;
        e = null !== (r = this.extractImageFromDataUrl(t)) ? r.data : t;

        try {
          n = atob(e);
        } catch (t) {
          throw x.validateStringAsBase64(e) ? new Error("atob-Error in jsPDF.convertStringToImageData " + t.message) : new Error("Supplied Data is not a valid base64-String jsPDF.convertStringToImageData ");
        }
      }

      return n;
    };

    var u = function (t, e) {
      return t.subarray(e, e + 5);
    };

    x.processJPEG = function (t, e, n, r, i, o) {
      var a,
          s = this.decode.DCT_DECODE;
      if (!this.isString(t) && !this.isArrayBuffer(t) && !this.isArrayBufferView(t)) return null;
      if (this.isString(t) && (a = function (t) {
        var e;
        if ("JPEG" !== h(t)) throw new Error("getJpegSize requires a binary string jpeg file");

        for (var n = 256 * t.charCodeAt(4) + t.charCodeAt(5), r = 4, i = t.length; r < i;) {
          if (r += n, 255 !== t.charCodeAt(r)) throw new Error("getJpegSize could not find the size of the image");
          if (192 === t.charCodeAt(r + 1) || 193 === t.charCodeAt(r + 1) || 194 === t.charCodeAt(r + 1) || 195 === t.charCodeAt(r + 1) || 196 === t.charCodeAt(r + 1) || 197 === t.charCodeAt(r + 1) || 198 === t.charCodeAt(r + 1) || 199 === t.charCodeAt(r + 1)) return e = 256 * t.charCodeAt(r + 5) + t.charCodeAt(r + 6), [256 * t.charCodeAt(r + 7) + t.charCodeAt(r + 8), e, t.charCodeAt(r + 9)];
          r += 2, n = 256 * t.charCodeAt(r) + t.charCodeAt(r + 1);
        }
      }(t)), this.isArrayBuffer(t) && (t = new Uint8Array(t)), this.isArrayBufferView(t) && (a = function (t) {
        if (65496 != (t[0] << 8 | t[1])) throw new Error("Supplied data is not a JPEG");

        for (var e, n = t.length, r = (t[4] << 8) + t[5], i = 4; i < n;) {
          if (r = ((e = u(t, i += r))[2] << 8) + e[3], (192 === e[1] || 194 === e[1]) && 255 === e[0] && 7 < r) return {
            width: ((e = u(t, i + 5))[2] << 8) + e[3],
            height: (e[0] << 8) + e[1],
            numcomponents: e[4]
          };
          i += 2;
        }

        throw new Error("getJpegSizeFromBytes could not find the size of the image");
      }(t), t = i || this.arrayBufferToBinaryString(t)), void 0 === o) switch (a.numcomponents) {
        case 1:
          o = this.color_spaces.DEVICE_GRAY;
          break;

        case 4:
          o = this.color_spaces.DEVICE_CMYK;
          break;

        default:
        case 3:
          o = this.color_spaces.DEVICE_RGB;
      }
      return this.createImageInfo(t, a.width, a.height, o, 8, s, e, n);
    }, x.processJPG = function () {
      return this.processJPEG.apply(this, arguments);
    }, x.getImageProperties = function (t) {
      var e,
          n,
          r = "";
      if (_(t) && (t = F(t)), this.isString(t) && ("" !== (r = this.convertStringToImageData(t)) ? t = r : void 0 !== (r = x.loadFile(t)) && (t = r)), n = this.getImageFileTypeByImageData(t), !S(n)) throw new Error("addImage does not support files of type '" + n + "', please ensure that a plugin for '" + n + "' support is added.");
      if (this.supportsArrayBuffer() && (t instanceof Uint8Array || (t = this.binaryStringToUint8Array(t))), !(e = this["process" + n.toUpperCase()](t))) throw new Error("An unknown error occurred whilst processing the image");
      return {
        fileType: n,
        width: e.w,
        height: e.h,
        colorSpace: e.cs,
        compressionMode: e.f,
        bitsPerComponent: e.bpc
      };
    };
  }(lt.API),
  /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  t = lt.API, lt.API.events.push(["addPage", function (t) {
    this.internal.getPageInfo(t.pageNumber).pageContext.annotations = [];
  }]), t.events.push(["putPage", function (t) {
    for (var e = this.internal.getPageInfoByObjId(t.objId), n = t.pageContext.annotations, r = function (t) {
      if (void 0 !== t && "" != t) return !0;
    }, i = !1, o = 0; o < n.length && !i; o++) switch ((l = n[o]).type) {
      case "link":
        if (r(l.options.url) || r(l.options.pageNumber)) {
          i = !0;
          break;
        }

      case "reference":
      case "text":
      case "freetext":
        i = !0;
    }

    if (0 != i) {
      this.internal.write("/Annots ["), this.internal.pageSize.height;
      var a = this.internal.getCoordinateString,
          s = this.internal.getVerticalCoordinateString;

      for (o = 0; o < n.length; o++) {
        var l;

        switch ((l = n[o]).type) {
          case "reference":
            this.internal.write(" " + l.object.objId + " 0 R ");
            break;

          case "text":
            var h = this.internal.newAdditionalObject(),
                u = this.internal.newAdditionalObject(),
                c = l.title || "Note";
            m = "<</Type /Annot /Subtype /Text " + (p = "/Rect [" + a(l.bounds.x) + " " + s(l.bounds.y + l.bounds.h) + " " + a(l.bounds.x + l.bounds.w) + " " + s(l.bounds.y) + "] ") + "/Contents (" + l.contents + ")", m += " /Popup " + u.objId + " 0 R", m += " /P " + e.objId + " 0 R", m += " /T (" + c + ") >>", h.content = m;
            var f = h.objId + " 0 R";
            m = "<</Type /Annot /Subtype /Popup " + (p = "/Rect [" + a(l.bounds.x + 30) + " " + s(l.bounds.y + l.bounds.h) + " " + a(l.bounds.x + l.bounds.w + 30) + " " + s(l.bounds.y) + "] ") + " /Parent " + f, l.open && (m += " /Open true"), m += " >>", u.content = m, this.internal.write(h.objId, "0 R", u.objId, "0 R");
            break;

          case "freetext":
            var p = "/Rect [" + a(l.bounds.x) + " " + s(l.bounds.y) + " " + a(l.bounds.x + l.bounds.w) + " " + s(l.bounds.y + l.bounds.h) + "] ",
                d = l.color || "#000000";
            m = "<</Type /Annot /Subtype /FreeText " + p + "/Contents (" + l.contents + ")", m += " /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#" + d + ")", m += " /Border [0 0 0]", m += " >>", this.internal.write(m);
            break;

          case "link":
            if (l.options.name) {
              var g = this.annotations._nameMap[l.options.name];
              l.options.pageNumber = g.page, l.options.top = g.y;
            } else l.options.top || (l.options.top = 0);

            p = "/Rect [" + a(l.x) + " " + s(l.y) + " " + a(l.x + l.w) + " " + s(l.y + l.h) + "] ";
            var m = "";
            if (l.options.url) m = "<</Type /Annot /Subtype /Link " + p + "/Border [0 0 0] /A <</S /URI /URI (" + l.options.url + ") >>";else if (l.options.pageNumber) switch (m = "<</Type /Annot /Subtype /Link " + p + "/Border [0 0 0] /Dest [" + this.internal.getPageInfo(l.options.pageNumber).objId + " 0 R", l.options.magFactor = l.options.magFactor || "XYZ", l.options.magFactor) {
              case "Fit":
                m += " /Fit]";
                break;

              case "FitH":
                m += " /FitH " + l.options.top + "]";
                break;

              case "FitV":
                l.options.left = l.options.left || 0, m += " /FitV " + l.options.left + "]";
                break;

              case "XYZ":
              default:
                var y = s(l.options.top);
                l.options.left = l.options.left || 0, void 0 === l.options.zoom && (l.options.zoom = 0), m += " /XYZ " + l.options.left + " " + y + " " + l.options.zoom + "]";
            }
            "" != m && (m += " >>", this.internal.write(m));
        }
      }

      this.internal.write("]");
    }
  }]), t.createAnnotation = function (t) {
    var e = this.internal.getCurrentPageInfo();

    switch (t.type) {
      case "link":
        this.link(t.bounds.x, t.bounds.y, t.bounds.w, t.bounds.h, t);
        break;

      case "text":
      case "freetext":
        e.pageContext.annotations.push(t);
    }
  }, t.link = function (t, e, n, r, i) {
    this.internal.getCurrentPageInfo().pageContext.annotations.push({
      x: t,
      y: e,
      w: n,
      h: r,
      options: i,
      type: "link"
    });
  }, t.textWithLink = function (t, e, n, r) {
    var i = this.getTextWidth(t),
        o = this.internal.getLineHeight() / this.internal.scaleFactor;
    return this.text(t, e, n), n += .2 * o, this.link(e, n - o, i, o, r), i;
  }, t.getTextWidth = function (t) {
    var e = this.internal.getFontSize();
    return this.getStringUnitWidth(t) * e / this.internal.scaleFactor;
  },
  /**
     * @license
     * Copyright (c) 2017 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  function (t) {
    var h = {
      1569: [65152],
      1570: [65153, 65154],
      1571: [65155, 65156],
      1572: [65157, 65158],
      1573: [65159, 65160],
      1574: [65161, 65162, 65163, 65164],
      1575: [65165, 65166],
      1576: [65167, 65168, 65169, 65170],
      1577: [65171, 65172],
      1578: [65173, 65174, 65175, 65176],
      1579: [65177, 65178, 65179, 65180],
      1580: [65181, 65182, 65183, 65184],
      1581: [65185, 65186, 65187, 65188],
      1582: [65189, 65190, 65191, 65192],
      1583: [65193, 65194],
      1584: [65195, 65196],
      1585: [65197, 65198],
      1586: [65199, 65200],
      1587: [65201, 65202, 65203, 65204],
      1588: [65205, 65206, 65207, 65208],
      1589: [65209, 65210, 65211, 65212],
      1590: [65213, 65214, 65215, 65216],
      1591: [65217, 65218, 65219, 65220],
      1592: [65221, 65222, 65223, 65224],
      1593: [65225, 65226, 65227, 65228],
      1594: [65229, 65230, 65231, 65232],
      1601: [65233, 65234, 65235, 65236],
      1602: [65237, 65238, 65239, 65240],
      1603: [65241, 65242, 65243, 65244],
      1604: [65245, 65246, 65247, 65248],
      1605: [65249, 65250, 65251, 65252],
      1606: [65253, 65254, 65255, 65256],
      1607: [65257, 65258, 65259, 65260],
      1608: [65261, 65262],
      1609: [65263, 65264, 64488, 64489],
      1610: [65265, 65266, 65267, 65268],
      1649: [64336, 64337],
      1655: [64477],
      1657: [64358, 64359, 64360, 64361],
      1658: [64350, 64351, 64352, 64353],
      1659: [64338, 64339, 64340, 64341],
      1662: [64342, 64343, 64344, 64345],
      1663: [64354, 64355, 64356, 64357],
      1664: [64346, 64347, 64348, 64349],
      1667: [64374, 64375, 64376, 64377],
      1668: [64370, 64371, 64372, 64373],
      1670: [64378, 64379, 64380, 64381],
      1671: [64382, 64383, 64384, 64385],
      1672: [64392, 64393],
      1676: [64388, 64389],
      1677: [64386, 64387],
      1678: [64390, 64391],
      1681: [64396, 64397],
      1688: [64394, 64395],
      1700: [64362, 64363, 64364, 64365],
      1702: [64366, 64367, 64368, 64369],
      1705: [64398, 64399, 64400, 64401],
      1709: [64467, 64468, 64469, 64470],
      1711: [64402, 64403, 64404, 64405],
      1713: [64410, 64411, 64412, 64413],
      1715: [64406, 64407, 64408, 64409],
      1722: [64414, 64415],
      1723: [64416, 64417, 64418, 64419],
      1726: [64426, 64427, 64428, 64429],
      1728: [64420, 64421],
      1729: [64422, 64423, 64424, 64425],
      1733: [64480, 64481],
      1734: [64473, 64474],
      1735: [64471, 64472],
      1736: [64475, 64476],
      1737: [64482, 64483],
      1739: [64478, 64479],
      1740: [64508, 64509, 64510, 64511],
      1744: [64484, 64485, 64486, 64487],
      1746: [64430, 64431],
      1747: [64432, 64433]
    },
        a = {
      65247: {
        65154: 65269,
        65156: 65271,
        65160: 65273,
        65166: 65275
      },
      65248: {
        65154: 65270,
        65156: 65272,
        65160: 65274,
        65166: 65276
      },
      65165: {
        65247: {
          65248: {
            65258: 65010
          }
        }
      },
      1617: {
        1612: 64606,
        1613: 64607,
        1614: 64608,
        1615: 64609,
        1616: 64610
      }
    },
        e = {
      1612: 64606,
      1613: 64607,
      1614: 64608,
      1615: 64609,
      1616: 64610
    },
        n = [1570, 1571, 1573, 1575];
    t.__arabicParser__ = {};

    var r = t.__arabicParser__.isInArabicSubstitutionA = function (t) {
      return void 0 !== h[t.charCodeAt(0)];
    },
        u = t.__arabicParser__.isArabicLetter = function (t) {
      return "string" == typeof t && /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/.test(t);
    },
        i = t.__arabicParser__.isArabicEndLetter = function (t) {
      return u(t) && r(t) && h[t.charCodeAt(0)].length <= 2;
    },
        o = t.__arabicParser__.isArabicAlfLetter = function (t) {
      return u(t) && 0 <= n.indexOf(t.charCodeAt(0));
    },
        s = (t.__arabicParser__.arabicLetterHasIsolatedForm = function (t) {
      return u(t) && r(t) && 1 <= h[t.charCodeAt(0)].length;
    }, t.__arabicParser__.arabicLetterHasFinalForm = function (t) {
      return u(t) && r(t) && 2 <= h[t.charCodeAt(0)].length;
    }),
        l = (t.__arabicParser__.arabicLetterHasInitialForm = function (t) {
      return u(t) && r(t) && 3 <= h[t.charCodeAt(0)].length;
    }, t.__arabicParser__.arabicLetterHasMedialForm = function (t) {
      return u(t) && r(t) && 4 == h[t.charCodeAt(0)].length;
    }),
        c = t.__arabicParser__.resolveLigatures = function (t) {
      var e = 0,
          n = a,
          r = 0,
          i = "",
          o = 0;

      for (e = 0; e < t.length; e += 1) void 0 !== n[t.charCodeAt(e)] ? (o++, "number" == typeof (n = n[t.charCodeAt(e)]) && (r = -1 !== (r = f(t.charAt(e), t.charAt(e - o), t.charAt(e + 1))) ? r : 0, i += String.fromCharCode(n), n = a, o = 0), e === t.length - 1 && (n = a, i += t.charAt(e - (o - 1)), e -= o - 1, o = 0)) : (n = a, i += t.charAt(e - o), e -= o, o = 0);

      return i;
    },
        f = (t.__arabicParser__.isArabicDiacritic = function (t) {
      return void 0 !== t && void 0 !== e[t.charCodeAt(0)];
    }, t.__arabicParser__.getCorrectForm = function (t, e, n) {
      return u(t) ? !1 === r(t) ? -1 : !s(t) || !u(e) && !u(n) || !u(n) && i(e) || i(t) && !u(e) || i(t) && o(e) || i(t) && i(e) ? 0 : l(t) && u(e) && !i(e) && u(n) && s(n) ? 3 : i(t) || !u(n) ? 1 : 2 : -1;
    }),
        p = t.__arabicParser__.processArabic = t.processArabic = function (t) {
      var e = 0,
          n = 0,
          r = 0,
          i = "",
          o = "",
          a = "",
          s = (t = t || "").split("\\s+"),
          l = [];

      for (e = 0; e < s.length; e += 1) {
        for (l.push(""), n = 0; n < s[e].length; n += 1) i = s[e][n], o = s[e][n - 1], a = s[e][n + 1], u(i) ? (r = f(i, o, a), l[e] += -1 !== r ? String.fromCharCode(h[i.charCodeAt(0)][r]) : i) : l[e] += i;

        l[e] = c(l[e]);
      }

      return l.join(" ");
    };

    t.events.push(["preProcessText", function (t) {
      var e = t.text,
          n = (t.x, t.y, t.options || {}),
          r = (t.mutex, n.lang, []);

      if ("[object Array]" === Object.prototype.toString.call(e)) {
        var i = 0;

        for (r = [], i = 0; i < e.length; i += 1) "[object Array]" === Object.prototype.toString.call(e[i]) ? r.push([p(e[i][0]), e[i][1], e[i][2]]) : r.push([p(e[i])]);

        t.text = r;
      } else t.text = p(e);
    }]);
  }(lt.API), lt.API.autoPrint = function (t) {
    var e;

    switch ((t = t || {}).variant = t.variant || "non-conform", t.variant) {
      case "javascript":
        this.addJS("print({});");
        break;

      case "non-conform":
      default:
        this.internal.events.subscribe("postPutResources", function () {
          e = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/S /Named"), this.internal.out("/Type /Action"), this.internal.out("/N /Print"), this.internal.out(">>"), this.internal.out("endobj");
        }), this.internal.events.subscribe("putCatalog", function () {
          this.internal.out("/OpenAction " + e + " 0 R");
        });
    }

    return this;
  },
  /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  e = lt.API, (n = function () {
    var e = void 0;
    Object.defineProperty(this, "pdf", {
      get: function () {
        return e;
      },
      set: function (t) {
        e = t;
      }
    });
    var n = 150;
    Object.defineProperty(this, "width", {
      get: function () {
        return n;
      },
      set: function (t) {
        n = isNaN(t) || !1 === Number.isInteger(t) || t < 0 ? 150 : t, this.getContext("2d").pageWrapXEnabled && (this.getContext("2d").pageWrapX = n + 1);
      }
    });
    var r = 300;
    Object.defineProperty(this, "height", {
      get: function () {
        return r;
      },
      set: function (t) {
        r = isNaN(t) || !1 === Number.isInteger(t) || t < 0 ? 300 : t, this.getContext("2d").pageWrapYEnabled && (this.getContext("2d").pageWrapY = r + 1);
      }
    });
    var i = [];
    Object.defineProperty(this, "childNodes", {
      get: function () {
        return i;
      },
      set: function (t) {
        i = t;
      }
    });
    var o = {};
    Object.defineProperty(this, "style", {
      get: function () {
        return o;
      },
      set: function (t) {
        o = t;
      }
    }), Object.defineProperty(this, "parentNode", {
      get: function () {
        return !1;
      }
    });
  }).prototype.getContext = function (t, e) {
    var n;
    if ("2d" !== (t = t || "2d")) return null;

    for (n in e) this.pdf.context2d.hasOwnProperty(n) && (this.pdf.context2d[n] = e[n]);

    return (this.pdf.context2d._canvas = this).pdf.context2d;
  }, n.prototype.toDataURL = function () {
    throw new Error("toDataURL is not implemented.");
  }, e.events.push(["initialized", function () {
    this.canvas = new n(), this.canvas.pdf = this;
  }]),
  /** 
     * @license
     * ====================================================================
     * Copyright (c) 2013 Youssef Beddad, youssef.beddad@gmail.com
     *               2013 Eduardo Menezes de Morais, eduardo.morais@usp.br
     *               2013 Lee Driscoll, https://github.com/lsdriscoll
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 James Hall, james@parall.ax
     *               2014 Diego Casorran, https://github.com/diegocr
     *
     * 
     * ====================================================================
     */
  _ = lt.API, F = {
    x: void 0,
    y: void 0,
    w: void 0,
    h: void 0,
    ln: void 0
  }, P = 1, p = function (t, e, n, r, i) {
    F = {
      x: t,
      y: e,
      w: n,
      h: r,
      ln: i
    };
  }, d = function () {
    return F;
  }, k = {
    left: 0,
    top: 0,
    bottom: 0
  }, _.setHeaderFunction = function (t) {
    l = t;
  }, _.getTextDimensions = function (t, e) {
    var n = this.table_font_size || this.internal.getFontSize(),
        r = (this.internal.getFont().fontStyle, (e = e || {}).scaleFactor || this.internal.scaleFactor),
        i = 0,
        o = 0,
        a = 0;
    if ("string" == typeof t) 0 != (i = this.getStringUnitWidth(t) * n) && (o = 1);else {
      if ("[object Array]" !== Object.prototype.toString.call(t)) throw new Error("getTextDimensions expects text-parameter to be of type String or an Array of Strings.");

      for (var s = 0; s < t.length; s++) i < (a = this.getStringUnitWidth(t[s]) * n) && (i = a);

      0 !== i && (o = t.length);
    }
    return {
      w: i /= r,
      h: Math.max((o * n * this.getLineHeightFactor() - n * (this.getLineHeightFactor() - 1)) / r, 0)
    };
  }, _.cellAddPage = function () {
    var t = this.margins || k;
    this.addPage(), p(t.left, t.top, void 0, void 0), P += 1;
  }, _.cellInitialize = function () {
    F = {
      x: void 0,
      y: void 0,
      w: void 0,
      h: void 0,
      ln: void 0
    }, P = 1;
  }, _.cell = function (t, e, n, r, i, o, a) {
    var s = d(),
        l = !1;
    if (void 0 !== s.ln) if (s.ln === o) t = s.x + s.w, e = s.y;else {
      var h = this.margins || k;
      s.y + s.h + r + 13 >= this.internal.pageSize.getHeight() - h.bottom && (this.cellAddPage(), l = !0, this.printHeaders && this.tableHeaderRow && this.printHeaderRow(o, !0)), e = d().y + d().h, l && (e = 23);
    }
    if (void 0 !== i[0]) if (this.printingHeaderRow ? this.rect(t, e, n, r, "FD") : this.rect(t, e, n, r), "right" === a) {
      i instanceof Array || (i = [i]);

      for (var u = 0; u < i.length; u++) {
        var c = i[u],
            f = this.getStringUnitWidth(c) * this.internal.getFontSize() / this.internal.scaleFactor;
        this.text(c, t + n - f - 3, e + this.internal.getLineHeight() * (u + 1));
      }
    } else this.text(i, t + 3, e + this.internal.getLineHeight());
    return p(t, e, n, r, o), this;
  }, _.arrayMax = function (t, e) {
    var n,
        r,
        i,
        o = t[0];

    for (n = 0, r = t.length; n < r; n += 1) i = t[n], e ? -1 === e(o, i) && (o = i) : o < i && (o = i);

    return o;
  }, _.table = function (t, e, n, r, i) {
    if (!n) throw "No data for PDF table";
    var o,
        a,
        s,
        l,
        h,
        u,
        c,
        f,
        p,
        d,
        g = [],
        m = [],
        y = {},
        v = {},
        w = [],
        b = [],
        x = !1,
        N = !0,
        L = 12,
        A = k;
    if (A.width = this.internal.pageSize.getWidth(), i && (!0 === i.autoSize && (x = !0), !1 === i.printHeaders && (N = !1), i.fontSize && (L = i.fontSize), i.css && void 0 !== i.css["font-size"] && (L = 16 * i.css["font-size"]), i.margins && (A = i.margins)), this.lnMod = 0, F = {
      x: void 0,
      y: void 0,
      w: void 0,
      h: void 0,
      ln: void 0
    }, P = 1, this.printHeaders = N, this.margins = A, this.setFontSize(L), this.table_font_size = L, null == r) g = Object.keys(n[0]);else if (r[0] && "string" != typeof r[0]) for (a = 0, s = r.length; a < s; a += 1) o = r[a], g.push(o.name), m.push(o.prompt), v[o.name] = o.width * (19.049976 / 25.4);else g = r;
    if (x) for (d = function (t) {
      return t[o];
    }, a = 0, s = g.length; a < s; a += 1) {
      for (y[o = g[a]] = n.map(d), w.push(this.getTextDimensions(m[a] || o, {
        scaleFactor: 1
      }).w), c = 0, l = (u = y[o]).length; c < l; c += 1) h = u[c], w.push(this.getTextDimensions(h, {
        scaleFactor: 1
      }).w);

      v[o] = _.arrayMax(w), w = [];
    }

    if (N) {
      var S = this.calculateLineHeight(g, v, m.length ? m : g);

      for (a = 0, s = g.length; a < s; a += 1) o = g[a], b.push([t, e, v[o], S, String(m.length ? m[a] : o)]);

      this.setTableHeaderRow(b), this.printHeaderRow(1, !1);
    }

    for (a = 0, s = n.length; a < s; a += 1) for (f = n[a], S = this.calculateLineHeight(g, v, f), c = 0, p = g.length; c < p; c += 1) o = g[c], this.cell(t, e, v[o], S, f[o], a + 2, o.align);

    return this.lastCellPos = F, this.table_x = t, this.table_y = e, this;
  }, _.calculateLineHeight = function (t, e, n) {
    for (var r, i = 0, o = 0; o < t.length; o++) {
      n[r = t[o]] = this.splitTextToSize(String(n[r]), e[r] - 3);
      var a = this.internal.getLineHeight() * n[r].length + 3;
      i < a && (i = a);
    }

    return i;
  }, _.setTableHeaderRow = function (t) {
    this.tableHeaderRow = t;
  }, _.printHeaderRow = function (t, e) {
    if (!this.tableHeaderRow) throw "Property tableHeaderRow does not exist.";
    var n, r, i, o;

    if (this.printingHeaderRow = !0, void 0 !== l) {
      var a = l(this, P);
      p(a[0], a[1], a[2], a[3], -1);
    }

    this.setFontStyle("bold");
    var s = [];

    for (i = 0, o = this.tableHeaderRow.length; i < o; i += 1) this.setFillColor(200, 200, 200), n = this.tableHeaderRow[i], e && (this.margins.top = 13, n[1] = this.margins && this.margins.top || 0, s.push(n)), r = [].concat(n), this.cell.apply(this, r.concat(t));

    0 < s.length && this.setTableHeaderRow(s), this.setFontStyle("normal"), this.printingHeaderRow = !1;
  },
  /**
     * jsPDF Context2D PlugIn Copyright (c) 2014 Steven Spungin (TwelveTone LLC) steven@twelvetone.tv
     *
     * Licensed under the MIT License. http://opensource.org/licenses/mit-license
     */
  function (t, e) {
    var l,
        i,
        o,
        h,
        u,
        c = function (t) {
      return t = t || {}, this.isStrokeTransparent = t.isStrokeTransparent || !1, this.strokeOpacity = t.strokeOpacity || 1, this.strokeStyle = t.strokeStyle || "#000000", this.fillStyle = t.fillStyle || "#000000", this.isFillTransparent = t.isFillTransparent || !1, this.fillOpacity = t.fillOpacity || 1, this.font = t.font || "10px sans-serif", this.textBaseline = t.textBaseline || "alphabetic", this.textAlign = t.textAlign || "left", this.lineWidth = t.lineWidth || 1, this.lineJoin = t.lineJoin || "miter", this.lineCap = t.lineCap || "butt", this.path = t.path || [], this.transform = void 0 !== t.transform ? t.transform.clone() : new M(), this.globalCompositeOperation = t.globalCompositeOperation || "normal", this.globalAlpha = t.globalAlpha || 1, this.clip_path = t.clip_path || [], this.currentPoint = t.currentPoint || new j(), this.miterLimit = t.miterLimit || 10, this.lastPoint = t.lastPoint || new j(), this.ignoreClearRect = "boolean" != typeof t.ignoreClearRect || t.ignoreClearRect, this;
    };

    t.events.push(["initialized", function () {
      this.context2d = new n(this), l = this.internal.f2, this.internal.f3, i = this.internal.getCoordinateString, o = this.internal.getVerticalCoordinateString, h = this.internal.getHorizontalCoordinate, u = this.internal.getVerticalCoordinate;
    }]);

    var n = function (t) {
      Object.defineProperty(this, "canvas", {
        get: function () {
          return {
            parentNode: !1,
            style: !1
          };
        }
      }), Object.defineProperty(this, "pdf", {
        get: function () {
          return t;
        }
      });
      var e = !1;
      Object.defineProperty(this, "pageWrapXEnabled", {
        get: function () {
          return e;
        },
        set: function (t) {
          e = Boolean(t);
        }
      });
      var n = !1;
      Object.defineProperty(this, "pageWrapYEnabled", {
        get: function () {
          return n;
        },
        set: function (t) {
          n = Boolean(t);
        }
      });
      var r = 0;
      Object.defineProperty(this, "posX", {
        get: function () {
          return r;
        },
        set: function (t) {
          isNaN(t) || (r = t);
        }
      });
      var i = 0;
      Object.defineProperty(this, "posY", {
        get: function () {
          return i;
        },
        set: function (t) {
          isNaN(t) || (i = t);
        }
      });
      var o = !1;
      Object.defineProperty(this, "autoPaging", {
        get: function () {
          return o;
        },
        set: function (t) {
          o = Boolean(t);
        }
      });
      var a = 0;
      Object.defineProperty(this, "lastBreak", {
        get: function () {
          return a;
        },
        set: function (t) {
          a = t;
        }
      });
      var s = [];
      Object.defineProperty(this, "pageBreaks", {
        get: function () {
          return s;
        },
        set: function (t) {
          s = t;
        }
      });
      var l = new c();
      Object.defineProperty(this, "ctx", {
        get: function () {
          return l;
        },
        set: function (t) {
          t instanceof c && (l = t);
        }
      }), Object.defineProperty(this, "path", {
        get: function () {
          return l.path;
        },
        set: function (t) {
          l.path = t;
        }
      });
      var h = [];
      Object.defineProperty(this, "ctxStack", {
        get: function () {
          return h;
        },
        set: function (t) {
          h = t;
        }
      }), Object.defineProperty(this, "fillStyle", {
        get: function () {
          return this.ctx.fillStyle;
        },
        set: function (t) {
          var e;
          e = f(t), this.ctx.fillStyle = e.style, this.ctx.isFillTransparent = 0 === e.a, this.ctx.fillOpacity = e.a, this.pdf.setFillColor(e.r, e.g, e.b, {
            a: e.a
          }), this.pdf.setTextColor(e.r, e.g, e.b, {
            a: e.a
          });
        }
      }), Object.defineProperty(this, "strokeStyle", {
        get: function () {
          return this.ctx.strokeStyle;
        },
        set: function (t) {
          var e = f(t);
          this.ctx.strokeStyle = e.style, this.ctx.isStrokeTransparent = 0 === e.a, this.ctx.strokeOpacity = e.a, 0 === e.a ? this.pdf.setDrawColor(255, 255, 255) : (e.a, this.pdf.setDrawColor(e.r, e.g, e.b));
        }
      }), Object.defineProperty(this, "lineCap", {
        get: function () {
          return this.ctx.lineCap;
        },
        set: function (t) {
          -1 !== ["butt", "round", "square"].indexOf(t) && (this.ctx.lineCap = t, this.pdf.setLineCap(t));
        }
      }), Object.defineProperty(this, "lineWidth", {
        get: function () {
          return this.ctx.lineWidth;
        },
        set: function (t) {
          isNaN(t) || (this.ctx.lineWidth = t, this.pdf.setLineWidth(t));
        }
      }), Object.defineProperty(this, "lineJoin", {
        get: function () {
          return this.ctx.lineJoin;
        },
        set: function (t) {
          -1 !== ["bevel", "round", "miter"].indexOf(t) && (this.ctx.lineJoin = t, this.pdf.setLineJoin(t));
        }
      }), Object.defineProperty(this, "miterLimit", {
        get: function () {
          return this.ctx.miterLimit;
        },
        set: function (t) {
          isNaN(t) || (this.ctx.miterLimit = t, this.pdf.setMiterLimit(t));
        }
      }), Object.defineProperty(this, "textBaseline", {
        get: function () {
          return this.ctx.textBaseline;
        },
        set: function (t) {
          this.ctx.textBaseline = t;
        }
      }), Object.defineProperty(this, "textAlign", {
        get: function () {
          return this.ctx.textAlign;
        },
        set: function (t) {
          -1 !== ["right", "end", "center", "left", "start"].indexOf(t) && (this.ctx.textAlign = t);
        }
      }), Object.defineProperty(this, "font", {
        get: function () {
          return this.ctx.font;
        },
        set: function (t) {
          var e;

          if (this.ctx.font = t, null !== (e = /^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-_,\"\'\sa-z]+?)\s*$/i.exec(t))) {
            var n = e[1],
                r = (e[2], e[3]),
                i = e[4],
                o = e[5],
                a = e[6];
            i = "px" === o ? Math.floor(parseFloat(i)) : "em" === o ? Math.floor(parseFloat(i) * this.pdf.getFontSize()) : Math.floor(parseFloat(i)), this.pdf.setFontSize(i);
            var s = "";
            ("bold" === r || 700 <= parseInt(r, 10) || "bold" === n) && (s = "bold"), "italic" === n && (s += "italic"), 0 === s.length && (s = "normal");

            for (var l = "", h = a.toLowerCase().replace(/"|'/g, "").split(/\s*,\s*/), u = {
              arial: "Helvetica",
              verdana: "Helvetica",
              helvetica: "Helvetica",
              "sans-serif": "Helvetica",
              fixed: "Courier",
              monospace: "Courier",
              terminal: "Courier",
              courier: "Courier",
              times: "Times",
              cursive: "Times",
              fantasy: "Times",
              serif: "Times"
            }, c = 0; c < h.length; c++) {
              if (void 0 !== this.pdf.internal.getFont(h[c], s, {
                noFallback: !0,
                disableWarning: !0
              })) {
                l = h[c];
                break;
              }

              if ("bolditalic" === s && void 0 !== this.pdf.internal.getFont(h[c], "bold", {
                noFallback: !0,
                disableWarning: !0
              })) l = h[c], s = "bold";else if (void 0 !== this.pdf.internal.getFont(h[c], "normal", {
                noFallback: !0,
                disableWarning: !0
              })) {
                l = h[c], s = "normal";
                break;
              }
            }

            if ("" === l) for (c = 0; c < h.length; c++) if (u[h[c]]) {
              l = u[h[c]];
              break;
            }
            l = "" === l ? "Times" : l, this.pdf.setFont(l, s);
          }
        }
      }), Object.defineProperty(this, "globalCompositeOperation", {
        get: function () {
          return this.ctx.globalCompositeOperation;
        },
        set: function (t) {
          this.ctx.globalCompositeOperation = t;
        }
      }), Object.defineProperty(this, "globalAlpha", {
        get: function () {
          return this.ctx.globalAlpha;
        },
        set: function (t) {
          this.ctx.globalAlpha = t;
        }
      }), Object.defineProperty(this, "ignoreClearRect", {
        get: function () {
          return this.ctx.ignoreClearRect;
        },
        set: function (t) {
          this.ctx.ignoreClearRect = Boolean(t);
        }
      });
    };

    n.prototype.fill = function () {
      r.call(this, "fill", !1);
    }, n.prototype.stroke = function () {
      r.call(this, "stroke", !1);
    }, n.prototype.beginPath = function () {
      this.path = [{
        type: "begin"
      }];
    }, n.prototype.moveTo = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw console.error("jsPDF.context2d.moveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.moveTo");
      var n = this.ctx.transform.applyToPoint(new j(t, e));
      this.path.push({
        type: "mt",
        x: n.x,
        y: n.y
      }), this.ctx.lastPoint = new j(t, e);
    }, n.prototype.closePath = function () {
      var t = new j(0, 0),
          e = 0;

      for (e = this.path.length - 1; -1 !== e; e--) if ("begin" === this.path[e].type && "object" === se(this.path[e + 1]) && "number" == typeof this.path[e + 1].x) {
        t = new j(this.path[e + 1].x, this.path[e + 1].y), this.path.push({
          type: "lt",
          x: t.x,
          y: t.y
        });
        break;
      }

      "object" === se(this.path[e + 2]) && "number" == typeof this.path[e + 2].x && this.path.push(JSON.parse(JSON.stringify(this.path[e + 2]))), this.path.push({
        type: "close"
      }), this.ctx.lastPoint = new j(t.x, t.y);
    }, n.prototype.lineTo = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw console.error("jsPDF.context2d.lineTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.lineTo");
      var n = this.ctx.transform.applyToPoint(new j(t, e));
      this.path.push({
        type: "lt",
        x: n.x,
        y: n.y
      }), this.ctx.lastPoint = new j(n.x, n.y);
    }, n.prototype.clip = function () {
      this.ctx.clip_path = JSON.parse(JSON.stringify(this.path)), r.call(this, null, !0);
    }, n.prototype.quadraticCurveTo = function (t, e, n, r) {
      if (isNaN(n) || isNaN(r) || isNaN(t) || isNaN(e)) throw console.error("jsPDF.context2d.quadraticCurveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.quadraticCurveTo");
      var i = this.ctx.transform.applyToPoint(new j(n, r)),
          o = this.ctx.transform.applyToPoint(new j(t, e));
      this.path.push({
        type: "qct",
        x1: o.x,
        y1: o.y,
        x: i.x,
        y: i.y
      }), this.ctx.lastPoint = new j(i.x, i.y);
    }, n.prototype.bezierCurveTo = function (t, e, n, r, i, o) {
      if (isNaN(i) || isNaN(o) || isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw console.error("jsPDF.context2d.bezierCurveTo: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.bezierCurveTo");
      var a = this.ctx.transform.applyToPoint(new j(i, o)),
          s = this.ctx.transform.applyToPoint(new j(t, e)),
          l = this.ctx.transform.applyToPoint(new j(n, r));
      this.path.push({
        type: "bct",
        x1: s.x,
        y1: s.y,
        x2: l.x,
        y2: l.y,
        x: a.x,
        y: a.y
      }), this.ctx.lastPoint = new j(a.x, a.y);
    }, n.prototype.arc = function (t, e, n, r, i, o) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || isNaN(i)) throw console.error("jsPDF.context2d.arc: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.arc");

      if (o = Boolean(o), !this.ctx.transform.isIdentity) {
        var a = this.ctx.transform.applyToPoint(new j(t, e));
        t = a.x, e = a.y;
        var s = this.ctx.transform.applyToPoint(new j(0, n)),
            l = this.ctx.transform.applyToPoint(new j(0, 0));
        n = Math.sqrt(Math.pow(s.x - l.x, 2) + Math.pow(s.y - l.y, 2));
      }

      Math.abs(i - r) >= 2 * Math.PI && (r = 0, i = 2 * Math.PI), this.path.push({
        type: "arc",
        x: t,
        y: e,
        radius: n,
        startAngle: r,
        endAngle: i,
        counterclockwise: o
      });
    }, n.prototype.arcTo = function (t, e, n, r, i) {
      throw new Error("arcTo not implemented.");
    }, n.prototype.rect = function (t, e, n, r) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw console.error("jsPDF.context2d.rect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.rect");
      this.moveTo(t, e), this.lineTo(t + n, e), this.lineTo(t + n, e + r), this.lineTo(t, e + r), this.lineTo(t, e), this.lineTo(t + n, e), this.lineTo(t, e);
    }, n.prototype.fillRect = function (t, e, n, r) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw console.error("jsPDF.context2d.fillRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.fillRect");

      if (!N.call(this)) {
        var i = {};
        "butt" !== this.lineCap && (i.lineCap = this.lineCap, this.lineCap = "butt"), "miter" !== this.lineJoin && (i.lineJoin = this.lineJoin, this.lineJoin = "miter"), this.beginPath(), this.rect(t, e, n, r), this.fill(), i.hasOwnProperty("lineCap") && (this.lineCap = i.lineCap), i.hasOwnProperty("lineJoin") && (this.lineJoin = i.lineJoin);
      }
    }, n.prototype.strokeRect = function (t, e, n, r) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw console.error("jsPDF.context2d.strokeRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.strokeRect");
      L.call(this) || (this.beginPath(), this.rect(t, e, n, r), this.stroke());
    }, n.prototype.clearRect = function (t, e, n, r) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r)) throw console.error("jsPDF.context2d.clearRect: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.clearRect");
      this.ignoreClearRect || (this.fillStyle = "#ffffff", this.fillRect(t, e, n, r));
    }, n.prototype.save = function (t) {
      t = "boolean" != typeof t || t;

      for (var e = this.pdf.internal.getCurrentPageInfo().pageNumber, n = 0; n < this.pdf.internal.getNumberOfPages(); n++) this.pdf.setPage(n + 1), this.pdf.internal.out("q");

      if (this.pdf.setPage(e), t) {
        this.ctx.fontSize = this.pdf.internal.getFontSize();
        var r = new c(this.ctx);
        this.ctxStack.push(this.ctx), this.ctx = r;
      }
    }, n.prototype.restore = function (t) {
      t = "boolean" != typeof t || t;

      for (var e = this.pdf.internal.getCurrentPageInfo().pageNumber, n = 0; n < this.pdf.internal.getNumberOfPages(); n++) this.pdf.setPage(n + 1), this.pdf.internal.out("Q");

      this.pdf.setPage(e), t && 0 !== this.ctxStack.length && (this.ctx = this.ctxStack.pop(), this.fillStyle = this.ctx.fillStyle, this.strokeStyle = this.ctx.strokeStyle, this.font = this.ctx.font, this.lineCap = this.ctx.lineCap, this.lineWidth = this.ctx.lineWidth, this.lineJoin = this.ctx.lineJoin);
    }, n.prototype.toDataURL = function () {
      throw new Error("toDataUrl not implemented.");
    };

    var f = function (t) {
      var e, n, r, i;
      if (!0 === t.isCanvasGradient && (t = t.getColor()), !t) return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
        style: t
      };
      if (/transparent|rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0+\s*\)/.test(t)) i = r = n = e = 0;else {
        var o = /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(t);
        if (null !== o) e = parseInt(o[1]), n = parseInt(o[2]), r = parseInt(o[3]), i = 1;else if (null !== (o = /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/.exec(t))) e = parseInt(o[1]), n = parseInt(o[2]), r = parseInt(o[3]), i = parseFloat(o[4]);else {
          if (i = 1, "string" == typeof t && "#" !== t.charAt(0)) {
            var a = new RGBColor(t);
            t = a.ok ? a.toHex() : "#000000";
          }

          4 === t.length ? (e = t.substring(1, 2), e += e, n = t.substring(2, 3), n += n, r = t.substring(3, 4), r += r) : (e = t.substring(1, 3), n = t.substring(3, 5), r = t.substring(5, 7)), e = parseInt(e, 16), n = parseInt(n, 16), r = parseInt(r, 16);
        }
      }
      return {
        r: e,
        g: n,
        b: r,
        a: i,
        style: t
      };
    },
        N = function () {
      return this.ctx.isFillTransparent || 0 == this.globalAlpha;
    },
        L = function () {
      return Boolean(this.ctx.isStrokeTransparent || 0 == this.globalAlpha);
    };

    n.prototype.fillText = function (t, e, n, r) {
      if (isNaN(e) || isNaN(n) || "string" != typeof t) throw console.error("jsPDF.context2d.fillText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.fillText");

      if (r = isNaN(r) ? void 0 : r, !N.call(this)) {
        n = a.call(this, n);
        var i = B(this.ctx.transform.rotation),
            o = this.ctx.transform.scaleX;
        s.call(this, {
          text: t,
          x: e,
          y: n,
          scale: o,
          angle: i,
          align: this.textAlign,
          maxWidth: r
        });
      }
    }, n.prototype.strokeText = function (t, e, n, r) {
      if (isNaN(e) || isNaN(n) || "string" != typeof t) throw console.error("jsPDF.context2d.strokeText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.strokeText");

      if (!L.call(this)) {
        r = isNaN(r) ? void 0 : r, n = a.call(this, n);
        var i = B(this.ctx.transform.rotation),
            o = this.ctx.transform.scaleX;
        s.call(this, {
          text: t,
          x: e,
          y: n,
          scale: o,
          renderingMode: "stroke",
          angle: i,
          align: this.textAlign,
          maxWidth: r
        });
      }
    }, n.prototype.measureText = function (t) {
      if ("string" != typeof t) throw console.error("jsPDF.context2d.measureText: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.measureText");
      var e = this.pdf,
          n = this.pdf.internal.scaleFactor,
          r = e.internal.getFontSize(),
          i = e.getStringUnitWidth(t) * r / e.internal.scaleFactor;
      return new function (t) {
        var e = (t = t || {}).width || 0;
        return Object.defineProperty(this, "width", {
          get: function () {
            return e;
          }
        }), this;
      }({
        width: i *= Math.round(96 * n / 72 * 1e4) / 1e4
      });
    }, n.prototype.scale = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw console.error("jsPDF.context2d.scale: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.scale");
      var n = new M(t, 0, 0, e, 0, 0);
      this.ctx.transform = this.ctx.transform.multiply(n);
    }, n.prototype.rotate = function (t) {
      if (isNaN(t)) throw console.error("jsPDF.context2d.rotate: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.rotate");
      var e = new M(Math.cos(t), Math.sin(t), -Math.sin(t), Math.cos(t), 0, 0);
      this.ctx.transform = this.ctx.transform.multiply(e);
    }, n.prototype.translate = function (t, e) {
      if (isNaN(t) || isNaN(e)) throw console.error("jsPDF.context2d.translate: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.translate");
      var n = new M(1, 0, 0, 1, t, e);
      this.ctx.transform = this.ctx.transform.multiply(n);
    }, n.prototype.transform = function (t, e, n, r, i, o) {
      if (isNaN(t) || isNaN(e) || isNaN(n) || isNaN(r) || isNaN(i) || isNaN(o)) throw console.error("jsPDF.context2d.transform: Invalid arguments", arguments), new Error("Invalid arguments passed to jsPDF.context2d.transform");
      var a = new M(t, e, n, r, i, o);
      this.ctx.transform = this.ctx.transform.multiply(a);
    }, n.prototype.setTransform = function (t, e, n, r, i, o) {
      t = isNaN(t) ? 1 : t, e = isNaN(e) ? 0 : e, n = isNaN(n) ? 0 : n, r = isNaN(r) ? 1 : r, i = isNaN(i) ? 0 : i, o = isNaN(o) ? 0 : o, this.ctx.transform = new M(t, e, n, r, i, o);
    }, n.prototype.drawImage = function (t, e, n, r, i, o, a, s, l) {
      var h = this.pdf.getImageProperties(t),
          u = 1,
          c = 1,
          f = 1,
          p = 1;
      void 0 !== r && void 0 !== s && (f = s / r, p = l / i, u = h.width / r * s / r, c = h.height / i * l / i), void 0 === o && (o = e, a = n, n = e = 0), void 0 !== r && void 0 === s && (s = r, l = i), void 0 === r && void 0 === s && (s = h.width, l = h.height);
      var d = this.ctx.transform.decompose(),
          g = B(d.rotate.shx);
      d.scale.sx, d.scale.sy;

      for (var m, y = new M(), v = ((y = (y = (y = y.multiply(d.translate)).multiply(d.skew)).multiply(d.scale)).applyToPoint(new j(s, l)), y.applyToRectangle(new E(o - e * f, a - n * p, r * u, i * c))), w = F.call(this, v), b = [], x = 0; x < w.length; x += 1) -1 === b.indexOf(w[x]) && b.push(w[x]);

      if (b.sort(), this.autoPaging) for (var N = b[0], L = b[b.length - 1], A = N; A < L + 1; A++) {
        if (this.pdf.setPage(A), 0 !== this.ctx.clip_path.length) {
          var S = this.path;
          m = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = P(m, this.posX, -1 * this.pdf.internal.pageSize.height * (A - 1) + this.posY), k.call(this, "fill", !0), this.path = S;
        }

        var _ = JSON.parse(JSON.stringify(v));

        _ = P([_], this.posX, -1 * this.pdf.internal.pageSize.height * (A - 1) + this.posY)[0], this.pdf.addImage(t, "jpg", _.x, _.y, _.w, _.h, null, null, g);
      } else this.pdf.addImage(t, "jpg", v.x, v.y, v.w, v.h, null, null, g);
    };

    var F = function (t, e, n) {
      var r = [];

      switch (e = e || this.pdf.internal.pageSize.width, n = n || this.pdf.internal.pageSize.height, t.type) {
        default:
        case "mt":
        case "lt":
          r.push(Math.floor((t.y + this.posY) / n) + 1);
          break;

        case "arc":
          r.push(Math.floor((t.y + this.posY - t.radius) / n) + 1), r.push(Math.floor((t.y + this.posY + t.radius) / n) + 1);
          break;

        case "qct":
          var i = w(this.ctx.lastPoint.x, this.ctx.lastPoint.y, t.x1, t.y1, t.x, t.y);
          r.push(Math.floor(i.y / n) + 1), r.push(Math.floor((i.y + i.h) / n) + 1);
          break;

        case "bct":
          var o = b(this.ctx.lastPoint.x, this.ctx.lastPoint.y, t.x1, t.y1, t.x2, t.y2, t.x, t.y);
          r.push(Math.floor(o.y / n) + 1), r.push(Math.floor((o.y + o.h) / n) + 1);
          break;

        case "rect":
          r.push(Math.floor((t.y + this.posY) / n) + 1), r.push(Math.floor((t.y + t.h + this.posY) / n) + 1);
      }

      for (var a = 0; a < r.length; a += 1) for (; this.pdf.internal.getNumberOfPages() < r[a];) v.call(this);

      return r;
    },
        v = function () {
      var t = this.fillStyle,
          e = this.strokeStyle,
          n = this.font,
          r = this.lineCap,
          i = this.lineWidth,
          o = this.lineJoin;
      this.pdf.addPage(), this.fillStyle = t, this.strokeStyle = e, this.font = n, this.lineCap = r, this.lineWidth = i, this.lineJoin = o;
    },
        P = function (t, e, n) {
      for (var r = 0; r < t.length; r++) switch (t[r].type) {
        case "bct":
          t[r].x2 += e, t[r].y2 += n;

        case "qct":
          t[r].x1 += e, t[r].y1 += n;

        case "mt":
        case "lt":
        case "arc":
        default:
          t[r].x += e, t[r].y += n;
      }

      return t;
    },
        r = function (t, e) {
      for (var n, r, i = this.fillStyle, o = this.strokeStyle, a = (this.font, this.lineCap), s = this.lineWidth, l = this.lineJoin, h = JSON.parse(JSON.stringify(this.path)), u = JSON.parse(JSON.stringify(this.path)), c = [], f = 0; f < u.length; f++) if (void 0 !== u[f].x) for (var p = F.call(this, u[f]), d = 0; d < p.length; d += 1) -1 === c.indexOf(p[d]) && c.push(p[d]);

      for (f = 0; f < c.length; f++) for (; this.pdf.internal.getNumberOfPages() < c[f];) v.call(this);

      if (c.sort(), this.autoPaging) {
        var g = c[0],
            m = c[c.length - 1];

        for (f = g; f < m + 1; f++) {
          if (this.pdf.setPage(f), this.fillStyle = i, this.strokeStyle = o, this.lineCap = a, this.lineWidth = s, this.lineJoin = l, 0 !== this.ctx.clip_path.length) {
            var y = this.path;
            n = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = P(n, this.posX, -1 * this.pdf.internal.pageSize.height * (f - 1) + this.posY), k.call(this, t, !0), this.path = y;
          }

          r = JSON.parse(JSON.stringify(h)), this.path = P(r, this.posX, -1 * this.pdf.internal.pageSize.height * (f - 1) + this.posY), !1 !== e && 0 !== f || k.call(this, t, e);
        }
      } else k.call(this, t, e);

      this.path = h;
    },
        k = function (t, e) {
      if (("stroke" !== t || e || !L.call(this)) && ("stroke" === t || e || !N.call(this))) {
        var n = [];
        this.ctx.globalAlpha;
        this.ctx.fillOpacity < 1 && this.ctx.fillOpacity;

        for (var r, i = this.path, o = 0; o < i.length; o++) {
          var a = i[o];

          switch (a.type) {
            case "begin":
              n.push({
                begin: !0
              });
              break;

            case "close":
              n.push({
                close: !0
              });
              break;

            case "mt":
              n.push({
                start: a,
                deltas: [],
                abs: []
              });
              break;

            case "lt":
              var s = n.length;

              if (!isNaN(i[o - 1].x)) {
                var l = [a.x - i[o - 1].x, a.y - i[o - 1].y];
                if (0 < s) for (; 0 <= s; s--) if (!0 !== n[s - 1].close && !0 !== n[s - 1].begin) {
                  n[s - 1].deltas.push(l), n[s - 1].abs.push(a);
                  break;
                }
              }

              break;

            case "bct":
              l = [a.x1 - i[o - 1].x, a.y1 - i[o - 1].y, a.x2 - i[o - 1].x, a.y2 - i[o - 1].y, a.x - i[o - 1].x, a.y - i[o - 1].y];
              n[n.length - 1].deltas.push(l);
              break;

            case "qct":
              var h = i[o - 1].x + 2 / 3 * (a.x1 - i[o - 1].x),
                  u = i[o - 1].y + 2 / 3 * (a.y1 - i[o - 1].y),
                  c = a.x + 2 / 3 * (a.x1 - a.x),
                  f = a.y + 2 / 3 * (a.y1 - a.y),
                  p = a.x,
                  d = a.y;
              l = [h - i[o - 1].x, u - i[o - 1].y, c - i[o - 1].x, f - i[o - 1].y, p - i[o - 1].x, d - i[o - 1].y];
              n[n.length - 1].deltas.push(l);
              break;

            case "arc":
              n.push({
                deltas: [],
                abs: [],
                arc: !0
              }), Array.isArray(n[n.length - 1].abs) && n[n.length - 1].abs.push(a);
          }
        }

        r = e ? null : "stroke" === t ? "stroke" : "fill";

        for (o = 0; o < n.length; o++) {
          if (n[o].arc) for (var g = n[o].abs, m = 0; m < g.length; m++) {
            var y = g[m];

            if (void 0 !== y.startAngle) {
              var v = B(y.startAngle),
                  w = B(y.endAngle),
                  b = y.x,
                  x = y.y;
              A.call(this, b, x, y.radius, v, w, y.counterclockwise, r, e);
            } else I.call(this, y.x, y.y);
          }

          if (!n[o].arc && !0 !== n[o].close && !0 !== n[o].begin) {
            b = n[o].start.x, x = n[o].start.y;
            C.call(this, n[o].deltas, b, x, null, null);
          }
        }

        r && S.call(this, r), e && _.call(this);
      }
    },
        a = function (t) {
      var e = this.pdf.internal.getFontSize() / this.pdf.internal.scaleFactor,
          n = e * (this.pdf.internal.getLineHeightFactor() - 1);

      switch (this.ctx.textBaseline) {
        case "bottom":
          return t - n;

        case "top":
          return t + e - n;

        case "hanging":
          return t + e - 2 * n;

        case "middle":
          return t + e / 2 - n;

        case "ideographic":
          return t;

        case "alphabetic":
        default:
          return t;
      }
    };

    n.prototype.createLinearGradient = function () {
      var t = function () {};

      return t.colorStops = [], t.addColorStop = function (t, e) {
        this.colorStops.push([t, e]);
      }, t.getColor = function () {
        return 0 === this.colorStops.length ? "#000000" : this.colorStops[0][1];
      }, t.isCanvasGradient = !0, t;
    }, n.prototype.createPattern = function () {
      return this.createLinearGradient();
    }, n.prototype.createRadialGradient = function () {
      return this.createLinearGradient();
    };

    var A = function (t, e, n, r, i, o, a, s) {
      this.pdf.internal.scaleFactor;

      for (var l = y(r), h = y(i), u = g.call(this, n, l, h, o), c = 0; c < u.length; c++) {
        var f = u[c];
        0 === c && p.call(this, f.x1 + t, f.y1 + e), d.call(this, t, e, f.x2, f.y2, f.x3, f.y3, f.x4, f.y4);
      }

      s ? _.call(this) : S.call(this, a);
    },
        S = function (t) {
      switch (t) {
        case "stroke":
          this.pdf.internal.out("S");
          break;

        case "fill":
          this.pdf.internal.out("f");
      }
    },
        _ = function () {
      this.pdf.clip();
    },
        p = function (t, e) {
      this.pdf.internal.out(i(t) + " " + o(e) + " m");
    },
        s = function (t) {
      var e;

      switch (t.align) {
        case "right":
        case "end":
          e = "right";
          break;

        case "center":
          e = "center";
          break;

        case "left":
        case "start":
        default:
          e = "left";
      }

      var n = this.ctx.transform.applyToPoint(new j(t.x, t.y)),
          r = this.ctx.transform.decompose(),
          i = new M();
      i = (i = (i = i.multiply(r.translate)).multiply(r.skew)).multiply(r.scale);

      for (var o, a = this.pdf.getTextDimensions(t.text), s = this.ctx.transform.applyToRectangle(new E(t.x, t.y, a.w, a.h)), l = i.applyToRectangle(new E(t.x, t.y - a.h, a.w, a.h)), h = F.call(this, l), u = [], c = 0; c < h.length; c += 1) -1 === u.indexOf(h[c]) && u.push(h[c]);

      if (u.sort(), !0 === this.autoPaging) for (var f = u[0], p = u[u.length - 1], d = f; d < p + 1; d++) {
        if (this.pdf.setPage(d), 0 !== this.ctx.clip_path.length) {
          var g = this.path;
          o = JSON.parse(JSON.stringify(this.ctx.clip_path)), this.path = P(o, this.posX, -1 * this.pdf.internal.pageSize.height * (d - 1) + this.posY), k.call(this, "fill", !0), this.path = g;
        }

        var m = JSON.parse(JSON.stringify(s));

        if (m = P([m], this.posX, -1 * this.pdf.internal.pageSize.height * (d - 1) + this.posY)[0], .01 <= t.scale) {
          var y = this.pdf.internal.getFontSize();
          this.pdf.setFontSize(y * t.scale);
        }

        this.pdf.text(t.text, m.x, m.y, {
          angle: t.angle,
          align: e,
          renderingMode: t.renderingMode,
          maxWidth: t.maxWidth
        }), .01 <= t.scale && this.pdf.setFontSize(y);
      } else {
        if (.01 <= t.scale) {
          y = this.pdf.internal.getFontSize();
          this.pdf.setFontSize(y * t.scale);
        }

        this.pdf.text(t.text, n.x + this.posX, n.y + this.posY, {
          angle: t.angle,
          align: e,
          renderingMode: t.renderingMode,
          maxWidth: t.maxWidth
        }), .01 <= t.scale && this.pdf.setFontSize(y);
      }
    },
        I = function (t, e, n, r) {
      n = n || 0, r = r || 0, this.pdf.internal.out(i(t + n) + " " + o(e + r) + " l");
    },
        C = function (t, e, n) {
      return this.pdf.lines(t, e, n, null, null);
    },
        d = function (t, e, n, r, i, o, a, s) {
      this.pdf.internal.out([l(h(n + t)), l(u(r + e)), l(h(i + t)), l(u(o + e)), l(h(a + t)), l(u(s + e)), "c"].join(" "));
    },
        g = function (t, e, n, r) {
      var i = 2 * Math.PI,
          o = e;
      (o < i || i < o) && (o %= i);
      var a = n;
      (a < i || i < a) && (a %= i);

      for (var s = [], l = Math.PI / 2, h = r ? -1 : 1, u = e, c = Math.min(i, Math.abs(a - o)); 1e-5 < c;) {
        var f = u + h * Math.min(c, l);
        s.push(m.call(this, t, u, f)), c -= Math.abs(f - u), u = f;
      }

      return s;
    },
        m = function (t, e, n) {
      var r = (n - e) / 2,
          i = t * Math.cos(r),
          o = t * Math.sin(r),
          a = i,
          s = -o,
          l = a * a + s * s,
          h = l + a * i + s * o,
          u = 4 / 3 * (Math.sqrt(2 * l * h) - h) / (a * o - s * i),
          c = a - u * s,
          f = s + u * a,
          p = c,
          d = -f,
          g = r + e,
          m = Math.cos(g),
          y = Math.sin(g);
      return {
        x1: t * Math.cos(e),
        y1: t * Math.sin(e),
        x2: c * m - f * y,
        y2: c * y + f * m,
        x3: p * m - d * y,
        y3: p * y + d * m,
        x4: t * Math.cos(n),
        y4: t * Math.sin(n)
      };
    },
        B = function (t) {
      return 180 * t / Math.PI;
    },
        y = function (t) {
      return t * Math.PI / 180;
    },
        w = function (t, e, n, r, i, o) {
      var a = t + .5 * (n - t),
          s = e + .5 * (r - e),
          l = i + .5 * (n - i),
          h = o + .5 * (r - o),
          u = Math.min(t, i, a, l),
          c = Math.max(t, i, a, l),
          f = Math.min(e, o, s, h),
          p = Math.max(e, o, s, h);
      return new E(u, f, c - u, p - f);
    },
        b = function (t, e, n, r, i, o, a, s) {
      for (var l, h, u, c, f, p, d, g, m, y, v, w, b, x = n - t, N = r - e, L = i - n, A = o - r, S = a - i, _ = s - o, F = 0; F < 41; F++) g = (p = (h = t + (l = F / 40) * x) + l * ((c = n + l * L) - h)) + l * (c + l * (i + l * S - c) - p), m = (d = (u = e + l * N) + l * ((f = r + l * A) - u)) + l * (f + l * (o + l * _ - f) - d), b = 0 == F ? (w = y = g, v = m) : (y = Math.min(y, g), v = Math.min(v, m), w = Math.max(w, g), Math.max(b, m));

      return new E(Math.round(y), Math.round(v), Math.round(w - y), Math.round(b - v));
    },
        j = function (t, e) {
      var n = t || 0;
      Object.defineProperty(this, "x", {
        enumerable: !0,
        get: function () {
          return n;
        },
        set: function (t) {
          isNaN(t) || (n = parseFloat(t));
        }
      });
      var r = e || 0;
      Object.defineProperty(this, "y", {
        enumerable: !0,
        get: function () {
          return r;
        },
        set: function (t) {
          isNaN(t) || (r = parseFloat(t));
        }
      });
      var i = "pt";
      return Object.defineProperty(this, "type", {
        enumerable: !0,
        get: function () {
          return i;
        },
        set: function (t) {
          i = t.toString();
        }
      }), this;
    },
        E = function (t, e, n, r) {
      j.call(this, t, e), this.type = "rect";
      var i = n || 0;
      Object.defineProperty(this, "w", {
        enumerable: !0,
        get: function () {
          return i;
        },
        set: function (t) {
          isNaN(t) || (i = parseFloat(t));
        }
      });
      var o = r || 0;
      return Object.defineProperty(this, "h", {
        enumerable: !0,
        get: function () {
          return o;
        },
        set: function (t) {
          isNaN(t) || (o = parseFloat(t));
        }
      }), this;
    },
        M = function (t, e, n, r, i, o) {
      var a = [];
      return Object.defineProperty(this, "sx", {
        get: function () {
          return a[0];
        },
        set: function (t) {
          a[0] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "shy", {
        get: function () {
          return a[1];
        },
        set: function (t) {
          a[1] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "shx", {
        get: function () {
          return a[2];
        },
        set: function (t) {
          a[2] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "sy", {
        get: function () {
          return a[3];
        },
        set: function (t) {
          a[3] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "tx", {
        get: function () {
          return a[4];
        },
        set: function (t) {
          a[4] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "ty", {
        get: function () {
          return a[5];
        },
        set: function (t) {
          a[5] = Math.round(1e5 * t) / 1e5;
        }
      }), Object.defineProperty(this, "rotation", {
        get: function () {
          return Math.atan2(this.shx, this.sx);
        }
      }), Object.defineProperty(this, "scaleX", {
        get: function () {
          return this.decompose().scale.sx;
        }
      }), Object.defineProperty(this, "scaleY", {
        get: function () {
          return this.decompose().scale.sy;
        }
      }), Object.defineProperty(this, "isIdentity", {
        get: function () {
          return 1 === this.sx && 0 === this.shy && 0 === this.shx && 1 === this.sy && 0 === this.tx && 0 === this.ty;
        }
      }), this.sx = isNaN(t) ? 1 : t, this.shy = isNaN(e) ? 0 : e, this.shx = isNaN(n) ? 0 : n, this.sy = isNaN(r) ? 1 : r, this.tx = isNaN(i) ? 0 : i, this.ty = isNaN(o) ? 0 : o, this;
    };

    M.prototype.multiply = function (t) {
      var e = t.sx * this.sx + t.shy * this.shx,
          n = t.sx * this.shy + t.shy * this.sy,
          r = t.shx * this.sx + t.sy * this.shx,
          i = t.shx * this.shy + t.sy * this.sy,
          o = t.tx * this.sx + t.ty * this.shx + this.tx,
          a = t.tx * this.shy + t.ty * this.sy + this.ty;
      return new M(e, n, r, i, o, a);
    }, M.prototype.decompose = function () {
      var t = this.sx,
          e = this.shy,
          n = this.shx,
          r = this.sy,
          i = this.tx,
          o = this.ty,
          a = Math.sqrt(t * t + e * e),
          s = (t /= a) * n + (e /= a) * r;
      n -= t * s, r -= e * s;
      var l = Math.sqrt(n * n + r * r);
      return s /= l, t * (r /= l) < e * (n /= l) && (t = -t, e = -e, s = -s, a = -a), {
        scale: new M(a, 0, 0, l, 0, 0),
        translate: new M(1, 0, 0, 1, i, o),
        rotate: new M(t, e, -e, t, 0, 0),
        skew: new M(1, 0, s, 1, 0, 0)
      };
    }, M.prototype.applyToPoint = function (t) {
      var e = t.x * this.sx + t.y * this.shx + this.tx,
          n = t.x * this.shy + t.y * this.sy + this.ty;
      return new j(e, n);
    }, M.prototype.applyToRectangle = function (t) {
      var e = this.applyToPoint(t),
          n = this.applyToPoint(new j(t.x + t.w, t.y + t.h));
      return new E(e.x, e.y, n.x - e.x, n.y - e.y);
    }, M.prototype.clone = function () {
      var t = this.sx,
          e = this.shy,
          n = this.shx,
          r = this.sy,
          i = this.tx,
          o = this.ty;
      return new M(t, e, n, r, i, o);
    };
  }(lt.API, "undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")()),
  /**
     * jsPDF filters PlugIn
     * Copyright (c) 2014 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  a = lt.API, o = function (t) {
    var r, e, n, i, o, a, s, l, h, u;

    for (/[^\x00-\xFF]/.test(t), e = [], n = 0, i = (t += r = "\0\0\0\0".slice(t.length % 4 || 4)).length; n < i; n += 4) 0 !== (o = (t.charCodeAt(n) << 24) + (t.charCodeAt(n + 1) << 16) + (t.charCodeAt(n + 2) << 8) + t.charCodeAt(n + 3)) ? (a = (o = ((o = ((o = ((o = (o - (u = o % 85)) / 85) - (h = o % 85)) / 85) - (l = o % 85)) / 85) - (s = o % 85)) / 85) % 85, e.push(a + 33, s + 33, l + 33, h + 33, u + 33)) : e.push(122);

    return function (t, e) {
      for (var n = r.length; 0 < n; n--) t.pop();
    }(e), String.fromCharCode.apply(String, e) + "~>";
  }, s = function (t) {
    var r,
        e,
        n,
        i,
        o,
        a = String,
        s = "length",
        l = "charCodeAt",
        h = "slice",
        u = "replace";

    for (t[h](-2), t = t[h](0, -2)[u](/\s/g, "")[u]("z", "!!!!!"), n = [], i = 0, o = (t += r = "uuuuu"[h](t[s] % 5 || 5))[s]; i < o; i += 5) e = 52200625 * (t[l](i) - 33) + 614125 * (t[l](i + 1) - 33) + 7225 * (t[l](i + 2) - 33) + 85 * (t[l](i + 3) - 33) + (t[l](i + 4) - 33), n.push(255 & e >> 24, 255 & e >> 16, 255 & e >> 8, 255 & e);

    return function (t, e) {
      for (var n = r[s]; 0 < n; n--) t.pop();
    }(n), a.fromCharCode.apply(a, n);
  }, h = function (t) {
    for (var e = "", n = 0; n < t.length; n += 1) e += ("0" + t.charCodeAt(n).toString(16)).slice(-2);

    return e += ">";
  }, u = function (t) {
    var e = new RegExp(/^([0-9A-Fa-f]{2})+$/);
    if (-1 !== (t = t.replace(/\s/g, "")).indexOf(">") && (t = t.substr(0, t.indexOf(">"))), t.length % 2 && (t += "0"), !1 === e.test(t)) return "";

    for (var n = "", r = 0; r < t.length; r += 2) n += String.fromCharCode("0x" + (t[r] + t[r + 1]));

    return n;
  }, c = function (t, e) {
    e = Object.assign({
      predictor: 1,
      colors: 1,
      bitsPerComponent: 8,
      columns: 1
    }, e);

    for (var n, r, i = [], o = t.length; o--;) i[o] = t.charCodeAt(o);

    return n = a.adler32cs.from(t), (r = new Deflater(6)).append(new Uint8Array(i)), t = r.flush(), (i = new Uint8Array(t.length + 6)).set(new Uint8Array([120, 156])), i.set(t, 2), i.set(new Uint8Array([255 & n, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255]), t.length + 2), t = String.fromCharCode.apply(null, i);
  }, a.processDataByFilters = function (t, e) {
    var n = 0,
        r = t || "",
        i = [];

    for ("string" == typeof (e = e || []) && (e = [e]), n = 0; n < e.length; n += 1) switch (e[n]) {
      case "ASCII85Decode":
      case "/ASCII85Decode":
        r = s(r), i.push("/ASCII85Encode");
        break;

      case "ASCII85Encode":
      case "/ASCII85Encode":
        r = o(r), i.push("/ASCII85Decode");
        break;

      case "ASCIIHexDecode":
      case "/ASCIIHexDecode":
        r = u(r), i.push("/ASCIIHexEncode");
        break;

      case "ASCIIHexEncode":
      case "/ASCIIHexEncode":
        r = h(r), i.push("/ASCIIHexDecode");
        break;

      case "FlateEncode":
      case "/FlateEncode":
        r = c(r), i.push("/FlateDecode");
        break;

      default:
        throw 'The filter: "' + e[n] + '" is not implemented';
    }

    return {
      data: r,
      reverseChain: i.reverse().join(" ")
    };
  }, (
  /**
     * jsPDF fileloading PlugIn
     * Copyright (c) 2018 Aras Abbasi (aras.abbasi@gmail.com)
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  r = lt.API).loadFile = function (t, e, n) {
    var r;
    e = e || !0, n = n || function () {};

    try {
      r = function (t, e, n) {
        var r = new XMLHttpRequest(),
            i = [],
            o = 0,
            a = function (t) {
          var e = t.length,
              n = String.fromCharCode;

          for (o = 0; o < e; o += 1) i.push(n(255 & t.charCodeAt(o)));

          return i.join("");
        };

        if (r.open("GET", t, !e), r.overrideMimeType("text/plain; charset=x-user-defined"), !1 === e && (r.onload = function () {
          return a(this.responseText);
        }), r.send(null), 200 === r.status) return e ? a(r.responseText) : void 0;
        console.warn('Unable to load file "' + t + '"');
      }(t, e);
    } catch (t) {
      r = void 0;
    }

    return r;
  }, r.loadImageFile = r.loadFile,
  /**
     * Copyright (c) 2018 Erik Koopmans
     * Released under the MIT License.
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  i = lt.API, f = "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal, g = function (t) {
    var e = se(t);
    return "undefined" === e ? "undefined" : "string" === e || t instanceof String ? "string" : "number" === e || t instanceof Number ? "number" : "function" === e || t instanceof Function ? "function" : t && t.constructor === Array ? "array" : t && 1 === t.nodeType ? "element" : "object" === e ? "object" : "unknown";
  }, m = function (t, e) {
    var n = document.createElement(t);

    if (e.className && (n.className = e.className), e.innerHTML) {
      n.innerHTML = e.innerHTML;

      for (var r = n.getElementsByTagName("script"), i = r.length; 0 < i--; null) r[i].parentNode.removeChild(r[i]);
    }

    for (var o in e.style) n.style[o] = e.style[o];

    return n;
  }, (((y = function t(e) {
    var n = Object.assign(t.convert(Promise.resolve()), JSON.parse(JSON.stringify(t.template))),
        r = t.convert(Promise.resolve(), n);
    return r = (r = r.setProgress(1, t, 1, [t])).set(e);
  }).prototype = Object.create(Promise.prototype)).constructor = y).convert = function (t, e) {
    return t.__proto__ = e || y.prototype, t;
  }, y.template = {
    prop: {
      src: null,
      container: null,
      overlay: null,
      canvas: null,
      img: null,
      pdf: null,
      pageSize: null,
      callback: function () {}
    },
    progress: {
      val: 0,
      state: null,
      n: 0,
      stack: []
    },
    opt: {
      filename: "file.pdf",
      margin: [0, 0, 0, 0],
      enableLinks: !0,
      x: 0,
      y: 0,
      html2canvas: {},
      jsPDF: {}
    }
  }, y.prototype.from = function (t, e) {
    return this.then(function () {
      switch (e = e || function (t) {
        switch (g(t)) {
          case "string":
            return "string";

          case "element":
            return "canvas" === t.nodeName.toLowerCase ? "canvas" : "element";

          default:
            return "unknown";
        }
      }(t)) {
        case "string":
          return this.set({
            src: m("div", {
              innerHTML: t
            })
          });

        case "element":
          return this.set({
            src: t
          });

        case "canvas":
          return this.set({
            canvas: t
          });

        case "img":
          return this.set({
            img: t
          });

        default:
          return this.error("Unknown source type.");
      }
    });
  }, y.prototype.to = function (t) {
    switch (t) {
      case "container":
        return this.toContainer();

      case "canvas":
        return this.toCanvas();

      case "img":
        return this.toImg();

      case "pdf":
        return this.toPdf();

      default:
        return this.error("Invalid target.");
    }
  }, y.prototype.toContainer = function () {
    return this.thenList([function () {
      return this.prop.src || this.error("Cannot duplicate - no source HTML.");
    }, function () {
      return this.prop.pageSize || this.setPageSize();
    }]).then(function () {
      var t = {
        position: "relative",
        display: "inline-block",
        width: Math.max(this.prop.src.clientWidth, this.prop.src.scrollWidth, this.prop.src.offsetWidth) + "px",
        left: 0,
        right: 0,
        top: 0,
        margin: "auto",
        backgroundColor: "white"
      },
          e = function t(e, n) {
        for (var r = 3 === e.nodeType ? document.createTextNode(e.nodeValue) : e.cloneNode(!1), i = e.firstChild; i; i = i.nextSibling) !0 !== n && 1 === i.nodeType && "SCRIPT" === i.nodeName || r.appendChild(t(i, n));

        return 1 === e.nodeType && ("CANVAS" === e.nodeName ? (r.width = e.width, r.height = e.height, r.getContext("2d").drawImage(e, 0, 0)) : "TEXTAREA" !== e.nodeName && "SELECT" !== e.nodeName || (r.value = e.value), r.addEventListener("load", function () {
          r.scrollTop = e.scrollTop, r.scrollLeft = e.scrollLeft;
        }, !0)), r;
      }(this.prop.src, this.opt.html2canvas.javascriptEnabled);

      "BODY" === e.tagName && (t.height = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) + "px"), this.prop.overlay = m("div", {
        className: "html2pdf__overlay",
        style: {
          position: "fixed",
          overflow: "hidden",
          zIndex: 1e3,
          left: "-100000px",
          right: 0,
          bottom: 0,
          top: 0
        }
      }), this.prop.container = m("div", {
        className: "html2pdf__container",
        style: t
      }), this.prop.container.appendChild(e), this.prop.container.firstChild.appendChild(m("div", {
        style: {
          clear: "both",
          border: "0 none transparent",
          margin: 0,
          padding: 0,
          height: 0
        }
      })), this.prop.container.style.float = "none", this.prop.overlay.appendChild(this.prop.container), document.body.appendChild(this.prop.overlay), this.prop.container.firstChild.style.position = "relative", this.prop.container.height = Math.max(this.prop.container.firstChild.clientHeight, this.prop.container.firstChild.scrollHeight, this.prop.container.firstChild.offsetHeight) + "px";
    });
  }, y.prototype.toCanvas = function () {
    var t = [function () {
      return document.body.contains(this.prop.container) || this.toContainer();
    }];
    return this.thenList(t).then(function () {
      var t = Object.assign({}, this.opt.html2canvas);
      if (delete t.onrendered, this.isHtml2CanvasLoaded()) return html2canvas(this.prop.container, t);
    }).then(function (t) {
      (this.opt.html2canvas.onrendered || function () {})(t), this.prop.canvas = t, document.body.removeChild(this.prop.overlay);
    });
  }, y.prototype.toContext2d = function () {
    var t = [function () {
      return document.body.contains(this.prop.container) || this.toContainer();
    }];
    return this.thenList(t).then(function () {
      var t = this.opt.jsPDF,
          e = Object.assign({
        async: !0,
        allowTaint: !0,
        backgroundColor: "#ffffff",
        imageTimeout: 15e3,
        logging: !0,
        proxy: null,
        removeContainer: !0,
        foreignObjectRendering: !1,
        useCORS: !1
      }, this.opt.html2canvas);
      if (delete e.onrendered, t.context2d.autoPaging = !0, t.context2d.posX = this.opt.x, t.context2d.posY = this.opt.y, e.windowHeight = e.windowHeight || 0, e.windowHeight = 0 == e.windowHeight ? Math.max(this.prop.container.clientHeight, this.prop.container.scrollHeight, this.prop.container.offsetHeight) : e.windowHeight, this.isHtml2CanvasLoaded()) return html2canvas(this.prop.container, e);
    }).then(function (t) {
      (this.opt.html2canvas.onrendered || function () {})(t), this.prop.canvas = t, document.body.removeChild(this.prop.overlay);
    });
  }, y.prototype.toImg = function () {
    return this.thenList([function () {
      return this.prop.canvas || this.toCanvas();
    }]).then(function () {
      var t = this.prop.canvas.toDataURL("image/" + this.opt.image.type, this.opt.image.quality);
      this.prop.img = document.createElement("img"), this.prop.img.src = t;
    });
  }, y.prototype.toPdf = function () {
    return this.thenList([function () {
      return this.toContext2d();
    }]).then(function () {
      this.prop.pdf = this.prop.pdf || this.opt.jsPDF;
    });
  }, y.prototype.output = function (t, e, n) {
    return "img" === (n = n || "pdf").toLowerCase() || "image" === n.toLowerCase() ? this.outputImg(t, e) : this.outputPdf(t, e);
  }, y.prototype.outputPdf = function (t, e) {
    return this.thenList([function () {
      return this.prop.pdf || this.toPdf();
    }]).then(function () {
      return this.prop.pdf.output(t, e);
    });
  }, y.prototype.outputImg = function (t, e) {
    return this.thenList([function () {
      return this.prop.img || this.toImg();
    }]).then(function () {
      switch (t) {
        case void 0:
        case "img":
          return this.prop.img;

        case "datauristring":
        case "dataurlstring":
          return this.prop.img.src;

        case "datauri":
        case "dataurl":
          return document.location.href = this.prop.img.src;

        default:
          throw 'Image output type "' + t + '" is not supported.';
      }
    });
  }, y.prototype.isHtml2CanvasLoaded = function () {
    var t = void 0 !== f.html2canvas;
    return t || console.error("html2canvas not loaded."), t;
  }, y.prototype.save = function (t) {
    if (this.isHtml2CanvasLoaded()) return this.thenList([function () {
      return this.prop.pdf || this.toPdf();
    }]).set(t ? {
      filename: t
    } : null).then(function () {
      this.prop.pdf.save(this.opt.filename);
    });
  }, y.prototype.doCallback = function (t) {
    if (this.isHtml2CanvasLoaded()) return this.thenList([function () {
      return this.prop.pdf || this.toPdf();
    }]).then(function () {
      this.prop.callback(this.prop.pdf);
    });
  }, y.prototype.set = function (e) {
    if ("object" !== g(e)) return this;
    var t = Object.keys(e || {}).map(function (t) {
      if (t in y.template.prop) return function () {
        this.prop[t] = e[t];
      };

      switch (t) {
        case "margin":
          return this.setMargin.bind(this, e.margin);

        case "jsPDF":
          return function () {
            return this.opt.jsPDF = e.jsPDF, this.setPageSize();
          };

        case "pageSize":
          return this.setPageSize.bind(this, e.pageSize);

        default:
          return function () {
            this.opt[t] = e[t];
          };
      }
    }, this);
    return this.then(function () {
      return this.thenList(t);
    });
  }, y.prototype.get = function (e, n) {
    return this.then(function () {
      var t = e in y.template.prop ? this.prop[e] : this.opt[e];
      return n ? n(t) : t;
    });
  }, y.prototype.setMargin = function (t) {
    return this.then(function () {
      switch (g(t)) {
        case "number":
          t = [t, t, t, t];

        case "array":
          if (2 === t.length && (t = [t[0], t[1], t[0], t[1]]), 4 === t.length) break;

        default:
          return this.error("Invalid margin array.");
      }

      this.opt.margin = t;
    }).then(this.setPageSize);
  }, y.prototype.setPageSize = function (t) {
    function e(t, e) {
      return Math.floor(t * e / 72 * 96);
    }

    return this.then(function () {
      (t = t || lt.getPageSize(this.opt.jsPDF)).hasOwnProperty("inner") || (t.inner = {
        width: t.width - this.opt.margin[1] - this.opt.margin[3],
        height: t.height - this.opt.margin[0] - this.opt.margin[2]
      }, t.inner.px = {
        width: e(t.inner.width, t.k),
        height: e(t.inner.height, t.k)
      }, t.inner.ratio = t.inner.height / t.inner.width), this.prop.pageSize = t;
    });
  }, y.prototype.setProgress = function (t, e, n, r) {
    return null != t && (this.progress.val = t), null != e && (this.progress.state = e), null != n && (this.progress.n = n), null != r && (this.progress.stack = r), this.progress.ratio = this.progress.val / this.progress.state, this;
  }, y.prototype.updateProgress = function (t, e, n, r) {
    return this.setProgress(t ? this.progress.val + t : null, e || null, n ? this.progress.n + n : null, r ? this.progress.stack.concat(r) : null);
  }, y.prototype.then = function (t, e) {
    var n = this;
    return this.thenCore(t, e, function (e, t) {
      return n.updateProgress(null, null, 1, [e]), Promise.prototype.then.call(this, function (t) {
        return n.updateProgress(null, e), t;
      }).then(e, t).then(function (t) {
        return n.updateProgress(1), t;
      });
    });
  }, y.prototype.thenCore = function (t, e, n) {
    n = n || Promise.prototype.then;
    var r = this;
    t && (t = t.bind(r)), e && (e = e.bind(r));
    var i = -1 !== Promise.toString().indexOf("[native code]") && "Promise" === Promise.name ? r : y.convert(Object.assign({}, r), Promise.prototype),
        o = n.call(i, t, e);
    return y.convert(o, r.__proto__);
  }, y.prototype.thenExternal = function (t, e) {
    return Promise.prototype.then.call(this, t, e);
  }, y.prototype.thenList = function (t) {
    var e = this;
    return t.forEach(function (t) {
      e = e.thenCore(t);
    }), e;
  }, y.prototype.catch = function (t) {
    t && (t = t.bind(this));
    var e = Promise.prototype.catch.call(this, t);
    return y.convert(e, this);
  }, y.prototype.catchExternal = function (t) {
    return Promise.prototype.catch.call(this, t);
  }, y.prototype.error = function (t) {
    return this.then(function () {
      throw new Error(t);
    });
  }, y.prototype.using = y.prototype.set, y.prototype.saveAs = y.prototype.save, y.prototype.export = y.prototype.output, y.prototype.run = y.prototype.then, lt.getPageSize = function (t, e, n) {
    if ("object" === se(t)) {
      var r = t;
      t = r.orientation, e = r.unit || e, n = r.format || n;
    }

    e = e || "mm", n = n || "a4", t = ("" + (t || "P")).toLowerCase();
    var i = ("" + n).toLowerCase(),
        o = {
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

    switch (e) {
      case "pt":
        var a = 1;
        break;

      case "mm":
        a = 72 / 25.4;
        break;

      case "cm":
        a = 72 / 2.54;
        break;

      case "in":
        a = 72;
        break;

      case "px":
        a = .75;
        break;

      case "pc":
      case "em":
        a = 12;
        break;

      case "ex":
        a = 6;
        break;

      default:
        throw "Invalid unit: " + e;
    }

    if (o.hasOwnProperty(i)) var s = o[i][1] / a,
        l = o[i][0] / a;else try {
      s = n[1], l = n[0];
    } catch (t) {
      throw new Error("Invalid format: " + n);
    }

    if ("p" === t || "portrait" === t) {
      if (t = "p", s < l) {
        var h = l;
        l = s, s = h;
      }
    } else {
      if ("l" !== t && "landscape" !== t) throw "Invalid orientation: " + t;
      t = "l", l < s && (h = l, l = s, s = h);
    }

    return {
      width: l,
      height: s,
      unit: e,
      k: a
    };
  }, i.html = function (t, e) {
    (e = e || {}).callback = e.callback || function () {}, e.html2canvas = e.html2canvas || {}, e.html2canvas.canvas = e.html2canvas.canvas || this.canvas, e.jsPDF = e.jsPDF || this, e.jsPDF;
    var n = new y(e);
    return e.worker ? n : n.from(t).doCallback();
  }, lt.API.addJS = function (t) {
    return b = t, this.internal.events.subscribe("postPutResources", function (t) {
      v = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/Names [(EmbeddedJS) " + (v + 1) + " 0 R]"), this.internal.out(">>"), this.internal.out("endobj"), w = this.internal.newObject(), this.internal.out("<<"), this.internal.out("/S /JavaScript"), this.internal.out("/JS (" + b + ")"), this.internal.out(">>"), this.internal.out("endobj");
    }), this.internal.events.subscribe("putCatalog", function () {
      void 0 !== v && void 0 !== w && this.internal.out("/Names <</JavaScript " + v + " 0 R>>");
    }), this;
  }, (
  /**
     * @license
     * Copyright (c) 2014 Steven Spungin (TwelveTone LLC)  steven@twelvetone.tv
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  x = lt.API).events.push(["postPutResources", function () {
    var t = this,
        e = /^(\d+) 0 obj$/;
    if (0 < this.outline.root.children.length) for (var n = t.outline.render().split(/\r\n/), r = 0; r < n.length; r++) {
      var i = n[r],
          o = e.exec(i);

      if (null != o) {
        var a = o[1];
        t.internal.newObjectDeferredBegin(a, !1);
      }

      t.internal.write(i);
    }

    if (this.outline.createNamedDestinations) {
      var s = this.internal.pages.length,
          l = [];

      for (r = 0; r < s; r++) {
        var h = t.internal.newObject();
        l.push(h);
        var u = t.internal.getPageInfo(r + 1);
        t.internal.write("<< /D[" + u.objId + " 0 R /XYZ null null null]>> endobj");
      }

      var c = t.internal.newObject();

      for (t.internal.write("<< /Names [ "), r = 0; r < l.length; r++) t.internal.write("(page_" + (r + 1) + ")" + l[r] + " 0 R");

      t.internal.write(" ] >>", "endobj"), t.internal.newObject(), t.internal.write("<< /Dests " + c + " 0 R"), t.internal.write(">>", "endobj");
    }
  }]), x.events.push(["putCatalog", function () {
    0 < this.outline.root.children.length && (this.internal.write("/Outlines", this.outline.makeRef(this.outline.root)), this.outline.createNamedDestinations && this.internal.write("/Names " + namesOid + " 0 R"));
  }]), x.events.push(["initialized", function () {
    var a = this;
    a.outline = {
      createNamedDestinations: !1,
      root: {
        children: []
      }
    }, a.outline.add = function (t, e, n) {
      var r = {
        title: e,
        options: n,
        children: []
      };
      return null == t && (t = this.root), t.children.push(r), r;
    }, a.outline.render = function () {
      return this.ctx = {}, this.ctx.val = "", this.ctx.pdf = a, this.genIds_r(this.root), this.renderRoot(this.root), this.renderItems(this.root), this.ctx.val;
    }, a.outline.genIds_r = function (t) {
      t.id = a.internal.newObjectDeferred();

      for (var e = 0; e < t.children.length; e++) this.genIds_r(t.children[e]);
    }, a.outline.renderRoot = function (t) {
      this.objStart(t), this.line("/Type /Outlines"), 0 < t.children.length && (this.line("/First " + this.makeRef(t.children[0])), this.line("/Last " + this.makeRef(t.children[t.children.length - 1]))), this.line("/Count " + this.count_r({
        count: 0
      }, t)), this.objEnd();
    }, a.outline.renderItems = function (t) {
      this.ctx.pdf.internal.getCoordinateString;

      for (var e = this.ctx.pdf.internal.getVerticalCoordinateString, n = 0; n < t.children.length; n++) {
        var r = t.children[n];
        this.objStart(r), this.line("/Title " + this.makeString(r.title)), this.line("/Parent " + this.makeRef(t)), 0 < n && this.line("/Prev " + this.makeRef(t.children[n - 1])), n < t.children.length - 1 && this.line("/Next " + this.makeRef(t.children[n + 1])), 0 < r.children.length && (this.line("/First " + this.makeRef(r.children[0])), this.line("/Last " + this.makeRef(r.children[r.children.length - 1])));
        var i = this.count = this.count_r({
          count: 0
        }, r);

        if (0 < i && this.line("/Count " + i), r.options && r.options.pageNumber) {
          var o = a.internal.getPageInfo(r.options.pageNumber);
          this.line("/Dest [" + o.objId + " 0 R /XYZ 0 " + e(0) + " 0]");
        }

        this.objEnd();
      }

      for (n = 0; n < t.children.length; n++) r = t.children[n], this.renderItems(r);
    }, a.outline.line = function (t) {
      this.ctx.val += t + "\r\n";
    }, a.outline.makeRef = function (t) {
      return t.id + " 0 R";
    }, a.outline.makeString = function (t) {
      return "(" + a.internal.pdfEscape(t) + ")";
    }, a.outline.objStart = function (t) {
      this.ctx.val += "\r\n" + t.id + " 0 obj\r\n<<\r\n";
    }, a.outline.objEnd = function (t) {
      this.ctx.val += ">> \r\nendobj\r\n";
    }, a.outline.count_r = function (t, e) {
      for (var n = 0; n < e.children.length; n++) t.count++, this.count_r(t, e.children[n]);

      return t.count;
    };
  }]),
  /**
     * @license
     * 
     * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
     *
     * 
     * ====================================================================
     */
  I = lt.API, C = function () {
    var t = "function" == typeof Deflater;
    if (!t) throw new Error("requires deflate.js for compression");
    return t;
  }, B = function (t, e, n, r) {
    var i = 5,
        o = E;

    switch (r) {
      case I.image_compression.FAST:
        i = 3, o = j;
        break;

      case I.image_compression.MEDIUM:
        i = 6, o = M;
        break;

      case I.image_compression.SLOW:
        i = 9, o = O;
    }

    t = A(t, e, n, o);
    var a = new Uint8Array(N(i)),
        s = L(t),
        l = new Deflater(i),
        h = l.append(t),
        u = l.flush(),
        c = a.length + h.length + u.length,
        f = new Uint8Array(c + 4);
    return f.set(a), f.set(h, a.length), f.set(u, a.length + h.length), f[c++] = s >>> 24 & 255, f[c++] = s >>> 16 & 255, f[c++] = s >>> 8 & 255, f[c++] = 255 & s, I.arrayBufferToBinaryString(f);
  }, N = function (t, e) {
    var n = Math.LOG2E * Math.log(32768) - 8 << 4 | 8,
        r = n << 8;
    return r |= Math.min(3, (e - 1 & 255) >> 1) << 6, r |= 0, [n, 255 & (r += 31 - r % 31)];
  }, L = function (t, e) {
    for (var n, r = 1, i = 0, o = t.length, a = 0; 0 < o;) {
      for (o -= n = e < o ? e : o; i += r += t[a++], --n;);

      r %= 65521, i %= 65521;
    }

    return (i << 16 | r) >>> 0;
  }, A = function (t, e, n, r) {
    for (var i, o, a, s = t.length / e, l = new Uint8Array(t.length + s), h = T(), u = 0; u < s; u++) {
      if (a = u * e, i = t.subarray(a, a + e), r) l.set(r(i, n, o), a + u);else {
        for (var c = 0, f = h.length, p = []; c < f; c++) p[c] = h[c](i, n, o);

        var d = R(p.concat());
        l.set(p[d], a + u);
      }
      o = i;
    }

    return l;
  }, S = function (t, e, n) {
    var r = Array.apply([], t);
    return r.unshift(0), r;
  }, j = function (t, e, n) {
    var r,
        i = [],
        o = 0,
        a = t.length;

    for (i[0] = 1; o < a; o++) r = t[o - e] || 0, i[o + 1] = t[o] - r + 256 & 255;

    return i;
  }, E = function (t, e, n) {
    var r,
        i = [],
        o = 0,
        a = t.length;

    for (i[0] = 2; o < a; o++) r = n && n[o] || 0, i[o + 1] = t[o] - r + 256 & 255;

    return i;
  }, M = function (t, e, n) {
    var r,
        i,
        o = [],
        a = 0,
        s = t.length;

    for (o[0] = 3; a < s; a++) r = t[a - e] || 0, i = n && n[a] || 0, o[a + 1] = t[a] + 256 - (r + i >>> 1) & 255;

    return o;
  }, O = function (t, e, n) {
    var r,
        i,
        o,
        a,
        s = [],
        l = 0,
        h = t.length;

    for (s[0] = 4; l < h; l++) r = t[l - e] || 0, i = n && n[l] || 0, o = n && n[l - e] || 0, a = q(r, i, o), s[l + 1] = t[l] - a + 256 & 255;

    return s;
  }, q = function (t, e, n) {
    var r = t + e - n,
        i = Math.abs(r - t),
        o = Math.abs(r - e),
        a = Math.abs(r - n);
    return i <= o && i <= a ? t : o <= a ? e : n;
  }, T = function () {
    return [S, j, E, M, O];
  }, R = function (t) {
    for (var e, n, r, i = 0, o = t.length; i < o;) ((e = D(t[i].slice(1))) < n || !n) && (n = e, r = i), i++;

    return r;
  }, D = function (t) {
    for (var e = 0, n = t.length, r = 0; e < n;) r += Math.abs(t[e++]);

    return r;
  }, I.processPNG = function (t, e, n, r, i) {
    var o,
        a,
        s,
        l,
        h,
        u,
        c = this.color_spaces.DEVICE_RGB,
        f = this.decode.FLATE_DECODE,
        p = 8;

    if (this.isArrayBuffer(t) && (t = new Uint8Array(t)), this.isArrayBufferView(t)) {
      if ("function" != typeof PNG || "function" != typeof kt) throw new Error("PNG support requires png.js and zlib.js");

      if (t = (o = new PNG(t)).imgData, p = o.bits, c = o.colorSpace, l = o.colors, -1 !== [4, 6].indexOf(o.colorType)) {
        if (8 === o.bits) for (var d, g = (_ = 32 == o.pixelBitlength ? new Uint32Array(o.decodePixels().buffer) : 16 == o.pixelBitlength ? new Uint16Array(o.decodePixels().buffer) : new Uint8Array(o.decodePixels().buffer)).length, m = new Uint8Array(g * o.colors), y = new Uint8Array(g), v = o.pixelBitlength - o.bits, w = 0, b = 0; w < g; w++) {
          for (x = _[w], d = 0; d < v;) m[b++] = x >>> d & 255, d += o.bits;

          y[w] = x >>> d & 255;
        }

        if (16 === o.bits) {
          g = (_ = new Uint32Array(o.decodePixels().buffer)).length, m = new Uint8Array(g * (32 / o.pixelBitlength) * o.colors), y = new Uint8Array(g * (32 / o.pixelBitlength));

          for (var x, N = 1 < o.colors, L = b = w = 0; w < g;) x = _[w++], m[b++] = x >>> 0 & 255, N && (m[b++] = x >>> 16 & 255, x = _[w++], m[b++] = x >>> 0 & 255), y[L++] = x >>> 16 & 255;

          p = 8;
        }

        r !== I.image_compression.NONE && C() ? (t = B(m, o.width * o.colors, o.colors, r), u = B(y, o.width, 1, r)) : (t = m, u = y, f = null);
      }

      if (3 === o.colorType && (c = this.color_spaces.INDEXED, h = o.palette, o.transparency.indexed)) {
        var A = o.transparency.indexed,
            S = 0;

        for (w = 0, g = A.length; w < g; ++w) S += A[w];

        if ((S /= 255) == g - 1 && -1 !== A.indexOf(0)) s = [A.indexOf(0)];else if (S !== g) {
          var _ = o.decodePixels();

          for (y = new Uint8Array(_.length), w = 0, g = _.length; w < g; w++) y[w] = A[_[w]];

          u = B(y, o.width, 1);
        }
      }

      var F = function (t) {
        var e;

        switch (t) {
          case I.image_compression.FAST:
            e = 11;
            break;

          case I.image_compression.MEDIUM:
            e = 13;
            break;

          case I.image_compression.SLOW:
            e = 14;
            break;

          default:
            e = 12;
        }

        return e;
      }(r);

      return a = f === this.decode.FLATE_DECODE ? "/Predictor " + F + " /Colors " + l + " /BitsPerComponent " + p + " /Columns " + o.width : "/Colors " + l + " /BitsPerComponent " + p + " /Columns " + o.width, (this.isArrayBuffer(t) || this.isArrayBufferView(t)) && (t = this.arrayBufferToBinaryString(t)), (u && this.isArrayBuffer(u) || this.isArrayBufferView(u)) && (u = this.arrayBufferToBinaryString(u)), this.createImageInfo(t, o.width, o.height, c, p, f, e, n, a, s, h, u, F);
    }

    throw new Error("Unsupported PNG image data, try using JPEG instead.");
  }, (
  /**
     * @license
     * Copyright (c) 2017 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  U = lt.API).processGIF89A = function (t, e, n, r, i) {
    var o = new At(t),
        a = o.width,
        s = o.height,
        l = [];
    o.decodeAndBlitFrameRGBA(0, l);
    var h = {
      data: l,
      width: a,
      height: s
    },
        u = new _t(100).encode(h, 100);
    return U.processJPEG.call(this, u, e, n, r);
  }, U.processGIF87A = U.processGIF89A, (
  /**
     * Copyright (c) 2018 Aras Abbasi 
     *
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  z = lt.API).processBMP = function (t, e, n, r, i) {
    var o = new Ft(t, !1),
        a = o.width,
        s = o.height,
        l = {
      data: o.getData(),
      width: a,
      height: s
    },
        h = new _t(100).encode(l, 100);
    return z.processJPEG.call(this, h, e, n, r);
  }, lt.API.setLanguage = function (t) {
    return void 0 === this.internal.languageSettings && (this.internal.languageSettings = {}, this.internal.languageSettings.isSubscribed = !1), void 0 !== {
      af: "Afrikaans",
      sq: "Albanian",
      ar: "Arabic (Standard)",
      "ar-DZ": "Arabic (Algeria)",
      "ar-BH": "Arabic (Bahrain)",
      "ar-EG": "Arabic (Egypt)",
      "ar-IQ": "Arabic (Iraq)",
      "ar-JO": "Arabic (Jordan)",
      "ar-KW": "Arabic (Kuwait)",
      "ar-LB": "Arabic (Lebanon)",
      "ar-LY": "Arabic (Libya)",
      "ar-MA": "Arabic (Morocco)",
      "ar-OM": "Arabic (Oman)",
      "ar-QA": "Arabic (Qatar)",
      "ar-SA": "Arabic (Saudi Arabia)",
      "ar-SY": "Arabic (Syria)",
      "ar-TN": "Arabic (Tunisia)",
      "ar-AE": "Arabic (U.A.E.)",
      "ar-YE": "Arabic (Yemen)",
      an: "Aragonese",
      hy: "Armenian",
      as: "Assamese",
      ast: "Asturian",
      az: "Azerbaijani",
      eu: "Basque",
      be: "Belarusian",
      bn: "Bengali",
      bs: "Bosnian",
      br: "Breton",
      bg: "Bulgarian",
      my: "Burmese",
      ca: "Catalan",
      ch: "Chamorro",
      ce: "Chechen",
      zh: "Chinese",
      "zh-HK": "Chinese (Hong Kong)",
      "zh-CN": "Chinese (PRC)",
      "zh-SG": "Chinese (Singapore)",
      "zh-TW": "Chinese (Taiwan)",
      cv: "Chuvash",
      co: "Corsican",
      cr: "Cree",
      hr: "Croatian",
      cs: "Czech",
      da: "Danish",
      nl: "Dutch (Standard)",
      "nl-BE": "Dutch (Belgian)",
      en: "English",
      "en-AU": "English (Australia)",
      "en-BZ": "English (Belize)",
      "en-CA": "English (Canada)",
      "en-IE": "English (Ireland)",
      "en-JM": "English (Jamaica)",
      "en-NZ": "English (New Zealand)",
      "en-PH": "English (Philippines)",
      "en-ZA": "English (South Africa)",
      "en-TT": "English (Trinidad & Tobago)",
      "en-GB": "English (United Kingdom)",
      "en-US": "English (United States)",
      "en-ZW": "English (Zimbabwe)",
      eo: "Esperanto",
      et: "Estonian",
      fo: "Faeroese",
      fj: "Fijian",
      fi: "Finnish",
      fr: "French (Standard)",
      "fr-BE": "French (Belgium)",
      "fr-CA": "French (Canada)",
      "fr-FR": "French (France)",
      "fr-LU": "French (Luxembourg)",
      "fr-MC": "French (Monaco)",
      "fr-CH": "French (Switzerland)",
      fy: "Frisian",
      fur: "Friulian",
      gd: "Gaelic (Scots)",
      "gd-IE": "Gaelic (Irish)",
      gl: "Galacian",
      ka: "Georgian",
      de: "German (Standard)",
      "de-AT": "German (Austria)",
      "de-DE": "German (Germany)",
      "de-LI": "German (Liechtenstein)",
      "de-LU": "German (Luxembourg)",
      "de-CH": "German (Switzerland)",
      el: "Greek",
      gu: "Gujurati",
      ht: "Haitian",
      he: "Hebrew",
      hi: "Hindi",
      hu: "Hungarian",
      is: "Icelandic",
      id: "Indonesian",
      iu: "Inuktitut",
      ga: "Irish",
      it: "Italian (Standard)",
      "it-CH": "Italian (Switzerland)",
      ja: "Japanese",
      kn: "Kannada",
      ks: "Kashmiri",
      kk: "Kazakh",
      km: "Khmer",
      ky: "Kirghiz",
      tlh: "Klingon",
      ko: "Korean",
      "ko-KP": "Korean (North Korea)",
      "ko-KR": "Korean (South Korea)",
      la: "Latin",
      lv: "Latvian",
      lt: "Lithuanian",
      lb: "Luxembourgish",
      mk: "FYRO Macedonian",
      ms: "Malay",
      ml: "Malayalam",
      mt: "Maltese",
      mi: "Maori",
      mr: "Marathi",
      mo: "Moldavian",
      nv: "Navajo",
      ng: "Ndonga",
      ne: "Nepali",
      no: "Norwegian",
      nb: "Norwegian (Bokmal)",
      nn: "Norwegian (Nynorsk)",
      oc: "Occitan",
      or: "Oriya",
      om: "Oromo",
      fa: "Persian",
      "fa-IR": "Persian/Iran",
      pl: "Polish",
      pt: "Portuguese",
      "pt-BR": "Portuguese (Brazil)",
      pa: "Punjabi",
      "pa-IN": "Punjabi (India)",
      "pa-PK": "Punjabi (Pakistan)",
      qu: "Quechua",
      rm: "Rhaeto-Romanic",
      ro: "Romanian",
      "ro-MO": "Romanian (Moldavia)",
      ru: "Russian",
      "ru-MO": "Russian (Moldavia)",
      sz: "Sami (Lappish)",
      sg: "Sango",
      sa: "Sanskrit",
      sc: "Sardinian",
      sd: "Sindhi",
      si: "Singhalese",
      sr: "Serbian",
      sk: "Slovak",
      sl: "Slovenian",
      so: "Somani",
      sb: "Sorbian",
      es: "Spanish",
      "es-AR": "Spanish (Argentina)",
      "es-BO": "Spanish (Bolivia)",
      "es-CL": "Spanish (Chile)",
      "es-CO": "Spanish (Colombia)",
      "es-CR": "Spanish (Costa Rica)",
      "es-DO": "Spanish (Dominican Republic)",
      "es-EC": "Spanish (Ecuador)",
      "es-SV": "Spanish (El Salvador)",
      "es-GT": "Spanish (Guatemala)",
      "es-HN": "Spanish (Honduras)",
      "es-MX": "Spanish (Mexico)",
      "es-NI": "Spanish (Nicaragua)",
      "es-PA": "Spanish (Panama)",
      "es-PY": "Spanish (Paraguay)",
      "es-PE": "Spanish (Peru)",
      "es-PR": "Spanish (Puerto Rico)",
      "es-ES": "Spanish (Spain)",
      "es-UY": "Spanish (Uruguay)",
      "es-VE": "Spanish (Venezuela)",
      sx: "Sutu",
      sw: "Swahili",
      sv: "Swedish",
      "sv-FI": "Swedish (Finland)",
      "sv-SV": "Swedish (Sweden)",
      ta: "Tamil",
      tt: "Tatar",
      te: "Teluga",
      th: "Thai",
      tig: "Tigre",
      ts: "Tsonga",
      tn: "Tswana",
      tr: "Turkish",
      tk: "Turkmen",
      uk: "Ukrainian",
      hsb: "Upper Sorbian",
      ur: "Urdu",
      ve: "Venda",
      vi: "Vietnamese",
      vo: "Volapuk",
      wa: "Walloon",
      cy: "Welsh",
      xh: "Xhosa",
      ji: "Yiddish",
      zu: "Zulu"
    }[t] && (this.internal.languageSettings.languageCode = t, !1 === this.internal.languageSettings.isSubscribed && (this.internal.events.subscribe("putCatalog", function () {
      this.internal.write("/Lang (" + this.internal.languageSettings.languageCode + ")");
    }), this.internal.languageSettings.isSubscribed = !0)), this;
  },
  /** @license
     * MIT license.
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     *               2014 Diego Casorran, https://github.com/diegocr
     *
     * 
     * ====================================================================
     */
  H = lt.API, W = H.getCharWidthsArray = function (t, e) {
    var n,
        r,
        i,
        o = (e = e || {}).font || this.internal.getFont(),
        a = e.fontSize || this.internal.getFontSize(),
        s = e.charSpace || this.internal.getCharSpace(),
        l = e.widths ? e.widths : o.metadata.Unicode.widths,
        h = l.fof ? l.fof : 1,
        u = e.kerning ? e.kerning : o.metadata.Unicode.kerning,
        c = u.fof ? u.fof : 1,
        f = 0,
        p = l[0] || h,
        d = [];

    for (n = 0, r = t.length; n < r; n++) i = t.charCodeAt(n), "function" == typeof o.metadata.widthOfString ? d.push((o.metadata.widthOfGlyph(o.metadata.characterToGlyph(i)) + s * (1e3 / a) || 0) / 1e3) : d.push((l[i] || p) / h + (u[i] && u[i][f] || 0) / c), f = i;

    return d;
  }, V = H.getArraySum = function (t) {
    for (var e = t.length, n = 0; e;) n += t[--e];

    return n;
  }, G = H.getStringUnitWidth = function (t, e) {
    var n = (e = e || {}).fontSize || this.internal.getFontSize(),
        r = e.font || this.internal.getFont(),
        i = e.charSpace || this.internal.getCharSpace();
    return "function" == typeof r.metadata.widthOfString ? r.metadata.widthOfString(t, n, i) / n : V(W.apply(this, arguments));
  }, Y = function (t, e, n, r) {
    for (var i = [], o = 0, a = t.length, s = 0; o !== a && s + e[o] < n;) s += e[o], o++;

    i.push(t.slice(0, o));
    var l = o;

    for (s = 0; o !== a;) s + e[o] > r && (i.push(t.slice(l, o)), s = 0, l = o), s += e[o], o++;

    return l !== o && i.push(t.slice(l, o)), i;
  }, J = function (t, e, n) {
    n || (n = {});
    var r,
        i,
        o,
        a,
        s,
        l,
        h = [],
        u = [h],
        c = n.textIndent || 0,
        f = 0,
        p = 0,
        d = t.split(" "),
        g = W.apply(this, [" ", n])[0];

    if (l = -1 === n.lineIndent ? d[0].length + 2 : n.lineIndent || 0) {
      var m = Array(l).join(" "),
          y = [];
      d.map(function (t) {
        1 < (t = t.split(/\s*\n/)).length ? y = y.concat(t.map(function (t, e) {
          return (e && t.length ? "\n" : "") + t;
        })) : y.push(t[0]);
      }), d = y, l = G.apply(this, [m, n]);
    }

    for (o = 0, a = d.length; o < a; o++) {
      var v = 0;

      if (r = d[o], l && "\n" == r[0] && (r = r.substr(1), v = 1), i = W.apply(this, [r, n]), e < c + f + (p = V(i)) || v) {
        if (e < p) {
          for (s = Y.apply(this, [r, i, e - (c + f), e]), h.push(s.shift()), h = [s.pop()]; s.length;) u.push([s.shift()]);

          p = V(i.slice(r.length - (h[0] ? h[0].length : 0)));
        } else h = [r];

        u.push(h), c = p + l, f = g;
      } else h.push(r), c += f + p, f = g;
    }

    if (l) var w = function (t, e) {
      return (e ? m : "") + t.join(" ");
    };else w = function (t) {
      return t.join(" ");
    };
    return u.map(w);
  }, H.splitTextToSize = function (t, e, n) {
    var r,
        i = (n = n || {}).fontSize || this.internal.getFontSize(),
        o = function (t) {
      var e = {
        0: 1
      },
          n = {};
      if (t.widths && t.kerning) return {
        widths: t.widths,
        kerning: t.kerning
      };
      var r = this.internal.getFont(t.fontName, t.fontStyle),
          i = "Unicode";
      return r.metadata[i] ? {
        widths: r.metadata[i].widths || e,
        kerning: r.metadata[i].kerning || n
      } : {
        font: r.metadata,
        fontSize: this.internal.getFontSize(),
        charSpace: this.internal.getCharSpace()
      };
    }.call(this, n);

    r = Array.isArray(t) ? t : t.split(/\r?\n/);
    var a = 1 * this.internal.scaleFactor * e / i;
    o.textIndent = n.textIndent ? 1 * n.textIndent * this.internal.scaleFactor / i : 0, o.lineIndent = n.lineIndent;
    var s,
        l,
        h = [];

    for (s = 0, l = r.length; s < l; s++) h = h.concat(J.apply(this, [r[s], a, o]));

    return h;
  },
  /** @license
     jsPDF standard_fonts_metrics plugin
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     * MIT license.
     * 
     * ====================================================================
     */
  X = lt.API, Z = {
    codePages: ["WinAnsiEncoding"],
    WinAnsiEncoding: (K = function (t) {
      for (var e = "klmnopqrstuvwxyz", n = {}, r = 0; r < e.length; r++) n[e[r]] = "0123456789abcdef"[r];

      var i,
          o,
          a,
          s,
          l,
          h = {},
          u = 1,
          c = h,
          f = [],
          p = "",
          d = "",
          g = t.length - 1;

      for (r = 1; r != g;) l = t[r], r += 1, "'" == l ? o = o ? (s = o.join(""), i) : [] : o ? o.push(l) : "{" == l ? (f.push([c, s]), c = {}, s = i) : "}" == l ? ((a = f.pop())[0][a[1]] = c, s = i, c = a[0]) : "-" == l ? u = -1 : s === i ? n.hasOwnProperty(l) ? (p += n[l], s = parseInt(p, 16) * u, u = 1, p = "") : p += l : n.hasOwnProperty(l) ? (d += n[l], c[s] = parseInt(d, 16) * u, u = 1, s = i, d = "") : d += l;

      return h;
    })("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")
  }, Q = {
    Unicode: {
      Courier: Z,
      "Courier-Bold": Z,
      "Courier-BoldOblique": Z,
      "Courier-Oblique": Z,
      Helvetica: Z,
      "Helvetica-Bold": Z,
      "Helvetica-BoldOblique": Z,
      "Helvetica-Oblique": Z,
      "Times-Roman": Z,
      "Times-Bold": Z,
      "Times-BoldItalic": Z,
      "Times-Italic": Z
    }
  }, $ = {
    Unicode: {
      "Courier-Oblique": K("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
      "Times-BoldItalic": K("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"),
      "Helvetica-Bold": K("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),
      Courier: K("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
      "Courier-BoldOblique": K("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
      "Times-Bold": K("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"),
      Symbol: K("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}"),
      Helvetica: K("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"),
      "Helvetica-BoldOblique": K("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),
      ZapfDingbats: K("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}"),
      "Courier-Bold": K("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),
      "Times-Italic": K("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"),
      "Times-Roman": K("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"),
      "Helvetica-Oblique": K("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")
    }
  }, X.events.push(["addFont", function (t) {
    var e,
        n,
        r,
        i = t.font,
        o = "Unicode";
    (e = $[o][i.postScriptName]) && ((n = i.metadata[o] ? i.metadata[o] : i.metadata[o] = {}).widths = e.widths, n.kerning = e.kerning), (r = Q[o][i.postScriptName]) && ((n = i.metadata[o] ? i.metadata[o] : i.metadata[o] = {}).encoding = r).codePages && r.codePages.length && (i.encoding = r.codePages[0]);
  }]),
  /**
     * @license
     * Licensed under the MIT License.
     * http://opensource.org/licenses/mit-license
     */
  tt = lt, "undefined" != typeof self && self || "undefined" != typeof commonjsGlobal && commonjsGlobal || "undefined" != typeof window && window || Function("return this")(), tt.API.events.push(["addFont", function (t) {
    var e = t.font,
        n = t.instance;

    if (void 0 !== n && n.existsFileInVFS(e.postScriptName)) {
      var r = n.getFileFromVFS(e.postScriptName);
      if ("string" != typeof r) throw new Error("Font is not stored as string-data in vFS, import fonts or remove declaration doc.addFont('" + e.postScriptName + "').");
      e.metadata = tt.API.TTFFont.open(e.postScriptName, e.fontName, r, e.encoding), e.metadata.Unicode = e.metadata.Unicode || {
        encoding: {},
        kerning: {},
        widths: []
      }, e.metadata.glyIdsUsed = [0];
    } else if (!1 === e.isStandardFont) throw new Error("Font does not exist in vFS, import fonts or remove declaration doc.addFont('" + e.postScriptName + "').");
  }]), (
  /** @license
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     * 
     * 
     * ====================================================================
     */
  et = lt.API).addSvg = function (t, e, n, r, i) {
    if (void 0 === e || void 0 === n) throw new Error("addSVG needs values for 'x' and 'y'");

    function o(t) {
      for (var e = parseFloat(t[1]), n = parseFloat(t[2]), r = [], i = 3, o = t.length; i < o;) "c" === t[i] ? (r.push([parseFloat(t[i + 1]), parseFloat(t[i + 2]), parseFloat(t[i + 3]), parseFloat(t[i + 4]), parseFloat(t[i + 5]), parseFloat(t[i + 6])]), i += 7) : "l" === t[i] ? (r.push([parseFloat(t[i + 1]), parseFloat(t[i + 2])]), i += 3) : i += 1;

      return [e, n, r];
    }

    var a,
        s,
        l,
        h,
        u,
        c,
        f,
        p,
        d = (h = document, p = h.createElement("iframe"), u = ".jsPDF_sillysvg_iframe {display:none;position:absolute;}", (f = (c = h).createElement("style")).type = "text/css", f.styleSheet ? f.styleSheet.cssText = u : f.appendChild(c.createTextNode(u)), c.getElementsByTagName("head")[0].appendChild(f), p.name = "childframe", p.setAttribute("width", 0), p.setAttribute("height", 0), p.setAttribute("frameborder", "0"), p.setAttribute("scrolling", "no"), p.setAttribute("seamless", "seamless"), p.setAttribute("class", "jsPDF_sillysvg_iframe"), h.body.appendChild(p), p),
        g = (a = t, (l = ((s = d).contentWindow || s.contentDocument).document).write(a), l.close(), l.getElementsByTagName("svg")[0]),
        m = [1, 1],
        y = parseFloat(g.getAttribute("width")),
        v = parseFloat(g.getAttribute("height"));
    y && v && (r && i ? m = [r / y, i / v] : r ? m = [r / y, r / y] : i && (m = [i / v, i / v]));
    var w,
        b,
        x,
        N,
        L = g.childNodes;

    for (w = 0, b = L.length; w < b; w++) (x = L[w]).tagName && "PATH" === x.tagName.toUpperCase() && ((N = o(x.getAttribute("d").split(" ")))[0] = N[0] * m[0] + e, N[1] = N[1] * m[1] + n, this.lines.call(this, N[2], N[0], N[1], m));

    return this;
  }, et.addSVG = et.addSvg, et.addSvgAsImage = function (t, e, n, r, i, o, a, s) {
    if (isNaN(e) || isNaN(n)) throw console.error("jsPDF.addSvgAsImage: Invalid coordinates", arguments), new Error("Invalid coordinates passed to jsPDF.addSvgAsImage");
    if (isNaN(r) || isNaN(i)) throw console.error("jsPDF.addSvgAsImage: Invalid measurements", arguments), new Error("Invalid measurements (width and/or height) passed to jsPDF.addSvgAsImage");
    var l = document.createElement("canvas");
    l.width = r, l.height = i;
    var h = l.getContext("2d");
    return h.fillStyle = "#fff", h.fillRect(0, 0, l.width, l.height), canvg(l, t, {
      ignoreMouse: !0,
      ignoreAnimation: !0,
      ignoreDimensions: !0,
      ignoreClear: !0
    }), this.addImage(l.toDataURL("image/jpeg", 1), e, n, r, i, a, s), this;
  }, lt.API.putTotalPages = function (t) {
    var e,
        n = 0;
    n = parseInt(this.internal.getFont().id.substr(1), 10) < 15 ? (e = new RegExp(t, "g"), this.internal.getNumberOfPages()) : (e = new RegExp(this.pdfEscape16(t, this.internal.getFont()), "g"), this.pdfEscape16(this.internal.getNumberOfPages() + "", this.internal.getFont()));

    for (var r = 1; r <= this.internal.getNumberOfPages(); r++) for (var i = 0; i < this.internal.pages[r].length; i++) this.internal.pages[r][i] = this.internal.pages[r][i].replace(e, n);

    return this;
  }, lt.API.viewerPreferences = function (t, e) {
    var n;
    t = t || {}, e = e || !1;
    var r,
        i,
        o = {
      HideToolbar: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.3
      },
      HideMenubar: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.3
      },
      HideWindowUI: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.3
      },
      FitWindow: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.3
      },
      CenterWindow: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.3
      },
      DisplayDocTitle: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.4
      },
      NonFullScreenPageMode: {
        defaultValue: "UseNone",
        value: "UseNone",
        type: "name",
        explicitSet: !1,
        valueSet: ["UseNone", "UseOutlines", "UseThumbs", "UseOC"],
        pdfVersion: 1.3
      },
      Direction: {
        defaultValue: "L2R",
        value: "L2R",
        type: "name",
        explicitSet: !1,
        valueSet: ["L2R", "R2L"],
        pdfVersion: 1.3
      },
      ViewArea: {
        defaultValue: "CropBox",
        value: "CropBox",
        type: "name",
        explicitSet: !1,
        valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
        pdfVersion: 1.4
      },
      ViewClip: {
        defaultValue: "CropBox",
        value: "CropBox",
        type: "name",
        explicitSet: !1,
        valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
        pdfVersion: 1.4
      },
      PrintArea: {
        defaultValue: "CropBox",
        value: "CropBox",
        type: "name",
        explicitSet: !1,
        valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
        pdfVersion: 1.4
      },
      PrintClip: {
        defaultValue: "CropBox",
        value: "CropBox",
        type: "name",
        explicitSet: !1,
        valueSet: ["MediaBox", "CropBox", "TrimBox", "BleedBox", "ArtBox"],
        pdfVersion: 1.4
      },
      PrintScaling: {
        defaultValue: "AppDefault",
        value: "AppDefault",
        type: "name",
        explicitSet: !1,
        valueSet: ["AppDefault", "None"],
        pdfVersion: 1.6
      },
      Duplex: {
        defaultValue: "",
        value: "none",
        type: "name",
        explicitSet: !1,
        valueSet: ["Simplex", "DuplexFlipShortEdge", "DuplexFlipLongEdge", "none"],
        pdfVersion: 1.7
      },
      PickTrayByPDFSize: {
        defaultValue: !1,
        value: !1,
        type: "boolean",
        explicitSet: !1,
        valueSet: [!0, !1],
        pdfVersion: 1.7
      },
      PrintPageRange: {
        defaultValue: "",
        value: "",
        type: "array",
        explicitSet: !1,
        valueSet: null,
        pdfVersion: 1.7
      },
      NumCopies: {
        defaultValue: 1,
        value: 1,
        type: "integer",
        explicitSet: !1,
        valueSet: null,
        pdfVersion: 1.7
      }
    },
        a = Object.keys(o),
        s = [],
        l = 0,
        h = 0,
        u = 0,
        c = !0;

    function f(t, e) {
      var n,
          r = !1;

      for (n = 0; n < t.length; n += 1) t[n] === e && (r = !0);

      return r;
    }

    if (void 0 === this.internal.viewerpreferences && (this.internal.viewerpreferences = {}, this.internal.viewerpreferences.configuration = JSON.parse(JSON.stringify(o)), this.internal.viewerpreferences.isSubscribed = !1), n = this.internal.viewerpreferences.configuration, "reset" === t || !0 === e) {
      var p = a.length;

      for (u = 0; u < p; u += 1) n[a[u]].value = n[a[u]].defaultValue, n[a[u]].explicitSet = !1;
    }

    if ("object" === se(t)) for (r in t) if (i = t[r], f(a, r) && void 0 !== i) {
      if ("boolean" === n[r].type && "boolean" == typeof i) n[r].value = i;else if ("name" === n[r].type && f(n[r].valueSet, i)) n[r].value = i;else if ("integer" === n[r].type && Number.isInteger(i)) n[r].value = i;else if ("array" === n[r].type) {
        for (l = 0; l < i.length; l += 1) if (c = !0, 1 === i[l].length && "number" == typeof i[l][0]) s.push(String(i[l] - 1));else if (1 < i[l].length) {
          for (h = 0; h < i[l].length; h += 1) "number" != typeof i[l][h] && (c = !1);

          !0 === c && s.push([i[l][0] - 1, i[l][1] - 1].join(" "));
        }

        n[r].value = "[" + s.join(" ") + "]";
      } else n[r].value = n[r].defaultValue;
      n[r].explicitSet = !0;
    }
    return !1 === this.internal.viewerpreferences.isSubscribed && (this.internal.events.subscribe("putCatalog", function () {
      var t,
          e = [];

      for (t in n) !0 === n[t].explicitSet && ("name" === n[t].type ? e.push("/" + t + " /" + n[t].value) : e.push("/" + t + " " + n[t].value));

      0 !== e.length && this.internal.write("/ViewerPreferences\n<<\n" + e.join("\n") + "\n>>");
    }), this.internal.viewerpreferences.isSubscribed = !0), this.internal.viewerpreferences.configuration = n, this;
  },
  /** ==================================================================== 
     * jsPDF XMP metadata plugin
     * Copyright (c) 2016 Jussi Utunen, u-jussi@suomi24.fi
     * 
     * 
     * ====================================================================
     */
  nt = lt.API, ot = it = rt = "", nt.addMetadata = function (t, e) {
    return it = e || "http://jspdf.default.namespaceuri/", rt = t, this.internal.events.subscribe("postPutResources", function () {
      if (rt) {
        var t = '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:jspdf="' + it + '"><jspdf:metadata>',
            e = unescape(encodeURIComponent('<x:xmpmeta xmlns:x="adobe:ns:meta/">')),
            n = unescape(encodeURIComponent(t)),
            r = unescape(encodeURIComponent(rt)),
            i = unescape(encodeURIComponent("</jspdf:metadata></rdf:Description></rdf:RDF>")),
            o = unescape(encodeURIComponent("</x:xmpmeta>")),
            a = n.length + r.length + i.length + e.length + o.length;
        ot = this.internal.newObject(), this.internal.write("<< /Type /Metadata /Subtype /XML /Length " + a + " >>"), this.internal.write("stream"), this.internal.write(e + n + r + i + o), this.internal.write("endstream"), this.internal.write("endobj");
      } else ot = "";
    }), this.internal.events.subscribe("putCatalog", function () {
      ot && this.internal.write("/Metadata " + ot + " 0 R");
    }), this;
  }, function (f, t) {
    var e = f.API;

    var m = e.pdfEscape16 = function (t, e) {
      for (var n, r = e.metadata.Unicode.widths, i = ["", "0", "00", "000", "0000"], o = [""], a = 0, s = t.length; a < s; ++a) {
        if (n = e.metadata.characterToGlyph(t.charCodeAt(a)), e.metadata.glyIdsUsed.push(n), e.metadata.toUnicode[n] = t.charCodeAt(a), -1 == r.indexOf(n) && (r.push(n), r.push([parseInt(e.metadata.widthOfGlyph(n), 10)])), "0" == n) return o.join("");
        n = n.toString(16), o.push(i[4 - n.length], n);
      }

      return o.join("");
    },
        p = function (t) {
      var e, n, r, i, o, a, s;

      for (o = "/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo <<\n  /Registry (Adobe)\n  /Ordering (UCS)\n  /Supplement 0\n>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000><ffff>\nendcodespacerange", r = [], a = 0, s = (n = Object.keys(t).sort(function (t, e) {
        return t - e;
      })).length; a < s; a++) e = n[a], 100 <= r.length && (o += "\n" + r.length + " beginbfchar\n" + r.join("\n") + "\nendbfchar", r = []), i = ("0000" + t[e].toString(16)).slice(-4), e = ("0000" + (+e).toString(16)).slice(-4), r.push("<" + e + "><" + i + ">");

      return r.length && (o += "\n" + r.length + " beginbfchar\n" + r.join("\n") + "\nendbfchar\n"), o += "endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend";
    };

    e.events.push(["putFont", function (t) {
      !function (t, e, n, r) {
        if (t.metadata instanceof f.API.TTFFont && "Identity-H" === t.encoding) {
          for (var i = t.metadata.Unicode.widths, o = t.metadata.subset.encode(t.metadata.glyIdsUsed, 1), a = "", s = 0; s < o.length; s++) a += String.fromCharCode(o[s]);

          var l = n();
          r({
            data: a,
            addLength1: !0
          }), e("endobj");
          var h = n();
          r({
            data: p(t.metadata.toUnicode),
            addLength1: !0
          }), e("endobj");
          var u = n();
          e("<<"), e("/Type /FontDescriptor"), e("/FontName /" + t.fontName), e("/FontFile2 " + l + " 0 R"), e("/FontBBox " + f.API.PDFObject.convert(t.metadata.bbox)), e("/Flags " + t.metadata.flags), e("/StemV " + t.metadata.stemV), e("/ItalicAngle " + t.metadata.italicAngle), e("/Ascent " + t.metadata.ascender), e("/Descent " + t.metadata.decender), e("/CapHeight " + t.metadata.capHeight), e(">>"), e("endobj");
          var c = n();
          e("<<"), e("/Type /Font"), e("/BaseFont /" + t.fontName), e("/FontDescriptor " + u + " 0 R"), e("/W " + f.API.PDFObject.convert(i)), e("/CIDToGIDMap /Identity"), e("/DW 1000"), e("/Subtype /CIDFontType2"), e("/CIDSystemInfo"), e("<<"), e("/Supplement 0"), e("/Registry (Adobe)"), e("/Ordering (" + t.encoding + ")"), e(">>"), e(">>"), e("endobj"), t.objectNumber = n(), e("<<"), e("/Type /Font"), e("/Subtype /Type0"), e("/ToUnicode " + h + " 0 R"), e("/BaseFont /" + t.fontName), e("/Encoding /" + t.encoding), e("/DescendantFonts [" + c + " 0 R]"), e(">>"), e("endobj"), t.isAlreadyPutted = !0;
        }
      }(t.font, t.out, t.newObject, t.putStream);
    }]);
    e.events.push(["putFont", function (t) {
      !function (t, e, n, r) {
        if (t.metadata instanceof f.API.TTFFont && "WinAnsiEncoding" === t.encoding) {
          t.metadata.Unicode.widths;

          for (var i = t.metadata.rawData, o = "", a = 0; a < i.length; a++) o += String.fromCharCode(i[a]);

          var s = n();
          r({
            data: o,
            addLength1: !0
          }), e("endobj");
          var l = n();
          r({
            data: p(t.metadata.toUnicode),
            addLength1: !0
          }), e("endobj");
          var h = n();

          for (e("<<"), e("/Descent " + t.metadata.decender), e("/CapHeight " + t.metadata.capHeight), e("/StemV " + t.metadata.stemV), e("/Type /FontDescriptor"), e("/FontFile2 " + s + " 0 R"), e("/Flags 96"), e("/FontBBox " + f.API.PDFObject.convert(t.metadata.bbox)), e("/FontName /" + t.fontName), e("/ItalicAngle " + t.metadata.italicAngle), e("/Ascent " + t.metadata.ascender), e(">>"), e("endobj"), t.objectNumber = n(), a = 0; a < t.metadata.hmtx.widths.length; a++) t.metadata.hmtx.widths[a] = parseInt(t.metadata.hmtx.widths[a] * (1e3 / t.metadata.head.unitsPerEm));

          e("<</Subtype/TrueType/Type/Font/ToUnicode " + l + " 0 R/BaseFont/" + t.fontName + "/FontDescriptor " + h + " 0 R/Encoding/" + t.encoding + " /FirstChar 29 /LastChar 255 /Widths " + f.API.PDFObject.convert(t.metadata.hmtx.widths) + ">>"), e("endobj"), t.isAlreadyPutted = !0;
        }
      }(t.font, t.out, t.newObject, t.putStream);
    }]);

    var h = function (t) {
      var e,
          n,
          r = t.text || "",
          i = t.x,
          o = t.y,
          a = t.options || {},
          s = t.mutex || {},
          l = s.pdfEscape,
          h = s.activeFontKey,
          u = s.fonts,
          c = (s.activeFontSize, ""),
          f = 0,
          p = "",
          d = u[n = h].encoding;
      if ("Identity-H" !== u[n].encoding) return {
        text: r,
        x: i,
        y: o,
        options: a,
        mutex: s
      };

      for (p = r, n = h, "[object Array]" === Object.prototype.toString.call(r) && (p = r[0]), f = 0; f < p.length; f += 1) u[n].metadata.hasOwnProperty("cmap") && (e = u[n].metadata.cmap.unicode.codeMap[p[f].charCodeAt(0)]), e ? c += p[f] : p[f].charCodeAt(0) < 256 && u[n].metadata.hasOwnProperty("Unicode") ? c += p[f] : c += "";

      var g = "";
      return parseInt(n.slice(1)) < 14 || "WinAnsiEncoding" === d ? g = function (t) {
        for (var e = "", n = 0; n < t.length; n++) e += "" + t.charCodeAt(n).toString(16);

        return e;
      }(l(c, n)) : "Identity-H" === d && (g = m(c, u[n])), s.isHex = !0, {
        text: g,
        x: i,
        y: o,
        options: a,
        mutex: s
      };
    };

    e.events.push(["postProcessText", function (t) {
      var e = t.text || "",
          n = t.x,
          r = t.y,
          i = t.options,
          o = t.mutex,
          a = (i.lang, []),
          s = {
        text: e,
        x: n,
        y: r,
        options: i,
        mutex: o
      };

      if ("[object Array]" === Object.prototype.toString.call(e)) {
        var l = 0;

        for (l = 0; l < e.length; l += 1) "[object Array]" === Object.prototype.toString.call(e[l]) && 3 === e[l].length ? a.push([h(Object.assign({}, s, {
          text: e[l][0]
        })).text, e[l][1], e[l][2]]) : a.push(h(Object.assign({}, s, {
          text: e[l]
        })).text);

        t.text = a;
      } else t.text = h(Object.assign({}, s, {
        text: e
      })).text;
    }]);
  }(lt, "undefined" != typeof self && self || "undefined" != typeof commonjsGlobal && commonjsGlobal || "undefined" != typeof window && window || Function("return this")()), at = lt.API, st = function (t) {
    return void 0 !== t && (void 0 === t.vFS && (t.vFS = {}), !0);
  }, at.existsFileInVFS = function (t) {
    return !!st(this.internal) && void 0 !== this.internal.vFS[t];
  }, at.addFileToVFS = function (t, e) {
    return st(this.internal), this.internal.vFS[t] = e, this;
  }, at.getFileFromVFS = function (t) {
    return st(this.internal), void 0 !== this.internal.vFS[t] ? this.internal.vFS[t] : null;
  }, lt.API.addHTML = function (t, d, g, s, m) {
    if ("undefined" == typeof html2canvas && "undefined" == typeof rasterizeHTML) throw new Error("You need either https://github.com/niklasvh/html2canvas or https://github.com/cburgmer/rasterizeHTML.js");
    "number" != typeof d && (s = d, m = g), "function" == typeof s && (m = s, s = null), "function" != typeof m && (m = function () {});
    var e = this.internal,
        y = e.scaleFactor,
        v = e.pageSize.getWidth(),
        w = e.pageSize.getHeight();
    if ((s = s || {}).onrendered = function (l) {
      d = parseInt(d) || 0, g = parseInt(g) || 0;
      var t = s.dim || {},
          h = Object.assign({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        useFor: "content"
      }, s.margin),
          e = t.h || Math.min(w, l.height / y),
          u = t.w || Math.min(v, l.width / y) - d,
          c = s.format || "JPEG",
          f = s.imageCompression || "SLOW";

      if (l.height > w - h.top - h.bottom && s.pagesplit) {
        var p = function (t, e, n, r, i) {
          var o = document.createElement("canvas");
          o.height = i, o.width = r;
          var a = o.getContext("2d");
          return a.mozImageSmoothingEnabled = !1, a.webkitImageSmoothingEnabled = !1, a.msImageSmoothingEnabled = !1, a.imageSmoothingEnabled = !1, a.fillStyle = s.backgroundColor || "#ffffff", a.fillRect(0, 0, r, i), a.drawImage(t, e, n, r, i, 0, 0, r, i), o;
        },
            n = function () {
          for (var t, e, n = 0, r = 0, i = {}, o = !1;;) {
            var a;
            if (r = 0, i.top = 0 !== n ? h.top : g, i.left = 0 !== n ? h.left : d, o = (v - h.left - h.right) * y < l.width, "content" === h.useFor ? 0 === n ? (t = Math.min((v - h.left) * y, l.width), e = Math.min((w - h.top) * y, l.height - n)) : (t = Math.min(v * y, l.width), e = Math.min(w * y, l.height - n), i.top = 0) : (t = Math.min((v - h.left - h.right) * y, l.width), e = Math.min((w - h.bottom - h.top) * y, l.height - n)), o) for (;;) {
              "content" === h.useFor && (0 === r ? t = Math.min((v - h.left) * y, l.width) : (t = Math.min(v * y, l.width - r), i.left = 0));
              var s = [a = p(l, r, n, t, e), i.left, i.top, a.width / y, a.height / y, c, null, f];
              if (this.addImage.apply(this, s), (r += t) >= l.width) break;
              this.addPage();
            } else s = [a = p(l, 0, n, t, e), i.left, i.top, a.width / y, a.height / y, c, null, f], this.addImage.apply(this, s);
            if ((n += e) >= l.height) break;
            this.addPage();
          }

          m(u, n, null, s);
        }.bind(this);

        if ("CANVAS" === l.nodeName) {
          var r = new Image();
          r.onload = n, r.src = l.toDataURL("image/png"), l = r;
        } else n();
      } else {
        var i = Math.random().toString(35),
            o = [l, d, g, u, e, c, i, f];
        this.addImage.apply(this, o), m(u, e, i, o);
      }
    }.bind(this), "undefined" != typeof html2canvas && !s.rstz) return html2canvas(t, s);
    if ("undefined" == typeof rasterizeHTML) return null;
    var n = "drawDocument";
    return "string" == typeof t && (n = /^http/.test(t) ? "drawURL" : "drawHTML"), s.width = s.width || v * y, rasterizeHTML[n](t, void 0, s).then(function (t) {
      s.onrendered(t.image);
    }, function (t) {
      m(null, t);
    });
  },
  /**
     * jsPDF fromHTML plugin. BETA stage. API subject to change. Needs browser
     * Copyright (c) 2012 Willow Systems Corporation, willow-systems.com
     *               2014 Juan Pablo Gaviria, https://github.com/juanpgaviria
     *               2014 Diego Casorran, https://github.com/diegocr
     *               2014 Daniel Husar, https://github.com/danielhusar
     *               2014 Wolfgang Gassler, https://github.com/woolfg
     *               2014 Steven Spungin, https://github.com/flamenco
     *
     * @license
     * 
     * ====================================================================
     */
  function (t) {
    var P, k, i, a, s, l, h, u, I, w, f, c, p, n, C, B, d, g, m, j;
    P = function () {
      return function (t) {
        return e.prototype = t, new e();
      };

      function e() {}
    }(), w = function (t) {
      var e, n, r, i, o, a, s;

      for (n = 0, r = t.length, e = void 0, a = i = !1; !i && n !== r;) (e = t[n] = t[n].trimLeft()) && (i = !0), n++;

      for (n = r - 1; r && !a && -1 !== n;) (e = t[n] = t[n].trimRight()) && (a = !0), n--;

      for (o = /\s+$/g, s = !0, n = 0; n !== r;) "\u2028" != t[n] && (e = t[n].replace(/\s+/g, " "), s && (e = e.trimLeft()), e && (s = o.test(e)), t[n] = e), n++;

      return t;
    }, c = function (t) {
      var e, n, r;

      for (e = void 0, n = (r = t.split(",")).shift(); !e && n;) e = i[n.trim().toLowerCase()], n = r.shift();

      return e;
    }, p = function (t) {
      var e;
      return -1 < (t = "auto" === t ? "0px" : t).indexOf("em") && !isNaN(Number(t.replace("em", ""))) && (t = 18.719 * Number(t.replace("em", "")) + "px"), -1 < t.indexOf("pt") && !isNaN(Number(t.replace("pt", ""))) && (t = 1.333 * Number(t.replace("pt", "")) + "px"), (e = n[t]) ? e : void 0 !== (e = {
        "xx-small": 9,
        "x-small": 11,
        small: 13,
        medium: 16,
        large: 19,
        "x-large": 23,
        "xx-large": 28,
        auto: 0
      }[t]) ? n[t] = e / 16 : (e = parseFloat(t)) ? n[t] = e / 16 : (e = t.match(/([\d\.]+)(px)/), Array.isArray(e) && 3 === e.length ? n[t] = parseFloat(e[1]) / 16 : n[t] = 1);
    }, I = function (t) {
      var e, n, r, i, o;
      return o = t, i = document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(o, null) : o.currentStyle ? o.currentStyle : o.style, n = void 0, (e = {})["font-family"] = c((r = function (t) {
        return t = t.replace(/-\D/g, function (t) {
          return t.charAt(1).toUpperCase();
        }), i[t];
      })("font-family")) || "times", e["font-style"] = a[r("font-style")] || "normal", e["text-align"] = s[r("text-align")] || "left", "bold" === (n = l[r("font-weight")] || "normal") && ("normal" === e["font-style"] ? e["font-style"] = n : e["font-style"] = n + e["font-style"]), e["font-size"] = p(r("font-size")) || 1, e["line-height"] = p(r("line-height")) || 1, e.display = "inline" === r("display") ? "inline" : "block", n = "block" === e.display, e["margin-top"] = n && p(r("margin-top")) || 0, e["margin-bottom"] = n && p(r("margin-bottom")) || 0, e["padding-top"] = n && p(r("padding-top")) || 0, e["padding-bottom"] = n && p(r("padding-bottom")) || 0, e["margin-left"] = n && p(r("margin-left")) || 0, e["margin-right"] = n && p(r("margin-right")) || 0, e["padding-left"] = n && p(r("padding-left")) || 0, e["padding-right"] = n && p(r("padding-right")) || 0, e["page-break-before"] = r("page-break-before") || "auto", e.float = h[r("cssFloat")] || "none", e.clear = u[r("clear")] || "none", e.color = r("color"), e;
    }, C = function (t, e, n) {
      var r, i, o, a, s;
      if (o = !1, a = i = void 0, r = n["#" + t.id]) if ("function" == typeof r) o = r(t, e);else for (i = 0, a = r.length; !o && i !== a;) o = r[i](t, e), i++;
      if (r = n[t.nodeName], !o && r) if ("function" == typeof r) o = r(t, e);else for (i = 0, a = r.length; !o && i !== a;) o = r[i](t, e), i++;

      for (s = "string" == typeof t.className ? t.className.split(" ") : [], i = 0; i < s.length; i++) if (r = n["." + s[i]], !o && r) if ("function" == typeof r) o = r(t, e);else for (i = 0, a = r.length; !o && i !== a;) o = r[i](t, e), i++;

      return o;
    }, j = function (t, e) {
      var n, r, i, o, a, s, l, h, u;

      for (n = [], r = [], i = 0, u = t.rows[0].cells.length, l = t.clientWidth; i < u;) h = t.rows[0].cells[i], r[i] = {
        name: h.textContent.toLowerCase().replace(/\s+/g, ""),
        prompt: h.textContent.replace(/\r?\n/g, ""),
        width: h.clientWidth / l * e.pdf.internal.pageSize.getWidth()
      }, i++;

      for (i = 1; i < t.rows.length;) {
        for (s = t.rows[i], a = {}, o = 0; o < s.cells.length;) a[r[o].name] = s.cells[o].textContent.replace(/\r?\n/g, ""), o++;

        n.push(a), i++;
      }

      return {
        rows: n,
        headers: r
      };
    };
    var E = {
      SCRIPT: 1,
      STYLE: 1,
      NOSCRIPT: 1,
      OBJECT: 1,
      EMBED: 1,
      SELECT: 1
    },
        M = 1;
    k = function (t, i, e) {
      var n, r, o, a, s, l, h, u;

      for (r = t.childNodes, n = void 0, (s = "block" === (o = I(t)).display) && (i.setBlockBoundary(), i.setBlockStyle(o)), a = 0, l = r.length; a < l;) {
        if ("object" === se(n = r[a])) {
          if (i.executeWatchFunctions(n), 1 === n.nodeType && "HEADER" === n.nodeName) {
            var c = n,
                f = i.pdf.margins_doc.top;
            i.pdf.internal.events.subscribe("addPage", function (t) {
              i.y = f, k(c, i, e), i.pdf.margins_doc.top = i.y + 10, i.y += 10;
            }, !1);
          }

          if (8 === n.nodeType && "#comment" === n.nodeName) ~n.textContent.indexOf("ADD_PAGE") && (i.pdf.addPage(), i.y = i.pdf.margins_doc.top);else if (1 !== n.nodeType || E[n.nodeName]) {
            if (3 === n.nodeType) {
              var p = n.nodeValue;
              if (n.nodeValue && "LI" === n.parentNode.nodeName) if ("OL" === n.parentNode.parentNode.nodeName) p = M++ + ". " + p;else {
                var d = o["font-size"],
                    g = (3 - .75 * d) * i.pdf.internal.scaleFactor,
                    m = .75 * d * i.pdf.internal.scaleFactor,
                    y = 1.74 * d / i.pdf.internal.scaleFactor;

                u = function (t, e) {
                  this.pdf.circle(t + g, e + m, y, "FD");
                };
              }
              16 & n.ownerDocument.body.compareDocumentPosition(n) && i.addText(p, o);
            } else "string" == typeof n && i.addText(n, o);
          } else {
            var v;

            if ("IMG" === n.nodeName) {
              var w = n.getAttribute("src");
              v = B[i.pdf.sHashCode(w) || w];
            }

            if (v) {
              i.pdf.internal.pageSize.getHeight() - i.pdf.margins_doc.bottom < i.y + n.height && i.y > i.pdf.margins_doc.top && (i.pdf.addPage(), i.y = i.pdf.margins_doc.top, i.executeWatchFunctions(n));

              var b = I(n),
                  x = i.x,
                  N = 12 / i.pdf.internal.scaleFactor,
                  L = (b["margin-left"] + b["padding-left"]) * N,
                  A = (b["margin-right"] + b["padding-right"]) * N,
                  S = (b["margin-top"] + b["padding-top"]) * N,
                  _ = (b["margin-bottom"] + b["padding-bottom"]) * N;

              void 0 !== b.float && "right" === b.float ? x += i.settings.width - n.width - A : x += L, i.pdf.addImage(v, x, i.y + S, n.width, n.height), v = void 0, "right" === b.float || "left" === b.float ? (i.watchFunctions.push(function (t, e, n, r) {
                return i.y >= e ? (i.x += t, i.settings.width += n, !0) : !!(r && 1 === r.nodeType && !E[r.nodeName] && i.x + r.width > i.pdf.margins_doc.left + i.pdf.margins_doc.width) && (i.x += t, i.y = e, i.settings.width += n, !0);
              }.bind(this, "left" === b.float ? -n.width - L - A : 0, i.y + n.height + S + _, n.width)), i.watchFunctions.push(function (t, e, n) {
                return !(i.y < t && e === i.pdf.internal.getNumberOfPages()) || 1 === n.nodeType && "both" === I(n).clear && (i.y = t, !0);
              }.bind(this, i.y + n.height, i.pdf.internal.getNumberOfPages())), i.settings.width -= n.width + L + A, "left" === b.float && (i.x += n.width + L + A)) : i.y += n.height + S + _;
            } else if ("TABLE" === n.nodeName) h = j(n, i), i.y += 10, i.pdf.table(i.x, i.y, h.rows, h.headers, {
              autoSize: !1,
              printHeaders: e.printHeaders,
              margins: i.pdf.margins_doc,
              css: I(n)
            }), i.y = i.pdf.lastCellPos.y + i.pdf.lastCellPos.h + 20;else if ("OL" === n.nodeName || "UL" === n.nodeName) M = 1, C(n, i, e) || k(n, i, e), i.y += 10;else if ("LI" === n.nodeName) {
              var F = i.x;
              i.x += 20 / i.pdf.internal.scaleFactor, i.y += 3, C(n, i, e) || k(n, i, e), i.x = F;
            } else "BR" === n.nodeName ? (i.y += o["font-size"] * i.pdf.internal.scaleFactor, i.addText("\u2028", P(o))) : C(n, i, e) || k(n, i, e);
          }
        }

        a++;
      }

      if (e.outY = i.y, s) return i.setBlockBoundary(u);
    }, B = {}, d = function (t, o, e, n) {
      var a,
          r = t.getElementsByTagName("img"),
          i = r.length,
          s = 0;

      function l() {
        o.pdf.internal.events.publish("imagesLoaded"), n(a);
      }

      function h(e, n, r) {
        if (e) {
          var i = new Image();
          a = ++s, i.crossOrigin = "", i.onerror = i.onload = function () {
            if (i.complete && (0 === i.src.indexOf("data:image/") && (i.width = n || i.width || 0, i.height = r || i.height || 0), i.width + i.height)) {
              var t = o.pdf.sHashCode(e) || e;
              B[t] = B[t] || i;
            }

            --s || l();
          }, i.src = e;
        }
      }

      for (; i--;) h(r[i].getAttribute("src"), r[i].width, r[i].height);

      return s || l();
    }, g = function (t, o, a) {
      var s = t.getElementsByTagName("footer");

      if (0 < s.length) {
        s = s[0];
        var e = o.pdf.internal.write,
            n = o.y;
        o.pdf.internal.write = function () {}, k(s, o, a);
        var l = Math.ceil(o.y - n) + 5;
        o.y = n, o.pdf.internal.write = e, o.pdf.margins_doc.bottom += l;

        for (var r = function (t) {
          var e = void 0 !== t ? t.pageNumber : 1,
              n = o.y;
          o.y = o.pdf.internal.pageSize.getHeight() - o.pdf.margins_doc.bottom, o.pdf.margins_doc.bottom -= l;

          for (var r = s.getElementsByTagName("span"), i = 0; i < r.length; ++i) -1 < (" " + r[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" pageCounter ") && (r[i].innerHTML = e), -1 < (" " + r[i].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") && (r[i].innerHTML = "###jsPDFVarTotalPages###");

          k(s, o, a), o.pdf.margins_doc.bottom += l, o.y = n;
        }, i = s.getElementsByTagName("span"), h = 0; h < i.length; ++h) -1 < (" " + i[h].className + " ").replace(/[\n\t]/g, " ").indexOf(" totalPages ") && o.pdf.internal.events.subscribe("htmlRenderingFinished", o.pdf.putTotalPages.bind(o.pdf, "###jsPDFVarTotalPages###"), !0);

        o.pdf.internal.events.subscribe("addPage", r, !1), r(), E.FOOTER = 1;
      }
    }, m = function (t, e, n, r, i, o) {
      if (!e) return !1;
      var a, s, l, h;
      "string" == typeof e || e.parentNode || (e = "" + e.innerHTML), "string" == typeof e && (a = e.replace(/<\/?script[^>]*?>/gi, ""), h = "jsPDFhtmlText" + Date.now().toString() + (1e3 * Math.random()).toFixed(0), (l = document.createElement("div")).style.cssText = "position: absolute !important;clip: rect(1px 1px 1px 1px); /* IE6, IE7 */clip: rect(1px, 1px, 1px, 1px);padding:0 !important;border:0 !important;height: 1px !important;width: 1px !important; top:auto;left:-100px;overflow: hidden;", l.innerHTML = '<iframe style="height:1px;width:1px" name="' + h + '" />', document.body.appendChild(l), (s = window.frames[h]).document.open(), s.document.writeln(a), s.document.close(), e = s.document.body);
      var u,
          c = new f(t, n, r, i);
      return d.call(this, e, c, i.elementHandlers, function (t) {
        g(e, c, i.elementHandlers), k(e, c, i.elementHandlers), c.pdf.internal.events.publish("htmlRenderingFinished"), u = c.dispose(), "function" == typeof o ? o(u) : t && console.error("jsPDF Warning: rendering issues? provide a callback to fromHTML!");
      }), u || {
        x: c.x,
        y: c.y
      };
    }, (f = function (t, e, n, r) {
      return this.pdf = t, this.x = e, this.y = n, this.settings = r, this.watchFunctions = [], this.init(), this;
    }).prototype.init = function () {
      return this.paragraph = {
        text: [],
        style: []
      }, this.pdf.internal.write("q");
    }, f.prototype.dispose = function () {
      return this.pdf.internal.write("Q"), {
        x: this.x,
        y: this.y,
        ready: !0
      };
    }, f.prototype.executeWatchFunctions = function (t) {
      var e = !1,
          n = [];

      if (0 < this.watchFunctions.length) {
        for (var r = 0; r < this.watchFunctions.length; ++r) !0 === this.watchFunctions[r](t) ? e = !0 : n.push(this.watchFunctions[r]);

        this.watchFunctions = n;
      }

      return e;
    }, f.prototype.splitFragmentsIntoLines = function (t, e) {
      var n, r, i, o, a, s, l, h, u, c, f, p, d, g;

      for (c = this.pdf.internal.scaleFactor, o = {}, s = l = h = g = a = i = u = r = void 0, p = [f = []], n = 0, d = this.settings.width; t.length;) if (a = t.shift(), g = e.shift(), a) if ((i = o[(r = g["font-family"]) + (u = g["font-style"])]) || (i = this.pdf.internal.getFont(r, u).metadata.Unicode, o[r + u] = i), h = {
        widths: i.widths,
        kerning: i.kerning,
        fontSize: 12 * g["font-size"],
        textIndent: n
      }, l = this.pdf.getStringUnitWidth(a, h) * h.fontSize / c, "\u2028" == a) f = [], p.push(f);else if (d < n + l) {
        for (s = this.pdf.splitTextToSize(a, d, h), f.push([s.shift(), g]); s.length;) f = [[s.shift(), g]], p.push(f);

        n = this.pdf.getStringUnitWidth(f[0][0], h) * h.fontSize / c;
      } else f.push([a, g]), n += l;

      if (void 0 !== g["text-align"] && ("center" === g["text-align"] || "right" === g["text-align"] || "justify" === g["text-align"])) for (var m = 0; m < p.length; ++m) {
        var y = this.pdf.getStringUnitWidth(p[m][0][0], h) * h.fontSize / c;
        0 < m && (p[m][0][1] = P(p[m][0][1]));
        var v = d - y;
        if ("right" === g["text-align"]) p[m][0][1]["margin-left"] = v;else if ("center" === g["text-align"]) p[m][0][1]["margin-left"] = v / 2;else if ("justify" === g["text-align"]) {
          var w = p[m][0][0].split(" ").length - 1;
          p[m][0][1]["word-spacing"] = v / w, m === p.length - 1 && (p[m][0][1]["word-spacing"] = 0);
        }
      }
      return p;
    }, f.prototype.RenderTextFragment = function (t, e) {
      var n, r;
      r = 0, this.pdf.internal.pageSize.getHeight() - this.pdf.margins_doc.bottom < this.y + this.pdf.internal.getFontSize() && (this.pdf.internal.write("ET", "Q"), this.pdf.addPage(), this.y = this.pdf.margins_doc.top, this.pdf.internal.write("q", "BT", this.getPdfColor(e.color), this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td"), r = Math.max(r, e["line-height"], e["font-size"]), this.pdf.internal.write(0, (-12 * r).toFixed(2), "Td")), n = this.pdf.internal.getFont(e["font-family"], e["font-style"]);
      var i = this.getPdfColor(e.color);
      i !== this.lastTextColor && (this.pdf.internal.write(i), this.lastTextColor = i), void 0 !== e["word-spacing"] && 0 < e["word-spacing"] && this.pdf.internal.write(e["word-spacing"].toFixed(2), "Tw"), this.pdf.internal.write("/" + n.id, (12 * e["font-size"]).toFixed(2), "Tf", "(" + this.pdf.internal.pdfEscape(t) + ") Tj"), void 0 !== e["word-spacing"] && this.pdf.internal.write(0, "Tw");
    }, f.prototype.getPdfColor = function (t) {
      var e,
          n,
          r,
          i = /rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+\s*)\)/.exec(t);
      if (null != i) e = parseInt(i[1]), n = parseInt(i[2]), r = parseInt(i[3]);else {
        if ("string" == typeof t && "#" != t.charAt(0)) {
          var o = new RGBColor(t);
          t = o.ok ? o.toHex() : "#000000";
        }

        e = t.substring(1, 3), e = parseInt(e, 16), n = t.substring(3, 5), n = parseInt(n, 16), r = t.substring(5, 7), r = parseInt(r, 16);
      }

      if ("string" == typeof e && /^#[0-9A-Fa-f]{6}$/.test(e)) {
        var a = parseInt(e.substr(1), 16);
        e = a >> 16 & 255, n = a >> 8 & 255, r = 255 & a;
      }

      var s = this.f3;
      return 0 === e && 0 === n && 0 === r || void 0 === n ? s(e / 255) + " g" : [s(e / 255), s(n / 255), s(r / 255), "rg"].join(" ");
    }, f.prototype.f3 = function (t) {
      return t.toFixed(3);
    }, f.prototype.renderParagraph = function (t) {
      var e, n, r, i, o, a, s, l, h, u, c, f, p;

      if (r = w(this.paragraph.text), f = this.paragraph.style, e = this.paragraph.blockstyle, this.paragraph.priorblockstyle || {}, this.paragraph = {
        text: [],
        style: [],
        blockstyle: {},
        priorblockstyle: e
      }, r.join("").trim()) {
        s = this.splitFragmentsIntoLines(r, f), l = a = void 0, n = 12 / this.pdf.internal.scaleFactor, this.priorMarginBottom = this.priorMarginBottom || 0, c = (Math.max((e["margin-top"] || 0) - this.priorMarginBottom, 0) + (e["padding-top"] || 0)) * n, u = ((e["margin-bottom"] || 0) + (e["padding-bottom"] || 0)) * n, this.priorMarginBottom = e["margin-bottom"] || 0, "always" === e["page-break-before"] && (this.pdf.addPage(), this.y = 0, c = ((e["margin-top"] || 0) + (e["padding-top"] || 0)) * n), h = this.pdf.internal.write, o = i = void 0, this.y += c, h("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");

        for (var d = 0; s.length;) {
          for (i = l = 0, o = (a = s.shift()).length; i !== o;) a[i][0].trim() && (l = Math.max(l, a[i][1]["line-height"], a[i][1]["font-size"]), p = 7 * a[i][1]["font-size"]), i++;

          var g = 0,
              m = 0;

          for (void 0 !== a[0][1]["margin-left"] && 0 < a[0][1]["margin-left"] && (g = (m = this.pdf.internal.getCoordinateString(a[0][1]["margin-left"])) - d, d = m), h(g + Math.max(e["margin-left"] || 0, 0) * n, (-12 * l).toFixed(2), "Td"), i = 0, o = a.length; i !== o;) a[i][0] && this.RenderTextFragment(a[i][0], a[i][1]), i++;

          if (this.y += l * n, this.executeWatchFunctions(a[0][1]) && 0 < s.length) {
            var y = [],
                v = [];
            s.forEach(function (t) {
              for (var e = 0, n = t.length; e !== n;) t[e][0] && (y.push(t[e][0] + " "), v.push(t[e][1])), ++e;
            }), s = this.splitFragmentsIntoLines(w(y), v), h("ET", "Q"), h("q", "BT 0 g", this.pdf.internal.getCoordinateString(this.x), this.pdf.internal.getVerticalCoordinateString(this.y), "Td");
          }
        }

        return t && "function" == typeof t && t.call(this, this.x - 9, this.y - p / 2), h("ET", "Q"), this.y += u;
      }
    }, f.prototype.setBlockBoundary = function (t) {
      return this.renderParagraph(t);
    }, f.prototype.setBlockStyle = function (t) {
      return this.paragraph.blockstyle = t;
    }, f.prototype.addText = function (t, e) {
      return this.paragraph.text.push(t), this.paragraph.style.push(e);
    }, i = {
      helvetica: "helvetica",
      "sans-serif": "helvetica",
      "times new roman": "times",
      serif: "times",
      times: "times",
      monospace: "courier",
      courier: "courier"
    }, l = {
      100: "normal",
      200: "normal",
      300: "normal",
      400: "normal",
      500: "bold",
      600: "bold",
      700: "bold",
      800: "bold",
      900: "bold",
      normal: "normal",
      bold: "bold",
      bolder: "bold",
      lighter: "normal"
    }, a = {
      normal: "normal",
      italic: "italic",
      oblique: "italic"
    }, s = {
      left: "left",
      right: "right",
      center: "center",
      justify: "justify"
    }, h = {
      none: "none",
      right: "right",
      left: "left"
    }, u = {
      none: "none",
      both: "both"
    }, n = {
      normal: 1
    }, t.fromHTML = function (t, e, n, r, i, o) {
      return this.margins_doc = o || {
        top: 0,
        bottom: 0
      }, r || (r = {}), r.elementHandlers || (r.elementHandlers = {}), m(this, t, isNaN(e) ? 4 : e, isNaN(n) ? 4 : n, r, i);
    };
  }(lt.API), ("undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal).html2pdf = function (t, a, e) {
    var n = a.canvas;

    if (n) {
      var r, i;

      if ((n.pdf = a).annotations = {
        _nameMap: [],
        createAnnotation: function (t, e) {
          var n,
              r = a.context2d._wrapX(e.left),
              i = a.context2d._wrapY(e.top),
              o = (a.context2d._page(e.top), t.indexOf("#"));

          n = 0 <= o ? {
            name: t.substring(o + 1)
          } : {
            url: t
          }, a.link(r, i, e.right - e.left, e.bottom - e.top, n);
        },
        setName: function (t, e) {
          var n = a.context2d._wrapX(e.left),
              r = a.context2d._wrapY(e.top),
              i = a.context2d._page(e.top);

          this._nameMap[t] = {
            page: i,
            x: n,
            y: r
          };
        }
      }, n.annotations = a.annotations, a.context2d._pageBreakAt = function (t) {
        this.pageBreaks.push(t);
      }, a.context2d._gotoPage = function (t) {
        for (; a.internal.getNumberOfPages() < t;) a.addPage();

        a.setPage(t);
      }, "string" == typeof t) {
        t = t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
        var o,
            s,
            l = document.createElement("iframe");
        document.body.appendChild(l), null != (o = l.contentDocument) && null != o || (o = l.contentWindow.document), o.open(), o.write(t), o.close(), r = o.body, s = o.body || {}, t = o.documentElement || {}, i = Math.max(s.scrollHeight, s.offsetHeight, t.clientHeight, t.scrollHeight, t.offsetHeight);
      } else s = (r = t).body || {}, i = Math.max(s.scrollHeight, s.offsetHeight, t.clientHeight, t.scrollHeight, t.offsetHeight);

      var h = {
        async: !0,
        allowTaint: !0,
        backgroundColor: "#ffffff",
        canvas: n,
        imageTimeout: 15e3,
        logging: !0,
        proxy: null,
        removeContainer: !0,
        foreignObjectRendering: !1,
        useCORS: !1,
        windowHeight: i = a.internal.pageSize.getHeight(),
        scrollY: i
      };
      a.context2d.pageWrapYEnabled = !0, a.context2d.pageWrapY = a.internal.pageSize.getHeight(), html2canvas(r, h).then(function (t) {
        e && (l && l.parentElement.removeChild(l), e(a));
      });
    } else alert("jsPDF canvas plugin not installed");
  }, window.tmp = html2pdf, function (f) {
    var r = f.BlobBuilder || f.WebKitBlobBuilder || f.MSBlobBuilder || f.MozBlobBuilder;

    f.URL = f.URL || f.webkitURL || function (t, e) {
      return (e = document.createElement("a")).href = t, e;
    };

    var n = f.Blob,
        p = URL.createObjectURL,
        d = URL.revokeObjectURL,
        o = f.Symbol && f.Symbol.toStringTag,
        t = !1,
        e = !1,
        g = !!f.ArrayBuffer,
        i = r && r.prototype.append && r.prototype.getBlob;

    try {
      t = 2 === new Blob(["ä"]).size, e = 2 === new Blob([new Uint8Array([1, 2])]).size;
    } catch (t) {}

    function a(t) {
      return t.map(function (t) {
        if (t.buffer instanceof ArrayBuffer) {
          var e = t.buffer;

          if (t.byteLength !== e.byteLength) {
            var n = new Uint8Array(t.byteLength);
            n.set(new Uint8Array(e, t.byteOffset, t.byteLength)), e = n.buffer;
          }

          return e;
        }

        return t;
      });
    }

    function s(t, e) {
      e = e || {};
      var n = new r();
      return a(t).forEach(function (t) {
        n.append(t);
      }), e.type ? n.getBlob(e.type) : n.getBlob();
    }

    function l(t, e) {
      return new n(a(t), e || {});
    }

    if (f.Blob && (s.prototype = Blob.prototype, l.prototype = Blob.prototype), o) try {
      File.prototype[o] = "File", Blob.prototype[o] = "Blob", FileReader.prototype[o] = "FileReader";
    } catch (t) {}

    function h() {
      var t = !!f.ActiveXObject || "-ms-scroll-limit" in document.documentElement.style && "-ms-ime-align" in document.documentElement.style,
          e = f.XMLHttpRequest && f.XMLHttpRequest.prototype.send;
      t && e && (XMLHttpRequest.prototype.send = function (t) {
        t instanceof Blob && this.setRequestHeader("Content-Type", t.type), e.call(this, t);
      });

      try {
        new File([], "");
      } catch (t) {
        try {
          var n = new Function('class File extends Blob {constructor(chunks, name, opts) {opts = opts || {};super(chunks, opts || {});this.name = name;this.lastModifiedDate = opts.lastModified ? new Date(opts.lastModified) : new Date;this.lastModified = +this.lastModifiedDate;}};return new File([], ""), File')();
          f.File = n;
        } catch (t) {
          n = function (t, e, n) {
            var r = new Blob(t, n),
                i = n && void 0 !== n.lastModified ? new Date(n.lastModified) : new Date();
            return r.name = e, r.lastModifiedDate = i, r.lastModified = +i, r.toString = function () {
              return "[object File]";
            }, o && (r[o] = "File"), r;
          };

          f.File = n;
        }
      }
    }

    t ? (h(), f.Blob = e ? f.Blob : l) : i ? (h(), f.Blob = s) : function () {
      function a(t) {
        for (var e = [], n = 0; n < t.length; n++) {
          var r = t.charCodeAt(n);
          r < 128 ? e.push(r) : r < 2048 ? e.push(192 | r >> 6, 128 | 63 & r) : r < 55296 || 57344 <= r ? e.push(224 | r >> 12, 128 | r >> 6 & 63, 128 | 63 & r) : (n++, r = 65536 + ((1023 & r) << 10 | 1023 & t.charCodeAt(n)), e.push(240 | r >> 18, 128 | r >> 12 & 63, 128 | r >> 6 & 63, 128 | 63 & r));
        }

        return e;
      }

      function e(t) {
        var e, n, r, i, o, a;

        for (e = "", r = t.length, n = 0; n < r;) switch ((i = t[n++]) >> 4) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            e += String.fromCharCode(i);
            break;

          case 12:
          case 13:
            o = t[n++], e += String.fromCharCode((31 & i) << 6 | 63 & o);
            break;

          case 14:
            o = t[n++], a = t[n++], e += String.fromCharCode((15 & i) << 12 | (63 & o) << 6 | (63 & a) << 0);
        }

        return e;
      }

      function s(t) {
        for (var e = new Array(t.byteLength), n = new Uint8Array(t), r = e.length; r--;) e[r] = n[r];

        return e;
      }

      function n(t) {
        for (var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = [], r = 0; r < t.length; r += 3) {
          var i = t[r],
              o = r + 1 < t.length,
              a = o ? t[r + 1] : 0,
              s = r + 2 < t.length,
              l = s ? t[r + 2] : 0,
              h = i >> 2,
              u = (3 & i) << 4 | a >> 4,
              c = (15 & a) << 2 | l >> 6,
              f = 63 & l;
          s || (f = 64, o || (c = 64)), n.push(e[h], e[u], e[c], e[f]);
        }

        return n.join("");
      }

      var t = Object.create || function (t) {
        function e() {}

        return e.prototype = t, new e();
      };

      if (g) var r = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"],
          l = ArrayBuffer.isView || function (t) {
        return t && -1 < r.indexOf(Object.prototype.toString.call(t));
      };

      function h(t, e) {
        for (var n = 0, r = (t = t || []).length; n < r; n++) {
          var i = t[n];
          i instanceof h ? t[n] = i._buffer : "string" == typeof i ? t[n] = a(i) : g && (ArrayBuffer.prototype.isPrototypeOf(i) || l(i)) ? t[n] = s(i) : g && (o = i) && DataView.prototype.isPrototypeOf(o) ? t[n] = s(i.buffer) : t[n] = a(String(i));
        }

        var o;
        this._buffer = [].concat.apply([], t), this.size = this._buffer.length, this.type = e && e.type || "";
      }

      function i(t, e, n) {
        var r = h.call(this, t, n = n || {}) || this;
        return r.name = e, r.lastModifiedDate = n.lastModified ? new Date(n.lastModified) : new Date(), r.lastModified = +r.lastModifiedDate, r;
      }

      if (h.prototype.slice = function (t, e, n) {
        return new h([this._buffer.slice(t || 0, e || this._buffer.length)], {
          type: n
        });
      }, h.prototype.toString = function () {
        return "[object Blob]";
      }, (i.prototype = t(h.prototype)).constructor = i, Object.setPrototypeOf) Object.setPrototypeOf(i, h);else try {
        i.__proto__ = h;
      } catch (t) {}

      function o() {
        if (!(this instanceof o)) throw new TypeError("Failed to construct 'FileReader': Please use the 'new' operator, this DOM object constructor cannot be called as a function.");
        var n = document.createDocumentFragment();
        this.addEventListener = n.addEventListener, this.dispatchEvent = function (t) {
          var e = this["on" + t.type];
          "function" == typeof e && e(t), n.dispatchEvent(t);
        }, this.removeEventListener = n.removeEventListener;
      }

      function u(t, e, n) {
        if (!(e instanceof h)) throw new TypeError("Failed to execute '" + n + "' on 'FileReader': parameter 1 is not of type 'Blob'.");
        t.result = "", setTimeout(function () {
          this.readyState = o.LOADING, t.dispatchEvent(new Event("load")), t.dispatchEvent(new Event("loadend"));
        });
      }

      i.prototype.toString = function () {
        return "[object File]";
      }, o.EMPTY = 0, o.LOADING = 1, o.DONE = 2, o.prototype.error = null, o.prototype.onabort = null, o.prototype.onerror = null, o.prototype.onload = null, o.prototype.onloadend = null, o.prototype.onloadstart = null, o.prototype.onprogress = null, o.prototype.readAsDataURL = function (t) {
        u(this, t, "readAsDataURL"), this.result = "data:" + t.type + ";base64," + n(t._buffer);
      }, o.prototype.readAsText = function (t) {
        u(this, t, "readAsText"), this.result = e(t._buffer);
      }, o.prototype.readAsArrayBuffer = function (t) {
        u(this, t, "readAsText"), this.result = t._buffer.slice();
      }, o.prototype.abort = function () {}, URL.createObjectURL = function (t) {
        return t instanceof h ? "data:" + t.type + ";base64," + n(t._buffer) : p.call(URL, t);
      }, URL.revokeObjectURL = function (t) {
        d && d.call(URL, t);
      };
      var c = f.XMLHttpRequest && f.XMLHttpRequest.prototype.send;
      c && (XMLHttpRequest.prototype.send = function (t) {
        t instanceof h ? (this.setRequestHeader("Content-Type", t.type), c.call(this, e(t._buffer))) : c.call(this, t);
      }), f.FileReader = o, f.File = i, f.Blob = h;
    }();
  }("undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")());

  var ht,
      ut,
      ct,
      ft,
      pt,
      dt,
      gt,
      mt,
      yt,
      vt,
      wt,
      bt,
      xt,
      Nt,
      Lt,
      le = le || function (s) {
    if (!(void 0 === s || "undefined" != typeof navigator && /MSIE [1-9]\./.test(navigator.userAgent))) {
      var t = s.document,
          l = function () {
        return s.URL || s.webkitURL || s;
      },
          h = t.createElementNS("http://www.w3.org/1999/xhtml", "a"),
          u = ("download" in h),
          c = /constructor/i.test(s.HTMLElement) || s.safari,
          f = /CriOS\/[\d]+/.test(navigator.userAgent),
          p = s.setImmediate || s.setTimeout,
          d = function (t) {
        p(function () {
          throw t;
        }, 0);
      },
          g = function (t) {
        setTimeout(function () {
          "string" == typeof t ? l().revokeObjectURL(t) : t.remove();
        }, 4e4);
      },
          m = function (t) {
        return /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type) ? new Blob([String.fromCharCode(65279), t], {
          type: t.type
        }) : t;
      },
          r = function (t, n, e) {
        e || (t = m(t));

        var r,
            i = this,
            o = "application/octet-stream" === t.type,
            a = function () {
          !function (t, e, n) {
            for (var r = (e = [].concat(e)).length; r--;) {
              var i = t["on" + e[r]];
              if ("function" == typeof i) try {
                i.call(t, n || t);
              } catch (t) {
                d(t);
              }
            }
          }(i, "writestart progress write writeend".split(" "));
        };

        if (i.readyState = i.INIT, u) return r = l().createObjectURL(t), void p(function () {
          var t, e;
          h.href = r, h.download = n, t = h, e = new MouseEvent("click"), t.dispatchEvent(e), a(), g(r), i.readyState = i.DONE;
        }, 0);
        !function () {
          if ((f || o && c) && s.FileReader) {
            var e = new FileReader();
            return e.onloadend = function () {
              var t = f ? e.result : e.result.replace(/^data:[^;]*;/, "data:attachment/file;");
              s.open(t, "_blank") || (s.location.href = t), t = void 0, i.readyState = i.DONE, a();
            }, e.readAsDataURL(t), i.readyState = i.INIT;
          }

          r || (r = l().createObjectURL(t)), o ? s.location.href = r : s.open(r, "_blank") || (s.location.href = r);
          i.readyState = i.DONE, a(), g(r);
        }();
      },
          e = r.prototype;

      return "undefined" != typeof navigator && navigator.msSaveOrOpenBlob ? function (t, e, n) {
        return e = e || t.name || "download", n || (t = m(t)), navigator.msSaveOrOpenBlob(t, e);
      } : (e.abort = function () {}, e.readyState = e.INIT = 0, e.WRITING = 1, e.DONE = 2, e.error = e.onwritestart = e.onprogress = e.onwrite = e.onabort = e.onerror = e.onwriteend = null, function (t, e, n) {
        return new r(t, e || t.name || "download", n);
      });
    }
  }("undefined" != typeof self && self || "undefined" != typeof window && window || void 0);

  function At(x) {
    var t = 0;
    if (71 !== x[t++] || 73 !== x[t++] || 70 !== x[t++] || 56 !== x[t++] || 56 != (x[t++] + 1 & 253) || 97 !== x[t++]) throw "Invalid GIF 87a/89a header.";
    var N = x[t++] | x[t++] << 8,
        e = x[t++] | x[t++] << 8,
        n = x[t++],
        r = n >> 7,
        i = 1 << (7 & n) + 1;
    x[t++];
    x[t++];
    var o = null;
    r && (o = t, t += 3 * i);
    var a = !0,
        s = [],
        l = 0,
        h = null,
        u = 0,
        c = null;

    for (this.width = N, this.height = e; a && t < x.length;) switch (x[t++]) {
      case 33:
        switch (x[t++]) {
          case 255:
            if (11 !== x[t] || 78 == x[t + 1] && 69 == x[t + 2] && 84 == x[t + 3] && 83 == x[t + 4] && 67 == x[t + 5] && 65 == x[t + 6] && 80 == x[t + 7] && 69 == x[t + 8] && 50 == x[t + 9] && 46 == x[t + 10] && 48 == x[t + 11] && 3 == x[t + 12] && 1 == x[t + 13] && 0 == x[t + 16]) t += 14, c = x[t++] | x[t++] << 8, t++;else for (t += 12;;) {
              if (0 === (A = x[t++])) break;
              t += A;
            }
            break;

          case 249:
            if (4 !== x[t++] || 0 !== x[t + 4]) throw "Invalid graphics extension block.";
            var f = x[t++];
            l = x[t++] | x[t++] << 8, h = x[t++], 0 == (1 & f) && (h = null), u = f >> 2 & 7, t++;
            break;

          case 254:
            for (;;) {
              if (0 === (A = x[t++])) break;
              t += A;
            }

            break;

          default:
            throw "Unknown graphic control label: 0x" + x[t - 1].toString(16);
        }

        break;

      case 44:
        var p = x[t++] | x[t++] << 8,
            d = x[t++] | x[t++] << 8,
            g = x[t++] | x[t++] << 8,
            m = x[t++] | x[t++] << 8,
            y = x[t++],
            v = y >> 6 & 1,
            w = o,
            b = !1;

        if (y >> 7) {
          b = !0;
          w = t, t += 3 * (1 << (7 & y) + 1);
        }

        var L = t;

        for (t++;;) {
          var A;
          if (0 === (A = x[t++])) break;
          t += A;
        }

        s.push({
          x: p,
          y: d,
          width: g,
          height: m,
          has_local_palette: b,
          palette_offset: w,
          data_offset: L,
          data_length: t - L,
          transparent_index: h,
          interlaced: !!v,
          delay: l,
          disposal: u
        });
        break;

      case 59:
        a = !1;
        break;

      default:
        throw "Unknown gif block: 0x" + x[t - 1].toString(16);
    }

    this.numFrames = function () {
      return s.length;
    }, this.loopCount = function () {
      return c;
    }, this.frameInfo = function (t) {
      if (t < 0 || t >= s.length) throw "Frame index out of range.";
      return s[t];
    }, this.decodeAndBlitFrameBGRA = function (t, e) {
      var n = this.frameInfo(t),
          r = n.width * n.height,
          i = new Uint8Array(r);
      St(x, n.data_offset, i, r);
      var o = n.palette_offset,
          a = n.transparent_index;
      null === a && (a = 256);
      var s = n.width,
          l = N - s,
          h = s,
          u = 4 * (n.y * N + n.x),
          c = 4 * ((n.y + n.height) * N + n.x),
          f = u,
          p = 4 * l;
      !0 === n.interlaced && (p += 4 * (s + l) * 7);

      for (var d = 8, g = 0, m = i.length; g < m; ++g) {
        var y = i[g];
        if (0 === h && (h = s, c <= (f += p) && (p = l + 4 * (s + l) * (d - 1), f = u + (s + l) * (d << 1), d >>= 1)), y === a) f += 4;else {
          var v = x[o + 3 * y],
              w = x[o + 3 * y + 1],
              b = x[o + 3 * y + 2];
          e[f++] = b, e[f++] = w, e[f++] = v, e[f++] = 255;
        }
        --h;
      }
    }, this.decodeAndBlitFrameRGBA = function (t, e) {
      var n = this.frameInfo(t),
          r = n.width * n.height,
          i = new Uint8Array(r);
      St(x, n.data_offset, i, r);
      var o = n.palette_offset,
          a = n.transparent_index;
      null === a && (a = 256);
      var s = n.width,
          l = N - s,
          h = s,
          u = 4 * (n.y * N + n.x),
          c = 4 * ((n.y + n.height) * N + n.x),
          f = u,
          p = 4 * l;
      !0 === n.interlaced && (p += 4 * (s + l) * 7);

      for (var d = 8, g = 0, m = i.length; g < m; ++g) {
        var y = i[g];
        if (0 === h && (h = s, c <= (f += p) && (p = l + 4 * (s + l) * (d - 1), f = u + (s + l) * (d << 1), d >>= 1)), y === a) f += 4;else {
          var v = x[o + 3 * y],
              w = x[o + 3 * y + 1],
              b = x[o + 3 * y + 2];
          e[f++] = v, e[f++] = w, e[f++] = b, e[f++] = 255;
        }
        --h;
      }
    };
  }

  function St(t, e, n, r) {
    for (var i = t[e++], o = 1 << i, a = o + 1, s = a + 1, l = i + 1, h = (1 << l) - 1, u = 0, c = 0, f = 0, p = t[e++], d = new Int32Array(4096), g = null;;) {
      for (; u < 16 && 0 !== p;) c |= t[e++] << u, u += 8, 1 === p ? p = t[e++] : --p;

      if (u < l) break;
      var m = c & h;

      if (c >>= l, u -= l, m !== o) {
        if (m === a) break;

        for (var y = m < s ? m : g, v = 0, w = y; o < w;) w = d[w] >> 8, ++v;

        var b = w;
        if (r < f + v + (y !== m ? 1 : 0)) return void console.log("Warning, gif stream longer than expected.");
        n[f++] = b;
        var x = f += v;

        for (y !== m && (n[f++] = b), w = y; v--;) w = d[w], n[--x] = 255 & w, w >>= 8;

        null !== g && s < 4096 && (d[s++] = g << 8 | b, h + 1 <= s && l < 12 && (++l, h = h << 1 | 1)), g = m;
      } else s = a + 1, h = (1 << (l = i + 1)) - 1, g = null;
    }

    return f !== r && console.log("Warning, gif stream shorter than expected."), n;
  }

  try {
    exports.GifWriter = function (y, t, e, n) {
      var v = 0,
          r = void 0 === (n = void 0 === n ? {} : n).loop ? null : n.loop,
          w = void 0 === n.palette ? null : n.palette;
      if (t <= 0 || e <= 0 || 65535 < t || 65535 < e) throw "Width/Height invalid.";

      function b(t) {
        var e = t.length;
        if (e < 2 || 256 < e || e & e - 1) throw "Invalid code/color length, must be power of 2 and 2 .. 256.";
        return e;
      }

      y[v++] = 71, y[v++] = 73, y[v++] = 70, y[v++] = 56, y[v++] = 57, y[v++] = 97;
      var i = 0,
          o = 0;

      if (null !== w) {
        for (var a = b(w); a >>= 1;) ++i;

        if (a = 1 << i, --i, void 0 !== n.background) {
          if (a <= (o = n.background)) throw "Background index out of range.";
          if (0 === o) throw "Background index explicitly passed as 0.";
        }
      }

      if (y[v++] = 255 & t, y[v++] = t >> 8 & 255, y[v++] = 255 & e, y[v++] = e >> 8 & 255, y[v++] = (null !== w ? 128 : 0) | i, y[v++] = o, y[v++] = 0, null !== w) for (var s = 0, l = w.length; s < l; ++s) {
        var h = w[s];
        y[v++] = h >> 16 & 255, y[v++] = h >> 8 & 255, y[v++] = 255 & h;
      }

      if (null !== r) {
        if (r < 0 || 65535 < r) throw "Loop count invalid.";
        y[v++] = 33, y[v++] = 255, y[v++] = 11, y[v++] = 78, y[v++] = 69, y[v++] = 84, y[v++] = 83, y[v++] = 67, y[v++] = 65, y[v++] = 80, y[v++] = 69, y[v++] = 50, y[v++] = 46, y[v++] = 48, y[v++] = 3, y[v++] = 1, y[v++] = 255 & r, y[v++] = r >> 8 & 255, y[v++] = 0;
      }

      var x = !1;
      this.addFrame = function (t, e, n, r, i, o) {
        if (!0 === x && (--v, x = !1), o = void 0 === o ? {} : o, t < 0 || e < 0 || 65535 < t || 65535 < e) throw "x/y invalid.";
        if (n <= 0 || r <= 0 || 65535 < n || 65535 < r) throw "Width/Height invalid.";
        if (i.length < n * r) throw "Not enough pixels for the frame size.";
        var a = !0,
            s = o.palette;
        if (null == s && (a = !1, s = w), null == s) throw "Must supply either a local or global palette.";

        for (var l = b(s), h = 0; l >>= 1;) ++h;

        l = 1 << h;
        var u = void 0 === o.delay ? 0 : o.delay,
            c = void 0 === o.disposal ? 0 : o.disposal;
        if (c < 0 || 3 < c) throw "Disposal out of range.";
        var f = !1,
            p = 0;
        if (void 0 !== o.transparent && null !== o.transparent && (f = !0, (p = o.transparent) < 0 || l <= p)) throw "Transparent color index.";
        if ((0 !== c || f || 0 !== u) && (y[v++] = 33, y[v++] = 249, y[v++] = 4, y[v++] = c << 2 | (!0 === f ? 1 : 0), y[v++] = 255 & u, y[v++] = u >> 8 & 255, y[v++] = p, y[v++] = 0), y[v++] = 44, y[v++] = 255 & t, y[v++] = t >> 8 & 255, y[v++] = 255 & e, y[v++] = e >> 8 & 255, y[v++] = 255 & n, y[v++] = n >> 8 & 255, y[v++] = 255 & r, y[v++] = r >> 8 & 255, y[v++] = !0 === a ? 128 | h - 1 : 0, !0 === a) for (var d = 0, g = s.length; d < g; ++d) {
          var m = s[d];
          y[v++] = m >> 16 & 255, y[v++] = m >> 8 & 255, y[v++] = 255 & m;
        }

        v = function (e, n, t, r) {
          e[n++] = t;
          var i = n++,
              o = 1 << t,
              a = o - 1,
              s = o + 1,
              l = s + 1,
              h = t + 1,
              u = 0,
              c = 0;

          function f(t) {
            for (; t <= u;) e[n++] = 255 & c, c >>= 8, u -= 8, n === i + 256 && (e[i] = 255, i = n++);
          }

          function p(t) {
            c |= t << u, u += h, f(8);
          }

          var d = r[0] & a,
              g = {};
          p(o);

          for (var m = 1, y = r.length; m < y; ++m) {
            var v = r[m] & a,
                w = d << 8 | v,
                b = g[w];

            if (void 0 === b) {
              for (c |= d << u, u += h; 8 <= u;) e[n++] = 255 & c, c >>= 8, u -= 8, n === i + 256 && (e[i] = 255, i = n++);

              4096 === l ? (p(o), l = s + 1, h = t + 1, g = {}) : (1 << h <= l && ++h, g[w] = l++), d = v;
            } else d = b;
          }

          return p(d), p(s), f(1), i + 1 === n ? e[i] = 0 : (e[i] = n - i - 1, e[n++] = 0), n;
        }(y, v, h < 2 ? 2 : h, i);
      }, this.end = function () {
        return !1 === x && (y[v++] = 59, x = !0), v;
      };
    }, exports.GifReader = At;
  } catch (t) {}
  /*
      Copyright (c) 2008, Adobe Systems Incorporated
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without 
      modification, are permitted provided that the following conditions are
      met:
  
      * Redistributions of source code must retain the above copyright notice, 
        this list of conditions and the following disclaimer.
      
      * Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the 
        documentation and/or other materials provided with the distribution.
      
      * Neither the name of Adobe Systems Incorporated nor the names of its 
        contributors may be used to endorse or promote products derived from 
        this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
      IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
      THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
      PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
      CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
      EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
      PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
      PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
      LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
      SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
    */


  function _t(t) {
    var N,
        L,
        A,
        S,
        e,
        c = Math.floor,
        _ = new Array(64),
        F = new Array(64),
        P = new Array(64),
        k = new Array(64),
        y = new Array(65535),
        v = new Array(65535),
        Z = new Array(64),
        w = new Array(64),
        I = [],
        C = 0,
        B = 7,
        j = new Array(64),
        E = new Array(64),
        M = new Array(64),
        n = new Array(256),
        O = new Array(2048),
        b = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63],
        q = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        T = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        R = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 125],
        D = [1, 2, 3, 0, 4, 17, 5, 18, 33, 49, 65, 6, 19, 81, 97, 7, 34, 113, 20, 50, 129, 145, 161, 8, 35, 66, 177, 193, 21, 82, 209, 240, 36, 51, 98, 114, 130, 9, 10, 22, 23, 24, 25, 26, 37, 38, 39, 40, 41, 42, 52, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
        U = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        z = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        H = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 119],
        W = [0, 1, 2, 3, 17, 4, 5, 33, 49, 6, 18, 65, 81, 7, 97, 113, 19, 34, 50, 129, 8, 20, 66, 145, 161, 177, 193, 9, 35, 51, 82, 240, 21, 98, 114, 209, 10, 22, 36, 52, 225, 37, 241, 23, 24, 25, 26, 38, 39, 40, 41, 42, 53, 54, 55, 56, 57, 58, 67, 68, 69, 70, 71, 72, 73, 74, 83, 84, 85, 86, 87, 88, 89, 90, 99, 100, 101, 102, 103, 104, 105, 106, 115, 116, 117, 118, 119, 120, 121, 122, 130, 131, 132, 133, 134, 135, 136, 137, 138, 146, 147, 148, 149, 150, 151, 152, 153, 154, 162, 163, 164, 165, 166, 167, 168, 169, 170, 178, 179, 180, 181, 182, 183, 184, 185, 186, 194, 195, 196, 197, 198, 199, 200, 201, 202, 210, 211, 212, 213, 214, 215, 216, 217, 218, 226, 227, 228, 229, 230, 231, 232, 233, 234, 242, 243, 244, 245, 246, 247, 248, 249, 250];

    function r(t, e) {
      for (var n = 0, r = 0, i = new Array(), o = 1; o <= 16; o++) {
        for (var a = 1; a <= t[o]; a++) i[e[r]] = [], i[e[r]][0] = n, i[e[r]][1] = o, r++, n++;

        n *= 2;
      }

      return i;
    }

    function V(t) {
      for (var e = t[0], n = t[1] - 1; 0 <= n;) e & 1 << n && (C |= 1 << B), n--, --B < 0 && (255 == C ? (G(255), G(0)) : G(C), B = 7, C = 0);
    }

    function G(t) {
      I.push(t);
    }

    function Y(t) {
      G(t >> 8 & 255), G(255 & t);
    }

    function J(t, e, n, r, i) {
      for (var o, a = i[0], s = i[240], l = function (t, e) {
        var n,
            r,
            i,
            o,
            a,
            s,
            l,
            h,
            u,
            c,
            f = 0;

        for (u = 0; u < 8; ++u) {
          n = t[f], r = t[f + 1], i = t[f + 2], o = t[f + 3], a = t[f + 4], s = t[f + 5], l = t[f + 6];
          var p = n + (h = t[f + 7]),
              d = n - h,
              g = r + l,
              m = r - l,
              y = i + s,
              v = i - s,
              w = o + a,
              b = o - a,
              x = p + w,
              N = p - w,
              L = g + y,
              A = g - y;
          t[f] = x + L, t[f + 4] = x - L;
          var S = .707106781 * (A + N);
          t[f + 2] = N + S, t[f + 6] = N - S;

          var _ = .382683433 * ((x = b + v) - (A = m + d)),
              F = .5411961 * x + _,
              P = 1.306562965 * A + _,
              k = .707106781 * (L = v + m),
              I = d + k,
              C = d - k;

          t[f + 5] = C + F, t[f + 3] = C - F, t[f + 1] = I + P, t[f + 7] = I - P, f += 8;
        }

        for (u = f = 0; u < 8; ++u) {
          n = t[f], r = t[f + 8], i = t[f + 16], o = t[f + 24], a = t[f + 32], s = t[f + 40], l = t[f + 48];
          var B = n + (h = t[f + 56]),
              j = n - h,
              E = r + l,
              M = r - l,
              O = i + s,
              q = i - s,
              T = o + a,
              R = o - a,
              D = B + T,
              U = B - T,
              z = E + O,
              H = E - O;
          t[f] = D + z, t[f + 32] = D - z;
          var W = .707106781 * (H + U);
          t[f + 16] = U + W, t[f + 48] = U - W;
          var V = .382683433 * ((D = R + q) - (H = M + j)),
              G = .5411961 * D + V,
              Y = 1.306562965 * H + V,
              J = .707106781 * (z = q + M),
              X = j + J,
              K = j - J;
          t[f + 40] = K + G, t[f + 24] = K - G, t[f + 8] = X + Y, t[f + 56] = X - Y, f++;
        }

        for (u = 0; u < 64; ++u) c = t[u] * e[u], Z[u] = 0 < c ? c + .5 | 0 : c - .5 | 0;

        return Z;
      }(t, e), h = 0; h < 64; ++h) w[b[h]] = l[h];

      var u = w[0] - n;
      n = w[0], 0 == u ? V(r[0]) : (V(r[v[o = 32767 + u]]), V(y[o]));

      for (var c = 63; 0 < c && 0 == w[c]; c--);

      if (0 == c) return V(a), n;

      for (var f, p = 1; p <= c;) {
        for (var d = p; 0 == w[p] && p <= c; ++p);

        var g = p - d;

        if (16 <= g) {
          f = g >> 4;

          for (var m = 1; m <= f; ++m) V(s);

          g &= 15;
        }

        o = 32767 + w[p], V(i[(g << 4) + v[o]]), V(y[o]), p++;
      }

      return 63 != c && V(a), n;
    }

    function X(t) {
      if (t <= 0 && (t = 1), 100 < t && (t = 100), e != t) {
        (function (t) {
          for (var e = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99], n = 0; n < 64; n++) {
            var r = c((e[n] * t + 50) / 100);
            r < 1 ? r = 1 : 255 < r && (r = 255), _[b[n]] = r;
          }

          for (var i = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99], o = 0; o < 64; o++) {
            var a = c((i[o] * t + 50) / 100);
            a < 1 ? a = 1 : 255 < a && (a = 255), F[b[o]] = a;
          }

          for (var s = [1, 1.387039845, 1.306562965, 1.175875602, 1, .785694958, .5411961, .275899379], l = 0, h = 0; h < 8; h++) for (var u = 0; u < 8; u++) P[l] = 1 / (_[b[l]] * s[h] * s[u] * 8), k[l] = 1 / (F[b[l]] * s[h] * s[u] * 8), l++;
        })(t < 50 ? Math.floor(5e3 / t) : Math.floor(200 - 2 * t)), e = t;
      }
    }

    this.encode = function (t, e) {
      var n, r;
      new Date().getTime();
      e && X(e), I = new Array(), C = 0, B = 7, Y(65496), Y(65504), Y(16), G(74), G(70), G(73), G(70), G(0), G(1), G(1), G(0), Y(1), Y(1), G(0), G(0), function () {
        Y(65499), Y(132), G(0);

        for (var t = 0; t < 64; t++) G(_[t]);

        G(1);

        for (var e = 0; e < 64; e++) G(F[e]);
      }(), n = t.width, r = t.height, Y(65472), Y(17), G(8), Y(r), Y(n), G(3), G(1), G(17), G(0), G(2), G(17), G(1), G(3), G(17), G(1), function () {
        Y(65476), Y(418), G(0);

        for (var t = 0; t < 16; t++) G(q[t + 1]);

        for (var e = 0; e <= 11; e++) G(T[e]);

        G(16);

        for (var n = 0; n < 16; n++) G(R[n + 1]);

        for (var r = 0; r <= 161; r++) G(D[r]);

        G(1);

        for (var i = 0; i < 16; i++) G(U[i + 1]);

        for (var o = 0; o <= 11; o++) G(z[o]);

        G(17);

        for (var a = 0; a < 16; a++) G(H[a + 1]);

        for (var s = 0; s <= 161; s++) G(W[s]);
      }(), Y(65498), Y(12), G(3), G(1), G(0), G(2), G(17), G(3), G(17), G(0), G(63), G(0);
      var i = 0,
          o = 0,
          a = 0;
      C = 0, B = 7, this.encode.displayName = "_encode_";

      for (var s, l, h, u, c, f, p, d, g, m = t.data, y = t.width, v = t.height, w = 4 * y, b = 0; b < v;) {
        for (s = 0; s < w;) {
          for (f = c = w * b + s, p = -1, g = d = 0; g < 64; g++) f = c + (d = g >> 3) * w + (p = 4 * (7 & g)), v <= b + d && (f -= w * (b + 1 + d - v)), w <= s + p && (f -= s + p - w + 4), l = m[f++], h = m[f++], u = m[f++], j[g] = (O[l] + O[h + 256 >> 0] + O[u + 512 >> 0] >> 16) - 128, E[g] = (O[l + 768 >> 0] + O[h + 1024 >> 0] + O[u + 1280 >> 0] >> 16) - 128, M[g] = (O[l + 1280 >> 0] + O[h + 1536 >> 0] + O[u + 1792 >> 0] >> 16) - 128;

          i = J(j, P, i, N, A), o = J(E, k, o, L, S), a = J(M, k, a, L, S), s += 32;
        }

        b += 8;
      }

      if (0 <= B) {
        var x = [];
        x[1] = B + 1, x[0] = (1 << B + 1) - 1, V(x);
      }

      return Y(65497), new Uint8Array(I);
    }, function () {
      new Date().getTime();
      t || (t = 50), function () {
        for (var t = String.fromCharCode, e = 0; e < 256; e++) n[e] = t(e);
      }(), N = r(q, T), L = r(U, z), A = r(R, D), S = r(H, W), function () {
        for (var t = 1, e = 2, n = 1; n <= 15; n++) {
          for (var r = t; r < e; r++) v[32767 + r] = n, y[32767 + r] = [], y[32767 + r][1] = n, y[32767 + r][0] = r;

          for (var i = -(e - 1); i <= -t; i++) v[32767 + i] = n, y[32767 + i] = [], y[32767 + i][1] = n, y[32767 + i][0] = e - 1 + i;

          t <<= 1, e <<= 1;
        }
      }(), function () {
        for (var t = 0; t < 256; t++) O[t] = 19595 * t, O[t + 256 >> 0] = 38470 * t, O[t + 512 >> 0] = 7471 * t + 32768, O[t + 768 >> 0] = -11059 * t, O[t + 1024 >> 0] = -21709 * t, O[t + 1280 >> 0] = 32768 * t + 8421375, O[t + 1536 >> 0] = -27439 * t, O[t + 1792 >> 0] = -5329 * t;
      }(), X(t), new Date().getTime();
    }();
  }

  function Ft(t, e) {
    if (this.pos = 0, this.buffer = t, this.datav = new DataView(t.buffer), this.is_with_alpha = !!e, this.bottom_up = !0, this.flag = String.fromCharCode(this.buffer[0]) + String.fromCharCode(this.buffer[1]), this.pos += 2, -1 === ["BM", "BA", "CI", "CP", "IC", "PT"].indexOf(this.flag)) throw new Error("Invalid BMP File");
    this.parseHeader(), this.parseBGR();
  }

  window.tmp = At, lt.API.adler32cs = (dt = "function" == typeof ArrayBuffer && "function" == typeof Uint8Array, gt = null, mt = function () {
    if (!dt) return function () {
      return !1;
    };

    try {
      var t = {};
      "function" == typeof t.Buffer && (gt = t.Buffer);
    } catch (t) {}

    return function (t) {
      return t instanceof ArrayBuffer || null !== gt && t instanceof gt;
    };
  }(), yt = null !== gt ? function (t) {
    return new gt(t, "utf8").toString("binary");
  } : function (t) {
    return unescape(encodeURIComponent(t));
  }, vt = function (t, e) {
    for (var n = 65535 & t, r = t >>> 16, i = 0, o = e.length; i < o; i++) n = (n + (255 & e.charCodeAt(i))) % 65521, r = (r + n) % 65521;

    return (r << 16 | n) >>> 0;
  }, wt = function (t, e) {
    for (var n = 65535 & t, r = t >>> 16, i = 0, o = e.length; i < o; i++) n = (n + e[i]) % 65521, r = (r + n) % 65521;

    return (r << 16 | n) >>> 0;
  }, xt = (bt = {}).Adler32 = (((pt = (ft = function (t) {
    if (!(this instanceof ft)) throw new TypeError("Constructor cannot called be as a function.");
    if (!isFinite(t = null == t ? 1 : +t)) throw new Error("First arguments needs to be a finite number.");
    this.checksum = t >>> 0;
  }).prototype = {}).constructor = ft).from = ((ht = function (t) {
    if (!(this instanceof ft)) throw new TypeError("Constructor cannot called be as a function.");
    if (null == t) throw new Error("First argument needs to be a string.");
    this.checksum = vt(1, t.toString());
  }).prototype = pt, ht), ft.fromUtf8 = ((ut = function (t) {
    if (!(this instanceof ft)) throw new TypeError("Constructor cannot called be as a function.");
    if (null == t) throw new Error("First argument needs to be a string.");
    var e = yt(t.toString());
    this.checksum = vt(1, e);
  }).prototype = pt, ut), dt && (ft.fromBuffer = ((ct = function (t) {
    if (!(this instanceof ft)) throw new TypeError("Constructor cannot called be as a function.");
    if (!mt(t)) throw new Error("First argument needs to be ArrayBuffer.");
    var e = new Uint8Array(t);
    return this.checksum = wt(1, e);
  }).prototype = pt, ct)), pt.update = function (t) {
    if (null == t) throw new Error("First argument needs to be a string.");
    return t = t.toString(), this.checksum = vt(this.checksum, t);
  }, pt.updateUtf8 = function (t) {
    if (null == t) throw new Error("First argument needs to be a string.");
    var e = yt(t.toString());
    return this.checksum = vt(this.checksum, e);
  }, dt && (pt.updateBuffer = function (t) {
    if (!mt(t)) throw new Error("First argument needs to be ArrayBuffer.");
    var e = new Uint8Array(t);
    return this.checksum = wt(this.checksum, e);
  }), pt.clone = function () {
    return new xt(this.checksum);
  }, ft), bt.from = function (t) {
    if (null == t) throw new Error("First argument needs to be a string.");
    return vt(1, t.toString());
  }, bt.fromUtf8 = function (t) {
    if (null == t) throw new Error("First argument needs to be a string.");
    var e = yt(t.toString());
    return vt(1, e);
  }, dt && (bt.fromBuffer = function (t) {
    if (!mt(t)) throw new Error("First argument need to be ArrayBuffer.");
    var e = new Uint8Array(t);
    return wt(1, e);
  }), bt), function (t) {
    t.__bidiEngine__ = t.prototype.__bidiEngine__ = function (t) {
      var d,
          g,
          c,
          f,
          i,
          o,
          a,
          s = e,
          m = [[0, 3, 0, 1, 0, 0, 0], [0, 3, 0, 1, 2, 2, 0], [0, 3, 0, 17, 2, 0, 1], [0, 3, 5, 5, 4, 1, 0], [0, 3, 21, 21, 4, 0, 1], [0, 3, 5, 5, 4, 2, 0]],
          y = [[2, 0, 1, 1, 0, 1, 0], [2, 0, 1, 1, 0, 2, 0], [2, 0, 2, 1, 3, 2, 0], [2, 0, 2, 33, 3, 1, 1]],
          v = {
        L: 0,
        R: 1,
        EN: 2,
        AN: 3,
        N: 4,
        B: 5,
        S: 6
      },
          l = {
        0: 0,
        5: 1,
        6: 2,
        7: 3,
        32: 4,
        251: 5,
        254: 6,
        255: 7
      },
          h = ["(", ")", "(", "<", ">", "<", "[", "]", "[", "{", "}", "{", "«", "»", "«", "‹", "›", "‹", "⁅", "⁆", "⁅", "⁽", "⁾", "⁽", "₍", "₎", "₍", "≤", "≥", "≤", "〈", "〉", "〈", "﹙", "﹚", "﹙", "﹛", "﹜", "﹛", "﹝", "﹞", "﹝", "﹤", "﹥", "﹤"],
          u = new RegExp(/^([1-4|9]|1[0-9]|2[0-9]|3[0168]|4[04589]|5[012]|7[78]|159|16[0-9]|17[0-2]|21[569]|22[03489]|250)$/),
          w = !1,
          b = 0;
      this.__bidiEngine__ = {};

      var x = function (t) {
        var e = t.charCodeAt(),
            n = e >> 8,
            r = l[n];
        return void 0 !== r ? s[256 * r + (255 & e)] : 252 === n || 253 === n ? "AL" : u.test(n) ? "L" : 8 === n ? "R" : "N";
      },
          p = function (t) {
        for (var e, n = 0; n < t.length; n++) {
          if ("L" === (e = x(t.charAt(n)))) return !1;
          if ("R" === e) return !0;
        }

        return !1;
      },
          N = function (t, e, n, r) {
        var i,
            o,
            a,
            s,
            l = e[r];

        switch (l) {
          case "L":
          case "R":
            w = !1;
            break;

          case "N":
          case "AN":
            break;

          case "EN":
            w && (l = "AN");
            break;

          case "AL":
            w = !0, l = "R";
            break;

          case "WS":
            l = "N";
            break;

          case "CS":
            r < 1 || r + 1 >= e.length || "EN" !== (i = n[r - 1]) && "AN" !== i || "EN" !== (o = e[r + 1]) && "AN" !== o ? l = "N" : w && (o = "AN"), l = o === i ? o : "N";
            break;

          case "ES":
            l = "EN" === (i = 0 < r ? n[r - 1] : "B") && r + 1 < e.length && "EN" === e[r + 1] ? "EN" : "N";
            break;

          case "ET":
            if (0 < r && "EN" === n[r - 1]) {
              l = "EN";
              break;
            }

            if (w) {
              l = "N";
              break;
            }

            for (a = r + 1, s = e.length; a < s && "ET" === e[a];) a++;

            l = a < s && "EN" === e[a] ? "EN" : "N";
            break;

          case "NSM":
            if (c && !f) {
              for (s = e.length, a = r + 1; a < s && "NSM" === e[a];) a++;

              if (a < s) {
                var h = t[r],
                    u = 1425 <= h && h <= 2303 || 64286 === h;

                if (i = e[a], u && ("R" === i || "AL" === i)) {
                  l = "R";
                  break;
                }
              }
            }

            l = r < 1 || "B" === (i = e[r - 1]) ? "N" : n[r - 1];
            break;

          case "B":
            d = !(w = !1), l = b;
            break;

          case "S":
            g = !0, l = "N";
            break;

          case "LRE":
          case "RLE":
          case "LRO":
          case "RLO":
          case "PDF":
            w = !1;
            break;

          case "BN":
            l = "N";
        }

        return l;
      },
          L = function (t, e, n) {
        var r = t.split("");
        return n && A(r, n, {
          hiLevel: b
        }), r.reverse(), e && e.reverse(), r.join("");
      },
          A = function (t, e, n) {
        var r,
            i,
            o,
            a,
            s,
            l = -1,
            h = t.length,
            u = 0,
            c = [],
            f = b ? y : m,
            p = [];

        for (g = d = w = !1, i = 0; i < h; i++) p[i] = x(t[i]);

        for (o = 0; o < h; o++) {
          if (s = u, c[o] = N(t, p, c, o), r = 240 & (u = f[s][v[c[o]]]), u &= 15, e[o] = a = f[u][5], 0 < r) if (16 === r) {
            for (i = l; i < o; i++) e[i] = 1;

            l = -1;
          } else l = -1;
          if (f[u][6]) -1 === l && (l = o);else if (-1 < l) {
            for (i = l; i < o; i++) e[i] = a;

            l = -1;
          }
          "B" === p[o] && (e[o] = 0), n.hiLevel |= a;
        }

        g && function (t, e, n) {
          for (var r = 0; r < n; r++) if ("S" === t[r]) {
            e[r] = b;

            for (var i = r - 1; 0 <= i && "WS" === t[i]; i--) e[i] = b;
          }
        }(p, e, h);
      },
          S = function (t, e, n, r, i) {
        if (!(i.hiLevel < t)) {
          if (1 === t && 1 === b && !d) return e.reverse(), void (n && n.reverse());

          for (var o, a, s, l, h = e.length, u = 0; u < h;) {
            if (r[u] >= t) {
              for (s = u + 1; s < h && r[s] >= t;) s++;

              for (l = u, a = s - 1; l < a; l++, a--) o = e[l], e[l] = e[a], e[a] = o, n && (o = n[l], n[l] = n[a], n[a] = o);

              u = s;
            }

            u++;
          }
        }
      },
          _ = function (t, e, n) {
        var r = t.split(""),
            i = {
          hiLevel: b
        };
        return n || (n = []), A(r, n, i), function (t, e, n) {
          if (0 !== n.hiLevel && a) for (var r, i = 0; i < t.length; i++) 1 === e[i] && 0 <= (r = h.indexOf(t[i])) && (t[i] = h[r + 1]);
        }(r, n, i), S(2, r, e, n, i), S(1, r, e, n, i), r.join("");
      };

      return this.__bidiEngine__.doBidiReorder = function (t, e, n) {
        if (function (t, e) {
          if (e) for (var n = 0; n < t.length; n++) e[n] = n;
          void 0 === f && (f = p(t)), void 0 === o && (o = p(t));
        }(t, e), c || !i || o) {
          if (c && i && f ^ o) b = f ? 1 : 0, t = L(t, e, n);else if (!c && i && o) b = f ? 1 : 0, t = _(t, e, n), t = L(t, e);else if (!c || f || i || o) {
            if (c && !i && f ^ o) t = L(t, e), t = f ? (b = 0, _(t, e, n)) : (b = 1, t = _(t, e, n), L(t, e));else if (c && f && !i && o) b = 1, t = _(t, e, n), t = L(t, e);else if (!c && !i && f ^ o) {
              var r = a;
              f ? (b = 1, t = _(t, e, n), b = 0, a = !1, t = _(t, e, n), a = r) : (b = 0, t = _(t, e, n), t = L(t, e), a = !(b = 1), t = _(t, e, n), a = r, t = L(t, e));
            }
          } else b = 0, t = _(t, e, n);
        } else b = f ? 1 : 0, t = _(t, e, n);
        return t;
      }, this.__bidiEngine__.setOptions = function (t) {
        t && (c = t.isInputVisual, i = t.isOutputVisual, f = t.isInputRtl, o = t.isOutputRtl, a = t.isSymmetricSwapping);
      }, this.__bidiEngine__.setOptions(t), this.__bidiEngine__;
    };

    var e = ["BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "S", "B", "S", "WS", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "B", "B", "B", "S", "WS", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "BN", "BN", "BN", "BN", "BN", "BN", "B", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "BN", "CS", "N", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "L", "N", "N", "BN", "N", "N", "ET", "ET", "EN", "EN", "N", "L", "N", "N", "N", "EN", "L", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "L", "N", "N", "N", "N", "N", "ET", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "NSM", "R", "NSM", "NSM", "R", "NSM", "NSM", "R", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AN", "AN", "AN", "AN", "AN", "AN", "N", "N", "AL", "ET", "ET", "AL", "CS", "AL", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "AN", "ET", "AN", "AN", "AL", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AN", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "NSM", "NSM", "N", "NSM", "NSM", "NSM", "NSM", "AL", "AL", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "NSM", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "R", "R", "N", "N", "N", "N", "R", "N", "N", "N", "N", "N", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "WS", "BN", "BN", "BN", "L", "R", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "B", "LRE", "RLE", "PDF", "LRO", "RLO", "CS", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "WS", "BN", "BN", "BN", "BN", "BN", "N", "LRI", "RLI", "FSI", "PDI", "BN", "BN", "BN", "BN", "BN", "BN", "EN", "L", "N", "N", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "L", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "ES", "ES", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "R", "NSM", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "ES", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "N", "R", "R", "R", "R", "R", "N", "R", "N", "R", "R", "N", "R", "R", "N", "R", "R", "R", "R", "R", "R", "R", "R", "R", "R", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "NSM", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "CS", "N", "CS", "N", "N", "CS", "N", "N", "N", "N", "N", "N", "N", "N", "N", "ET", "N", "N", "ES", "ES", "N", "N", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "AL", "AL", "AL", "AL", "AL", "N", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "AL", "N", "N", "BN", "N", "N", "N", "ET", "ET", "ET", "N", "N", "N", "N", "N", "ES", "CS", "ES", "CS", "CS", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "EN", "CS", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "L", "N", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "L", "L", "L", "N", "N", "L", "L", "L", "N", "N", "N", "ET", "ET", "N", "N", "N", "ET", "ET", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N"],
        o = new t.__bidiEngine__({
      isInputVisual: !0
    });
    t.API.events.push(["postProcessText", function (t) {
      var e = t.text,
          n = (t.x, t.y, t.options || {}),
          r = (t.mutex, n.lang, []);

      if ("[object Array]" === Object.prototype.toString.call(e)) {
        var i = 0;

        for (r = [], i = 0; i < e.length; i += 1) "[object Array]" === Object.prototype.toString.call(e[i]) ? r.push([o.doBidiReorder(e[i][0]), e[i][1], e[i][2]]) : r.push([o.doBidiReorder(e[i])]);

        t.text = r;
      } else t.text = o.doBidiReorder(e);
    }]);
  }(lt), window.tmp = _t, Ft.prototype.parseHeader = function () {
    if (this.fileSize = this.datav.getUint32(this.pos, !0), this.pos += 4, this.reserved = this.datav.getUint32(this.pos, !0), this.pos += 4, this.offset = this.datav.getUint32(this.pos, !0), this.pos += 4, this.headerSize = this.datav.getUint32(this.pos, !0), this.pos += 4, this.width = this.datav.getUint32(this.pos, !0), this.pos += 4, this.height = this.datav.getInt32(this.pos, !0), this.pos += 4, this.planes = this.datav.getUint16(this.pos, !0), this.pos += 2, this.bitPP = this.datav.getUint16(this.pos, !0), this.pos += 2, this.compress = this.datav.getUint32(this.pos, !0), this.pos += 4, this.rawSize = this.datav.getUint32(this.pos, !0), this.pos += 4, this.hr = this.datav.getUint32(this.pos, !0), this.pos += 4, this.vr = this.datav.getUint32(this.pos, !0), this.pos += 4, this.colors = this.datav.getUint32(this.pos, !0), this.pos += 4, this.importantColors = this.datav.getUint32(this.pos, !0), this.pos += 4, 16 === this.bitPP && this.is_with_alpha && (this.bitPP = 15), this.bitPP < 15) {
      var t = 0 === this.colors ? 1 << this.bitPP : this.colors;
      this.palette = new Array(t);

      for (var e = 0; e < t; e++) {
        var n = this.datav.getUint8(this.pos++, !0),
            r = this.datav.getUint8(this.pos++, !0),
            i = this.datav.getUint8(this.pos++, !0),
            o = this.datav.getUint8(this.pos++, !0);
        this.palette[e] = {
          red: i,
          green: r,
          blue: n,
          quad: o
        };
      }
    }

    this.height < 0 && (this.height *= -1, this.bottom_up = !1);
  }, Ft.prototype.parseBGR = function () {
    this.pos = this.offset;

    try {
      var t = "bit" + this.bitPP,
          e = this.width * this.height * 4;
      this.data = new Uint8Array(e), this[t]();
    } catch (t) {
      console.log("bit decode error:" + t);
    }
  }, Ft.prototype.bit1 = function () {
    var t = Math.ceil(this.width / 8),
        e = t % 4,
        n = 0 <= this.height ? this.height - 1 : -this.height;

    for (n = this.height - 1; 0 <= n; n--) {
      for (var r = this.bottom_up ? n : this.height - 1 - n, i = 0; i < t; i++) for (var o = this.datav.getUint8(this.pos++, !0), a = r * this.width * 4 + 8 * i * 4, s = 0; s < 8 && 8 * i + s < this.width; s++) {
        var l = this.palette[o >> 7 - s & 1];
        this.data[a + 4 * s] = l.blue, this.data[a + 4 * s + 1] = l.green, this.data[a + 4 * s + 2] = l.red, this.data[a + 4 * s + 3] = 255;
      }

      0 != e && (this.pos += 4 - e);
    }
  }, Ft.prototype.bit4 = function () {
    for (var t = Math.ceil(this.width / 2), e = t % 4, n = this.height - 1; 0 <= n; n--) {
      for (var r = this.bottom_up ? n : this.height - 1 - n, i = 0; i < t; i++) {
        var o = this.datav.getUint8(this.pos++, !0),
            a = r * this.width * 4 + 2 * i * 4,
            s = o >> 4,
            l = 15 & o,
            h = this.palette[s];
        if (this.data[a] = h.blue, this.data[a + 1] = h.green, this.data[a + 2] = h.red, this.data[a + 3] = 255, 2 * i + 1 >= this.width) break;
        h = this.palette[l], this.data[a + 4] = h.blue, this.data[a + 4 + 1] = h.green, this.data[a + 4 + 2] = h.red, this.data[a + 4 + 3] = 255;
      }

      0 != e && (this.pos += 4 - e);
    }
  }, Ft.prototype.bit8 = function () {
    for (var t = this.width % 4, e = this.height - 1; 0 <= e; e--) {
      for (var n = this.bottom_up ? e : this.height - 1 - e, r = 0; r < this.width; r++) {
        var i = this.datav.getUint8(this.pos++, !0),
            o = n * this.width * 4 + 4 * r;

        if (i < this.palette.length) {
          var a = this.palette[i];
          this.data[o] = a.red, this.data[o + 1] = a.green, this.data[o + 2] = a.blue, this.data[o + 3] = 255;
        } else this.data[o] = 255, this.data[o + 1] = 255, this.data[o + 2] = 255, this.data[o + 3] = 255;
      }

      0 != t && (this.pos += 4 - t);
    }
  }, Ft.prototype.bit15 = function () {
    for (var t = this.width % 3, e = parseInt("11111", 2), n = this.height - 1; 0 <= n; n--) {
      for (var r = this.bottom_up ? n : this.height - 1 - n, i = 0; i < this.width; i++) {
        var o = this.datav.getUint16(this.pos, !0);
        this.pos += 2;
        var a = (o & e) / e * 255 | 0,
            s = (o >> 5 & e) / e * 255 | 0,
            l = (o >> 10 & e) / e * 255 | 0,
            h = o >> 15 ? 255 : 0,
            u = r * this.width * 4 + 4 * i;
        this.data[u] = l, this.data[u + 1] = s, this.data[u + 2] = a, this.data[u + 3] = h;
      }

      this.pos += t;
    }
  }, Ft.prototype.bit16 = function () {
    for (var t = this.width % 3, e = parseInt("11111", 2), n = parseInt("111111", 2), r = this.height - 1; 0 <= r; r--) {
      for (var i = this.bottom_up ? r : this.height - 1 - r, o = 0; o < this.width; o++) {
        var a = this.datav.getUint16(this.pos, !0);
        this.pos += 2;
        var s = (a & e) / e * 255 | 0,
            l = (a >> 5 & n) / n * 255 | 0,
            h = (a >> 11) / e * 255 | 0,
            u = i * this.width * 4 + 4 * o;
        this.data[u] = h, this.data[u + 1] = l, this.data[u + 2] = s, this.data[u + 3] = 255;
      }

      this.pos += t;
    }
  }, Ft.prototype.bit24 = function () {
    for (var t = this.height - 1; 0 <= t; t--) {
      for (var e = this.bottom_up ? t : this.height - 1 - t, n = 0; n < this.width; n++) {
        var r = this.datav.getUint8(this.pos++, !0),
            i = this.datav.getUint8(this.pos++, !0),
            o = this.datav.getUint8(this.pos++, !0),
            a = e * this.width * 4 + 4 * n;
        this.data[a] = o, this.data[a + 1] = i, this.data[a + 2] = r, this.data[a + 3] = 255;
      }

      this.pos += this.width % 4;
    }
  }, Ft.prototype.bit32 = function () {
    for (var t = this.height - 1; 0 <= t; t--) for (var e = this.bottom_up ? t : this.height - 1 - t, n = 0; n < this.width; n++) {
      var r = this.datav.getUint8(this.pos++, !0),
          i = this.datav.getUint8(this.pos++, !0),
          o = this.datav.getUint8(this.pos++, !0),
          a = this.datav.getUint8(this.pos++, !0),
          s = e * this.width * 4 + 4 * n;
      this.data[s] = o, this.data[s + 1] = i, this.data[s + 2] = r, this.data[s + 3] = a;
    }
  }, Ft.prototype.getData = function () {
    return this.data;
  }, window.tmp = Ft,
  /*
     Copyright (c) 2013 Gildas Lormeau. All rights reserved.
  
     Redistribution and use in source and binary forms, with or without
     modification, are permitted provided that the following conditions are met:
  
     1. Redistributions of source code must retain the above copyright notice,
     this list of conditions and the following disclaimer.
  
     2. Redistributions in binary form must reproduce the above copyright 
     notice, this list of conditions and the following disclaimer in 
     the documentation and/or other materials provided with the distribution.
  
     3. The names of the authors may not be used to endorse or promote products
     derived from this software without specific prior written permission.
  
     THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
     INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
     FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
     INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
     INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
     OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
     EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */
  function (t) {
    var d = 15,
        g = 573,
        e = [0, 1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 0, 0, 16, 17, 18, 18, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29];

    function ct() {
      var p = this;

      function l(t, e) {
        for (var n = 0; n |= 1 & t, t >>>= 1, n <<= 1, 0 < --e;);

        return n >>> 1;
      }

      p.build_tree = function (t) {
        var e,
            n,
            r,
            i = p.dyn_tree,
            o = p.stat_desc.static_tree,
            a = p.stat_desc.elems,
            s = -1;

        for (t.heap_len = 0, t.heap_max = g, e = 0; e < a; e++) 0 !== i[2 * e] ? (t.heap[++t.heap_len] = s = e, t.depth[e] = 0) : i[2 * e + 1] = 0;

        for (; t.heap_len < 2;) i[2 * (r = t.heap[++t.heap_len] = s < 2 ? ++s : 0)] = 1, t.depth[r] = 0, t.opt_len--, o && (t.static_len -= o[2 * r + 1]);

        for (p.max_code = s, e = Math.floor(t.heap_len / 2); 1 <= e; e--) t.pqdownheap(i, e);

        for (r = a; e = t.heap[1], t.heap[1] = t.heap[t.heap_len--], t.pqdownheap(i, 1), n = t.heap[1], t.heap[--t.heap_max] = e, t.heap[--t.heap_max] = n, i[2 * r] = i[2 * e] + i[2 * n], t.depth[r] = Math.max(t.depth[e], t.depth[n]) + 1, i[2 * e + 1] = i[2 * n + 1] = r, t.heap[1] = r++, t.pqdownheap(i, 1), 2 <= t.heap_len;);

        t.heap[--t.heap_max] = t.heap[1], function (t) {
          var e,
              n,
              r,
              i,
              o,
              a,
              s = p.dyn_tree,
              l = p.stat_desc.static_tree,
              h = p.stat_desc.extra_bits,
              u = p.stat_desc.extra_base,
              c = p.stat_desc.max_length,
              f = 0;

          for (i = 0; i <= d; i++) t.bl_count[i] = 0;

          for (s[2 * t.heap[t.heap_max] + 1] = 0, e = t.heap_max + 1; e < g; e++) c < (i = s[2 * s[2 * (n = t.heap[e]) + 1] + 1] + 1) && (i = c, f++), s[2 * n + 1] = i, n > p.max_code || (t.bl_count[i]++, o = 0, u <= n && (o = h[n - u]), a = s[2 * n], t.opt_len += a * (i + o), l && (t.static_len += a * (l[2 * n + 1] + o)));

          if (0 !== f) {
            do {
              for (i = c - 1; 0 === t.bl_count[i];) i--;

              t.bl_count[i]--, t.bl_count[i + 1] += 2, t.bl_count[c]--, f -= 2;
            } while (0 < f);

            for (i = c; 0 !== i; i--) for (n = t.bl_count[i]; 0 !== n;) (r = t.heap[--e]) > p.max_code || (s[2 * r + 1] != i && (t.opt_len += (i - s[2 * r + 1]) * s[2 * r], s[2 * r + 1] = i), n--);
          }
        }(t), function (t, e, n) {
          var r,
              i,
              o,
              a = [],
              s = 0;

          for (r = 1; r <= d; r++) a[r] = s = s + n[r - 1] << 1;

          for (i = 0; i <= e; i++) 0 !== (o = t[2 * i + 1]) && (t[2 * i] = l(a[o]++, o));
        }(i, p.max_code, t.bl_count);
      };
    }

    function ft(t, e, n, r, i) {
      this.static_tree = t, this.extra_bits = e, this.extra_base = n, this.elems = r, this.max_length = i;
    }

    ct._length_code = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28], ct.base_length = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 0], ct.base_dist = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576], ct.d_code = function (t) {
      return t < 256 ? e[t] : e[256 + (t >>> 7)];
    }, ct.extra_lbits = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], ct.extra_dbits = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], ct.extra_blbits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], ct.bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], ft.static_ltree = [12, 8, 140, 8, 76, 8, 204, 8, 44, 8, 172, 8, 108, 8, 236, 8, 28, 8, 156, 8, 92, 8, 220, 8, 60, 8, 188, 8, 124, 8, 252, 8, 2, 8, 130, 8, 66, 8, 194, 8, 34, 8, 162, 8, 98, 8, 226, 8, 18, 8, 146, 8, 82, 8, 210, 8, 50, 8, 178, 8, 114, 8, 242, 8, 10, 8, 138, 8, 74, 8, 202, 8, 42, 8, 170, 8, 106, 8, 234, 8, 26, 8, 154, 8, 90, 8, 218, 8, 58, 8, 186, 8, 122, 8, 250, 8, 6, 8, 134, 8, 70, 8, 198, 8, 38, 8, 166, 8, 102, 8, 230, 8, 22, 8, 150, 8, 86, 8, 214, 8, 54, 8, 182, 8, 118, 8, 246, 8, 14, 8, 142, 8, 78, 8, 206, 8, 46, 8, 174, 8, 110, 8, 238, 8, 30, 8, 158, 8, 94, 8, 222, 8, 62, 8, 190, 8, 126, 8, 254, 8, 1, 8, 129, 8, 65, 8, 193, 8, 33, 8, 161, 8, 97, 8, 225, 8, 17, 8, 145, 8, 81, 8, 209, 8, 49, 8, 177, 8, 113, 8, 241, 8, 9, 8, 137, 8, 73, 8, 201, 8, 41, 8, 169, 8, 105, 8, 233, 8, 25, 8, 153, 8, 89, 8, 217, 8, 57, 8, 185, 8, 121, 8, 249, 8, 5, 8, 133, 8, 69, 8, 197, 8, 37, 8, 165, 8, 101, 8, 229, 8, 21, 8, 149, 8, 85, 8, 213, 8, 53, 8, 181, 8, 117, 8, 245, 8, 13, 8, 141, 8, 77, 8, 205, 8, 45, 8, 173, 8, 109, 8, 237, 8, 29, 8, 157, 8, 93, 8, 221, 8, 61, 8, 189, 8, 125, 8, 253, 8, 19, 9, 275, 9, 147, 9, 403, 9, 83, 9, 339, 9, 211, 9, 467, 9, 51, 9, 307, 9, 179, 9, 435, 9, 115, 9, 371, 9, 243, 9, 499, 9, 11, 9, 267, 9, 139, 9, 395, 9, 75, 9, 331, 9, 203, 9, 459, 9, 43, 9, 299, 9, 171, 9, 427, 9, 107, 9, 363, 9, 235, 9, 491, 9, 27, 9, 283, 9, 155, 9, 411, 9, 91, 9, 347, 9, 219, 9, 475, 9, 59, 9, 315, 9, 187, 9, 443, 9, 123, 9, 379, 9, 251, 9, 507, 9, 7, 9, 263, 9, 135, 9, 391, 9, 71, 9, 327, 9, 199, 9, 455, 9, 39, 9, 295, 9, 167, 9, 423, 9, 103, 9, 359, 9, 231, 9, 487, 9, 23, 9, 279, 9, 151, 9, 407, 9, 87, 9, 343, 9, 215, 9, 471, 9, 55, 9, 311, 9, 183, 9, 439, 9, 119, 9, 375, 9, 247, 9, 503, 9, 15, 9, 271, 9, 143, 9, 399, 9, 79, 9, 335, 9, 207, 9, 463, 9, 47, 9, 303, 9, 175, 9, 431, 9, 111, 9, 367, 9, 239, 9, 495, 9, 31, 9, 287, 9, 159, 9, 415, 9, 95, 9, 351, 9, 223, 9, 479, 9, 63, 9, 319, 9, 191, 9, 447, 9, 127, 9, 383, 9, 255, 9, 511, 9, 0, 7, 64, 7, 32, 7, 96, 7, 16, 7, 80, 7, 48, 7, 112, 7, 8, 7, 72, 7, 40, 7, 104, 7, 24, 7, 88, 7, 56, 7, 120, 7, 4, 7, 68, 7, 36, 7, 100, 7, 20, 7, 84, 7, 52, 7, 116, 7, 3, 8, 131, 8, 67, 8, 195, 8, 35, 8, 163, 8, 99, 8, 227, 8], ft.static_dtree = [0, 5, 16, 5, 8, 5, 24, 5, 4, 5, 20, 5, 12, 5, 28, 5, 2, 5, 18, 5, 10, 5, 26, 5, 6, 5, 22, 5, 14, 5, 30, 5, 1, 5, 17, 5, 9, 5, 25, 5, 5, 5, 21, 5, 13, 5, 29, 5, 3, 5, 19, 5, 11, 5, 27, 5, 7, 5, 23, 5], ft.static_l_desc = new ft(ft.static_ltree, ct.extra_lbits, 257, 286, d), ft.static_d_desc = new ft(ft.static_dtree, ct.extra_dbits, 0, 30, d), ft.static_bl_desc = new ft(null, ct.extra_blbits, 0, 19, 7);

    function n(t, e, n, r, i) {
      this.good_length = t, this.max_lazy = e, this.nice_length = n, this.max_chain = r, this.func = i;
    }

    var pt = [new n(0, 0, 0, 0, 0), new n(4, 4, 8, 4, 1), new n(4, 5, 16, 8, 1), new n(4, 6, 32, 32, 1), new n(4, 4, 16, 16, 2), new n(8, 16, 32, 32, 2), new n(8, 16, 128, 128, 2), new n(8, 32, 128, 256, 2), new n(32, 128, 258, 1024, 2), new n(32, 258, 258, 4096, 2)],
        dt = ["need dictionary", "stream end", "", "", "stream error", "data error", "", "buffer error", "", ""];

    function gt(t, e, n, r) {
      var i = t[2 * e],
          o = t[2 * n];
      return i < o || i == o && r[e] <= r[n];
    }

    function r() {
      var l,
          h,
          u,
          c,
          f,
          p,
          d,
          g,
          i,
          m,
          y,
          v,
          w,
          a,
          b,
          x,
          N,
          L,
          A,
          S,
          _,
          F,
          P,
          k,
          I,
          C,
          B,
          j,
          E,
          M,
          s,
          O,
          q,
          T,
          R,
          D,
          U,
          o,
          z,
          H,
          W,
          V = this,
          G = new ct(),
          Y = new ct(),
          J = new ct();

      function X() {
        var t;

        for (t = 0; t < 286; t++) s[2 * t] = 0;

        for (t = 0; t < 30; t++) O[2 * t] = 0;

        for (t = 0; t < 19; t++) q[2 * t] = 0;

        s[512] = 1, V.opt_len = V.static_len = 0, D = o = 0;
      }

      function K(t, e) {
        var n,
            r,
            i = -1,
            o = t[1],
            a = 0,
            s = 7,
            l = 4;

        for (0 === o && (s = 138, l = 3), t[2 * (e + 1) + 1] = 65535, n = 0; n <= e; n++) r = o, o = t[2 * (n + 1) + 1], ++a < s && r == o || (a < l ? q[2 * r] += a : 0 !== r ? (r != i && q[2 * r]++, q[32]++) : a <= 10 ? q[34]++ : q[36]++, i = r, l = (a = 0) === o ? (s = 138, 3) : r == o ? (s = 6, 3) : (s = 7, 4));
      }

      function Z(t) {
        V.pending_buf[V.pending++] = t;
      }

      function Q(t) {
        Z(255 & t), Z(t >>> 8 & 255);
      }

      function $(t, e) {
        var n,
            r = e;
        16 - r < W ? (Q(H |= (n = t) << W & 65535), H = n >>> 16 - W, W += r - 16) : (H |= t << W & 65535, W += r);
      }

      function tt(t, e) {
        var n = 2 * t;
        $(65535 & e[n], 65535 & e[n + 1]);
      }

      function et(t, e) {
        var n,
            r,
            i = -1,
            o = t[1],
            a = 0,
            s = 7,
            l = 4;

        for (0 === o && (s = 138, l = 3), n = 0; n <= e; n++) if (r = o, o = t[2 * (n + 1) + 1], !(++a < s && r == o)) {
          if (a < l) for (; tt(r, q), 0 != --a;);else 0 !== r ? (r != i && (tt(r, q), a--), tt(16, q), $(a - 3, 2)) : a <= 10 ? (tt(17, q), $(a - 3, 3)) : (tt(18, q), $(a - 11, 7));
          i = r, l = (a = 0) === o ? (s = 138, 3) : r == o ? (s = 6, 3) : (s = 7, 4);
        }
      }

      function nt() {
        16 == W ? (Q(H), W = H = 0) : 8 <= W && (Z(255 & H), H >>>= 8, W -= 8);
      }

      function rt(t, e) {
        var n, r, i;

        if (V.pending_buf[U + 2 * D] = t >>> 8 & 255, V.pending_buf[U + 2 * D + 1] = 255 & t, V.pending_buf[T + D] = 255 & e, D++, 0 === t ? s[2 * e]++ : (o++, t--, s[2 * (ct._length_code[e] + 256 + 1)]++, O[2 * ct.d_code(t)]++), 0 == (8191 & D) && 2 < B) {
          for (n = 8 * D, r = _ - N, i = 0; i < 30; i++) n += O[2 * i] * (5 + ct.extra_dbits[i]);

          if (n >>>= 3, o < Math.floor(D / 2) && n < Math.floor(r / 2)) return !0;
        }

        return D == R - 1;
      }

      function it(t, e) {
        var n,
            r,
            i,
            o,
            a = 0;
        if (0 !== D) for (; n = V.pending_buf[U + 2 * a] << 8 & 65280 | 255 & V.pending_buf[U + 2 * a + 1], r = 255 & V.pending_buf[T + a], a++, 0 === n ? tt(r, t) : (tt((i = ct._length_code[r]) + 256 + 1, t), 0 !== (o = ct.extra_lbits[i]) && $(r -= ct.base_length[i], o), tt(i = ct.d_code(--n), e), 0 !== (o = ct.extra_dbits[i]) && $(n -= ct.base_dist[i], o)), a < D;);
        tt(256, t), z = t[513];
      }

      function ot() {
        8 < W ? Q(H) : 0 < W && Z(255 & H), W = H = 0;
      }

      function at(t, e, n) {
        var r, i, o;
        $(0 + (n ? 1 : 0), 3), r = t, i = e, o = !0, ot(), z = 8, o && (Q(i), Q(~i)), V.pending_buf.set(g.subarray(r, r + i), V.pending), V.pending += i;
      }

      function e(t, e, n) {
        var r,
            i,
            o = 0;
        0 < B ? (G.build_tree(V), Y.build_tree(V), o = function () {
          var t;

          for (K(s, G.max_code), K(O, Y.max_code), J.build_tree(V), t = 18; 3 <= t && 0 === q[2 * ct.bl_order[t] + 1]; t--);

          return V.opt_len += 3 * (t + 1) + 5 + 5 + 4, t;
        }(), r = V.opt_len + 3 + 7 >>> 3, (i = V.static_len + 3 + 7 >>> 3) <= r && (r = i)) : r = i = e + 5, e + 4 <= r && -1 != t ? at(t, e, n) : i == r ? ($(2 + (n ? 1 : 0), 3), it(ft.static_ltree, ft.static_dtree)) : ($(4 + (n ? 1 : 0), 3), function (t, e, n) {
          var r;

          for ($(t - 257, 5), $(e - 1, 5), $(n - 4, 4), r = 0; r < n; r++) $(q[2 * ct.bl_order[r] + 1], 3);

          et(s, t - 1), et(O, e - 1);
        }(G.max_code + 1, Y.max_code + 1, o + 1), it(s, O)), X(), n && ot();
      }

      function st(t) {
        e(0 <= N ? N : -1, _ - N, t), N = _, l.flush_pending();
      }

      function lt() {
        var t, e, n, r;

        do {
          if (0 === (r = i - P - _) && 0 === _ && 0 === P) r = f;else if (-1 == r) r--;else if (f + f - 262 <= _) {
            for (g.set(g.subarray(f, f + f), 0), F -= f, _ -= f, N -= f, n = t = w; e = 65535 & y[--n], y[n] = f <= e ? e - f : 0, 0 != --t;);

            for (n = t = f; e = 65535 & m[--n], m[n] = f <= e ? e - f : 0, 0 != --t;);

            r += f;
          }
          if (0 === l.avail_in) return;
          t = l.read_buf(g, _ + P, r), 3 <= (P += t) && (v = ((v = 255 & g[_]) << x ^ 255 & g[_ + 1]) & b);
        } while (P < 262 && 0 !== l.avail_in);
      }

      function ht(t) {
        var e,
            n,
            r = I,
            i = _,
            o = k,
            a = f - 262 < _ ? _ - (f - 262) : 0,
            s = M,
            l = d,
            h = _ + 258,
            u = g[i + o - 1],
            c = g[i + o];
        E <= k && (r >>= 2), P < s && (s = P);

        do {
          if (g[(e = t) + o] == c && g[e + o - 1] == u && g[e] == g[i] && g[++e] == g[i + 1]) {
            i += 2, e++;

            do {} while (g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && g[++i] == g[++e] && i < h);

            if (n = 258 - (h - i), i = h - 258, o < n) {
              if (F = t, s <= (o = n)) break;
              u = g[i + o - 1], c = g[i + o];
            }
          }
        } while ((t = 65535 & m[t & l]) > a && 0 != --r);

        return o <= P ? o : P;
      }

      function ut(t) {
        return t.total_in = t.total_out = 0, t.msg = null, V.pending = 0, V.pending_out = 0, h = 113, c = 0, G.dyn_tree = s, G.stat_desc = ft.static_l_desc, Y.dyn_tree = O, Y.stat_desc = ft.static_d_desc, J.dyn_tree = q, J.stat_desc = ft.static_bl_desc, W = H = 0, z = 8, X(), function () {
          var t;

          for (i = 2 * f, t = y[w - 1] = 0; t < w - 1; t++) y[t] = 0;

          C = pt[B].max_lazy, E = pt[B].good_length, M = pt[B].nice_length, I = pt[B].max_chain, L = k = 2, v = S = P = N = _ = 0;
        }(), 0;
      }

      V.depth = [], V.bl_count = [], V.heap = [], s = [], O = [], q = [], V.pqdownheap = function (t, e) {
        for (var n = V.heap, r = n[e], i = e << 1; i <= V.heap_len && (i < V.heap_len && gt(t, n[i + 1], n[i], V.depth) && i++, !gt(t, r, n[i], V.depth));) n[e] = n[i], e = i, i <<= 1;

        n[e] = r;
      }, V.deflateInit = function (t, e, n, r, i, o) {
        return r || (r = 8), i || (i = 8), o || (o = 0), t.msg = null, -1 == e && (e = 6), i < 1 || 9 < i || 8 != r || n < 9 || 15 < n || e < 0 || 9 < e || o < 0 || 2 < o ? -2 : (t.dstate = V, d = (f = 1 << (p = n)) - 1, b = (w = 1 << (a = i + 7)) - 1, x = Math.floor((a + 3 - 1) / 3), g = new Uint8Array(2 * f), m = [], y = [], R = 1 << i + 6, V.pending_buf = new Uint8Array(4 * R), u = 4 * R, U = Math.floor(R / 2), T = 3 * R, B = e, j = o, ut(t));
      }, V.deflateEnd = function () {
        return 42 != h && 113 != h && 666 != h ? -2 : (V.pending_buf = null, g = m = y = null, V.dstate = null, 113 == h ? -3 : 0);
      }, V.deflateParams = function (t, e, n) {
        var r = 0;
        return -1 == e && (e = 6), e < 0 || 9 < e || n < 0 || 2 < n ? -2 : (pt[B].func != pt[e].func && 0 !== t.total_in && (r = t.deflate(1)), B != e && (C = pt[B = e].max_lazy, E = pt[B].good_length, M = pt[B].nice_length, I = pt[B].max_chain), j = n, r);
      }, V.deflateSetDictionary = function (t, e, n) {
        var r,
            i = n,
            o = 0;
        if (!e || 42 != h) return -2;
        if (i < 3) return 0;

        for (f - 262 < i && (o = n - (i = f - 262)), g.set(e.subarray(o, o + i), 0), N = _ = i, v = ((v = 255 & g[0]) << x ^ 255 & g[1]) & b, r = 0; r <= i - 3; r++) v = (v << x ^ 255 & g[r + 2]) & b, m[r & d] = y[v], y[v] = r;

        return 0;
      }, V.deflate = function (t, e) {
        var n, r, i, o, a, s;
        if (4 < e || e < 0) return -2;
        if (!t.next_out || !t.next_in && 0 !== t.avail_in || 666 == h && 4 != e) return t.msg = dt[4], -2;
        if (0 === t.avail_out) return t.msg = dt[7], -5;

        if (l = t, o = c, c = e, 42 == h && (r = 8 + (p - 8 << 4) << 8, 3 < (i = (B - 1 & 255) >> 1) && (i = 3), r |= i << 6, 0 !== _ && (r |= 32), h = 113, Z((s = r += 31 - r % 31) >> 8 & 255), Z(255 & s)), 0 !== V.pending) {
          if (l.flush_pending(), 0 === l.avail_out) return c = -1, 0;
        } else if (0 === l.avail_in && e <= o && 4 != e) return l.msg = dt[7], -5;

        if (666 == h && 0 !== l.avail_in) return t.msg = dt[7], -5;

        if (0 !== l.avail_in || 0 !== P || 0 != e && 666 != h) {
          switch (a = -1, pt[B].func) {
            case 0:
              a = function (t) {
                var e,
                    n = 65535;

                for (u - 5 < n && (n = u - 5);;) {
                  if (P <= 1) {
                    if (lt(), 0 === P && 0 == t) return 0;
                    if (0 === P) break;
                  }

                  if (_ += P, e = N + n, ((P = 0) === _ || e <= _) && (P = _ - e, _ = e, st(!1), 0 === l.avail_out)) return 0;
                  if (f - 262 <= _ - N && (st(!1), 0 === l.avail_out)) return 0;
                }

                return st(4 == t), 0 === l.avail_out ? 4 == t ? 2 : 0 : 4 == t ? 3 : 1;
              }(e);

              break;

            case 1:
              a = function (t) {
                for (var e, n = 0;;) {
                  if (P < 262) {
                    if (lt(), P < 262 && 0 == t) return 0;
                    if (0 === P) break;
                  }

                  if (3 <= P && (v = (v << x ^ 255 & g[_ + 2]) & b, n = 65535 & y[v], m[_ & d] = y[v], y[v] = _), 0 !== n && (_ - n & 65535) <= f - 262 && 2 != j && (L = ht(n)), 3 <= L) {
                    if (e = rt(_ - F, L - 3), P -= L, L <= C && 3 <= P) {
                      for (L--; v = (v << x ^ 255 & g[++_ + 2]) & b, n = 65535 & y[v], m[_ & d] = y[v], y[v] = _, 0 != --L;);

                      _++;
                    } else _ += L, L = 0, v = ((v = 255 & g[_]) << x ^ 255 & g[_ + 1]) & b;
                  } else e = rt(0, 255 & g[_]), P--, _++;
                  if (e && (st(!1), 0 === l.avail_out)) return 0;
                }

                return st(4 == t), 0 === l.avail_out ? 4 == t ? 2 : 0 : 4 == t ? 3 : 1;
              }(e);

              break;

            case 2:
              a = function (t) {
                for (var e, n, r = 0;;) {
                  if (P < 262) {
                    if (lt(), P < 262 && 0 == t) return 0;
                    if (0 === P) break;
                  }

                  if (3 <= P && (v = (v << x ^ 255 & g[_ + 2]) & b, r = 65535 & y[v], m[_ & d] = y[v], y[v] = _), k = L, A = F, L = 2, 0 !== r && k < C && (_ - r & 65535) <= f - 262 && (2 != j && (L = ht(r)), L <= 5 && (1 == j || 3 == L && 4096 < _ - F) && (L = 2)), 3 <= k && L <= k) {
                    for (n = _ + P - 3, e = rt(_ - 1 - A, k - 3), P -= k - 1, k -= 2; ++_ <= n && (v = (v << x ^ 255 & g[_ + 2]) & b, r = 65535 & y[v], m[_ & d] = y[v], y[v] = _), 0 != --k;);

                    if (S = 0, L = 2, _++, e && (st(!1), 0 === l.avail_out)) return 0;
                  } else if (0 !== S) {
                    if ((e = rt(0, 255 & g[_ - 1])) && st(!1), _++, P--, 0 === l.avail_out) return 0;
                  } else S = 1, _++, P--;
                }

                return 0 !== S && (e = rt(0, 255 & g[_ - 1]), S = 0), st(4 == t), 0 === l.avail_out ? 4 == t ? 2 : 0 : 4 == t ? 3 : 1;
              }(e);

          }

          if (2 != a && 3 != a || (h = 666), 0 == a || 2 == a) return 0 === l.avail_out && (c = -1), 0;

          if (1 == a) {
            if (1 == e) $(2, 3), tt(256, ft.static_ltree), nt(), 1 + z + 10 - W < 9 && ($(2, 3), tt(256, ft.static_ltree), nt()), z = 7;else if (at(0, 0, !1), 3 == e) for (n = 0; n < w; n++) y[n] = 0;
            if (l.flush_pending(), 0 === l.avail_out) return c = -1, 0;
          }
        }

        return 4 != e ? 0 : 1;
      };
    }

    function i() {
      this.next_in_index = 0, this.next_out_index = 0, this.avail_in = 0, this.total_in = 0, this.avail_out = 0, this.total_out = 0;
    }

    i.prototype = {
      deflateInit: function (t, e) {
        return this.dstate = new r(), e || (e = d), this.dstate.deflateInit(this, t, e);
      },
      deflate: function (t) {
        return this.dstate ? this.dstate.deflate(this, t) : -2;
      },
      deflateEnd: function () {
        if (!this.dstate) return -2;
        var t = this.dstate.deflateEnd();
        return this.dstate = null, t;
      },
      deflateParams: function (t, e) {
        return this.dstate ? this.dstate.deflateParams(this, t, e) : -2;
      },
      deflateSetDictionary: function (t, e) {
        return this.dstate ? this.dstate.deflateSetDictionary(this, t, e) : -2;
      },
      read_buf: function (t, e, n) {
        var r = this.avail_in;
        return n < r && (r = n), 0 === r ? 0 : (this.avail_in -= r, t.set(this.next_in.subarray(this.next_in_index, this.next_in_index + r), e), this.next_in_index += r, this.total_in += r, r);
      },
      flush_pending: function () {
        var t = this,
            e = t.dstate.pending;
        e > t.avail_out && (e = t.avail_out), 0 !== e && (t.next_out.set(t.dstate.pending_buf.subarray(t.dstate.pending_out, t.dstate.pending_out + e), t.next_out_index), t.next_out_index += e, t.dstate.pending_out += e, t.total_out += e, t.avail_out -= e, t.dstate.pending -= e, 0 === t.dstate.pending && (t.dstate.pending_out = 0));
      }
    };
    var o = t.zip || t;

    o.Deflater = o._jzlib_Deflater = function (t) {
      var s = new i(),
          l = new Uint8Array(512),
          e = t ? t.level : -1;
      void 0 === e && (e = -1), s.deflateInit(e), s.next_out = l, this.append = function (t, e) {
        var n,
            r = [],
            i = 0,
            o = 0,
            a = 0;

        if (t.length) {
          s.next_in_index = 0, s.next_in = t, s.avail_in = t.length;

          do {
            if (s.next_out_index = 0, s.avail_out = 512, 0 != s.deflate(0)) throw new Error("deflating: " + s.msg);
            s.next_out_index && (512 == s.next_out_index ? r.push(new Uint8Array(l)) : r.push(new Uint8Array(l.subarray(0, s.next_out_index)))), a += s.next_out_index, e && 0 < s.next_in_index && s.next_in_index != i && (e(s.next_in_index), i = s.next_in_index);
          } while (0 < s.avail_in || 0 === s.avail_out);

          return n = new Uint8Array(a), r.forEach(function (t) {
            n.set(t, o), o += t.length;
          }), n;
        }
      }, this.flush = function () {
        var t,
            e,
            n = [],
            r = 0,
            i = 0;

        do {
          if (s.next_out_index = 0, s.avail_out = 512, 1 != (t = s.deflate(4)) && 0 != t) throw new Error("deflating: " + s.msg);
          0 < 512 - s.avail_out && n.push(new Uint8Array(l.subarray(0, s.next_out_index))), i += s.next_out_index;
        } while (0 < s.avail_in || 0 === s.avail_out);

        return s.deflateEnd(), e = new Uint8Array(i), n.forEach(function (t) {
          e.set(t, r), r += t.length;
        }), e;
      };
    };
  }("undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")()), ("undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")()).RGBColor = function (t) {
    var e;
    t = t || "", this.ok = !1, "#" == t.charAt(0) && (t = t.substr(1, 6)), t = (t = t.replace(/ /g, "")).toLowerCase();
    var n = {
      aliceblue: "f0f8ff",
      antiquewhite: "faebd7",
      aqua: "00ffff",
      aquamarine: "7fffd4",
      azure: "f0ffff",
      beige: "f5f5dc",
      bisque: "ffe4c4",
      black: "000000",
      blanchedalmond: "ffebcd",
      blue: "0000ff",
      blueviolet: "8a2be2",
      brown: "a52a2a",
      burlywood: "deb887",
      cadetblue: "5f9ea0",
      chartreuse: "7fff00",
      chocolate: "d2691e",
      coral: "ff7f50",
      cornflowerblue: "6495ed",
      cornsilk: "fff8dc",
      crimson: "dc143c",
      cyan: "00ffff",
      darkblue: "00008b",
      darkcyan: "008b8b",
      darkgoldenrod: "b8860b",
      darkgray: "a9a9a9",
      darkgreen: "006400",
      darkkhaki: "bdb76b",
      darkmagenta: "8b008b",
      darkolivegreen: "556b2f",
      darkorange: "ff8c00",
      darkorchid: "9932cc",
      darkred: "8b0000",
      darksalmon: "e9967a",
      darkseagreen: "8fbc8f",
      darkslateblue: "483d8b",
      darkslategray: "2f4f4f",
      darkturquoise: "00ced1",
      darkviolet: "9400d3",
      deeppink: "ff1493",
      deepskyblue: "00bfff",
      dimgray: "696969",
      dodgerblue: "1e90ff",
      feldspar: "d19275",
      firebrick: "b22222",
      floralwhite: "fffaf0",
      forestgreen: "228b22",
      fuchsia: "ff00ff",
      gainsboro: "dcdcdc",
      ghostwhite: "f8f8ff",
      gold: "ffd700",
      goldenrod: "daa520",
      gray: "808080",
      green: "008000",
      greenyellow: "adff2f",
      honeydew: "f0fff0",
      hotpink: "ff69b4",
      indianred: "cd5c5c",
      indigo: "4b0082",
      ivory: "fffff0",
      khaki: "f0e68c",
      lavender: "e6e6fa",
      lavenderblush: "fff0f5",
      lawngreen: "7cfc00",
      lemonchiffon: "fffacd",
      lightblue: "add8e6",
      lightcoral: "f08080",
      lightcyan: "e0ffff",
      lightgoldenrodyellow: "fafad2",
      lightgrey: "d3d3d3",
      lightgreen: "90ee90",
      lightpink: "ffb6c1",
      lightsalmon: "ffa07a",
      lightseagreen: "20b2aa",
      lightskyblue: "87cefa",
      lightslateblue: "8470ff",
      lightslategray: "778899",
      lightsteelblue: "b0c4de",
      lightyellow: "ffffe0",
      lime: "00ff00",
      limegreen: "32cd32",
      linen: "faf0e6",
      magenta: "ff00ff",
      maroon: "800000",
      mediumaquamarine: "66cdaa",
      mediumblue: "0000cd",
      mediumorchid: "ba55d3",
      mediumpurple: "9370d8",
      mediumseagreen: "3cb371",
      mediumslateblue: "7b68ee",
      mediumspringgreen: "00fa9a",
      mediumturquoise: "48d1cc",
      mediumvioletred: "c71585",
      midnightblue: "191970",
      mintcream: "f5fffa",
      mistyrose: "ffe4e1",
      moccasin: "ffe4b5",
      navajowhite: "ffdead",
      navy: "000080",
      oldlace: "fdf5e6",
      olive: "808000",
      olivedrab: "6b8e23",
      orange: "ffa500",
      orangered: "ff4500",
      orchid: "da70d6",
      palegoldenrod: "eee8aa",
      palegreen: "98fb98",
      paleturquoise: "afeeee",
      palevioletred: "d87093",
      papayawhip: "ffefd5",
      peachpuff: "ffdab9",
      peru: "cd853f",
      pink: "ffc0cb",
      plum: "dda0dd",
      powderblue: "b0e0e6",
      purple: "800080",
      red: "ff0000",
      rosybrown: "bc8f8f",
      royalblue: "4169e1",
      saddlebrown: "8b4513",
      salmon: "fa8072",
      sandybrown: "f4a460",
      seagreen: "2e8b57",
      seashell: "fff5ee",
      sienna: "a0522d",
      silver: "c0c0c0",
      skyblue: "87ceeb",
      slateblue: "6a5acd",
      slategray: "708090",
      snow: "fffafa",
      springgreen: "00ff7f",
      steelblue: "4682b4",
      tan: "d2b48c",
      teal: "008080",
      thistle: "d8bfd8",
      tomato: "ff6347",
      turquoise: "40e0d0",
      violet: "ee82ee",
      violetred: "d02090",
      wheat: "f5deb3",
      white: "ffffff",
      whitesmoke: "f5f5f5",
      yellow: "ffff00",
      yellowgreen: "9acd32"
    };

    for (var r in n) t == r && (t = n[r]);

    for (var i = [{
      re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
      example: ["rgb(123, 234, 45)", "rgb(255,234,245)"],
      process: function (t) {
        return [parseInt(t[1]), parseInt(t[2]), parseInt(t[3])];
      }
    }, {
      re: /^(\w{2})(\w{2})(\w{2})$/,
      example: ["#00ff00", "336699"],
      process: function (t) {
        return [parseInt(t[1], 16), parseInt(t[2], 16), parseInt(t[3], 16)];
      }
    }, {
      re: /^(\w{1})(\w{1})(\w{1})$/,
      example: ["#fb0", "f0f"],
      process: function (t) {
        return [parseInt(t[1] + t[1], 16), parseInt(t[2] + t[2], 16), parseInt(t[3] + t[3], 16)];
      }
    }], o = 0; o < i.length; o++) {
      var a = i[o].re,
          s = i[o].process,
          l = a.exec(t);
      l && (e = s(l), this.r = e[0], this.g = e[1], this.b = e[2], this.ok = !0);
    }

    this.r = this.r < 0 || isNaN(this.r) ? 0 : 255 < this.r ? 255 : this.r, this.g = this.g < 0 || isNaN(this.g) ? 0 : 255 < this.g ? 255 : this.g, this.b = this.b < 0 || isNaN(this.b) ? 0 : 255 < this.b ? 255 : this.b, this.toRGB = function () {
      return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
    }, this.toHex = function () {
      var t = this.r.toString(16),
          e = this.g.toString(16),
          n = this.b.toString(16);
      return 1 == t.length && (t = "0" + t), 1 == e.length && (e = "0" + e), 1 == n.length && (n = "0" + n), "#" + t + e + n;
    };
  }, function (t) {
    var n = "+".charCodeAt(0),
        r = "/".charCodeAt(0),
        i = "0".charCodeAt(0),
        o = "a".charCodeAt(0),
        a = "A".charCodeAt(0),
        s = "-".charCodeAt(0),
        l = "_".charCodeAt(0),
        u = function (t) {
      var e = t.charCodeAt(0);
      return e === n || e === s ? 62 : e === r || e === l ? 63 : e < i ? -1 : e < i + 10 ? e - i + 26 + 26 : e < a + 26 ? e - a : e < o + 26 ? e - o + 26 : void 0;
    };

    t.API.TTFFont = function () {
      function i(t, e, n) {
        var r;

        if (this.rawData = t, r = this.contents = new J(t), this.contents.pos = 4, "ttcf" === r.readString(4)) {
          if (!e) throw new Error("Must specify a font name for TTC files.");
          throw new Error("Font " + e + " not found in TTC file.");
        }

        r.pos = 0, this.parse(), this.subset = new P(this), this.registerTTF();
      }

      return i.open = function (t, e, n, r) {
        if ("string" != typeof n) throw new Error("Invalid argument supplied in TTFFont.open");
        return new i(function (t) {
          var e, n, r, i, o, a;
          if (0 < t.length % 4) throw new Error("Invalid string. Length must be a multiple of 4");
          var s = t.length;
          o = "=" === t.charAt(s - 2) ? 2 : "=" === t.charAt(s - 1) ? 1 : 0, a = new Uint8Array(3 * t.length / 4 - o), r = 0 < o ? t.length - 4 : t.length;
          var l = 0;

          function h(t) {
            a[l++] = t;
          }

          for (n = e = 0; e < r; e += 4, n += 3) h((16711680 & (i = u(t.charAt(e)) << 18 | u(t.charAt(e + 1)) << 12 | u(t.charAt(e + 2)) << 6 | u(t.charAt(e + 3)))) >> 16), h((65280 & i) >> 8), h(255 & i);

          return 2 === o ? h(255 & (i = u(t.charAt(e)) << 2 | u(t.charAt(e + 1)) >> 4)) : 1 === o && (h((i = u(t.charAt(e)) << 10 | u(t.charAt(e + 1)) << 4 | u(t.charAt(e + 2)) >> 2) >> 8 & 255), h(255 & i)), a;
        }(n), e, r);
      }, i.prototype.parse = function () {
        return this.directory = new e(this.contents), this.head = new p(this), this.name = new b(this), this.cmap = new y(this), this.toUnicode = new Map(), this.hhea = new g(this), this.maxp = new x(this), this.hmtx = new N(this), this.post = new v(this), this.os2 = new m(this), this.loca = new F(this), this.glyf = new A(this), this.ascender = this.os2.exists && this.os2.ascender || this.hhea.ascender, this.decender = this.os2.exists && this.os2.decender || this.hhea.decender, this.lineGap = this.os2.exists && this.os2.lineGap || this.hhea.lineGap, this.bbox = [this.head.xMin, this.head.yMin, this.head.xMax, this.head.yMax];
      }, i.prototype.registerTTF = function () {
        var i, t, e, n, r;
        if (this.scaleFactor = 1e3 / this.head.unitsPerEm, this.bbox = function () {
          var t, e, n, r;

          for (r = [], t = 0, e = (n = this.bbox).length; t < e; t++) i = n[t], r.push(Math.round(i * this.scaleFactor));

          return r;
        }.call(this), this.stemV = 0, this.post.exists ? (e = 255 & (n = this.post.italic_angle), !0 & (t = n >> 16) && (t = -(1 + (65535 ^ t))), this.italicAngle = +(t + "." + e)) : this.italicAngle = 0, this.ascender = Math.round(this.ascender * this.scaleFactor), this.decender = Math.round(this.decender * this.scaleFactor), this.lineGap = Math.round(this.lineGap * this.scaleFactor), this.capHeight = this.os2.exists && this.os2.capHeight || this.ascender, this.xHeight = this.os2.exists && this.os2.xHeight || 0, this.familyClass = (this.os2.exists && this.os2.familyClass || 0) >> 8, this.isSerif = 1 === (r = this.familyClass) || 2 === r || 3 === r || 4 === r || 5 === r || 7 === r, this.isScript = 10 === this.familyClass, this.flags = 0, this.post.isFixedPitch && (this.flags |= 1), this.isSerif && (this.flags |= 2), this.isScript && (this.flags |= 8), 0 !== this.italicAngle && (this.flags |= 64), this.flags |= 32, !this.cmap.unicode) throw new Error("No unicode cmap for font");
      }, i.prototype.characterToGlyph = function (t) {
        var e;
        return (null != (e = this.cmap.unicode) ? e.codeMap[t] : void 0) || 0;
      }, i.prototype.widthOfGlyph = function (t) {
        var e;
        return e = 1e3 / this.head.unitsPerEm, this.hmtx.forGlyph(t).advance * e;
      }, i.prototype.widthOfString = function (t, e, n) {
        var r, i, o, a, s;

        for (i = a = o = 0, s = (t = "" + t).length; 0 <= s ? a < s : s < a; i = 0 <= s ? ++a : --a) r = t.charCodeAt(i), o += this.widthOfGlyph(this.characterToGlyph(r)) + n * (1e3 / e) || 0;

        return o * (e / 1e3);
      }, i.prototype.lineHeight = function (t, e) {
        var n;
        return null == e && (e = !1), n = e ? this.lineGap : 0, (this.ascender + n - this.decender) / 1e3 * t;
      }, i;
    }();

    var h,
        J = function () {
      function t(t) {
        this.data = null != t ? t : [], this.pos = 0, this.length = this.data.length;
      }

      return t.prototype.readByte = function () {
        return this.data[this.pos++];
      }, t.prototype.writeByte = function (t) {
        return this.data[this.pos++] = t;
      }, t.prototype.readUInt32 = function () {
        return 16777216 * this.readByte() + (this.readByte() << 16) + (this.readByte() << 8) + this.readByte();
      }, t.prototype.writeUInt32 = function (t) {
        return this.writeByte(t >>> 24 & 255), this.writeByte(t >> 16 & 255), this.writeByte(t >> 8 & 255), this.writeByte(255 & t);
      }, t.prototype.readInt32 = function () {
        var t;
        return 2147483648 <= (t = this.readUInt32()) ? t - 4294967296 : t;
      }, t.prototype.writeInt32 = function (t) {
        return t < 0 && (t += 4294967296), this.writeUInt32(t);
      }, t.prototype.readUInt16 = function () {
        return this.readByte() << 8 | this.readByte();
      }, t.prototype.writeUInt16 = function (t) {
        return this.writeByte(t >> 8 & 255), this.writeByte(255 & t);
      }, t.prototype.readInt16 = function () {
        var t;
        return 32768 <= (t = this.readUInt16()) ? t - 65536 : t;
      }, t.prototype.writeInt16 = function (t) {
        return t < 0 && (t += 65536), this.writeUInt16(t);
      }, t.prototype.readString = function (t) {
        var e, n, r;

        for (n = [], e = r = 0; 0 <= t ? r < t : t < r; e = 0 <= t ? ++r : --r) n[e] = String.fromCharCode(this.readByte());

        return n.join("");
      }, t.prototype.writeString = function (t) {
        var e, n, r, i;

        for (i = [], e = n = 0, r = t.length; 0 <= r ? n < r : r < n; e = 0 <= r ? ++n : --n) i.push(this.writeByte(t.charCodeAt(e)));

        return i;
      }, t.prototype.readShort = function () {
        return this.readInt16();
      }, t.prototype.writeShort = function (t) {
        return this.writeInt16(t);
      }, t.prototype.readLongLong = function () {
        var t, e, n, r, i, o, a, s;
        return t = this.readByte(), e = this.readByte(), n = this.readByte(), r = this.readByte(), i = this.readByte(), o = this.readByte(), a = this.readByte(), s = this.readByte(), 128 & t ? -1 * (72057594037927940 * (255 ^ t) + 281474976710656 * (255 ^ e) + 1099511627776 * (255 ^ n) + 4294967296 * (255 ^ r) + 16777216 * (255 ^ i) + 65536 * (255 ^ o) + 256 * (255 ^ a) + (255 ^ s) + 1) : 72057594037927940 * t + 281474976710656 * e + 1099511627776 * n + 4294967296 * r + 16777216 * i + 65536 * o + 256 * a + s;
      }, t.prototype.writeLongLong = function (t) {
        var e, n;
        return e = Math.floor(t / 4294967296), n = 4294967295 & t, this.writeByte(e >> 24 & 255), this.writeByte(e >> 16 & 255), this.writeByte(e >> 8 & 255), this.writeByte(255 & e), this.writeByte(n >> 24 & 255), this.writeByte(n >> 16 & 255), this.writeByte(n >> 8 & 255), this.writeByte(255 & n);
      }, t.prototype.readInt = function () {
        return this.readInt32();
      }, t.prototype.writeInt = function (t) {
        return this.writeInt32(t);
      }, t.prototype.read = function (t) {
        var e, n;

        for (e = [], n = 0; 0 <= t ? n < t : t < n; 0 <= t ? ++n : --n) e.push(this.readByte());

        return e;
      }, t.prototype.write = function (t) {
        var e, n, r, i;

        for (i = [], n = 0, r = t.length; n < r; n++) e = t[n], i.push(this.writeByte(e));

        return i;
      }, t;
    }(),
        e = function () {
      var d;

      function t(t) {
        var e, n, r;

        for (this.scalarType = t.readInt(), this.tableCount = t.readShort(), this.searchRange = t.readShort(), this.entrySelector = t.readShort(), this.rangeShift = t.readShort(), this.tables = {}, n = 0, r = this.tableCount; 0 <= r ? n < r : r < n; 0 <= r ? ++n : --n) e = {
          tag: t.readString(4),
          checksum: t.readInt(),
          offset: t.readInt(),
          length: t.readInt()
        }, this.tables[e.tag] = e;
      }

      return t.prototype.encode = function (t) {
        var e, n, r, i, o, a, s, l, h, u, c, f, p;

        for (p in c = Object.keys(t).length, a = Math.log(2), h = 16 * Math.floor(Math.log(c) / a), i = Math.floor(h / a), l = 16 * c - h, (n = new J()).writeInt(this.scalarType), n.writeShort(c), n.writeShort(h), n.writeShort(i), n.writeShort(l), r = 16 * c, s = n.pos + r, o = null, f = [], t) for (u = t[p], n.writeString(p), n.writeInt(d(u)), n.writeInt(s), n.writeInt(u.length), f = f.concat(u), "head" === p && (o = s), s += u.length; s % 4;) f.push(0), s++;

        return n.write(f), e = 2981146554 - d(n.data), n.pos = o + 8, n.writeUInt32(e), n.data;
      }, d = function (t) {
        var e, n, r, i;

        for (t = L.call(t); t.length % 4;) t.push(0);

        for (n = new J(t), r = e = 0, i = t.length; r < i; r += 4) e += n.readUInt32();

        return 4294967295 & e;
      }, t;
    }(),
        c = {}.hasOwnProperty,
        f = function (t, e) {
      for (var n in e) c.call(e, n) && (t[n] = e[n]);

      function r() {
        this.constructor = t;
      }

      return r.prototype = e.prototype, t.prototype = new r(), t.__super__ = e.prototype, t;
    };

    h = function () {
      function t(t) {
        var e;
        this.file = t, e = this.file.directory.tables[this.tag], this.exists = !!e, e && (this.offset = e.offset, this.length = e.length, this.parse(this.file.contents));
      }

      return t.prototype.parse = function () {}, t.prototype.encode = function () {}, t.prototype.raw = function () {
        return this.exists ? (this.file.contents.pos = this.offset, this.file.contents.read(this.length)) : null;
      }, t;
    }();

    var p = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "head", e.prototype.parse = function (t) {
        return t.pos = this.offset, this.version = t.readInt(), this.revision = t.readInt(), this.checkSumAdjustment = t.readInt(), this.magicNumber = t.readInt(), this.flags = t.readShort(), this.unitsPerEm = t.readShort(), this.created = t.readLongLong(), this.modified = t.readLongLong(), this.xMin = t.readShort(), this.yMin = t.readShort(), this.xMax = t.readShort(), this.yMax = t.readShort(), this.macStyle = t.readShort(), this.lowestRecPPEM = t.readShort(), this.fontDirectionHint = t.readShort(), this.indexToLocFormat = t.readShort(), this.glyphDataFormat = t.readShort();
      }, e.prototype.encode = function (t) {
        var e;
        return (e = new J()).writeInt(this.version), e.writeInt(this.revision), e.writeInt(this.checkSumAdjustment), e.writeInt(this.magicNumber), e.writeShort(this.flags), e.writeShort(this.unitsPerEm), e.writeLongLong(this.created), e.writeLongLong(this.modified), e.writeShort(this.xMin), e.writeShort(this.yMin), e.writeShort(this.xMax), e.writeShort(this.yMax), e.writeShort(this.macStyle), e.writeShort(this.lowestRecPPEM), e.writeShort(this.fontDirectionHint), e.writeShort(t), e.writeShort(this.glyphDataFormat), e.data;
      }, e;
    }(),
        d = function () {
      function t(n, t) {
        var e, r, i, o, a, s, l, h, u, c, f, p, d, g, m, y, v, w;

        switch (this.platformID = n.readUInt16(), this.encodingID = n.readShort(), this.offset = t + n.readInt(), u = n.pos, n.pos = this.offset, this.format = n.readUInt16(), this.length = n.readUInt16(), this.language = n.readUInt16(), this.isUnicode = 3 === this.platformID && 1 === this.encodingID && 4 === this.format || 0 === this.platformID && 4 === this.format, this.codeMap = {}, this.format) {
          case 0:
            for (s = m = 0; m < 256; s = ++m) this.codeMap[s] = n.readByte();

            break;

          case 4:
            for (f = n.readUInt16(), c = f / 2, n.pos += 6, i = function () {
              var t, e;

              for (e = [], s = t = 0; 0 <= c ? t < c : c < t; s = 0 <= c ? ++t : --t) e.push(n.readUInt16());

              return e;
            }(), n.pos += 2, d = function () {
              var t, e;

              for (e = [], s = t = 0; 0 <= c ? t < c : c < t; s = 0 <= c ? ++t : --t) e.push(n.readUInt16());

              return e;
            }(), l = function () {
              var t, e;

              for (e = [], s = t = 0; 0 <= c ? t < c : c < t; s = 0 <= c ? ++t : --t) e.push(n.readUInt16());

              return e;
            }(), h = function () {
              var t, e;

              for (e = [], s = t = 0; 0 <= c ? t < c : c < t; s = 0 <= c ? ++t : --t) e.push(n.readUInt16());

              return e;
            }(), r = (this.length - n.pos + this.offset) / 2, a = function () {
              var t, e;

              for (e = [], s = t = 0; 0 <= r ? t < r : r < t; s = 0 <= r ? ++t : --t) e.push(n.readUInt16());

              return e;
            }(), s = y = 0, w = i.length; y < w; s = ++y) for (g = i[s], e = v = p = d[s]; p <= g ? v <= g : g <= v; e = p <= g ? ++v : --v) 0 === h[s] ? o = e + l[s] : 0 !== (o = a[h[s] / 2 + (e - p) - (c - s)] || 0) && (o += l[s]), this.codeMap[e] = 65535 & o;

        }

        n.pos = u;
      }

      return t.encode = function (t, e) {
        var n, r, i, o, a, s, l, h, u, c, f, p, d, g, m, y, v, w, b, x, N, L, A, S, _, F, P, k, I, C, B, j, E, M, O, q, T, R, D, U, z, H, W, V, G, Y;

        switch (k = new J(), o = Object.keys(t).sort(function (t, e) {
          return t - e;
        }), e) {
          case "macroman":
            for (d = 0, g = function () {
              var t, e;

              for (e = [], p = t = 0; t < 256; p = ++t) e.push(0);

              return e;
            }(), y = {
              0: 0
            }, i = {}, I = 0, E = o.length; I < E; I++) null == y[W = t[r = o[I]]] && (y[W] = ++d), i[r] = {
              old: t[r],
              new: y[t[r]]
            }, g[r] = y[t[r]];

            return k.writeUInt16(1), k.writeUInt16(0), k.writeUInt32(12), k.writeUInt16(0), k.writeUInt16(262), k.writeUInt16(0), k.write(g), {
              charMap: i,
              subtable: k.data,
              maxGlyphID: d + 1
            };

          case "unicode":
            for (F = [], u = [], y = {}, n = {}, m = l = null, C = v = 0, M = o.length; C < M; C++) null == y[b = t[r = o[C]]] && (y[b] = ++v), n[r] = {
              old: b,
              new: y[b]
            }, a = y[b] - r, null != m && a === l || (m && u.push(m), F.push(r), l = a), m = r;

            for (m && u.push(m), u.push(65535), F.push(65535), S = 2 * (A = F.length), L = 2 * Math.pow(Math.log(A) / Math.LN2, 2), c = Math.log(L / 2) / Math.LN2, N = 2 * A - L, s = [], x = [], f = [], p = B = 0, O = F.length; B < O; p = ++B) {
              if (_ = F[p], h = u[p], 65535 === _) {
                s.push(0), x.push(0);
                break;
              }

              if (32768 <= _ - (P = n[_].new)) for (s.push(0), x.push(2 * (f.length + A - p)), r = j = _; _ <= h ? j <= h : h <= j; r = _ <= h ? ++j : --j) f.push(n[r].new);else s.push(P - _), x.push(0);
            }

            for (k.writeUInt16(3), k.writeUInt16(1), k.writeUInt32(12), k.writeUInt16(4), k.writeUInt16(16 + 8 * A + 2 * f.length), k.writeUInt16(0), k.writeUInt16(S), k.writeUInt16(L), k.writeUInt16(c), k.writeUInt16(N), z = 0, q = u.length; z < q; z++) r = u[z], k.writeUInt16(r);

            for (k.writeUInt16(0), H = 0, T = F.length; H < T; H++) r = F[H], k.writeUInt16(r);

            for (V = 0, R = s.length; V < R; V++) a = s[V], k.writeUInt16(a);

            for (G = 0, D = x.length; G < D; G++) w = x[G], k.writeUInt16(w);

            for (Y = 0, U = f.length; Y < U; Y++) d = f[Y], k.writeUInt16(d);

            return {
              charMap: n,
              subtable: k.data,
              maxGlyphID: v + 1
            };
        }
      }, t;
    }(),
        y = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "cmap", e.prototype.parse = function (t) {
        var e, n, r;

        for (t.pos = this.offset, this.version = t.readUInt16(), n = t.readUInt16(), this.tables = [], this.unicode = null, r = 0; 0 <= n ? r < n : n < r; 0 <= n ? ++r : --r) e = new d(t, this.offset), this.tables.push(e), e.isUnicode && null == this.unicode && (this.unicode = e);

        return !0;
      }, e.encode = function (t, e) {
        var n, r;
        return null == e && (e = "macroman"), n = d.encode(t, e), (r = new J()).writeUInt16(0), r.writeUInt16(1), n.table = r.data.concat(n.subtable), n;
      }, e;
    }(),
        g = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "hhea", e.prototype.parse = function (t) {
        return t.pos = this.offset, this.version = t.readInt(), this.ascender = t.readShort(), this.decender = t.readShort(), this.lineGap = t.readShort(), this.advanceWidthMax = t.readShort(), this.minLeftSideBearing = t.readShort(), this.minRightSideBearing = t.readShort(), this.xMaxExtent = t.readShort(), this.caretSlopeRise = t.readShort(), this.caretSlopeRun = t.readShort(), this.caretOffset = t.readShort(), t.pos += 8, this.metricDataFormat = t.readShort(), this.numberOfMetrics = t.readUInt16();
      }, e;
    }(),
        m = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "OS/2", e.prototype.parse = function (n) {
        if (n.pos = this.offset, this.version = n.readUInt16(), this.averageCharWidth = n.readShort(), this.weightClass = n.readUInt16(), this.widthClass = n.readUInt16(), this.type = n.readShort(), this.ySubscriptXSize = n.readShort(), this.ySubscriptYSize = n.readShort(), this.ySubscriptXOffset = n.readShort(), this.ySubscriptYOffset = n.readShort(), this.ySuperscriptXSize = n.readShort(), this.ySuperscriptYSize = n.readShort(), this.ySuperscriptXOffset = n.readShort(), this.ySuperscriptYOffset = n.readShort(), this.yStrikeoutSize = n.readShort(), this.yStrikeoutPosition = n.readShort(), this.familyClass = n.readShort(), this.panose = function () {
          var t, e;

          for (e = [], t = 0; t < 10; ++t) e.push(n.readByte());

          return e;
        }(), this.charRange = function () {
          var t, e;

          for (e = [], t = 0; t < 4; ++t) e.push(n.readInt());

          return e;
        }(), this.vendorID = n.readString(4), this.selection = n.readShort(), this.firstCharIndex = n.readShort(), this.lastCharIndex = n.readShort(), 0 < this.version && (this.ascent = n.readShort(), this.descent = n.readShort(), this.lineGap = n.readShort(), this.winAscent = n.readShort(), this.winDescent = n.readShort(), this.codePageRange = function () {
          var t, e;

          for (e = [], t = 0; t < 2; ++t) e.push(n.readInt());

          return e;
        }(), 1 < this.version)) return this.xHeight = n.readShort(), this.capHeight = n.readShort(), this.defaultChar = n.readShort(), this.breakChar = n.readShort(), this.maxContext = n.readShort();
      }, e;
    }(),
        v = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "post", e.prototype.parse = function (r) {
        var t, e, n, i;

        switch (r.pos = this.offset, this.format = r.readInt(), this.italicAngle = r.readInt(), this.underlinePosition = r.readShort(), this.underlineThickness = r.readShort(), this.isFixedPitch = r.readInt(), this.minMemType42 = r.readInt(), this.maxMemType42 = r.readInt(), this.minMemType1 = r.readInt(), this.maxMemType1 = r.readInt(), this.format) {
          case 65536:
            break;

          case 131072:
            for (e = r.readUInt16(), this.glyphNameIndex = [], n = 0; 0 <= e ? n < e : e < n; 0 <= e ? ++n : --n) this.glyphNameIndex.push(r.readUInt16());

            for (this.names = [], i = []; r.pos < this.offset + this.length;) t = r.readByte(), i.push(this.names.push(r.readString(t)));

            return i;

          case 151552:
            return e = r.readUInt16(), this.offsets = r.read(e);

          case 196608:
            break;

          case 262144:
            return this.map = function () {
              var t, e, n;

              for (n = [], t = 0, e = this.file.maxp.numGlyphs; 0 <= e ? t < e : e < t; 0 <= e ? ++t : --t) n.push(r.readUInt32());

              return n;
            }.call(this);
        }
      }, e;
    }(),
        w = function (t, e) {
      this.raw = t, this.length = t.length, this.platformID = e.platformID, this.encodingID = e.encodingID, this.languageID = e.languageID;
    },
        b = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "name", e.prototype.parse = function (t) {
        var e, n, r, i, o, a, s, l, h, u, c, f;

        for (t.pos = this.offset, t.readShort(), e = t.readShort(), a = t.readShort(), n = [], i = h = 0; 0 <= e ? h < e : e < h; i = 0 <= e ? ++h : --h) n.push({
          platformID: t.readShort(),
          encodingID: t.readShort(),
          languageID: t.readShort(),
          nameID: t.readShort(),
          length: t.readShort(),
          offset: this.offset + a + t.readShort()
        });

        for (s = {}, i = u = 0, c = n.length; u < c; i = ++u) r = n[i], t.pos = r.offset, l = t.readString(r.length), o = new w(l, r), null == s[f = r.nameID] && (s[f] = []), s[r.nameID].push(o);

        this.strings = s, this.copyright = s[0], this.fontFamily = s[1], this.fontSubfamily = s[2], this.uniqueSubfamily = s[3], this.fontName = s[4], this.version = s[5];

        try {
          this.postscriptName = s[6][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "");
        } catch (t) {
          this.postscriptName = s[4][0].raw.replace(/[\x00-\x19\x80-\xff]/g, "");
        }

        return this.trademark = s[7], this.manufacturer = s[8], this.designer = s[9], this.description = s[10], this.vendorUrl = s[11], this.designerUrl = s[12], this.license = s[13], this.licenseUrl = s[14], this.preferredFamily = s[15], this.preferredSubfamily = s[17], this.compatibleFull = s[18], this.sampleText = s[19];
      }, e;
    }(),
        x = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "maxp", e.prototype.parse = function (t) {
        return t.pos = this.offset, this.version = t.readInt(), this.numGlyphs = t.readUInt16(), this.maxPoints = t.readUInt16(), this.maxContours = t.readUInt16(), this.maxCompositePoints = t.readUInt16(), this.maxComponentContours = t.readUInt16(), this.maxZones = t.readUInt16(), this.maxTwilightPoints = t.readUInt16(), this.maxStorage = t.readUInt16(), this.maxFunctionDefs = t.readUInt16(), this.maxInstructionDefs = t.readUInt16(), this.maxStackElements = t.readUInt16(), this.maxSizeOfInstructions = t.readUInt16(), this.maxComponentElements = t.readUInt16(), this.maxComponentDepth = t.readUInt16();
      }, e;
    }(),
        N = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "hmtx", e.prototype.parse = function (n) {
        var t, r, i, e, o, a, s;

        for (n.pos = this.offset, this.metrics = [], e = 0, a = this.file.hhea.numberOfMetrics; 0 <= a ? e < a : a < e; 0 <= a ? ++e : --e) this.metrics.push({
          advance: n.readUInt16(),
          lsb: n.readInt16()
        });

        for (r = this.file.maxp.numGlyphs - this.file.hhea.numberOfMetrics, this.leftSideBearings = function () {
          var t, e;

          for (e = [], t = 0; 0 <= r ? t < r : r < t; 0 <= r ? ++t : --t) e.push(n.readInt16());

          return e;
        }(), this.widths = function () {
          var t, e, n, r;

          for (r = [], t = 0, e = (n = this.metrics).length; t < e; t++) i = n[t], r.push(i.advance);

          return r;
        }.call(this), t = this.widths[this.widths.length - 1], s = [], o = 0; 0 <= r ? o < r : r < o; 0 <= r ? ++o : --o) s.push(this.widths.push(t));

        return s;
      }, e.prototype.forGlyph = function (t) {
        return t in this.metrics ? this.metrics[t] : {
          advance: this.metrics[this.metrics.length - 1].advance,
          lsb: this.leftSideBearings[t - this.metrics.length]
        };
      }, e;
    }(),
        L = [].slice,
        A = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "glyf", e.prototype.parse = function (t) {
        return this.cache = {};
      }, e.prototype.glyphFor = function (t) {
        var e, n, r, i, o, a, s, l, h, u;
        return (t = t) in this.cache ? this.cache[t] : (i = this.file.loca, e = this.file.contents, n = i.indexOf(t), 0 === (r = i.lengthOf(t)) ? this.cache[t] = null : (e.pos = this.offset + n, o = (a = new J(e.read(r))).readShort(), l = a.readShort(), u = a.readShort(), s = a.readShort(), h = a.readShort(), this.cache[t] = -1 === o ? new _(a, l, u, s, h) : new S(a, o, l, u, s, h), this.cache[t]));
      }, e.prototype.encode = function (t, e, n) {
        var r, i, o, a, s;

        for (o = [], i = [], a = 0, s = e.length; a < s; a++) r = t[e[a]], i.push(o.length), r && (o = o.concat(r.encode(n)));

        return i.push(o.length), {
          table: o,
          offsets: i
        };
      }, e;
    }(),
        S = function () {
      function t(t, e, n, r, i, o) {
        this.raw = t, this.numberOfContours = e, this.xMin = n, this.yMin = r, this.xMax = i, this.yMax = o, this.compound = !1;
      }

      return t.prototype.encode = function () {
        return this.raw.data;
      }, t;
    }(),
        _ = function () {
      function t(t, e, n, r, i) {
        var o, a;

        for (this.raw = t, this.xMin = e, this.yMin = n, this.xMax = r, this.yMax = i, this.compound = !0, this.glyphIDs = [], this.glyphOffsets = [], o = this.raw; a = o.readShort(), this.glyphOffsets.push(o.pos), this.glyphIDs.push(o.readShort()), 32 & a;) o.pos += 1 & a ? 4 : 2, 128 & a ? o.pos += 8 : 64 & a ? o.pos += 4 : 8 & a && (o.pos += 2);
      }

      return t.prototype.encode = function (t) {
        var e, n, r, i, o;

        for (n = new J(L.call(this.raw.data)), e = r = 0, i = (o = this.glyphIDs).length; r < i; e = ++r) o[e], n.pos = this.glyphOffsets[e];

        return n.data;
      }, t;
    }(),
        F = function (t) {
      function e() {
        return e.__super__.constructor.apply(this, arguments);
      }

      return f(e, h), e.prototype.tag = "loca", e.prototype.parse = function (r) {
        var t;
        return r.pos = this.offset, t = this.file.head.indexToLocFormat, this.offsets = 0 === t ? function () {
          var t, e, n;

          for (n = [], t = 0, e = this.length; t < e; t += 2) n.push(2 * r.readUInt16());

          return n;
        }.call(this) : function () {
          var t, e, n;

          for (n = [], t = 0, e = this.length; t < e; t += 4) n.push(r.readUInt32());

          return n;
        }.call(this);
      }, e.prototype.indexOf = function (t) {
        return this.offsets[t];
      }, e.prototype.lengthOf = function (t) {
        return this.offsets[t + 1] - this.offsets[t];
      }, e.prototype.encode = function (t, e) {
        for (var n = new Uint32Array(this.offsets.length), r = 0, i = 0, o = 0; o < n.length; ++o) if (n[o] = r, i < e.length && e[i] == o) {
          ++i, n[o] = r;
          var a = this.offsets[o],
              s = this.offsets[o + 1] - a;
          0 < s && (r += s);
        }

        for (var l = new Array(4 * n.length), h = 0; h < n.length; ++h) l[4 * h + 3] = 255 & n[h], l[4 * h + 2] = (65280 & n[h]) >> 8, l[4 * h + 1] = (16711680 & n[h]) >> 16, l[4 * h] = (4278190080 & n[h]) >> 24;

        return l;
      }, e;
    }(),
        P = function () {
      function t(t) {
        this.font = t, this.subset = {}, this.unicodes = {}, this.next = 33;
      }

      return t.prototype.generateCmap = function () {
        var t, e, n, r, i;

        for (e in r = this.font.cmap.tables[0].codeMap, t = {}, i = this.subset) n = i[e], t[e] = r[n];

        return t;
      }, t.prototype.glyphsFor = function (t) {
        var e, n, r, i, o, a, s;

        for (r = {}, o = 0, a = t.length; o < a; o++) r[i = t[o]] = this.font.glyf.glyphFor(i);

        for (i in e = [], r) (null != (n = r[i]) ? n.compound : void 0) && e.push.apply(e, n.glyphIDs);

        if (0 < e.length) for (i in s = this.glyphsFor(e)) n = s[i], r[i] = n;
        return r;
      }, t.prototype.encode = function (t, e) {
        var n, r, i, o, a, s, l, h, u, c, f, p, d, g, m;

        for (r in n = y.encode(this.generateCmap(), "unicode"), o = this.glyphsFor(t), f = {
          0: 0
        }, m = n.charMap) f[(s = m[r]).old] = s.new;

        for (p in c = n.maxGlyphID, o) p in f || (f[p] = c++);

        return h = function (t) {
          var e, n;

          for (e in n = {}, t) n[t[e]] = e;

          return n;
        }(f), u = Object.keys(h).sort(function (t, e) {
          return t - e;
        }), d = function () {
          var t, e, n;

          for (n = [], t = 0, e = u.length; t < e; t++) a = u[t], n.push(h[a]);

          return n;
        }(), i = this.font.glyf.encode(o, d, f), l = this.font.loca.encode(i.offsets, d), g = {
          cmap: this.font.cmap.raw(),
          glyf: i.table,
          loca: l,
          hmtx: this.font.hmtx.raw(),
          hhea: this.font.hhea.raw(),
          maxp: this.font.maxp.raw(),
          post: this.font.post.raw(),
          name: this.font.name.raw(),
          head: this.font.head.encode(e)
        }, this.font.os2.exists && (g["OS/2"] = this.font.os2.raw()), this.font.directory.encode(g);
      }, t;
    }();

    t.API.PDFObject = function () {
      var o;

      function a() {}

      return o = function (t, e) {
        return (Array(e + 1).join("0") + t).slice(-e);
      }, a.convert = function (r) {
        var i, t, e, n;
        if (Array.isArray(r)) return "[" + function () {
          var t, e, n;

          for (n = [], t = 0, e = r.length; t < e; t++) i = r[t], n.push(a.convert(i));

          return n;
        }().join(" ") + "]";
        if ("string" == typeof r) return "/" + r;
        if (null != r ? r.isString : void 0) return "(" + r + ")";
        if (r instanceof Date) return "(D:" + o(r.getUTCFullYear(), 4) + o(r.getUTCMonth(), 2) + o(r.getUTCDate(), 2) + o(r.getUTCHours(), 2) + o(r.getUTCMinutes(), 2) + o(r.getUTCSeconds(), 2) + "Z)";
        if ("[object Object]" !== {}.toString.call(r)) return "" + r;

        for (t in e = ["<<"], r) n = r[t], e.push("/" + t + " " + a.convert(n));

        return e.push(">>"), e.join("\n");
      }, a;
    }();
  }(lt),
  /*
    # PNG.js
    # Copyright (c) 2011 Devon Govett
    # MIT LICENSE
    # 
    # 
    */
  Nt = "undefined" != typeof self && self || "undefined" != typeof window && window || "undefined" != typeof commonjsGlobal && commonjsGlobal || Function('return typeof this === "object" && this.content')() || Function("return this")(), Lt = function () {
    var h, n, r;

    function i(t) {
      var e, n, r, i, o, a, s, l, h, u, c, f, p, d;

      for (this.data = t, this.pos = 8, this.palette = [], this.imgData = [], this.transparency = {}, this.animation = null, this.text = {}, a = null;;) {
        switch (e = this.readUInt32(), h = function () {
          var t, e;

          for (e = [], t = 0; t < 4; ++t) e.push(String.fromCharCode(this.data[this.pos++]));

          return e;
        }.call(this).join("")) {
          case "IHDR":
            this.width = this.readUInt32(), this.height = this.readUInt32(), this.bits = this.data[this.pos++], this.colorType = this.data[this.pos++], this.compressionMethod = this.data[this.pos++], this.filterMethod = this.data[this.pos++], this.interlaceMethod = this.data[this.pos++];
            break;

          case "acTL":
            this.animation = {
              numFrames: this.readUInt32(),
              numPlays: this.readUInt32() || 1 / 0,
              frames: []
            };
            break;

          case "PLTE":
            this.palette = this.read(e);
            break;

          case "fcTL":
            a && this.animation.frames.push(a), this.pos += 4, a = {
              width: this.readUInt32(),
              height: this.readUInt32(),
              xOffset: this.readUInt32(),
              yOffset: this.readUInt32()
            }, o = this.readUInt16(), i = this.readUInt16() || 100, a.delay = 1e3 * o / i, a.disposeOp = this.data[this.pos++], a.blendOp = this.data[this.pos++], a.data = [];
            break;

          case "IDAT":
          case "fdAT":
            for ("fdAT" === h && (this.pos += 4, e -= 4), t = (null != a ? a.data : void 0) || this.imgData, f = 0; 0 <= e ? f < e : e < f; 0 <= e ? ++f : --f) t.push(this.data[this.pos++]);

            break;

          case "tRNS":
            switch (this.transparency = {}, this.colorType) {
              case 3:
                if (r = this.palette.length / 3, this.transparency.indexed = this.read(e), this.transparency.indexed.length > r) throw new Error("More transparent colors than palette size");
                if (0 < (u = r - this.transparency.indexed.length)) for (p = 0; 0 <= u ? p < u : u < p; 0 <= u ? ++p : --p) this.transparency.indexed.push(255);
                break;

              case 0:
                this.transparency.grayscale = this.read(e)[0];
                break;

              case 2:
                this.transparency.rgb = this.read(e);
            }

            break;

          case "tEXt":
            s = (c = this.read(e)).indexOf(0), l = String.fromCharCode.apply(String, c.slice(0, s)), this.text[l] = String.fromCharCode.apply(String, c.slice(s + 1));
            break;

          case "IEND":
            return a && this.animation.frames.push(a), this.colors = function () {
              switch (this.colorType) {
                case 0:
                case 3:
                case 4:
                  return 1;

                case 2:
                case 6:
                  return 3;
              }
            }.call(this), this.hasAlphaChannel = 4 === (d = this.colorType) || 6 === d, n = this.colors + (this.hasAlphaChannel ? 1 : 0), this.pixelBitlength = this.bits * n, this.colorSpace = function () {
              switch (this.colors) {
                case 1:
                  return "DeviceGray";

                case 3:
                  return "DeviceRGB";
              }
            }.call(this), void (this.imgData = new Uint8Array(this.imgData));

          default:
            this.pos += e;
        }

        if (this.pos += 4, this.pos > this.data.length) throw new Error("Incomplete or corrupt PNG file");
      }
    }

    i.load = function (t, e, n) {
      var r;
      return "function" == typeof e && (n = e), (r = new XMLHttpRequest()).open("GET", t, !0), r.responseType = "arraybuffer", r.onload = function () {
        var t;
        return t = new i(new Uint8Array(r.response || r.mozResponseArrayBuffer)), "function" == typeof (null != e ? e.getContext : void 0) && t.render(e), "function" == typeof n ? n(t) : void 0;
      }, r.send(null);
    }, i.prototype.read = function (t) {
      var e, n;

      for (n = [], e = 0; 0 <= t ? e < t : t < e; 0 <= t ? ++e : --e) n.push(this.data[this.pos++]);

      return n;
    }, i.prototype.readUInt32 = function () {
      return this.data[this.pos++] << 24 | this.data[this.pos++] << 16 | this.data[this.pos++] << 8 | this.data[this.pos++];
    }, i.prototype.readUInt16 = function () {
      return this.data[this.pos++] << 8 | this.data[this.pos++];
    }, i.prototype.decodePixels = function (C) {
      var B = this.pixelBitlength / 8,
          j = new Uint8Array(this.width * this.height * B),
          E = 0,
          M = this;
      if (null == C && (C = this.imgData), 0 === C.length) return new Uint8Array(0);

      function t(t, e, n, r) {
        var i,
            o,
            a,
            s,
            l,
            h,
            u,
            c,
            f,
            p,
            d,
            g,
            m,
            y,
            v,
            w,
            b,
            x,
            N,
            L,
            A,
            S = Math.ceil((M.width - t) / n),
            _ = Math.ceil((M.height - e) / r),
            F = M.width == S && M.height == _;

        for (y = B * S, g = F ? j : new Uint8Array(y * _), h = C.length, o = m = 0; m < _ && E < h;) {
          switch (C[E++]) {
            case 0:
              for (s = b = 0; b < y; s = b += 1) g[o++] = C[E++];

              break;

            case 1:
              for (s = x = 0; x < y; s = x += 1) i = C[E++], l = s < B ? 0 : g[o - B], g[o++] = (i + l) % 256;

              break;

            case 2:
              for (s = N = 0; N < y; s = N += 1) i = C[E++], a = (s - s % B) / B, v = m && g[(m - 1) * y + a * B + s % B], g[o++] = (v + i) % 256;

              break;

            case 3:
              for (s = L = 0; L < y; s = L += 1) i = C[E++], a = (s - s % B) / B, l = s < B ? 0 : g[o - B], v = m && g[(m - 1) * y + a * B + s % B], g[o++] = (i + Math.floor((l + v) / 2)) % 256;

              break;

            case 4:
              for (s = A = 0; A < y; s = A += 1) i = C[E++], a = (s - s % B) / B, l = s < B ? 0 : g[o - B], 0 === m ? v = w = 0 : (v = g[(m - 1) * y + a * B + s % B], w = a && g[(m - 1) * y + (a - 1) * B + s % B]), u = l + v - w, c = Math.abs(u - l), p = Math.abs(u - v), d = Math.abs(u - w), f = c <= p && c <= d ? l : p <= d ? v : w, g[o++] = (i + f) % 256;

              break;

            default:
              throw new Error("Invalid filter algorithm: " + C[E - 1]);
          }

          if (!F) {
            var P = ((e + m * r) * M.width + t) * B,
                k = m * y;

            for (s = 0; s < S; s += 1) {
              for (var I = 0; I < B; I += 1) j[P++] = g[k++];

              P += (n - 1) * B;
            }
          }

          m++;
        }
      }

      return C = (C = new kt(C)).getBytes(), 1 == M.interlaceMethod ? (t(0, 0, 8, 8), t(4, 0, 8, 8), t(0, 4, 4, 8), t(2, 0, 4, 4), t(0, 2, 2, 4), t(1, 0, 2, 2), t(0, 1, 1, 2)) : t(0, 0, 1, 1), j;
    }, i.prototype.decodePalette = function () {
      var t, e, n, r, i, o, a, s, l;

      for (n = this.palette, o = this.transparency.indexed || [], i = new Uint8Array((o.length || 0) + n.length), r = 0, n.length, e = a = t = 0, s = n.length; a < s; e = a += 3) i[r++] = n[e], i[r++] = n[e + 1], i[r++] = n[e + 2], i[r++] = null != (l = o[t++]) ? l : 255;

      return i;
    }, i.prototype.copyToImageData = function (t, e) {
      var n, r, i, o, a, s, l, h, u, c, f;
      if (r = this.colors, u = null, n = this.hasAlphaChannel, this.palette.length && (u = null != (f = this._decodedPalette) ? f : this._decodedPalette = this.decodePalette(), r = 4, n = !0), h = (i = t.data || t).length, a = u || e, o = s = 0, 1 === r) for (; o < h;) l = u ? 4 * e[o / 4] : s, c = a[l++], i[o++] = c, i[o++] = c, i[o++] = c, i[o++] = n ? a[l++] : 255, s = l;else for (; o < h;) l = u ? 4 * e[o / 4] : s, i[o++] = a[l++], i[o++] = a[l++], i[o++] = a[l++], i[o++] = n ? a[l++] : 255, s = l;
    }, i.prototype.decode = function () {
      var t;
      return t = new Uint8Array(this.width * this.height * 4), this.copyToImageData(t, this.decodePixels()), t;
    };

    try {
      n = Nt.document.createElement("canvas"), r = n.getContext("2d");
    } catch (t) {
      return -1;
    }

    return h = function (t) {
      var e;
      return r.width = t.width, r.height = t.height, r.clearRect(0, 0, t.width, t.height), r.putImageData(t, 0, 0), (e = new Image()).src = n.toDataURL(), e;
    }, i.prototype.decodeFrames = function (t) {
      var e, n, r, i, o, a, s, l;

      if (this.animation) {
        for (l = [], n = o = 0, a = (s = this.animation.frames).length; o < a; n = ++o) e = s[n], r = t.createImageData(e.width, e.height), i = this.decodePixels(new Uint8Array(e.data)), this.copyToImageData(r, i), e.imageData = r, l.push(e.image = h(r));

        return l;
      }
    }, i.prototype.renderFrame = function (t, e) {
      var n, r, i;
      return n = (r = this.animation.frames)[e], i = r[e - 1], 0 === e && t.clearRect(0, 0, this.width, this.height), 1 === (null != i ? i.disposeOp : void 0) ? t.clearRect(i.xOffset, i.yOffset, i.width, i.height) : 2 === (null != i ? i.disposeOp : void 0) && t.putImageData(i.imageData, i.xOffset, i.yOffset), 0 === n.blendOp && t.clearRect(n.xOffset, n.yOffset, n.width, n.height), t.drawImage(n.image, n.xOffset, n.yOffset);
    }, i.prototype.animate = function (n) {
      var r,
          i,
          o,
          a,
          s,
          t,
          l = this;
      return i = 0, t = this.animation, a = t.numFrames, o = t.frames, s = t.numPlays, (r = function () {
        var t, e;
        if (t = i++ % a, e = o[t], l.renderFrame(n, t), 1 < a && i / a < s) return l.animation._timeout = setTimeout(r, e.delay);
      })();
    }, i.prototype.stopAnimation = function () {
      var t;
      return clearTimeout(null != (t = this.animation) ? t._timeout : void 0);
    }, i.prototype.render = function (t) {
      var e, n;
      return t._png && t._png.stopAnimation(), t._png = this, t.width = this.width, t.height = this.height, e = t.getContext("2d"), this.animation ? (this.decodeFrames(e), this.animate(e)) : (n = e.createImageData(this.width, this.height), this.copyToImageData(n, this.decodePixels()), e.putImageData(n, 0, 0));
    }, i;
  }(), Nt.PNG = Lt;
  /*
     * Extracted from pdf.js
     * https://github.com/andreasgal/pdf.js
     *
     * Copyright (c) 2011 Mozilla Foundation
     *
     * Contributors: Andreas Gal <gal@mozilla.com>
     *               Chris G Jones <cjones@mozilla.com>
     *               Shaon Barman <shaon.barman@gmail.com>
     *               Vivien Nicolas <21@vingtetun.org>
     *               Justin D'Arcangelo <justindarc@gmail.com>
     *               Yury Delendik
     *
     * 
     */

  var Pt = function () {
    function t() {
      this.pos = 0, this.bufferLength = 0, this.eof = !1, this.buffer = null;
    }

    return t.prototype = {
      ensureBuffer: function (t) {
        var e = this.buffer,
            n = e ? e.byteLength : 0;
        if (t < n) return e;

        for (var r = 512; r < t;) r <<= 1;

        for (var i = new Uint8Array(r), o = 0; o < n; ++o) i[o] = e[o];

        return this.buffer = i;
      },
      getByte: function () {
        for (var t = this.pos; this.bufferLength <= t;) {
          if (this.eof) return null;
          this.readBlock();
        }

        return this.buffer[this.pos++];
      },
      getBytes: function (t) {
        var e = this.pos;

        if (t) {
          this.ensureBuffer(e + t);

          for (var n = e + t; !this.eof && this.bufferLength < n;) this.readBlock();

          var r = this.bufferLength;
          r < n && (n = r);
        } else {
          for (; !this.eof;) this.readBlock();

          n = this.bufferLength;
        }

        return this.pos = n, this.buffer.subarray(e, n);
      },
      lookChar: function () {
        for (var t = this.pos; this.bufferLength <= t;) {
          if (this.eof) return null;
          this.readBlock();
        }

        return String.fromCharCode(this.buffer[this.pos]);
      },
      getChar: function () {
        for (var t = this.pos; this.bufferLength <= t;) {
          if (this.eof) return null;
          this.readBlock();
        }

        return String.fromCharCode(this.buffer[this.pos++]);
      },
      makeSubStream: function (t, e, n) {
        for (var r = t + e; this.bufferLength <= r && !this.eof;) this.readBlock();

        return new Stream(this.buffer, t, e, n);
      },
      skip: function (t) {
        t || (t = 1), this.pos += t;
      },
      reset: function () {
        this.pos = 0;
      }
    }, t;
  }(),
      kt = function () {
    if ("undefined" != typeof Uint32Array) {
      var k = new Uint32Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]),
          I = new Uint32Array([3, 4, 5, 6, 7, 8, 9, 10, 65547, 65549, 65551, 65553, 131091, 131095, 131099, 131103, 196643, 196651, 196659, 196667, 262211, 262227, 262243, 262259, 327811, 327843, 327875, 327907, 258, 258, 258]),
          C = new Uint32Array([1, 2, 3, 4, 65541, 65543, 131081, 131085, 196625, 196633, 262177, 262193, 327745, 327777, 393345, 393409, 459009, 459137, 524801, 525057, 590849, 591361, 657409, 658433, 724993, 727041, 794625, 798721, 868353, 876545]),
          B = [new Uint32Array([459008, 524368, 524304, 524568, 459024, 524400, 524336, 590016, 459016, 524384, 524320, 589984, 524288, 524416, 524352, 590048, 459012, 524376, 524312, 589968, 459028, 524408, 524344, 590032, 459020, 524392, 524328, 59e4, 524296, 524424, 524360, 590064, 459010, 524372, 524308, 524572, 459026, 524404, 524340, 590024, 459018, 524388, 524324, 589992, 524292, 524420, 524356, 590056, 459014, 524380, 524316, 589976, 459030, 524412, 524348, 590040, 459022, 524396, 524332, 590008, 524300, 524428, 524364, 590072, 459009, 524370, 524306, 524570, 459025, 524402, 524338, 590020, 459017, 524386, 524322, 589988, 524290, 524418, 524354, 590052, 459013, 524378, 524314, 589972, 459029, 524410, 524346, 590036, 459021, 524394, 524330, 590004, 524298, 524426, 524362, 590068, 459011, 524374, 524310, 524574, 459027, 524406, 524342, 590028, 459019, 524390, 524326, 589996, 524294, 524422, 524358, 590060, 459015, 524382, 524318, 589980, 459031, 524414, 524350, 590044, 459023, 524398, 524334, 590012, 524302, 524430, 524366, 590076, 459008, 524369, 524305, 524569, 459024, 524401, 524337, 590018, 459016, 524385, 524321, 589986, 524289, 524417, 524353, 590050, 459012, 524377, 524313, 589970, 459028, 524409, 524345, 590034, 459020, 524393, 524329, 590002, 524297, 524425, 524361, 590066, 459010, 524373, 524309, 524573, 459026, 524405, 524341, 590026, 459018, 524389, 524325, 589994, 524293, 524421, 524357, 590058, 459014, 524381, 524317, 589978, 459030, 524413, 524349, 590042, 459022, 524397, 524333, 590010, 524301, 524429, 524365, 590074, 459009, 524371, 524307, 524571, 459025, 524403, 524339, 590022, 459017, 524387, 524323, 589990, 524291, 524419, 524355, 590054, 459013, 524379, 524315, 589974, 459029, 524411, 524347, 590038, 459021, 524395, 524331, 590006, 524299, 524427, 524363, 590070, 459011, 524375, 524311, 524575, 459027, 524407, 524343, 590030, 459019, 524391, 524327, 589998, 524295, 524423, 524359, 590062, 459015, 524383, 524319, 589982, 459031, 524415, 524351, 590046, 459023, 524399, 524335, 590014, 524303, 524431, 524367, 590078, 459008, 524368, 524304, 524568, 459024, 524400, 524336, 590017, 459016, 524384, 524320, 589985, 524288, 524416, 524352, 590049, 459012, 524376, 524312, 589969, 459028, 524408, 524344, 590033, 459020, 524392, 524328, 590001, 524296, 524424, 524360, 590065, 459010, 524372, 524308, 524572, 459026, 524404, 524340, 590025, 459018, 524388, 524324, 589993, 524292, 524420, 524356, 590057, 459014, 524380, 524316, 589977, 459030, 524412, 524348, 590041, 459022, 524396, 524332, 590009, 524300, 524428, 524364, 590073, 459009, 524370, 524306, 524570, 459025, 524402, 524338, 590021, 459017, 524386, 524322, 589989, 524290, 524418, 524354, 590053, 459013, 524378, 524314, 589973, 459029, 524410, 524346, 590037, 459021, 524394, 524330, 590005, 524298, 524426, 524362, 590069, 459011, 524374, 524310, 524574, 459027, 524406, 524342, 590029, 459019, 524390, 524326, 589997, 524294, 524422, 524358, 590061, 459015, 524382, 524318, 589981, 459031, 524414, 524350, 590045, 459023, 524398, 524334, 590013, 524302, 524430, 524366, 590077, 459008, 524369, 524305, 524569, 459024, 524401, 524337, 590019, 459016, 524385, 524321, 589987, 524289, 524417, 524353, 590051, 459012, 524377, 524313, 589971, 459028, 524409, 524345, 590035, 459020, 524393, 524329, 590003, 524297, 524425, 524361, 590067, 459010, 524373, 524309, 524573, 459026, 524405, 524341, 590027, 459018, 524389, 524325, 589995, 524293, 524421, 524357, 590059, 459014, 524381, 524317, 589979, 459030, 524413, 524349, 590043, 459022, 524397, 524333, 590011, 524301, 524429, 524365, 590075, 459009, 524371, 524307, 524571, 459025, 524403, 524339, 590023, 459017, 524387, 524323, 589991, 524291, 524419, 524355, 590055, 459013, 524379, 524315, 589975, 459029, 524411, 524347, 590039, 459021, 524395, 524331, 590007, 524299, 524427, 524363, 590071, 459011, 524375, 524311, 524575, 459027, 524407, 524343, 590031, 459019, 524391, 524327, 589999, 524295, 524423, 524359, 590063, 459015, 524383, 524319, 589983, 459031, 524415, 524351, 590047, 459023, 524399, 524335, 590015, 524303, 524431, 524367, 590079]), 9],
          j = [new Uint32Array([327680, 327696, 327688, 327704, 327684, 327700, 327692, 327708, 327682, 327698, 327690, 327706, 327686, 327702, 327694, 0, 327681, 327697, 327689, 327705, 327685, 327701, 327693, 327709, 327683, 327699, 327691, 327707, 327687, 327703, 327695, 0]), 5];
      return (t.prototype = Object.create(Pt.prototype)).getBits = function (t) {
        for (var e, n = this.codeSize, r = this.codeBuf, i = this.bytes, o = this.bytesPos; n < t;) void 0 === (e = i[o++]) && E("Bad encoding in flate stream"), r |= e << n, n += 8;

        return e = r & (1 << t) - 1, this.codeBuf = r >> t, this.codeSize = n -= t, this.bytesPos = o, e;
      }, t.prototype.getCode = function (t) {
        for (var e = t[0], n = t[1], r = this.codeSize, i = this.codeBuf, o = this.bytes, a = this.bytesPos; r < n;) {
          var s;
          void 0 === (s = o[a++]) && E("Bad encoding in flate stream"), i |= s << r, r += 8;
        }

        var l = e[i & (1 << n) - 1],
            h = l >> 16,
            u = 65535 & l;
        return (0 == r || r < h || 0 == h) && E("Bad encoding in flate stream"), this.codeBuf = i >> h, this.codeSize = r - h, this.bytesPos = a, u;
      }, t.prototype.generateHuffmanTable = function (t) {
        for (var e = t.length, n = 0, r = 0; r < e; ++r) t[r] > n && (n = t[r]);

        for (var i = 1 << n, o = new Uint32Array(i), a = 1, s = 0, l = 2; a <= n; ++a, s <<= 1, l <<= 1) for (var h = 0; h < e; ++h) if (t[h] == a) {
          var u = 0,
              c = s;

          for (r = 0; r < a; ++r) u = u << 1 | 1 & c, c >>= 1;

          for (r = u; r < i; r += l) o[r] = a << 16 | h;

          ++s;
        }

        return [o, n];
      }, t.prototype.readBlock = function () {
        function t(t, e, n, r, i) {
          for (var o = t.getBits(n) + r; 0 < o--;) e[l++] = i;
        }

        var e = this.getBits(3);

        if (1 & e && (this.eof = !0), 0 != (e >>= 1)) {
          var n, r;
          if (1 == e) n = B, r = j;else if (2 == e) {
            for (var i = this.getBits(5) + 257, o = this.getBits(5) + 1, a = this.getBits(4) + 4, s = Array(k.length), l = 0; l < a;) s[k[l++]] = this.getBits(3);

            for (var h = this.generateHuffmanTable(s), u = 0, c = (l = 0, i + o), f = new Array(c); l < c;) {
              var p = this.getCode(h);
              16 == p ? t(this, f, 2, 3, u) : 17 == p ? t(this, f, 3, 3, u = 0) : 18 == p ? t(this, f, 7, 11, u = 0) : f[l++] = u = p;
            }

            n = this.generateHuffmanTable(f.slice(0, i)), r = this.generateHuffmanTable(f.slice(i, c));
          } else E("Unknown block type in flate stream");

          for (var d = (_ = this.buffer) ? _.length : 0, g = this.bufferLength;;) {
            var m = this.getCode(n);
            if (m < 256) d <= g + 1 && (d = (_ = this.ensureBuffer(g + 1)).length), _[g++] = m;else {
              if (256 == m) return void (this.bufferLength = g);
              var y = (m = I[m -= 257]) >> 16;
              0 < y && (y = this.getBits(y));
              u = (65535 & m) + y;
              m = this.getCode(r), 0 < (y = (m = C[m]) >> 16) && (y = this.getBits(y));
              var v = (65535 & m) + y;
              d <= g + u && (d = (_ = this.ensureBuffer(g + u)).length);

              for (var w = 0; w < u; ++w, ++g) _[g] = _[g - v];
            }
          }
        } else {
          var b,
              x = this.bytes,
              N = this.bytesPos;
          void 0 === (b = x[N++]) && E("Bad block header in flate stream");
          var L = b;
          void 0 === (b = x[N++]) && E("Bad block header in flate stream"), L |= b << 8, void 0 === (b = x[N++]) && E("Bad block header in flate stream");
          var A = b;
          void 0 === (b = x[N++]) && E("Bad block header in flate stream"), (A |= b << 8) != (65535 & ~L) && E("Bad uncompressed block length in flate stream"), this.codeBuf = 0, this.codeSize = 0;

          var S = this.bufferLength,
              _ = this.ensureBuffer(S + L),
              F = S + L;

          this.bufferLength = F;

          for (var P = S; P < F; ++P) {
            if (void 0 === (b = x[N++])) {
              this.eof = !0;
              break;
            }

            _[P] = b;
          }

          this.bytesPos = N;
        }
      }, t;
    }

    function E(t) {
      throw new Error(t);
    }

    function t(t) {
      var e = 0,
          n = t[e++],
          r = t[e++];
      -1 != n && -1 != r || E("Invalid header in flate stream"), 8 != (15 & n) && E("Unknown compression method in flate stream"), ((n << 8) + r) % 31 != 0 && E("Bad FCHECK in flate stream"), 32 & r && E("FDICT bit set in flate stream"), this.bytes = t, this.bytesPos = 2, this.codeSize = 0, this.codeBuf = 0, Pt.call(this);
    }
  }();

  window.tmp = kt;
});

try {
  module.exports = jsPDF;
} catch (t) {}
});
var jspdf_min_1 = jspdf_min.jsPDF;
var jspdf_min_2 = jspdf_min.GifWriter;
var jspdf_min_3 = jspdf_min.GifReader;

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

/*!
 * html2canvas 1.0.0-rc.5 <https://html2canvas.hertzen.com>
 * Copyright (c) 2019 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function () {
  __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : new P(function (resolve) {
        resolve(result.value);
      }).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
}

var Bounds =
/** @class */
function () {
  function Bounds(x, y, w, h) {
    this.left = x;
    this.top = y;
    this.width = w;
    this.height = h;
  }

  Bounds.prototype.add = function (x, y, w, h) {
    return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
  };

  Bounds.fromClientRect = function (clientRect) {
    return new Bounds(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
  };

  return Bounds;
}();

var parseBounds = function (node) {
  return Bounds.fromClientRect(node.getBoundingClientRect());
};

var parseDocumentSize = function (document) {
  var body = document.body;
  var documentElement = document.documentElement;

  if (!body || !documentElement) {
    throw new Error("Unable to get document size");
  }

  var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
  var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
  return new Bounds(0, 0, width, height);
};
/*
 * css-line-break 1.1.1 <https://github.com/niklasvh/css-line-break#readme>
 * Copyright (c) 2019 Niklas von Hertzen <https://hertzen.com>
 * Released under MIT License
 */


var toCodePoints = function (str) {
  var codePoints = [];
  var i = 0;
  var length = str.length;

  while (i < length) {
    var value = str.charCodeAt(i++);

    if (value >= 0xd800 && value <= 0xdbff && i < length) {
      var extra = str.charCodeAt(i++);

      if ((extra & 0xfc00) === 0xdc00) {
        codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
      } else {
        codePoints.push(value);
        i--;
      }
    } else {
      codePoints.push(value);
    }
  }

  return codePoints;
};

var fromCodePoint = function () {
  var codePoints = [];

  for (var _i = 0; _i < arguments.length; _i++) {
    codePoints[_i] = arguments[_i];
  }

  if (String.fromCodePoint) {
    return String.fromCodePoint.apply(String, codePoints);
  }

  var length = codePoints.length;

  if (!length) {
    return '';
  }

  var codeUnits = [];
  var index = -1;
  var result = '';

  while (++index < length) {
    var codePoint = codePoints[index];

    if (codePoint <= 0xffff) {
      codeUnits.push(codePoint);
    } else {
      codePoint -= 0x10000;
      codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);
    }

    if (index + 1 === length || codeUnits.length > 0x4000) {
      result += String.fromCharCode.apply(String, codeUnits);
      codeUnits.length = 0;
    }
  }

  return result;
};

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; // Use a lookup table to find the index.

var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);

for (var i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

var decode = function (base64) {
  var bufferLength = base64.length * 0.75,
      len = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;

    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  var buffer = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.slice !== 'undefined' ? new ArrayBuffer(bufferLength) : new Array(bufferLength);
  var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);

  for (i = 0; i < len; i += 4) {
    encoded1 = lookup[base64.charCodeAt(i)];
    encoded2 = lookup[base64.charCodeAt(i + 1)];
    encoded3 = lookup[base64.charCodeAt(i + 2)];
    encoded4 = lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }

  return buffer;
};

var polyUint16Array = function (buffer) {
  var length = buffer.length;
  var bytes = [];

  for (var i = 0; i < length; i += 2) {
    bytes.push(buffer[i + 1] << 8 | buffer[i]);
  }

  return bytes;
};

var polyUint32Array = function (buffer) {
  var length = buffer.length;
  var bytes = [];

  for (var i = 0; i < length; i += 4) {
    bytes.push(buffer[i + 3] << 24 | buffer[i + 2] << 16 | buffer[i + 1] << 8 | buffer[i]);
  }

  return bytes;
};
/** Shift size for getting the index-2 table offset. */


var UTRIE2_SHIFT_2 = 5;
/** Shift size for getting the index-1 table offset. */

var UTRIE2_SHIFT_1 = 6 + 5;
/**
 * Shift size for shifting left the index array values.
 * Increases possible data size with 16-bit index values at the cost
 * of compactability.
 * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
 */

var UTRIE2_INDEX_SHIFT = 2;
/**
 * Difference between the two shift sizes,
 * for getting an index-1 offset from an index-2 offset. 6=11-5
 */

var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
/**
 * The part of the index-2 table for U+D800..U+DBFF stores values for
 * lead surrogate code _units_ not code _points_.
 * Values for lead surrogate code _points_ are indexed with this portion of the table.
 * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
 */

var UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;
/** Number of entries in a data block. 32=0x20 */

var UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;
/** Mask for getting the lower bits for the in-data-block offset. */

var UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;
var UTRIE2_LSCP_INDEX_2_LENGTH = 0x400 >> UTRIE2_SHIFT_2;
/** Count the lengths of both BMP pieces. 2080=0x820 */

var UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;
/**
 * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
 * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
 */

var UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;
var UTRIE2_UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;
/* U+0800 is the first code point after 2-byte UTF-8 */

/**
 * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
 * Variable length, for code points up to highStart, where the last single-value range starts.
 * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
 * (For 0x100000 supplementary code points U+10000..U+10ffff.)
 *
 * The part of the index-2 table for supplementary code points starts
 * after this index-1 table.
 *
 * Both the index-1 table and the following part of the index-2 table
 * are omitted completely if there is only BMP data.
 */

var UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;
/**
 * Number of index-1 entries for the BMP. 32=0x20
 * This part of the index-1 table is omitted from the serialized form.
 */

var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;
/** Number of entries in an index-2 block. 64=0x40 */

var UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;
/** Mask for getting the lower bits for the in-index-2-block offset. */

var UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;

var slice16 = function (view, start, end) {
  if (view.slice) {
    return view.slice(start, end);
  }

  return new Uint16Array(Array.prototype.slice.call(view, start, end));
};

var slice32 = function (view, start, end) {
  if (view.slice) {
    return view.slice(start, end);
  }

  return new Uint32Array(Array.prototype.slice.call(view, start, end));
};

var createTrieFromBase64 = function (base64) {
  var buffer = decode(base64);
  var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
  var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
  var headerLength = 24;
  var index = slice16(view16, headerLength / 2, view32[4] / 2);
  var data = view32[5] === 2 ? slice16(view16, (headerLength + view32[4]) / 2) : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
  return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
};

var Trie =
/** @class */
function () {
  function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
    this.initialValue = initialValue;
    this.errorValue = errorValue;
    this.highStart = highStart;
    this.highValueIndex = highValueIndex;
    this.index = index;
    this.data = data;
  }
  /**
   * Get the value for a code point as stored in the Trie.
   *
   * @param codePoint the code point
   * @return the value
   */


  Trie.prototype.get = function (codePoint) {
    var ix;

    if (codePoint >= 0) {
      if (codePoint < 0x0d800 || codePoint > 0x0dbff && codePoint <= 0x0ffff) {
        // Ordinary BMP code point, excluding leading surrogates.
        // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
        // 16 bit data is stored in the index array itself.
        ix = this.index[codePoint >> UTRIE2_SHIFT_2];
        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
        return this.data[ix];
      }

      if (codePoint <= 0xffff) {
        // Lead Surrogate Code Point.  A Separate index section is stored for
        // lead surrogate code units and code points.
        //   The main index has the code unit data.
        //   For this function, we need the code point data.
        // Note: this expression could be refactored for slightly improved efficiency, but
        //       surrogate code points will be so rare in practice that it's not worth it.
        ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + (codePoint - 0xd800 >> UTRIE2_SHIFT_2)];
        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
        return this.data[ix];
      }

      if (codePoint < this.highStart) {
        // Supplemental code point, use two-level lookup.
        ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
        ix = this.index[ix];
        ix += codePoint >> UTRIE2_SHIFT_2 & UTRIE2_INDEX_2_MASK;
        ix = this.index[ix];
        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
        return this.data[ix];
      }

      if (codePoint <= 0x10ffff) {
        return this.data[this.highValueIndex];
      }
    } // Fall through.  The code point is outside of the legal range of 0..0x10ffff.


    return this.errorValue;
  };

  return Trie;
}();

var base64 = 'KwAAAAAAAAAACA4AIDoAAPAfAAACAAAAAAAIABAAGABAAEgAUABYAF4AZgBeAGYAYABoAHAAeABeAGYAfACEAIAAiACQAJgAoACoAK0AtQC9AMUAXgBmAF4AZgBeAGYAzQDVAF4AZgDRANkA3gDmAOwA9AD8AAQBDAEUARoBIgGAAIgAJwEvATcBPwFFAU0BTAFUAVwBZAFsAXMBewGDATAAiwGTAZsBogGkAawBtAG8AcIBygHSAdoB4AHoAfAB+AH+AQYCDgIWAv4BHgImAi4CNgI+AkUCTQJTAlsCYwJrAnECeQKBAk0CiQKRApkCoQKoArACuALAAsQCzAIwANQC3ALkAjAA7AL0AvwCAQMJAxADGAMwACADJgMuAzYDPgOAAEYDSgNSA1IDUgNaA1oDYANiA2IDgACAAGoDgAByA3YDfgOAAIQDgACKA5IDmgOAAIAAogOqA4AAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAK8DtwOAAIAAvwPHA88D1wPfAyAD5wPsA/QD/AOAAIAABAQMBBIEgAAWBB4EJgQuBDMEIAM7BEEEXgBJBCADUQRZBGEEaQQwADAAcQQ+AXkEgQSJBJEEgACYBIAAoASoBK8EtwQwAL8ExQSAAIAAgACAAIAAgACgAM0EXgBeAF4AXgBeAF4AXgBeANUEXgDZBOEEXgDpBPEE+QQBBQkFEQUZBSEFKQUxBTUFPQVFBUwFVAVcBV4AYwVeAGsFcwV7BYMFiwWSBV4AmgWgBacFXgBeAF4AXgBeAKsFXgCyBbEFugW7BcIFwgXIBcIFwgXQBdQF3AXkBesF8wX7BQMGCwYTBhsGIwYrBjMGOwZeAD8GRwZNBl4AVAZbBl4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAGMGXgBqBnEGXgBeAF4AXgBeAF4AXgBeAF4AXgB5BoAG4wSGBo4GkwaAAIADHgR5AF4AXgBeAJsGgABGA4AAowarBrMGswagALsGwwbLBjAA0wbaBtoG3QbaBtoG2gbaBtoG2gblBusG8wb7BgMHCwcTBxsHCwcjBysHMAc1BzUHOgdCB9oGSgdSB1oHYAfaBloHaAfaBlIH2gbaBtoG2gbaBtoG2gbaBjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHbQdeAF4ANQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQd1B30HNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B4MH2gaKB68EgACAAIAAgACAAIAAgACAAI8HlwdeAJ8HpweAAIAArwe3B14AXgC/B8UHygcwANAH2AfgB4AA6AfwBz4B+AcACFwBCAgPCBcIogEYAR8IJwiAAC8INwg/CCADRwhPCFcIXwhnCEoDGgSAAIAAgABvCHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIhAiLCI4IMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAANQc1BzUHNQc1BzUHNQc1BzUHNQc1B54INQc1B6II2gaqCLIIugiAAIAAvgjGCIAAgACAAIAAgACAAIAAgACAAIAAywiHAYAA0wiAANkI3QjlCO0I9Aj8CIAAgACAAAIJCgkSCRoJIgknCTYHLwk3CZYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiAAIAAAAFAAXgBeAGAAcABeAHwAQACQAKAArQC9AJ4AXgBeAE0A3gBRAN4A7AD8AMwBGgEAAKcBNwEFAUwBXAF4QkhCmEKnArcCgAHHAsABz4LAAcABwAHAAd+C6ABoAG+C/4LAAcABwAHAAc+DF4MAAcAB54M3gweDV4Nng3eDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEeDqABVg6WDqABoQ6gAaABoAHXDvcONw/3DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DncPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB7cPPwlGCU4JMACAAIAAgABWCV4JYQmAAGkJcAl4CXwJgAkwADAAMAAwAIgJgACLCZMJgACZCZ8JowmrCYAAswkwAF4AXgB8AIAAuwkABMMJyQmAAM4JgADVCTAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAqwYWBNkIMAAwADAAMADdCeAJ6AnuCR4E9gkwAP4JBQoNCjAAMACAABUK0wiAAB0KJAosCjQKgAAwADwKQwqAAEsKvQmdCVMKWwowADAAgACAALcEMACAAGMKgABrCjAAMAAwADAAMAAwADAAMAAwADAAMAAeBDAAMAAwADAAMAAwADAAMAAwADAAMAAwAIkEPQFzCnoKiQSCCooKkAqJBJgKoAqkCokEGAGsCrQKvArBCjAAMADJCtEKFQHZCuEK/gHpCvEKMAAwADAAMACAAIwE+QowAIAAPwEBCzAAMAAwADAAMACAAAkLEQswAIAAPwEZCyELgAAOCCkLMAAxCzkLMAAwADAAMAAwADAAXgBeAEELMAAwADAAMAAwADAAMAAwAEkLTQtVC4AAXAtkC4AAiQkwADAAMAAwADAAMAAwADAAbAtxC3kLgAuFC4sLMAAwAJMLlwufCzAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAApwswADAAMACAAIAAgACvC4AAgACAAIAAgACAALcLMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAvwuAAMcLgACAAIAAgACAAIAAyguAAIAAgACAAIAA0QswADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAANkLgACAAIAA4AswADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACJCR4E6AswADAAhwHwC4AA+AsADAgMEAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMACAAIAAGAwdDCUMMAAwAC0MNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQw1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHPQwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADUHNQc1BzUHNQc1BzUHNQc2BzAAMAA5DDUHNQc1BzUHNQc1BzUHNQc1BzUHNQdFDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAATQxSDFoMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAF4AXgBeAF4AXgBeAF4AYgxeAGoMXgBxDHkMfwxeAIUMXgBeAI0MMAAwADAAMAAwAF4AXgCVDJ0MMAAwADAAMABeAF4ApQxeAKsMswy7DF4Awgy9DMoMXgBeAF4AXgBeAF4AXgBeAF4AXgDRDNkMeQBqCeAM3Ax8AOYM7Az0DPgMXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgCgAAANoAAHDQ4NFg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAeDSYNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAC4NMABeAF4ANg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAD4NRg1ODVYNXg1mDTAAbQ0wADAAMAAwADAAMAAwADAA2gbaBtoG2gbaBtoG2gbaBnUNeg3CBYANwgWFDdoGjA3aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gaUDZwNpA2oDdoG2gawDbcNvw3HDdoG2gbPDdYN3A3fDeYN2gbsDfMN2gbaBvoN/g3aBgYODg7aBl4AXgBeABYOXgBeACUG2gYeDl4AJA5eACwO2w3aBtoGMQ45DtoG2gbaBtoGQQ7aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B1EO2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQdZDjUHNQc1BzUHNQc1B2EONQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHaA41BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B3AO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B2EO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBkkOeA6gAKAAoAAwADAAMAAwAKAAoACgAKAAoACgAKAAgA4wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAD//wQABAAEAAQABAAEAAQABAAEAA0AAwABAAEAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAKABMAFwAeABsAGgAeABcAFgASAB4AGwAYAA8AGAAcAEsASwBLAEsASwBLAEsASwBLAEsAGAAYAB4AHgAeABMAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAFgAbABIAHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYADQARAB4ABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkAFgAaABsAGwAbAB4AHQAdAB4ATwAXAB4ADQAeAB4AGgAbAE8ATwAOAFAAHQAdAB0ATwBPABcATwBPAE8AFgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwArAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAAQABAANAA0ASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAUAArACsAKwArACsAKwArACsABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAGgAaAFAAUABQAFAAUABMAB4AGwBQAB4AKwArACsABAAEAAQAKwBQAFAAUABQAFAAUAArACsAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUAArAFAAUAArACsABAArAAQABAAEAAQABAArACsAKwArAAQABAArACsABAAEAAQAKwArACsABAArACsAKwArACsAKwArAFAAUABQAFAAKwBQACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwAEAAQAUABQAFAABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQAKwArAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeABsAKwArACsAKwArACsAKwBQAAQABAAEAAQABAAEACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAKwArACsAKwArACsAKwArAAQABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwAEAFAAKwBQAFAAUABQAFAAUAArACsAKwBQAFAAUAArAFAAUABQAFAAKwArACsAUABQACsAUAArAFAAUAArACsAKwBQAFAAKwArACsAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQAKwArACsABAAEAAQAKwAEAAQABAAEACsAKwBQACsAKwArACsAKwArAAQAKwArACsAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAB4AHgAeAB4AHgAeABsAHgArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArAFAAUABQACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAB4AUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArACsAKwArACsAKwArAFAAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwArAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAKwBcAFwAKwBcACsAKwBcACsAKwArACsAKwArAFwAXABcAFwAKwBcAFwAXABcAFwAXABcACsAXABcAFwAKwBcACsAXAArACsAXABcACsAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgArACoAKgBcACsAKwBcAFwAXABcAFwAKwBcACsAKgAqACoAKgAqACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAFwAXABcAFwAUAAOAA4ADgAOAB4ADgAOAAkADgAOAA0ACQATABMAEwATABMACQAeABMAHgAeAB4ABAAEAB4AHgAeAB4AHgAeAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUAANAAQAHgAEAB4ABAAWABEAFgARAAQABABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAAQABAAEAAQABAANAAQABABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsADQANAB4AHgAeAB4AHgAeAAQAHgAeAB4AHgAeAB4AKwAeAB4ADgAOAA0ADgAeAB4AHgAeAB4ACQAJACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgAeAB4AHgBcAFwAXABcAFwAXAAqACoAKgAqAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAKgAqACoAKgAqACoAKgBcAFwAXAAqACoAKgAqAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAXAAqAEsASwBLAEsASwBLAEsASwBLAEsAKgAqACoAKgAqACoAUABQAFAAUABQAFAAKwBQACsAKwArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQACsAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwAEAAQABAAeAA0AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAEQArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAADQANAA0AUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAA0ADQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoADQANABUAXAANAB4ADQAbAFwAKgArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAB4AHgATABMADQANAA4AHgATABMAHgAEAAQABAAJACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAUABQAFAAUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwAeACsAKwArABMAEwBLAEsASwBLAEsASwBLAEsASwBLAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwBcAFwAXABcAFwAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcACsAKwArACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwAeAB4AXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsABABLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKgAqACoAKgAqACoAKgBcACoAKgAqACoAKgAqACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAUABQAFAAUABQAFAAUAArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4ADQANAA0ADQAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAHgAeAB4AHgBQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwANAA0ADQANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwBQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsABAAEAAQAHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAABABQAFAAUABQAAQABAAEAFAAUAAEAAQABAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAKwBQACsAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAKwArAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAKwAeAB4AHgAeAB4AHgAeAA4AHgArAA0ADQANAA0ADQANAA0ACQANAA0ADQAIAAQACwAEAAQADQAJAA0ADQAMAB0AHQAeABcAFwAWABcAFwAXABYAFwAdAB0AHgAeABQAFAAUAA0AAQABAAQABAAEAAQABAAJABoAGgAaABoAGgAaABoAGgAeABcAFwAdABUAFQAeAB4AHgAeAB4AHgAYABYAEQAVABUAFQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgANAB4ADQANAA0ADQAeAA0ADQANAAcAHgAeAB4AHgArAAQABAAEAAQABAAEAAQABAAEAAQAUABQACsAKwBPAFAAUABQAFAAUAAeAB4AHgAWABEATwBQAE8ATwBPAE8AUABQAFAAUABQAB4AHgAeABYAEQArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGgAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgBQABoAHgAdAB4AUAAeABoAHgAeAB4AHgAeAB4AHgAeAB4ATwAeAFAAGwAeAB4AUABQAFAAUABQAB4AHgAeAB0AHQAeAFAAHgBQAB4AUAAeAFAATwBQAFAAHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AUABQAFAAUABPAE8AUABQAFAAUABQAE8AUABQAE8AUABPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAE8ATwBPAE8ATwBPAE8ATwBPAE8AUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAATwAeAB4AKwArACsAKwAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB0AHQAeAB4AHgAdAB0AHgAeAB0AHgAeAB4AHQAeAB0AGwAbAB4AHQAeAB4AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB0AHgAdAB4AHQAdAB0AHQAdAB0AHgAdAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAdAB0AHQAdAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAlACUAHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB0AHQAeAB4AHgAeAB0AHQAdAB4AHgAdAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB0AHQAeAB4AHQAeAB4AHgAeAB0AHQAeAB4AHgAeACUAJQAdAB0AJQAeACUAJQAlACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHQAdAB0AHgAdACUAHQAdAB4AHQAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHQAdAB0AHQAlAB4AJQAlACUAHQAlACUAHQAdAB0AJQAlAB0AHQAlAB0AHQAlACUAJQAeAB0AHgAeAB4AHgAdAB0AJQAdAB0AHQAdAB0AHQAlACUAJQAlACUAHQAlACUAIAAlAB0AHQAlACUAJQAlACUAJQAlACUAHgAeAB4AJQAlACAAIAAgACAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeABcAFwAXABcAFwAXAB4AEwATACUAHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACUAJQBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwArACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAE8ATwBPAE8ATwBPAE8ATwAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeACsAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUAArACsAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQBQAFAAUABQACsAKwArACsAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAABAAEAAQAKwAEAAQAKwArACsAKwArAAQABAAEAAQAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsABAAEAAQAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsADQANAA0ADQANAA0ADQANAB4AKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAUABQAFAAUABQAA0ADQANAA0ADQANABQAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwANAA0ADQANAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAeAAQABAAEAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLACsADQArAB4AKwArAAQABAAEAAQAUABQAB4AUAArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwAEAAQABAAEAAQABAAEAAQABAAOAA0ADQATABMAHgAeAB4ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0AUABQAFAAUAAEAAQAKwArAAQADQANAB4AUAArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXABcAA0ADQANACoASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUAArACsAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANACsADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEcARwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwAeAAQABAANAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAEAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUAArACsAUAArACsAUABQACsAKwBQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAeAB4ADQANAA0ADQAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAArAAQABAArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAEAAQABAAEAAQABAAEACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAFgAWAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAKwBQACsAKwArACsAKwArAFAAKwArACsAKwBQACsAUAArAFAAKwBQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQACsAUAArAFAAKwBQACsAUABQACsAUAArACsAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAUABQAFAAUAArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUAArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAlACUAJQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeACUAJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeACUAJQAlACUAJQAeACUAJQAlACUAJQAgACAAIAAlACUAIAAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIQAhACEAIQAhACUAJQAgACAAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAIAAlACUAJQAlACAAJQAgACAAIAAgACAAIAAgACAAIAAlACUAJQAgACUAJQAlACUAIAAgACAAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeACUAHgAlAB4AJQAlACUAJQAlACAAJQAlACUAJQAeACUAHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAIAAgACAAIAAgAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFwAXABcAFQAVABUAHgAeAB4AHgAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAlACAAIAAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsA';
/* @flow */

var LETTER_NUMBER_MODIFIER = 50; // Non-tailorable Line Breaking Classes

var BK = 1; //  Cause a line break (after)

var CR = 2; //  Cause a line break (after), except between CR and LF

var LF = 3; //  Cause a line break (after)

var CM = 4; //  Prohibit a line break between the character and the preceding character

var NL = 5; //  Cause a line break (after)

var WJ = 7; //  Prohibit line breaks before and after

var ZW = 8; //  Provide a break opportunity

var GL = 9; //  Prohibit line breaks before and after

var SP = 10; // Enable indirect line breaks

var ZWJ = 11; // Prohibit line breaks within joiner sequences
// Break Opportunities

var B2 = 12; //  Provide a line break opportunity before and after the character

var BA = 13; //  Generally provide a line break opportunity after the character

var BB = 14; //  Generally provide a line break opportunity before the character

var HY = 15; //  Provide a line break opportunity after the character, except in numeric context

var CB = 16; //   Provide a line break opportunity contingent on additional information
// Characters Prohibiting Certain Breaks

var CL = 17; //  Prohibit line breaks before

var CP = 18; //  Prohibit line breaks before

var EX = 19; //  Prohibit line breaks before

var IN = 20; //  Allow only indirect line breaks between pairs

var NS = 21; //  Allow only indirect line breaks before

var OP = 22; //  Prohibit line breaks after

var QU = 23; //  Act like they are both opening and closing
// Numeric Context

var IS = 24; //  Prevent breaks after any and before numeric

var NU = 25; //  Form numeric expressions for line breaking purposes

var PO = 26; //  Do not break following a numeric expression

var PR = 27; //  Do not break in front of a numeric expression

var SY = 28; //  Prevent a break before; and allow a break after
// Other Characters

var AI = 29; //  Act like AL when the resolvedEAW is N; otherwise; act as ID

var AL = 30; //  Are alphabetic characters or symbols that are used with alphabetic characters

var CJ = 31; //  Treat as NS or ID for strict or normal breaking.

var EB = 32; //  Do not break from following Emoji Modifier

var EM = 33; //  Do not break from preceding Emoji Base

var H2 = 34; //  Form Korean syllable blocks

var H3 = 35; //  Form Korean syllable blocks

var HL = 36; //  Do not break around a following hyphen; otherwise act as Alphabetic

var ID = 37; //  Break before or after; except in some numeric context

var JL = 38; //  Form Korean syllable blocks

var JV = 39; //  Form Korean syllable blocks

var JT = 40; //  Form Korean syllable blocks

var RI = 41; //  Keep pairs together. For pairs; break before and after other classes

var SA = 42; //  Provide a line break opportunity contingent on additional, language-specific context analysis

var XX = 43; //  Have as yet unknown line breaking behavior or unassigned code positions

var BREAK_MANDATORY = '!';
var BREAK_NOT_ALLOWED = '×';
var BREAK_ALLOWED = '÷';
var UnicodeTrie = createTrieFromBase64(base64);
var ALPHABETICS = [AL, HL];
var HARD_LINE_BREAKS = [BK, CR, LF, NL];
var SPACE = [SP, ZW];
var PREFIX_POSTFIX = [PR, PO];
var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE);
var KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];
var HYPHEN = [HY, BA];

var codePointsToCharacterClasses = function (codePoints, lineBreak) {
  if (lineBreak === void 0) {
    lineBreak = 'strict';
  }

  var types = [];
  var indicies = [];
  var categories = [];
  codePoints.forEach(function (codePoint, index) {
    var classType = UnicodeTrie.get(codePoint);

    if (classType > LETTER_NUMBER_MODIFIER) {
      categories.push(true);
      classType -= LETTER_NUMBER_MODIFIER;
    } else {
      categories.push(false);
    }

    if (['normal', 'auto', 'loose'].indexOf(lineBreak) !== -1) {
      // U+2010, – U+2013, 〜 U+301C, ゠ U+30A0
      if ([0x2010, 0x2013, 0x301c, 0x30a0].indexOf(codePoint) !== -1) {
        indicies.push(index);
        return types.push(CB);
      }
    }

    if (classType === CM || classType === ZWJ) {
      // LB10 Treat any remaining combining mark or ZWJ as AL.
      if (index === 0) {
        indicies.push(index);
        return types.push(AL);
      } // LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of
      // the base character in all of the following rules. Treat ZWJ as if it were CM.


      var prev = types[index - 1];

      if (LINE_BREAKS.indexOf(prev) === -1) {
        indicies.push(indicies[index - 1]);
        return types.push(prev);
      }

      indicies.push(index);
      return types.push(AL);
    }

    indicies.push(index);

    if (classType === CJ) {
      return types.push(lineBreak === 'strict' ? NS : ID);
    }

    if (classType === SA) {
      return types.push(AL);
    }

    if (classType === AI) {
      return types.push(AL);
    } // For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL
    // and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised
    // to take into account the actual line breaking properties for these characters.


    if (classType === XX) {
      if (codePoint >= 0x20000 && codePoint <= 0x2fffd || codePoint >= 0x30000 && codePoint <= 0x3fffd) {
        return types.push(ID);
      } else {
        return types.push(AL);
      }
    }

    types.push(classType);
  });
  return [indicies, types, categories];
};

var isAdjacentWithSpaceIgnored = function (a, b, currentIndex, classTypes) {
  var current = classTypes[currentIndex];

  if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {
    var i = currentIndex;

    while (i <= classTypes.length) {
      i++;
      var next = classTypes[i];

      if (next === b) {
        return true;
      }

      if (next !== SP) {
        break;
      }
    }
  }

  if (current === SP) {
    var i = currentIndex;

    while (i > 0) {
      i--;
      var prev = classTypes[i];

      if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {
        var n = currentIndex;

        while (n <= classTypes.length) {
          n++;
          var next = classTypes[n];

          if (next === b) {
            return true;
          }

          if (next !== SP) {
            break;
          }
        }
      }

      if (prev !== SP) {
        break;
      }
    }
  }

  return false;
};

var previousNonSpaceClassType = function (currentIndex, classTypes) {
  var i = currentIndex;

  while (i >= 0) {
    var type = classTypes[i];

    if (type === SP) {
      i--;
    } else {
      return type;
    }
  }

  return 0;
};

var _lineBreakAtIndex = function (codePoints, classTypes, indicies, index, forbiddenBreaks) {
  if (indicies[index] === 0) {
    return BREAK_NOT_ALLOWED;
  }

  var currentIndex = index - 1;

  if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {
    return BREAK_NOT_ALLOWED;
  }

  var beforeIndex = currentIndex - 1;
  var afterIndex = currentIndex + 1;
  var current = classTypes[currentIndex]; // LB4 Always break after hard line breaks.
  // LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.

  var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
  var next = classTypes[afterIndex];

  if (current === CR && next === LF) {
    return BREAK_NOT_ALLOWED;
  }

  if (HARD_LINE_BREAKS.indexOf(current) !== -1) {
    return BREAK_MANDATORY;
  } // LB6 Do not break before hard line breaks.


  if (HARD_LINE_BREAKS.indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB7 Do not break before spaces or zero width space.


  if (SPACE.indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB8 Break before any character following a zero-width space, even if one or more spaces intervene.


  if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {
    return BREAK_ALLOWED;
  } // LB8a Do not break between a zero width joiner and an ideograph, emoji base or emoji modifier.


  if (UnicodeTrie.get(codePoints[currentIndex]) === ZWJ && (next === ID || next === EB || next === EM)) {
    return BREAK_NOT_ALLOWED;
  } // LB11 Do not break before or after Word joiner and related characters.


  if (current === WJ || next === WJ) {
    return BREAK_NOT_ALLOWED;
  } // LB12 Do not break after NBSP and related characters.


  if (current === GL) {
    return BREAK_NOT_ALLOWED;
  } // LB12a Do not break before NBSP and related characters, except after spaces and hyphens.


  if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {
    return BREAK_NOT_ALLOWED;
  } // LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.


  if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB14 Do not break after ‘[’, even after spaces.


  if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {
    return BREAK_NOT_ALLOWED;
  } // LB15 Do not break within ‘”[’, even with intervening spaces.


  if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {
    return BREAK_NOT_ALLOWED;
  } // LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.


  if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {
    return BREAK_NOT_ALLOWED;
  } // LB17 Do not break within ‘——’, even with intervening spaces.


  if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {
    return BREAK_NOT_ALLOWED;
  } // LB18 Break after spaces.


  if (current === SP) {
    return BREAK_ALLOWED;
  } // LB19 Do not break before or after quotation marks, such as ‘ ” ’.


  if (current === QU || next === QU) {
    return BREAK_NOT_ALLOWED;
  } // LB20 Break before and after unresolved CB.


  if (next === CB || current === CB) {
    return BREAK_ALLOWED;
  } // LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.


  if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {
    return BREAK_NOT_ALLOWED;
  } // LB21a Don't break after Hebrew + Hyphen.


  if (before === HL && HYPHEN.indexOf(current) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB21b Don’t break between Solidus and Hebrew letters.


  if (current === SY && next === HL) {
    return BREAK_NOT_ALLOWED;
  } // LB22 Do not break between two ellipses, or between letters, numbers or exclamations and ellipsis.


  if (next === IN && ALPHABETICS.concat(IN, EX, NU, ID, EB, EM).indexOf(current) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB23 Do not break between digits and letters.


  if (ALPHABETICS.indexOf(next) !== -1 && current === NU || ALPHABETICS.indexOf(current) !== -1 && next === NU) {
    return BREAK_NOT_ALLOWED;
  } // LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.


  if (current === PR && [ID, EB, EM].indexOf(next) !== -1 || [ID, EB, EM].indexOf(current) !== -1 && next === PO) {
    return BREAK_NOT_ALLOWED;
  } // LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.


  if (ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1 || PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB25 Do not break between the following pairs of classes relevant to numbers:


  if ( // (PR | PO) × ( OP | HY )? NU
  [PR, PO].indexOf(current) !== -1 && (next === NU || [OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU) || // ( OP | HY ) × NU
  [OP, HY].indexOf(current) !== -1 && next === NU || // NU ×	(NU | SY | IS)
  current === NU && [NU, SY, IS].indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)


  if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {
    var prevIndex = currentIndex;

    while (prevIndex >= 0) {
      var type = classTypes[prevIndex];

      if (type === NU) {
        return BREAK_NOT_ALLOWED;
      } else if ([SY, IS].indexOf(type) !== -1) {
        prevIndex--;
      } else {
        break;
      }
    }
  } // NU (NU | SY | IS)* (CL | CP)? × (PO | PR))


  if ([PR, PO].indexOf(next) !== -1) {
    var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;

    while (prevIndex >= 0) {
      var type = classTypes[prevIndex];

      if (type === NU) {
        return BREAK_NOT_ALLOWED;
      } else if ([SY, IS].indexOf(type) !== -1) {
        prevIndex--;
      } else {
        break;
      }
    }
  } // LB26 Do not break a Korean syllable.


  if (JL === current && [JL, JV, H2, H3].indexOf(next) !== -1 || [JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1 || [JT, H3].indexOf(current) !== -1 && next === JT) {
    return BREAK_NOT_ALLOWED;
  } // LB27 Treat a Korean Syllable Block the same as ID.


  if (KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1 || KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR) {
    return BREAK_NOT_ALLOWED;
  } // LB28 Do not break between alphabetics (“at”).


  if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).


  if (current === IS && ALPHABETICS.indexOf(next) !== -1) {
    return BREAK_NOT_ALLOWED;
  } // LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.


  if (ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP || ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP) {
    return BREAK_NOT_ALLOWED;
  } // LB30a Break between two regional indicator symbols if and only if there are an even number of regional
  // indicators preceding the position of the break.


  if (current === RI && next === RI) {
    var i = indicies[currentIndex];
    var count = 1;

    while (i > 0) {
      i--;

      if (classTypes[i] === RI) {
        count++;
      } else {
        break;
      }
    }

    if (count % 2 !== 0) {
      return BREAK_NOT_ALLOWED;
    }
  } // LB30b Do not break between an emoji base and an emoji modifier.


  if (current === EB && next === EM) {
    return BREAK_NOT_ALLOWED;
  }

  return BREAK_ALLOWED;
};

var cssFormattedClasses = function (codePoints, options) {
  if (!options) {
    options = {
      lineBreak: 'normal',
      wordBreak: 'normal'
    };
  }

  var _a = codePointsToCharacterClasses(codePoints, options.lineBreak),
      indicies = _a[0],
      classTypes = _a[1],
      isLetterNumber = _a[2];

  if (options.wordBreak === 'break-all' || options.wordBreak === 'break-word') {
    classTypes = classTypes.map(function (type) {
      return [NU, AL, SA].indexOf(type) !== -1 ? ID : type;
    });
  }

  var forbiddenBreakpoints = options.wordBreak === 'keep-all' ? isLetterNumber.map(function (letterNumber, i) {
    return letterNumber && codePoints[i] >= 0x4e00 && codePoints[i] <= 0x9fff;
  }) : undefined;
  return [indicies, classTypes, forbiddenBreakpoints];
};

var Break =
/** @class */
function () {
  function Break(codePoints, lineBreak, start, end) {
    this.codePoints = codePoints;
    this.required = lineBreak === BREAK_MANDATORY;
    this.start = start;
    this.end = end;
  }

  Break.prototype.slice = function () {
    return fromCodePoint.apply(void 0, this.codePoints.slice(this.start, this.end));
  };

  return Break;
}();

var LineBreaker = function (str, options) {
  var codePoints = toCodePoints(str);

  var _a = cssFormattedClasses(codePoints, options),
      indicies = _a[0],
      classTypes = _a[1],
      forbiddenBreakpoints = _a[2];

  var length = codePoints.length;
  var lastEnd = 0;
  var nextIndex = 0;
  return {
    next: function () {
      if (nextIndex >= length) {
        return {
          done: true,
          value: null
        };
      }

      var lineBreak = BREAK_NOT_ALLOWED;

      while (nextIndex < length && (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) === BREAK_NOT_ALLOWED) {}

      if (lineBreak !== BREAK_NOT_ALLOWED || nextIndex === length) {
        var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);
        lastEnd = nextIndex;
        return {
          value: value,
          done: false
        };
      }

      return {
        done: true,
        value: null
      };
    }
  };
}; // https://www.w3.org/TR/css-syntax-3


var TokenType;

(function (TokenType) {
  TokenType[TokenType["STRING_TOKEN"] = 0] = "STRING_TOKEN";
  TokenType[TokenType["BAD_STRING_TOKEN"] = 1] = "BAD_STRING_TOKEN";
  TokenType[TokenType["LEFT_PARENTHESIS_TOKEN"] = 2] = "LEFT_PARENTHESIS_TOKEN";
  TokenType[TokenType["RIGHT_PARENTHESIS_TOKEN"] = 3] = "RIGHT_PARENTHESIS_TOKEN";
  TokenType[TokenType["COMMA_TOKEN"] = 4] = "COMMA_TOKEN";
  TokenType[TokenType["HASH_TOKEN"] = 5] = "HASH_TOKEN";
  TokenType[TokenType["DELIM_TOKEN"] = 6] = "DELIM_TOKEN";
  TokenType[TokenType["AT_KEYWORD_TOKEN"] = 7] = "AT_KEYWORD_TOKEN";
  TokenType[TokenType["PREFIX_MATCH_TOKEN"] = 8] = "PREFIX_MATCH_TOKEN";
  TokenType[TokenType["DASH_MATCH_TOKEN"] = 9] = "DASH_MATCH_TOKEN";
  TokenType[TokenType["INCLUDE_MATCH_TOKEN"] = 10] = "INCLUDE_MATCH_TOKEN";
  TokenType[TokenType["LEFT_CURLY_BRACKET_TOKEN"] = 11] = "LEFT_CURLY_BRACKET_TOKEN";
  TokenType[TokenType["RIGHT_CURLY_BRACKET_TOKEN"] = 12] = "RIGHT_CURLY_BRACKET_TOKEN";
  TokenType[TokenType["SUFFIX_MATCH_TOKEN"] = 13] = "SUFFIX_MATCH_TOKEN";
  TokenType[TokenType["SUBSTRING_MATCH_TOKEN"] = 14] = "SUBSTRING_MATCH_TOKEN";
  TokenType[TokenType["DIMENSION_TOKEN"] = 15] = "DIMENSION_TOKEN";
  TokenType[TokenType["PERCENTAGE_TOKEN"] = 16] = "PERCENTAGE_TOKEN";
  TokenType[TokenType["NUMBER_TOKEN"] = 17] = "NUMBER_TOKEN";
  TokenType[TokenType["FUNCTION"] = 18] = "FUNCTION";
  TokenType[TokenType["FUNCTION_TOKEN"] = 19] = "FUNCTION_TOKEN";
  TokenType[TokenType["IDENT_TOKEN"] = 20] = "IDENT_TOKEN";
  TokenType[TokenType["COLUMN_TOKEN"] = 21] = "COLUMN_TOKEN";
  TokenType[TokenType["URL_TOKEN"] = 22] = "URL_TOKEN";
  TokenType[TokenType["BAD_URL_TOKEN"] = 23] = "BAD_URL_TOKEN";
  TokenType[TokenType["CDC_TOKEN"] = 24] = "CDC_TOKEN";
  TokenType[TokenType["CDO_TOKEN"] = 25] = "CDO_TOKEN";
  TokenType[TokenType["COLON_TOKEN"] = 26] = "COLON_TOKEN";
  TokenType[TokenType["SEMICOLON_TOKEN"] = 27] = "SEMICOLON_TOKEN";
  TokenType[TokenType["LEFT_SQUARE_BRACKET_TOKEN"] = 28] = "LEFT_SQUARE_BRACKET_TOKEN";
  TokenType[TokenType["RIGHT_SQUARE_BRACKET_TOKEN"] = 29] = "RIGHT_SQUARE_BRACKET_TOKEN";
  TokenType[TokenType["UNICODE_RANGE_TOKEN"] = 30] = "UNICODE_RANGE_TOKEN";
  TokenType[TokenType["WHITESPACE_TOKEN"] = 31] = "WHITESPACE_TOKEN";
  TokenType[TokenType["EOF_TOKEN"] = 32] = "EOF_TOKEN";
})(TokenType || (TokenType = {}));

var FLAG_UNRESTRICTED = 1 << 0;
var FLAG_ID = 1 << 1;
var FLAG_INTEGER = 1 << 2;
var FLAG_NUMBER = 1 << 3;
var LINE_FEED = 0x000a;
var SOLIDUS = 0x002f;
var REVERSE_SOLIDUS = 0x005c;
var CHARACTER_TABULATION = 0x0009;
var SPACE$1 = 0x0020;
var QUOTATION_MARK = 0x0022;
var EQUALS_SIGN = 0x003d;
var NUMBER_SIGN = 0x0023;
var DOLLAR_SIGN = 0x0024;
var PERCENTAGE_SIGN = 0x0025;
var APOSTROPHE = 0x0027;
var LEFT_PARENTHESIS = 0x0028;
var RIGHT_PARENTHESIS = 0x0029;
var LOW_LINE = 0x005f;
var HYPHEN_MINUS = 0x002d;
var EXCLAMATION_MARK = 0x0021;
var LESS_THAN_SIGN = 0x003c;
var GREATER_THAN_SIGN = 0x003e;
var COMMERCIAL_AT = 0x0040;
var LEFT_SQUARE_BRACKET = 0x005b;
var RIGHT_SQUARE_BRACKET = 0x005d;
var CIRCUMFLEX_ACCENT = 0x003d;
var LEFT_CURLY_BRACKET = 0x007b;
var QUESTION_MARK = 0x003f;
var RIGHT_CURLY_BRACKET = 0x007d;
var VERTICAL_LINE = 0x007c;
var TILDE = 0x007e;
var CONTROL = 0x0080;
var REPLACEMENT_CHARACTER = 0xfffd;
var ASTERISK = 0x002a;
var PLUS_SIGN = 0x002b;
var COMMA = 0x002c;
var COLON = 0x003a;
var SEMICOLON = 0x003b;
var FULL_STOP = 0x002e;
var NULL = 0x0000;
var BACKSPACE = 0x0008;
var LINE_TABULATION = 0x000b;
var SHIFT_OUT = 0x000e;
var INFORMATION_SEPARATOR_ONE = 0x001f;
var DELETE = 0x007f;
var EOF = -1;
var ZERO = 0x0030;
var a = 0x0061;
var e = 0x0065;
var f = 0x0066;
var u = 0x0075;
var z = 0x007a;
var A = 0x0041;
var E = 0x0045;
var F = 0x0046;
var U = 0x0055;
var Z = 0x005a;

var isDigit = function (codePoint) {
  return codePoint >= ZERO && codePoint <= 0x0039;
};

var isSurrogateCodePoint = function (codePoint) {
  return codePoint >= 0xd800 && codePoint <= 0xdfff;
};

var isHex = function (codePoint) {
  return isDigit(codePoint) || codePoint >= A && codePoint <= F || codePoint >= a && codePoint <= f;
};

var isLowerCaseLetter = function (codePoint) {
  return codePoint >= a && codePoint <= z;
};

var isUpperCaseLetter = function (codePoint) {
  return codePoint >= A && codePoint <= Z;
};

var isLetter = function (codePoint) {
  return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint);
};

var isNonASCIICodePoint = function (codePoint) {
  return codePoint >= CONTROL;
};

var isWhiteSpace = function (codePoint) {
  return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE$1;
};

var isNameStartCodePoint = function (codePoint) {
  return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
};

var isNameCodePoint = function (codePoint) {
  return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
};

var isNonPrintableCodePoint = function (codePoint) {
  return codePoint >= NULL && codePoint <= BACKSPACE || codePoint === LINE_TABULATION || codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE || codePoint === DELETE;
};

var isValidEscape = function (c1, c2) {
  if (c1 !== REVERSE_SOLIDUS) {
    return false;
  }

  return c2 !== LINE_FEED;
};

var isIdentifierStart = function (c1, c2, c3) {
  if (c1 === HYPHEN_MINUS) {
    return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
  } else if (isNameStartCodePoint(c1)) {
    return true;
  } else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c2)) {
    return true;
  }

  return false;
};

var isNumberStart = function (c1, c2, c3) {
  if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
    if (isDigit(c2)) {
      return true;
    }

    return c2 === FULL_STOP && isDigit(c3);
  }

  if (c1 === FULL_STOP) {
    return isDigit(c2);
  }

  return isDigit(c1);
};

var stringToNumber = function (codePoints) {
  var c = 0;
  var sign = 1;

  if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
    if (codePoints[c] === HYPHEN_MINUS) {
      sign = -1;
    }

    c++;
  }

  var integers = [];

  while (isDigit(codePoints[c])) {
    integers.push(codePoints[c++]);
  }

  var int = integers.length ? parseInt(fromCodePoint.apply(void 0, integers), 10) : 0;

  if (codePoints[c] === FULL_STOP) {
    c++;
  }

  var fraction = [];

  while (isDigit(codePoints[c])) {
    fraction.push(codePoints[c++]);
  }

  var fracd = fraction.length;
  var frac = fracd ? parseInt(fromCodePoint.apply(void 0, fraction), 10) : 0;

  if (codePoints[c] === E || codePoints[c] === e) {
    c++;
  }

  var expsign = 1;

  if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
    if (codePoints[c] === HYPHEN_MINUS) {
      expsign = -1;
    }

    c++;
  }

  var exponent = [];

  while (isDigit(codePoints[c])) {
    exponent.push(codePoints[c++]);
  }

  var exp = exponent.length ? parseInt(fromCodePoint.apply(void 0, exponent), 10) : 0;
  return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
};

var LEFT_PARENTHESIS_TOKEN = {
  type: TokenType.LEFT_PARENTHESIS_TOKEN
};
var RIGHT_PARENTHESIS_TOKEN = {
  type: TokenType.RIGHT_PARENTHESIS_TOKEN
};
var COMMA_TOKEN = {
  type: TokenType.COMMA_TOKEN
};
var SUFFIX_MATCH_TOKEN = {
  type: TokenType.SUFFIX_MATCH_TOKEN
};
var PREFIX_MATCH_TOKEN = {
  type: TokenType.PREFIX_MATCH_TOKEN
};
var COLUMN_TOKEN = {
  type: TokenType.COLUMN_TOKEN
};
var DASH_MATCH_TOKEN = {
  type: TokenType.DASH_MATCH_TOKEN
};
var INCLUDE_MATCH_TOKEN = {
  type: TokenType.INCLUDE_MATCH_TOKEN
};
var LEFT_CURLY_BRACKET_TOKEN = {
  type: TokenType.LEFT_CURLY_BRACKET_TOKEN
};
var RIGHT_CURLY_BRACKET_TOKEN = {
  type: TokenType.RIGHT_CURLY_BRACKET_TOKEN
};
var SUBSTRING_MATCH_TOKEN = {
  type: TokenType.SUBSTRING_MATCH_TOKEN
};
var BAD_URL_TOKEN = {
  type: TokenType.BAD_URL_TOKEN
};
var BAD_STRING_TOKEN = {
  type: TokenType.BAD_STRING_TOKEN
};
var CDO_TOKEN = {
  type: TokenType.CDO_TOKEN
};
var CDC_TOKEN = {
  type: TokenType.CDC_TOKEN
};
var COLON_TOKEN = {
  type: TokenType.COLON_TOKEN
};
var SEMICOLON_TOKEN = {
  type: TokenType.SEMICOLON_TOKEN
};
var LEFT_SQUARE_BRACKET_TOKEN = {
  type: TokenType.LEFT_SQUARE_BRACKET_TOKEN
};
var RIGHT_SQUARE_BRACKET_TOKEN = {
  type: TokenType.RIGHT_SQUARE_BRACKET_TOKEN
};
var WHITESPACE_TOKEN = {
  type: TokenType.WHITESPACE_TOKEN
};
var EOF_TOKEN = {
  type: TokenType.EOF_TOKEN
};

var Tokenizer =
/** @class */
function () {
  function Tokenizer() {
    this._value = [];
  }

  Tokenizer.prototype.write = function (chunk) {
    this._value = this._value.concat(toCodePoints(chunk));
  };

  Tokenizer.prototype.read = function () {
    var tokens = [];
    var token = this.consumeToken();

    while (token !== EOF_TOKEN) {
      tokens.push(token);
      token = this.consumeToken();
    }

    return tokens;
  };

  Tokenizer.prototype.consumeToken = function () {
    var codePoint = this.consumeCodePoint();

    switch (codePoint) {
      case QUOTATION_MARK:
        return this.consumeStringToken(QUOTATION_MARK);

      case NUMBER_SIGN:
        var c1 = this.peekCodePoint(0);
        var c2 = this.peekCodePoint(1);
        var c3 = this.peekCodePoint(2);

        if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
          var flags = isIdentifierStart(c1, c2, c3) ? FLAG_ID : FLAG_UNRESTRICTED;
          var value = this.consumeName();
          return {
            type: TokenType.HASH_TOKEN,
            value: value,
            flags: flags
          };
        }

        break;

      case DOLLAR_SIGN:
        if (this.peekCodePoint(0) === EQUALS_SIGN) {
          this.consumeCodePoint();
          return SUFFIX_MATCH_TOKEN;
        }

        break;

      case APOSTROPHE:
        return this.consumeStringToken(APOSTROPHE);

      case LEFT_PARENTHESIS:
        return LEFT_PARENTHESIS_TOKEN;

      case RIGHT_PARENTHESIS:
        return RIGHT_PARENTHESIS_TOKEN;

      case ASTERISK:
        if (this.peekCodePoint(0) === EQUALS_SIGN) {
          this.consumeCodePoint();
          return SUBSTRING_MATCH_TOKEN;
        }

        break;

      case PLUS_SIGN:
        if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
          this.reconsumeCodePoint(codePoint);
          return this.consumeNumericToken();
        }

        break;

      case COMMA:
        return COMMA_TOKEN;

      case HYPHEN_MINUS:
        var e1 = codePoint;
        var e2 = this.peekCodePoint(0);
        var e3 = this.peekCodePoint(1);

        if (isNumberStart(e1, e2, e3)) {
          this.reconsumeCodePoint(codePoint);
          return this.consumeNumericToken();
        }

        if (isIdentifierStart(e1, e2, e3)) {
          this.reconsumeCodePoint(codePoint);
          return this.consumeIdentLikeToken();
        }

        if (e2 === HYPHEN_MINUS && e3 === GREATER_THAN_SIGN) {
          this.consumeCodePoint();
          this.consumeCodePoint();
          return CDC_TOKEN;
        }

        break;

      case FULL_STOP:
        if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
          this.reconsumeCodePoint(codePoint);
          return this.consumeNumericToken();
        }

        break;

      case SOLIDUS:
        if (this.peekCodePoint(0) === ASTERISK) {
          this.consumeCodePoint();

          while (true) {
            var c = this.consumeCodePoint();

            if (c === ASTERISK) {
              c = this.consumeCodePoint();

              if (c === SOLIDUS) {
                return this.consumeToken();
              }
            }

            if (c === EOF) {
              return this.consumeToken();
            }
          }
        }

        break;

      case COLON:
        return COLON_TOKEN;

      case SEMICOLON:
        return SEMICOLON_TOKEN;

      case LESS_THAN_SIGN:
        if (this.peekCodePoint(0) === EXCLAMATION_MARK && this.peekCodePoint(1) === HYPHEN_MINUS && this.peekCodePoint(2) === HYPHEN_MINUS) {
          this.consumeCodePoint();
          this.consumeCodePoint();
          return CDO_TOKEN;
        }

        break;

      case COMMERCIAL_AT:
        var a1 = this.peekCodePoint(0);
        var a2 = this.peekCodePoint(1);
        var a3 = this.peekCodePoint(2);

        if (isIdentifierStart(a1, a2, a3)) {
          var value = this.consumeName();
          return {
            type: TokenType.AT_KEYWORD_TOKEN,
            value: value
          };
        }

        break;

      case LEFT_SQUARE_BRACKET:
        return LEFT_SQUARE_BRACKET_TOKEN;

      case REVERSE_SOLIDUS:
        if (isValidEscape(codePoint, this.peekCodePoint(0))) {
          this.reconsumeCodePoint(codePoint);
          return this.consumeIdentLikeToken();
        }

        break;

      case RIGHT_SQUARE_BRACKET:
        return RIGHT_SQUARE_BRACKET_TOKEN;

      case CIRCUMFLEX_ACCENT:
        if (this.peekCodePoint(0) === EQUALS_SIGN) {
          this.consumeCodePoint();
          return PREFIX_MATCH_TOKEN;
        }

        break;

      case LEFT_CURLY_BRACKET:
        return LEFT_CURLY_BRACKET_TOKEN;

      case RIGHT_CURLY_BRACKET:
        return RIGHT_CURLY_BRACKET_TOKEN;

      case u:
      case U:
        var u1 = this.peekCodePoint(0);
        var u2 = this.peekCodePoint(1);

        if (u1 === PLUS_SIGN && (isHex(u2) || u2 === QUESTION_MARK)) {
          this.consumeCodePoint();
          this.consumeUnicodeRangeToken();
        }

        this.reconsumeCodePoint(codePoint);
        return this.consumeIdentLikeToken();

      case VERTICAL_LINE:
        if (this.peekCodePoint(0) === EQUALS_SIGN) {
          this.consumeCodePoint();
          return DASH_MATCH_TOKEN;
        }

        if (this.peekCodePoint(0) === VERTICAL_LINE) {
          this.consumeCodePoint();
          return COLUMN_TOKEN;
        }

        break;

      case TILDE:
        if (this.peekCodePoint(0) === EQUALS_SIGN) {
          this.consumeCodePoint();
          return INCLUDE_MATCH_TOKEN;
        }

        break;

      case EOF:
        return EOF_TOKEN;
    }

    if (isWhiteSpace(codePoint)) {
      this.consumeWhiteSpace();
      return WHITESPACE_TOKEN;
    }

    if (isDigit(codePoint)) {
      this.reconsumeCodePoint(codePoint);
      return this.consumeNumericToken();
    }

    if (isNameStartCodePoint(codePoint)) {
      this.reconsumeCodePoint(codePoint);
      return this.consumeIdentLikeToken();
    }

    return {
      type: TokenType.DELIM_TOKEN,
      value: fromCodePoint(codePoint)
    };
  };

  Tokenizer.prototype.consumeCodePoint = function () {
    var value = this._value.shift();

    return typeof value === 'undefined' ? -1 : value;
  };

  Tokenizer.prototype.reconsumeCodePoint = function (codePoint) {
    this._value.unshift(codePoint);
  };

  Tokenizer.prototype.peekCodePoint = function (delta) {
    if (delta >= this._value.length) {
      return -1;
    }

    return this._value[delta];
  };

  Tokenizer.prototype.consumeUnicodeRangeToken = function () {
    var digits = [];
    var codePoint = this.consumeCodePoint();

    while (isHex(codePoint) && digits.length < 6) {
      digits.push(codePoint);
      codePoint = this.consumeCodePoint();
    }

    var questionMarks = false;

    while (codePoint === QUESTION_MARK && digits.length < 6) {
      digits.push(codePoint);
      codePoint = this.consumeCodePoint();
      questionMarks = true;
    }

    if (questionMarks) {
      var start_1 = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) {
        return digit === QUESTION_MARK ? ZERO : digit;
      })), 16);
      var end = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) {
        return digit === QUESTION_MARK ? F : digit;
      })), 16);
      return {
        type: TokenType.UNICODE_RANGE_TOKEN,
        start: start_1,
        end: end
      };
    }

    var start = parseInt(fromCodePoint.apply(void 0, digits), 16);

    if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
      this.consumeCodePoint();
      codePoint = this.consumeCodePoint();
      var endDigits = [];

      while (isHex(codePoint) && endDigits.length < 6) {
        endDigits.push(codePoint);
        codePoint = this.consumeCodePoint();
      }

      var end = parseInt(fromCodePoint.apply(void 0, endDigits), 16);
      return {
        type: TokenType.UNICODE_RANGE_TOKEN,
        start: start,
        end: end
      };
    } else {
      return {
        type: TokenType.UNICODE_RANGE_TOKEN,
        start: start,
        end: start
      };
    }
  };

  Tokenizer.prototype.consumeIdentLikeToken = function () {
    var value = this.consumeName();

    if (value.toLowerCase() === 'url' && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
      this.consumeCodePoint();
      return this.consumeUrlToken();
    } else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
      this.consumeCodePoint();
      return {
        type: TokenType.FUNCTION_TOKEN,
        value: value
      };
    }

    return {
      type: TokenType.IDENT_TOKEN,
      value: value
    };
  };

  Tokenizer.prototype.consumeUrlToken = function () {
    var value = [];
    this.consumeWhiteSpace();

    if (this.peekCodePoint(0) === EOF) {
      return {
        type: TokenType.URL_TOKEN,
        value: ''
      };
    }

    var next = this.peekCodePoint(0);

    if (next === APOSTROPHE || next === QUOTATION_MARK) {
      var stringToken = this.consumeStringToken(this.consumeCodePoint());

      if (stringToken.type === TokenType.STRING_TOKEN) {
        this.consumeWhiteSpace();

        if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
          this.consumeCodePoint();
          return {
            type: TokenType.URL_TOKEN,
            value: stringToken.value
          };
        }
      }

      this.consumeBadUrlRemnants();
      return BAD_URL_TOKEN;
    }

    while (true) {
      var codePoint = this.consumeCodePoint();

      if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
        return {
          type: TokenType.URL_TOKEN,
          value: fromCodePoint.apply(void 0, value)
        };
      } else if (isWhiteSpace(codePoint)) {
        this.consumeWhiteSpace();

        if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
          this.consumeCodePoint();
          return {
            type: TokenType.URL_TOKEN,
            value: fromCodePoint.apply(void 0, value)
          };
        }

        this.consumeBadUrlRemnants();
        return BAD_URL_TOKEN;
      } else if (codePoint === QUOTATION_MARK || codePoint === APOSTROPHE || codePoint === LEFT_PARENTHESIS || isNonPrintableCodePoint(codePoint)) {
        this.consumeBadUrlRemnants();
        return BAD_URL_TOKEN;
      } else if (codePoint === REVERSE_SOLIDUS) {
        if (isValidEscape(codePoint, this.peekCodePoint(0))) {
          value.push(this.consumeEscapedCodePoint());
        } else {
          this.consumeBadUrlRemnants();
          return BAD_URL_TOKEN;
        }
      } else {
        value.push(codePoint);
      }
    }
  };

  Tokenizer.prototype.consumeWhiteSpace = function () {
    while (isWhiteSpace(this.peekCodePoint(0))) {
      this.consumeCodePoint();
    }
  };

  Tokenizer.prototype.consumeBadUrlRemnants = function () {
    while (true) {
      var codePoint = this.consumeCodePoint();

      if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
        return;
      }

      if (isValidEscape(codePoint, this.peekCodePoint(0))) {
        this.consumeEscapedCodePoint();
      }
    }
  };

  Tokenizer.prototype.consumeStringSlice = function (count) {
    var SLICE_STACK_SIZE = 60000;
    var value = '';

    while (count > 0) {
      var amount = Math.min(SLICE_STACK_SIZE, count);
      value += fromCodePoint.apply(void 0, this._value.splice(0, amount));
      count -= amount;
    }

    this._value.shift();

    return value;
  };

  Tokenizer.prototype.consumeStringToken = function (endingCodePoint) {
    var value = '';
    var i = 0;

    do {
      var codePoint = this._value[i];

      if (codePoint === EOF || codePoint === undefined || codePoint === endingCodePoint) {
        value += this.consumeStringSlice(i);
        return {
          type: TokenType.STRING_TOKEN,
          value: value
        };
      }

      if (codePoint === LINE_FEED) {
        this._value.splice(0, i);

        return BAD_STRING_TOKEN;
      }

      if (codePoint === REVERSE_SOLIDUS) {
        var next = this._value[i + 1];

        if (next !== EOF && next !== undefined) {
          if (next === LINE_FEED) {
            value += this.consumeStringSlice(i);
            i = -1;

            this._value.shift();
          } else if (isValidEscape(codePoint, next)) {
            value += this.consumeStringSlice(i);
            value += fromCodePoint(this.consumeEscapedCodePoint());
            i = -1;
          }
        }
      }

      i++;
    } while (true);
  };

  Tokenizer.prototype.consumeNumber = function () {
    var repr = [];
    var type = FLAG_INTEGER;
    var c1 = this.peekCodePoint(0);

    if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
      repr.push(this.consumeCodePoint());
    }

    while (isDigit(this.peekCodePoint(0))) {
      repr.push(this.consumeCodePoint());
    }

    c1 = this.peekCodePoint(0);
    var c2 = this.peekCodePoint(1);

    if (c1 === FULL_STOP && isDigit(c2)) {
      repr.push(this.consumeCodePoint(), this.consumeCodePoint());
      type = FLAG_NUMBER;

      while (isDigit(this.peekCodePoint(0))) {
        repr.push(this.consumeCodePoint());
      }
    }

    c1 = this.peekCodePoint(0);
    c2 = this.peekCodePoint(1);
    var c3 = this.peekCodePoint(2);

    if ((c1 === E || c1 === e) && ((c2 === PLUS_SIGN || c2 === HYPHEN_MINUS) && isDigit(c3) || isDigit(c2))) {
      repr.push(this.consumeCodePoint(), this.consumeCodePoint());
      type = FLAG_NUMBER;

      while (isDigit(this.peekCodePoint(0))) {
        repr.push(this.consumeCodePoint());
      }
    }

    return [stringToNumber(repr), type];
  };

  Tokenizer.prototype.consumeNumericToken = function () {
    var _a = this.consumeNumber(),
        number = _a[0],
        flags = _a[1];

    var c1 = this.peekCodePoint(0);
    var c2 = this.peekCodePoint(1);
    var c3 = this.peekCodePoint(2);

    if (isIdentifierStart(c1, c2, c3)) {
      var unit = this.consumeName();
      return {
        type: TokenType.DIMENSION_TOKEN,
        number: number,
        flags: flags,
        unit: unit
      };
    }

    if (c1 === PERCENTAGE_SIGN) {
      this.consumeCodePoint();
      return {
        type: TokenType.PERCENTAGE_TOKEN,
        number: number,
        flags: flags
      };
    }

    return {
      type: TokenType.NUMBER_TOKEN,
      number: number,
      flags: flags
    };
  };

  Tokenizer.prototype.consumeEscapedCodePoint = function () {
    var codePoint = this.consumeCodePoint();

    if (isHex(codePoint)) {
      var hex = fromCodePoint(codePoint);

      while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
        hex += fromCodePoint(this.consumeCodePoint());
      }

      if (isWhiteSpace(this.peekCodePoint(0))) {
        this.consumeCodePoint();
      }

      var hexCodePoint = parseInt(hex, 16);

      if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 0x10ffff) {
        return REPLACEMENT_CHARACTER;
      }

      return hexCodePoint;
    }

    if (codePoint === EOF) {
      return REPLACEMENT_CHARACTER;
    }

    return codePoint;
  };

  Tokenizer.prototype.consumeName = function () {
    var result = '';

    while (true) {
      var codePoint = this.consumeCodePoint();

      if (isNameCodePoint(codePoint)) {
        result += fromCodePoint(codePoint);
      } else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
        result += fromCodePoint(this.consumeEscapedCodePoint());
      } else {
        this.reconsumeCodePoint(codePoint);
        return result;
      }
    }
  };

  return Tokenizer;
}();

var Parser =
/** @class */
function () {
  function Parser(tokens) {
    this._tokens = tokens;
  }

  Parser.create = function (value) {
    var tokenizer = new Tokenizer();
    tokenizer.write(value);
    return new Parser(tokenizer.read());
  };

  Parser.parseValue = function (value) {
    return Parser.create(value).parseComponentValue();
  };

  Parser.parseValues = function (value) {
    return Parser.create(value).parseComponentValues();
  };

  Parser.prototype.parseComponentValue = function () {
    var token = this.consumeToken();

    while (token.type === TokenType.WHITESPACE_TOKEN) {
      token = this.consumeToken();
    }

    if (token.type === TokenType.EOF_TOKEN) {
      throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
    }

    this.reconsumeToken(token);
    var value = this.consumeComponentValue();

    do {
      token = this.consumeToken();
    } while (token.type === TokenType.WHITESPACE_TOKEN);

    if (token.type === TokenType.EOF_TOKEN) {
      return value;
    }

    throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
  };

  Parser.prototype.parseComponentValues = function () {
    var values = [];

    while (true) {
      var value = this.consumeComponentValue();

      if (value.type === TokenType.EOF_TOKEN) {
        return values;
      }

      values.push(value);
      values.push();
    }
  };

  Parser.prototype.consumeComponentValue = function () {
    var token = this.consumeToken();

    switch (token.type) {
      case TokenType.LEFT_CURLY_BRACKET_TOKEN:
      case TokenType.LEFT_SQUARE_BRACKET_TOKEN:
      case TokenType.LEFT_PARENTHESIS_TOKEN:
        return this.consumeSimpleBlock(token.type);

      case TokenType.FUNCTION_TOKEN:
        return this.consumeFunction(token);
    }

    return token;
  };

  Parser.prototype.consumeSimpleBlock = function (type) {
    var block = {
      type: type,
      values: []
    };
    var token = this.consumeToken();

    while (true) {
      if (token.type === TokenType.EOF_TOKEN || isEndingTokenFor(token, type)) {
        return block;
      }

      this.reconsumeToken(token);
      block.values.push(this.consumeComponentValue());
      token = this.consumeToken();
    }
  };

  Parser.prototype.consumeFunction = function (functionToken) {
    var cssFunction = {
      name: functionToken.value,
      values: [],
      type: TokenType.FUNCTION
    };

    while (true) {
      var token = this.consumeToken();

      if (token.type === TokenType.EOF_TOKEN || token.type === TokenType.RIGHT_PARENTHESIS_TOKEN) {
        return cssFunction;
      }

      this.reconsumeToken(token);
      cssFunction.values.push(this.consumeComponentValue());
    }
  };

  Parser.prototype.consumeToken = function () {
    var token = this._tokens.shift();

    return typeof token === 'undefined' ? EOF_TOKEN : token;
  };

  Parser.prototype.reconsumeToken = function (token) {
    this._tokens.unshift(token);
  };

  return Parser;
}();

var isDimensionToken = function (token) {
  return token.type === TokenType.DIMENSION_TOKEN;
};

var isNumberToken = function (token) {
  return token.type === TokenType.NUMBER_TOKEN;
};

var isIdentToken = function (token) {
  return token.type === TokenType.IDENT_TOKEN;
};

var isStringToken = function (token) {
  return token.type === TokenType.STRING_TOKEN;
};

var isIdentWithValue = function (token, value) {
  return isIdentToken(token) && token.value === value;
};

var nonWhiteSpace = function (token) {
  return token.type !== TokenType.WHITESPACE_TOKEN;
};

var nonFunctionArgSeparator = function (token) {
  return token.type !== TokenType.WHITESPACE_TOKEN && token.type !== TokenType.COMMA_TOKEN;
};

var parseFunctionArgs = function (tokens) {
  var args = [];
  var arg = [];
  tokens.forEach(function (token) {
    if (token.type === TokenType.COMMA_TOKEN) {
      if (arg.length === 0) {
        throw new Error("Error parsing function args, zero tokens for arg");
      }

      args.push(arg);
      arg = [];
      return;
    }

    if (token.type !== TokenType.WHITESPACE_TOKEN) {
      arg.push(token);
    }
  });

  if (arg.length) {
    args.push(arg);
  }

  return args;
};

var isEndingTokenFor = function (token, type) {
  if (type === TokenType.LEFT_CURLY_BRACKET_TOKEN && token.type === TokenType.RIGHT_CURLY_BRACKET_TOKEN) {
    return true;
  }

  if (type === TokenType.LEFT_SQUARE_BRACKET_TOKEN && token.type === TokenType.RIGHT_SQUARE_BRACKET_TOKEN) {
    return true;
  }

  return type === TokenType.LEFT_PARENTHESIS_TOKEN && token.type === TokenType.RIGHT_PARENTHESIS_TOKEN;
};

var isLength = function (token) {
  return token.type === TokenType.NUMBER_TOKEN || token.type === TokenType.DIMENSION_TOKEN;
};

var isLengthPercentage = function (token) {
  return token.type === TokenType.PERCENTAGE_TOKEN || isLength(token);
};

var parseLengthPercentageTuple = function (tokens) {
  return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
};

var ZERO_LENGTH = {
  type: TokenType.NUMBER_TOKEN,
  number: 0,
  flags: FLAG_INTEGER
};
var FIFTY_PERCENT = {
  type: TokenType.PERCENTAGE_TOKEN,
  number: 50,
  flags: FLAG_INTEGER
};
var HUNDRED_PERCENT = {
  type: TokenType.PERCENTAGE_TOKEN,
  number: 100,
  flags: FLAG_INTEGER
};

var getAbsoluteValueForTuple = function (tuple, width, height) {
  var x = tuple[0],
      y = tuple[1];
  return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
};

var getAbsoluteValue = function (token, parent) {
  if (token.type === TokenType.PERCENTAGE_TOKEN) {
    return token.number / 100 * parent;
  }

  if (isDimensionToken(token)) {
    switch (token.unit) {
      case 'rem':
      case 'em':
        return 16 * token.number;
      // TODO use correct font-size

      case 'px':
      default:
        return token.number;
    }
  }

  return token.number;
};

var DEG = 'deg';
var GRAD = 'grad';
var RAD = 'rad';
var TURN = 'turn';
var angle = {
  name: 'angle',
  parse: function (value) {
    if (value.type === TokenType.DIMENSION_TOKEN) {
      switch (value.unit) {
        case DEG:
          return Math.PI * value.number / 180;

        case GRAD:
          return Math.PI / 200 * value.number;

        case RAD:
          return value.number;

        case TURN:
          return Math.PI * 2 * value.number;
      }
    }

    throw new Error("Unsupported angle type");
  }
};

var isAngle = function (value) {
  if (value.type === TokenType.DIMENSION_TOKEN) {
    if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
      return true;
    }
  }

  return false;
};

var parseNamedSide = function (tokens) {
  var sideOrCorner = tokens.filter(isIdentToken).map(function (ident) {
    return ident.value;
  }).join(' ');

  switch (sideOrCorner) {
    case 'to bottom right':
    case 'to right bottom':
    case 'left top':
    case 'top left':
      return [ZERO_LENGTH, ZERO_LENGTH];

    case 'to top':
    case 'bottom':
      return deg(0);

    case 'to bottom left':
    case 'to left bottom':
    case 'right top':
    case 'top right':
      return [ZERO_LENGTH, HUNDRED_PERCENT];

    case 'to right':
    case 'left':
      return deg(90);

    case 'to top left':
    case 'to left top':
    case 'right bottom':
    case 'bottom right':
      return [HUNDRED_PERCENT, HUNDRED_PERCENT];

    case 'to bottom':
    case 'top':
      return deg(180);

    case 'to top right':
    case 'to right top':
    case 'left bottom':
    case 'bottom left':
      return [HUNDRED_PERCENT, ZERO_LENGTH];

    case 'to left':
    case 'right':
      return deg(270);
  }

  return 0;
};

var deg = function (deg) {
  return Math.PI * deg / 180;
};

var color = {
  name: 'color',
  parse: function (value) {
    if (value.type === TokenType.FUNCTION) {
      var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];

      if (typeof colorFunction === 'undefined') {
        throw new Error("Attempting to parse an unsupported color function \"" + value.name + "\"");
      }

      return colorFunction(value.values);
    }

    if (value.type === TokenType.HASH_TOKEN) {
      if (value.value.length === 3) {
        var r = value.value.substring(0, 1);
        var g = value.value.substring(1, 2);
        var b = value.value.substring(2, 3);
        return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
      }

      if (value.value.length === 4) {
        var r = value.value.substring(0, 1);
        var g = value.value.substring(1, 2);
        var b = value.value.substring(2, 3);
        var a = value.value.substring(3, 4);
        return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
      }

      if (value.value.length === 6) {
        var r = value.value.substring(0, 2);
        var g = value.value.substring(2, 4);
        var b = value.value.substring(4, 6);
        return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
      }

      if (value.value.length === 8) {
        var r = value.value.substring(0, 2);
        var g = value.value.substring(2, 4);
        var b = value.value.substring(4, 6);
        var a = value.value.substring(6, 8);
        return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
      }
    }

    if (value.type === TokenType.IDENT_TOKEN) {
      var namedColor = COLORS[value.value.toUpperCase()];

      if (typeof namedColor !== 'undefined') {
        return namedColor;
      }
    }

    return COLORS.TRANSPARENT;
  }
};

var isTransparent = function (color) {
  return (0xff & color) === 0;
};

var asString = function (color) {
  var alpha = 0xff & color;
  var blue = 0xff & color >> 8;
  var green = 0xff & color >> 16;
  var red = 0xff & color >> 24;
  return alpha < 255 ? "rgba(" + red + "," + green + "," + blue + "," + alpha / 255 + ")" : "rgb(" + red + "," + green + "," + blue + ")";
};

var pack = function (r, g, b, a) {
  return (r << 24 | g << 16 | b << 8 | Math.round(a * 255) << 0) >>> 0;
};

var getTokenColorValue = function (token, i) {
  if (token.type === TokenType.NUMBER_TOKEN) {
    return token.number;
  }

  if (token.type === TokenType.PERCENTAGE_TOKEN) {
    var max = i === 3 ? 1 : 255;
    return i === 3 ? token.number / 100 * max : Math.round(token.number / 100 * max);
  }

  return 0;
};

var rgb = function (args) {
  var tokens = args.filter(nonFunctionArgSeparator);

  if (tokens.length === 3) {
    var _a = tokens.map(getTokenColorValue),
        r = _a[0],
        g = _a[1],
        b = _a[2];

    return pack(r, g, b, 1);
  }

  if (tokens.length === 4) {
    var _b = tokens.map(getTokenColorValue),
        r = _b[0],
        g = _b[1],
        b = _b[2],
        a = _b[3];

    return pack(r, g, b, a);
  }

  return 0;
};

function hue2rgb(t1, t2, hue) {
  if (hue < 0) {
    hue += 1;
  }

  if (hue >= 1) {
    hue -= 1;
  }

  if (hue < 1 / 6) {
    return (t2 - t1) * hue * 6 + t1;
  } else if (hue < 1 / 2) {
    return t2;
  } else if (hue < 2 / 3) {
    return (t2 - t1) * 6 * (2 / 3 - hue) + t1;
  } else {
    return t1;
  }
}

var hsl = function (args) {
  var tokens = args.filter(nonFunctionArgSeparator);
  var hue = tokens[0],
      saturation = tokens[1],
      lightness = tokens[2],
      alpha = tokens[3];
  var h = (hue.type === TokenType.NUMBER_TOKEN ? deg(hue.number) : angle.parse(hue)) / (Math.PI * 2);
  var s = isLengthPercentage(saturation) ? saturation.number / 100 : 0;
  var l = isLengthPercentage(lightness) ? lightness.number / 100 : 0;
  var a = typeof alpha !== 'undefined' && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1;

  if (s === 0) {
    return pack(l * 255, l * 255, l * 255, 1);
  }

  var t2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
  var t1 = l * 2 - t2;
  var r = hue2rgb(t1, t2, h + 1 / 3);
  var g = hue2rgb(t1, t2, h);
  var b = hue2rgb(t1, t2, h - 1 / 3);
  return pack(r * 255, g * 255, b * 255, a);
};

var SUPPORTED_COLOR_FUNCTIONS = {
  hsl: hsl,
  hsla: hsl,
  rgb: rgb,
  rgba: rgb
};
var COLORS = {
  ALICEBLUE: 0xf0f8ffff,
  ANTIQUEWHITE: 0xfaebd7ff,
  AQUA: 0x00ffffff,
  AQUAMARINE: 0x7fffd4ff,
  AZURE: 0xf0ffffff,
  BEIGE: 0xf5f5dcff,
  BISQUE: 0xffe4c4ff,
  BLACK: 0x000000ff,
  BLANCHEDALMOND: 0xffebcdff,
  BLUE: 0x0000ffff,
  BLUEVIOLET: 0x8a2be2ff,
  BROWN: 0xa52a2aff,
  BURLYWOOD: 0xdeb887ff,
  CADETBLUE: 0x5f9ea0ff,
  CHARTREUSE: 0x7fff00ff,
  CHOCOLATE: 0xd2691eff,
  CORAL: 0xff7f50ff,
  CORNFLOWERBLUE: 0x6495edff,
  CORNSILK: 0xfff8dcff,
  CRIMSON: 0xdc143cff,
  CYAN: 0x00ffffff,
  DARKBLUE: 0x00008bff,
  DARKCYAN: 0x008b8bff,
  DARKGOLDENROD: 0xb886bbff,
  DARKGRAY: 0xa9a9a9ff,
  DARKGREEN: 0x006400ff,
  DARKGREY: 0xa9a9a9ff,
  DARKKHAKI: 0xbdb76bff,
  DARKMAGENTA: 0x8b008bff,
  DARKOLIVEGREEN: 0x556b2fff,
  DARKORANGE: 0xff8c00ff,
  DARKORCHID: 0x9932ccff,
  DARKRED: 0x8b0000ff,
  DARKSALMON: 0xe9967aff,
  DARKSEAGREEN: 0x8fbc8fff,
  DARKSLATEBLUE: 0x483d8bff,
  DARKSLATEGRAY: 0x2f4f4fff,
  DARKSLATEGREY: 0x2f4f4fff,
  DARKTURQUOISE: 0x00ced1ff,
  DARKVIOLET: 0x9400d3ff,
  DEEPPINK: 0xff1493ff,
  DEEPSKYBLUE: 0x00bfffff,
  DIMGRAY: 0x696969ff,
  DIMGREY: 0x696969ff,
  DODGERBLUE: 0x1e90ffff,
  FIREBRICK: 0xb22222ff,
  FLORALWHITE: 0xfffaf0ff,
  FORESTGREEN: 0x228b22ff,
  FUCHSIA: 0xff00ffff,
  GAINSBORO: 0xdcdcdcff,
  GHOSTWHITE: 0xf8f8ffff,
  GOLD: 0xffd700ff,
  GOLDENROD: 0xdaa520ff,
  GRAY: 0x808080ff,
  GREEN: 0x008000ff,
  GREENYELLOW: 0xadff2fff,
  GREY: 0x808080ff,
  HONEYDEW: 0xf0fff0ff,
  HOTPINK: 0xff69b4ff,
  INDIANRED: 0xcd5c5cff,
  INDIGO: 0x4b0082ff,
  IVORY: 0xfffff0ff,
  KHAKI: 0xf0e68cff,
  LAVENDER: 0xe6e6faff,
  LAVENDERBLUSH: 0xfff0f5ff,
  LAWNGREEN: 0x7cfc00ff,
  LEMONCHIFFON: 0xfffacdff,
  LIGHTBLUE: 0xadd8e6ff,
  LIGHTCORAL: 0xf08080ff,
  LIGHTCYAN: 0xe0ffffff,
  LIGHTGOLDENRODYELLOW: 0xfafad2ff,
  LIGHTGRAY: 0xd3d3d3ff,
  LIGHTGREEN: 0x90ee90ff,
  LIGHTGREY: 0xd3d3d3ff,
  LIGHTPINK: 0xffb6c1ff,
  LIGHTSALMON: 0xffa07aff,
  LIGHTSEAGREEN: 0x20b2aaff,
  LIGHTSKYBLUE: 0x87cefaff,
  LIGHTSLATEGRAY: 0x778899ff,
  LIGHTSLATEGREY: 0x778899ff,
  LIGHTSTEELBLUE: 0xb0c4deff,
  LIGHTYELLOW: 0xffffe0ff,
  LIME: 0x00ff00ff,
  LIMEGREEN: 0x32cd32ff,
  LINEN: 0xfaf0e6ff,
  MAGENTA: 0xff00ffff,
  MAROON: 0x800000ff,
  MEDIUMAQUAMARINE: 0x66cdaaff,
  MEDIUMBLUE: 0x0000cdff,
  MEDIUMORCHID: 0xba55d3ff,
  MEDIUMPURPLE: 0x9370dbff,
  MEDIUMSEAGREEN: 0x3cb371ff,
  MEDIUMSLATEBLUE: 0x7b68eeff,
  MEDIUMSPRINGGREEN: 0x00fa9aff,
  MEDIUMTURQUOISE: 0x48d1ccff,
  MEDIUMVIOLETRED: 0xc71585ff,
  MIDNIGHTBLUE: 0x191970ff,
  MINTCREAM: 0xf5fffaff,
  MISTYROSE: 0xffe4e1ff,
  MOCCASIN: 0xffe4b5ff,
  NAVAJOWHITE: 0xffdeadff,
  NAVY: 0x000080ff,
  OLDLACE: 0xfdf5e6ff,
  OLIVE: 0x808000ff,
  OLIVEDRAB: 0x6b8e23ff,
  ORANGE: 0xffa500ff,
  ORANGERED: 0xff4500ff,
  ORCHID: 0xda70d6ff,
  PALEGOLDENROD: 0xeee8aaff,
  PALEGREEN: 0x98fb98ff,
  PALETURQUOISE: 0xafeeeeff,
  PALEVIOLETRED: 0xdb7093ff,
  PAPAYAWHIP: 0xffefd5ff,
  PEACHPUFF: 0xffdab9ff,
  PERU: 0xcd853fff,
  PINK: 0xffc0cbff,
  PLUM: 0xdda0ddff,
  POWDERBLUE: 0xb0e0e6ff,
  PURPLE: 0x800080ff,
  REBECCAPURPLE: 0x663399ff,
  RED: 0xff0000ff,
  ROSYBROWN: 0xbc8f8fff,
  ROYALBLUE: 0x4169e1ff,
  SADDLEBROWN: 0x8b4513ff,
  SALMON: 0xfa8072ff,
  SANDYBROWN: 0xf4a460ff,
  SEAGREEN: 0x2e8b57ff,
  SEASHELL: 0xfff5eeff,
  SIENNA: 0xa0522dff,
  SILVER: 0xc0c0c0ff,
  SKYBLUE: 0x87ceebff,
  SLATEBLUE: 0x6a5acdff,
  SLATEGRAY: 0x708090ff,
  SLATEGREY: 0x708090ff,
  SNOW: 0xfffafaff,
  SPRINGGREEN: 0x00ff7fff,
  STEELBLUE: 0x4682b4ff,
  TAN: 0xd2b48cff,
  TEAL: 0x008080ff,
  THISTLE: 0xd8bfd8ff,
  TOMATO: 0xff6347ff,
  TRANSPARENT: 0x00000000,
  TURQUOISE: 0x40e0d0ff,
  VIOLET: 0xee82eeff,
  WHEAT: 0xf5deb3ff,
  WHITE: 0xffffffff,
  WHITESMOKE: 0xf5f5f5ff,
  YELLOW: 0xffff00ff,
  YELLOWGREEN: 0x9acd32ff
};
var PropertyDescriptorParsingType;

(function (PropertyDescriptorParsingType) {
  PropertyDescriptorParsingType[PropertyDescriptorParsingType["VALUE"] = 0] = "VALUE";
  PropertyDescriptorParsingType[PropertyDescriptorParsingType["LIST"] = 1] = "LIST";
  PropertyDescriptorParsingType[PropertyDescriptorParsingType["IDENT_VALUE"] = 2] = "IDENT_VALUE";
  PropertyDescriptorParsingType[PropertyDescriptorParsingType["TYPE_VALUE"] = 3] = "TYPE_VALUE";
  PropertyDescriptorParsingType[PropertyDescriptorParsingType["TOKEN_VALUE"] = 4] = "TOKEN_VALUE";
})(PropertyDescriptorParsingType || (PropertyDescriptorParsingType = {}));

var BACKGROUND_CLIP;

(function (BACKGROUND_CLIP) {
  BACKGROUND_CLIP[BACKGROUND_CLIP["BORDER_BOX"] = 0] = "BORDER_BOX";
  BACKGROUND_CLIP[BACKGROUND_CLIP["PADDING_BOX"] = 1] = "PADDING_BOX";
  BACKGROUND_CLIP[BACKGROUND_CLIP["CONTENT_BOX"] = 2] = "CONTENT_BOX";
})(BACKGROUND_CLIP || (BACKGROUND_CLIP = {}));

var backgroundClip = {
  name: 'background-clip',
  initialValue: 'border-box',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.map(function (token) {
      if (isIdentToken(token)) {
        switch (token.value) {
          case 'padding-box':
            return BACKGROUND_CLIP.PADDING_BOX;

          case 'content-box':
            return BACKGROUND_CLIP.CONTENT_BOX;
        }
      }

      return BACKGROUND_CLIP.BORDER_BOX;
    });
  }
};
var backgroundColor = {
  name: "background-color",
  initialValue: 'transparent',
  prefix: false,
  type: PropertyDescriptorParsingType.TYPE_VALUE,
  format: 'color'
};

var parseColorStop = function (args) {
  var color$1 = color.parse(args[0]);
  var stop = args[1];
  return stop && isLengthPercentage(stop) ? {
    color: color$1,
    stop: stop
  } : {
    color: color$1,
    stop: null
  };
};

var processColorStops = function (stops, lineLength) {
  var first = stops[0];
  var last = stops[stops.length - 1];

  if (first.stop === null) {
    first.stop = ZERO_LENGTH;
  }

  if (last.stop === null) {
    last.stop = HUNDRED_PERCENT;
  }

  var processStops = [];
  var previous = 0;

  for (var i = 0; i < stops.length; i++) {
    var stop_1 = stops[i].stop;

    if (stop_1 !== null) {
      var absoluteValue = getAbsoluteValue(stop_1, lineLength);

      if (absoluteValue > previous) {
        processStops.push(absoluteValue);
      } else {
        processStops.push(previous);
      }

      previous = absoluteValue;
    } else {
      processStops.push(null);
    }
  }

  var gapBegin = null;

  for (var i = 0; i < processStops.length; i++) {
    var stop_2 = processStops[i];

    if (stop_2 === null) {
      if (gapBegin === null) {
        gapBegin = i;
      }
    } else if (gapBegin !== null) {
      var gapLength = i - gapBegin;
      var beforeGap = processStops[gapBegin - 1];
      var gapValue = (stop_2 - beforeGap) / (gapLength + 1);

      for (var g = 1; g <= gapLength; g++) {
        processStops[gapBegin + g - 1] = gapValue * g;
      }

      gapBegin = null;
    }
  }

  return stops.map(function (_a, i) {
    var color = _a.color;
    return {
      color: color,
      stop: Math.max(Math.min(1, processStops[i] / lineLength), 0)
    };
  });
};

var getAngleFromCorner = function (corner, width, height) {
  var centerX = width / 2;
  var centerY = height / 2;
  var x = getAbsoluteValue(corner[0], width) - centerX;
  var y = centerY - getAbsoluteValue(corner[1], height);
  return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
};

var calculateGradientDirection = function (angle, width, height) {
  var radian = typeof angle === 'number' ? angle : getAngleFromCorner(angle, width, height);
  var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
  var halfWidth = width / 2;
  var halfHeight = height / 2;
  var halfLineLength = lineLength / 2;
  var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
  var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
  return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
};

var distance = function (a, b) {
  return Math.sqrt(a * a + b * b);
};

var findCorner = function (width, height, x, y, closest) {
  var corners = [[0, 0], [0, height], [width, 0], [width, height]];
  return corners.reduce(function (stat, corner) {
    var cx = corner[0],
        cy = corner[1];
    var d = distance(x - cx, y - cy);

    if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {
      return {
        optimumCorner: corner,
        optimumDistance: d
      };
    }

    return stat;
  }, {
    optimumDistance: closest ? Infinity : -Infinity,
    optimumCorner: null
  }).optimumCorner;
};

var calculateRadius = function (gradient, x, y, width, height) {
  var rx = 0;
  var ry = 0;

  switch (gradient.size) {
    case CSSRadialExtent.CLOSEST_SIDE:
      // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
      // If the shape is an ellipse, it exactly meets the closest side in each dimension.
      if (gradient.shape === CSSRadialShape.CIRCLE) {
        rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
      } else if (gradient.shape === CSSRadialShape.ELLIPSE) {
        rx = Math.min(Math.abs(x), Math.abs(x - width));
        ry = Math.min(Math.abs(y), Math.abs(y - height));
      }

      break;

    case CSSRadialExtent.CLOSEST_CORNER:
      // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
      // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
      if (gradient.shape === CSSRadialShape.CIRCLE) {
        rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
      } else if (gradient.shape === CSSRadialShape.ELLIPSE) {
        // Compute the ratio ry/rx (which is to be the same as for "closest-side")
        var c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));

        var _a = findCorner(width, height, x, y, true),
            cx = _a[0],
            cy = _a[1];

        rx = distance(cx - x, (cy - y) / c);
        ry = c * rx;
      }

      break;

    case CSSRadialExtent.FARTHEST_SIDE:
      // Same as closest-side, except the ending shape is sized based on the farthest side(s)
      if (gradient.shape === CSSRadialShape.CIRCLE) {
        rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
      } else if (gradient.shape === CSSRadialShape.ELLIPSE) {
        rx = Math.max(Math.abs(x), Math.abs(x - width));
        ry = Math.max(Math.abs(y), Math.abs(y - height));
      }

      break;

    case CSSRadialExtent.FARTHEST_CORNER:
      // Same as closest-corner, except the ending shape is sized based on the farthest corner.
      // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
      if (gradient.shape === CSSRadialShape.CIRCLE) {
        rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
      } else if (gradient.shape === CSSRadialShape.ELLIPSE) {
        // Compute the ratio ry/rx (which is to be the same as for "farthest-side")
        var c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));

        var _b = findCorner(width, height, x, y, false),
            cx = _b[0],
            cy = _b[1];

        rx = distance(cx - x, (cy - y) / c);
        ry = c * rx;
      }

      break;
  }

  if (Array.isArray(gradient.size)) {
    rx = getAbsoluteValue(gradient.size[0], width);
    ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
  }

  return [rx, ry];
};

var linearGradient = function (tokens) {
  var angle$1 = deg(180);
  var stops = [];
  parseFunctionArgs(tokens).forEach(function (arg, i) {
    if (i === 0) {
      var firstToken = arg[0];

      if (firstToken.type === TokenType.IDENT_TOKEN && firstToken.value === 'to') {
        angle$1 = parseNamedSide(arg);
        return;
      } else if (isAngle(firstToken)) {
        angle$1 = angle.parse(firstToken);
        return;
      }
    }

    var colorStop = parseColorStop(arg);
    stops.push(colorStop);
  });
  return {
    angle: angle$1,
    stops: stops,
    type: CSSImageType.LINEAR_GRADIENT
  };
};

var prefixLinearGradient = function (tokens) {
  var angle$1 = deg(180);
  var stops = [];
  parseFunctionArgs(tokens).forEach(function (arg, i) {
    if (i === 0) {
      var firstToken = arg[0];

      if (firstToken.type === TokenType.IDENT_TOKEN && ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
        angle$1 = parseNamedSide(arg);
        return;
      } else if (isAngle(firstToken)) {
        angle$1 = (angle.parse(firstToken) + deg(270)) % deg(360);
        return;
      }
    }

    var colorStop = parseColorStop(arg);
    stops.push(colorStop);
  });
  return {
    angle: angle$1,
    stops: stops,
    type: CSSImageType.LINEAR_GRADIENT
  };
};

var testRangeBounds = function (document) {
  var TEST_HEIGHT = 123;

  if (document.createRange) {
    var range = document.createRange();

    if (range.getBoundingClientRect) {
      var testElement = document.createElement('boundtest');
      testElement.style.height = TEST_HEIGHT + "px";
      testElement.style.display = 'block';
      document.body.appendChild(testElement);
      range.selectNode(testElement);
      var rangeBounds = range.getBoundingClientRect();
      var rangeHeight = Math.round(rangeBounds.height);
      document.body.removeChild(testElement);

      if (rangeHeight === TEST_HEIGHT) {
        return true;
      }
    }
  }

  return false;
};

var testCORS = function () {
  return typeof new Image().crossOrigin !== 'undefined';
};

var testResponseType = function () {
  return typeof new XMLHttpRequest().responseType === 'string';
};

var testSVG = function (document) {
  var img = new Image();
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  if (!ctx) {
    return false;
  }

  img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";

  try {
    ctx.drawImage(img, 0, 0);
    canvas.toDataURL();
  } catch (e) {
    return false;
  }

  return true;
};

var isGreenPixel = function (data) {
  return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
};

var testForeignObject = function (document) {
  var canvas = document.createElement('canvas');
  var size = 100;
  canvas.width = size;
  canvas.height = size;
  var ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(false);
  }

  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillRect(0, 0, size, size);
  var img = new Image();
  var greenImageSrc = canvas.toDataURL();
  img.src = greenImageSrc;
  var svg = createForeignObjectSVG(size, size, 0, 0, img);
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, size, size);
  return loadSerializedSVG(svg).then(function (img) {
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, size, size).data;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size, size);
    var node = document.createElement('div');
    node.style.backgroundImage = "url(" + greenImageSrc + ")";
    node.style.height = size + "px"; // Firefox 55 does not render inline <img /> tags

    return isGreenPixel(data) ? loadSerializedSVG(createForeignObjectSVG(size, size, 0, 0, node)) : Promise.reject(false);
  }).then(function (img) {
    ctx.drawImage(img, 0, 0); // Edge does not render background-images

    return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
  }).catch(function () {
    return false;
  });
};

var createForeignObjectSVG = function (width, height, x, y, node) {
  var xmlns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(xmlns, 'svg');
  var foreignObject = document.createElementNS(xmlns, 'foreignObject');
  svg.setAttributeNS(null, 'width', width.toString());
  svg.setAttributeNS(null, 'height', height.toString());
  foreignObject.setAttributeNS(null, 'width', '100%');
  foreignObject.setAttributeNS(null, 'height', '100%');
  foreignObject.setAttributeNS(null, 'x', x.toString());
  foreignObject.setAttributeNS(null, 'y', y.toString());
  foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
  svg.appendChild(foreignObject);
  foreignObject.appendChild(node);
  return svg;
};

var loadSerializedSVG = function (svg) {
  return new Promise(function (resolve, reject) {
    var img = new Image();

    img.onload = function () {
      return resolve(img);
    };

    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  });
};

var FEATURES = {
  get SUPPORT_RANGE_BOUNDS() {
    var value = testRangeBounds(document);
    Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', {
      value: value
    });
    return value;
  },

  get SUPPORT_SVG_DRAWING() {
    var value = testSVG(document);
    Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', {
      value: value
    });
    return value;
  },

  get SUPPORT_FOREIGNOBJECT_DRAWING() {
    var value = typeof Array.from === 'function' && typeof window.fetch === 'function' ? testForeignObject(document) : Promise.resolve(false);
    Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', {
      value: value
    });
    return value;
  },

  get SUPPORT_CORS_IMAGES() {
    var value = testCORS();
    Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', {
      value: value
    });
    return value;
  },

  get SUPPORT_RESPONSE_TYPE() {
    var value = testResponseType();
    Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', {
      value: value
    });
    return value;
  },

  get SUPPORT_CORS_XHR() {
    var value = ('withCredentials' in new XMLHttpRequest());
    Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', {
      value: value
    });
    return value;
  }

};

var Logger =
/** @class */
function () {
  function Logger(_a) {
    var id = _a.id,
        enabled = _a.enabled;
    this.id = id;
    this.enabled = enabled;
    this.start = Date.now();
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any


  Logger.prototype.debug = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.enabled) {
      // eslint-disable-next-line no-console
      if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
        // eslint-disable-next-line no-console
        console.debug.apply(console, [this.id, this.getTime() + "ms"].concat(args));
      } else {
        this.info.apply(this, args);
      }
    }
  };

  Logger.prototype.getTime = function () {
    return Date.now() - this.start;
  };

  Logger.create = function (options) {
    Logger.instances[options.id] = new Logger(options);
  };

  Logger.destroy = function (id) {
    delete Logger.instances[id];
  };

  Logger.getInstance = function (id) {
    var instance = Logger.instances[id];

    if (typeof instance === 'undefined') {
      throw new Error("No logger instance found with id " + id);
    }

    return instance;
  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any


  Logger.prototype.info = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.enabled) {
      // eslint-disable-next-line no-console
      if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
        // eslint-disable-next-line no-console
        console.info.apply(console, [this.id, this.getTime() + "ms"].concat(args));
      }
    }
  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any


  Logger.prototype.error = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this.enabled) {
      // eslint-disable-next-line no-console
      if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
        // eslint-disable-next-line no-console
        console.error.apply(console, [this.id, this.getTime() + "ms"].concat(args));
      } else {
        this.info.apply(this, args);
      }
    }
  };

  Logger.instances = {};
  return Logger;
}();

var CacheStorage =
/** @class */
function () {
  function CacheStorage() {}

  CacheStorage.create = function (name, options) {
    return CacheStorage._caches[name] = new Cache(name, options);
  };

  CacheStorage.destroy = function (name) {
    delete CacheStorage._caches[name];
  };

  CacheStorage.open = function (name) {
    var cache = CacheStorage._caches[name];

    if (typeof cache !== 'undefined') {
      return cache;
    }

    throw new Error("Cache with key \"" + name + "\" not found");
  };

  CacheStorage.getOrigin = function (url) {
    var link = CacheStorage._link;

    if (!link) {
      return 'about:blank';
    }

    link.href = url;
    link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/

    return link.protocol + link.hostname + link.port;
  };

  CacheStorage.isSameOrigin = function (src) {
    return CacheStorage.getOrigin(src) === CacheStorage._origin;
  };

  CacheStorage.setContext = function (window) {
    CacheStorage._link = window.document.createElement('a');
    CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
  };

  CacheStorage.getInstance = function () {
    var current = CacheStorage._current;

    if (current === null) {
      throw new Error("No cache instance attached");
    }

    return current;
  };

  CacheStorage.attachInstance = function (cache) {
    CacheStorage._current = cache;
  };

  CacheStorage.detachInstance = function () {
    CacheStorage._current = null;
  };

  CacheStorage._caches = {};
  CacheStorage._origin = 'about:blank';
  CacheStorage._current = null;
  return CacheStorage;
}();

var Cache =
/** @class */
function () {
  function Cache(id, options) {
    this.id = id;
    this._options = options;
    this._cache = {};
  }

  Cache.prototype.addImage = function (src) {
    var result = Promise.resolve();

    if (this.has(src)) {
      return result;
    }

    if (isBlobImage(src) || isRenderable(src)) {
      this._cache[src] = this.loadImage(src);
      return result;
    }

    return result;
  }; // eslint-disable-next-line @typescript-eslint/no-explicit-any


  Cache.prototype.match = function (src) {
    return this._cache[src];
  };

  Cache.prototype.loadImage = function (key) {
    return __awaiter(this, void 0, void 0, function () {
      var isSameOrigin, useCORS, useProxy, src;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            isSameOrigin = CacheStorage.isSameOrigin(key);
            useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
            useProxy = !isInlineImage(key) && !isSameOrigin && typeof this._options.proxy === 'string' && FEATURES.SUPPORT_CORS_XHR && !useCORS;

            if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !useProxy && !useCORS) {
              return [2
              /*return*/
              ];
            }

            src = key;
            if (!useProxy) return [3
            /*break*/
            , 2];
            return [4
            /*yield*/
            , this.proxy(src)];

          case 1:
            src = _a.sent();
            _a.label = 2;

          case 2:
            Logger.getInstance(this.id).debug("Added image " + key.substring(0, 256));
            return [4
            /*yield*/
            , new Promise(function (resolve, reject) {
              var img = new Image();

              img.onload = function () {
                return resolve(img);
              };

              img.onerror = reject; //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous

              if (isInlineBase64Image(src) || useCORS) {
                img.crossOrigin = 'anonymous';
              }

              img.src = src;

              if (img.complete === true) {
                // Inline XML images may fail to parse, throwing an Error later on
                setTimeout(function () {
                  return resolve(img);
                }, 500);
              }

              if (_this._options.imageTimeout > 0) {
                setTimeout(function () {
                  return reject("Timed out (" + _this._options.imageTimeout + "ms) loading image");
                }, _this._options.imageTimeout);
              }
            })];

          case 3:
            return [2
            /*return*/
            , _a.sent()];
        }
      });
    });
  };

  Cache.prototype.has = function (key) {
    return typeof this._cache[key] !== 'undefined';
  };

  Cache.prototype.keys = function () {
    return Promise.resolve(Object.keys(this._cache));
  };

  Cache.prototype.proxy = function (src) {
    var _this = this;

    var proxy = this._options.proxy;

    if (!proxy) {
      throw new Error('No proxy defined');
    }

    var key = src.substring(0, 256);
    return new Promise(function (resolve, reject) {
      var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
      var xhr = new XMLHttpRequest();

      xhr.onload = function () {
        if (xhr.status === 200) {
          if (responseType === 'text') {
            resolve(xhr.response);
          } else {
            var reader_1 = new FileReader();
            reader_1.addEventListener('load', function () {
              return resolve(reader_1.result);
            }, false);
            reader_1.addEventListener('error', function (e) {
              return reject(e);
            }, false);
            reader_1.readAsDataURL(xhr.response);
          }
        } else {
          reject("Failed to proxy resource " + key + " with status code " + xhr.status);
        }
      };

      xhr.onerror = reject;
      xhr.open('GET', proxy + "?url=" + encodeURIComponent(src) + "&responseType=" + responseType);

      if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
        xhr.responseType = responseType;
      }

      if (_this._options.imageTimeout) {
        var timeout_1 = _this._options.imageTimeout;
        xhr.timeout = timeout_1;

        xhr.ontimeout = function () {
          return reject("Timed out (" + timeout_1 + "ms) proxying " + key);
        };
      }

      xhr.send();
    });
  };

  return Cache;
}();

var INLINE_SVG = /^data:image\/svg\+xml/i;
var INLINE_BASE64 = /^data:image\/.*;base64,/i;
var INLINE_IMG = /^data:image\/.*/i;

var isRenderable = function (src) {
  return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src);
};

var isInlineImage = function (src) {
  return INLINE_IMG.test(src);
};

var isInlineBase64Image = function (src) {
  return INLINE_BASE64.test(src);
};

var isBlobImage = function (src) {
  return src.substr(0, 4) === 'blob';
};

var isSVG = function (src) {
  return src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src);
};

var webkitGradient = function (tokens) {
  var angle = deg(180);
  var stops = [];
  var type = CSSImageType.LINEAR_GRADIENT;
  var shape = CSSRadialShape.CIRCLE;
  var size = CSSRadialExtent.FARTHEST_CORNER;
  var position = [];
  parseFunctionArgs(tokens).forEach(function (arg, i) {
    var firstToken = arg[0];

    if (i === 0) {
      if (isIdentToken(firstToken) && firstToken.value === 'linear') {
        type = CSSImageType.LINEAR_GRADIENT;
        return;
      } else if (isIdentToken(firstToken) && firstToken.value === 'radial') {
        type = CSSImageType.RADIAL_GRADIENT;
        return;
      }
    }

    if (firstToken.type === TokenType.FUNCTION) {
      if (firstToken.name === 'from') {
        var color$1 = color.parse(firstToken.values[0]);
        stops.push({
          stop: ZERO_LENGTH,
          color: color$1
        });
      } else if (firstToken.name === 'to') {
        var color$1 = color.parse(firstToken.values[0]);
        stops.push({
          stop: HUNDRED_PERCENT,
          color: color$1
        });
      } else if (firstToken.name === 'color-stop') {
        var values = firstToken.values.filter(nonFunctionArgSeparator);

        if (values.length === 2) {
          var color$1 = color.parse(values[1]);
          var stop_1 = values[0];

          if (isNumberToken(stop_1)) {
            stops.push({
              stop: {
                type: TokenType.PERCENTAGE_TOKEN,
                number: stop_1.number * 100,
                flags: stop_1.flags
              },
              color: color$1
            });
          }
        }
      }
    }
  });
  return type === CSSImageType.LINEAR_GRADIENT ? {
    angle: (angle + deg(180)) % deg(360),
    stops: stops,
    type: type
  } : {
    size: size,
    shape: shape,
    stops: stops,
    position: position,
    type: type
  };
};

var CLOSEST_SIDE = 'closest-side';
var FARTHEST_SIDE = 'farthest-side';
var CLOSEST_CORNER = 'closest-corner';
var FARTHEST_CORNER = 'farthest-corner';
var CIRCLE = 'circle';
var ELLIPSE = 'ellipse';
var COVER = 'cover';
var CONTAIN = 'contain';

var radialGradient = function (tokens) {
  var shape = CSSRadialShape.CIRCLE;
  var size = CSSRadialExtent.FARTHEST_CORNER;
  var stops = [];
  var position = [];
  parseFunctionArgs(tokens).forEach(function (arg, i) {
    var isColorStop = true;

    if (i === 0) {
      var isAtPosition_1 = false;
      isColorStop = arg.reduce(function (acc, token) {
        if (isAtPosition_1) {
          if (isIdentToken(token)) {
            switch (token.value) {
              case 'center':
                position.push(FIFTY_PERCENT);
                return acc;

              case 'top':
              case 'left':
                position.push(ZERO_LENGTH);
                return acc;

              case 'right':
              case 'bottom':
                position.push(HUNDRED_PERCENT);
                return acc;
            }
          } else if (isLengthPercentage(token) || isLength(token)) {
            position.push(token);
          }
        } else if (isIdentToken(token)) {
          switch (token.value) {
            case CIRCLE:
              shape = CSSRadialShape.CIRCLE;
              return false;

            case ELLIPSE:
              shape = CSSRadialShape.ELLIPSE;
              return false;

            case 'at':
              isAtPosition_1 = true;
              return false;

            case CLOSEST_SIDE:
              size = CSSRadialExtent.CLOSEST_SIDE;
              return false;

            case COVER:
            case FARTHEST_SIDE:
              size = CSSRadialExtent.FARTHEST_SIDE;
              return false;

            case CONTAIN:
            case CLOSEST_CORNER:
              size = CSSRadialExtent.CLOSEST_CORNER;
              return false;

            case FARTHEST_CORNER:
              size = CSSRadialExtent.FARTHEST_CORNER;
              return false;
          }
        } else if (isLength(token) || isLengthPercentage(token)) {
          if (!Array.isArray(size)) {
            size = [];
          }

          size.push(token);
          return false;
        }

        return acc;
      }, isColorStop);
    }

    if (isColorStop) {
      var colorStop = parseColorStop(arg);
      stops.push(colorStop);
    }
  });
  return {
    size: size,
    shape: shape,
    stops: stops,
    position: position,
    type: CSSImageType.RADIAL_GRADIENT
  };
};

var prefixRadialGradient = function (tokens) {
  var shape = CSSRadialShape.CIRCLE;
  var size = CSSRadialExtent.FARTHEST_CORNER;
  var stops = [];
  var position = [];
  parseFunctionArgs(tokens).forEach(function (arg, i) {
    var isColorStop = true;

    if (i === 0) {
      isColorStop = arg.reduce(function (acc, token) {
        if (isIdentToken(token)) {
          switch (token.value) {
            case 'center':
              position.push(FIFTY_PERCENT);
              return false;

            case 'top':
            case 'left':
              position.push(ZERO_LENGTH);
              return false;

            case 'right':
            case 'bottom':
              position.push(HUNDRED_PERCENT);
              return false;
          }
        } else if (isLengthPercentage(token) || isLength(token)) {
          position.push(token);
          return false;
        }

        return acc;
      }, isColorStop);
    } else if (i === 1) {
      isColorStop = arg.reduce(function (acc, token) {
        if (isIdentToken(token)) {
          switch (token.value) {
            case CIRCLE:
              shape = CSSRadialShape.CIRCLE;
              return false;

            case ELLIPSE:
              shape = CSSRadialShape.ELLIPSE;
              return false;

            case CONTAIN:
            case CLOSEST_SIDE:
              size = CSSRadialExtent.CLOSEST_SIDE;
              return false;

            case FARTHEST_SIDE:
              size = CSSRadialExtent.FARTHEST_SIDE;
              return false;

            case CLOSEST_CORNER:
              size = CSSRadialExtent.CLOSEST_CORNER;
              return false;

            case COVER:
            case FARTHEST_CORNER:
              size = CSSRadialExtent.FARTHEST_CORNER;
              return false;
          }
        } else if (isLength(token) || isLengthPercentage(token)) {
          if (!Array.isArray(size)) {
            size = [];
          }

          size.push(token);
          return false;
        }

        return acc;
      }, isColorStop);
    }

    if (isColorStop) {
      var colorStop = parseColorStop(arg);
      stops.push(colorStop);
    }
  });
  return {
    size: size,
    shape: shape,
    stops: stops,
    position: position,
    type: CSSImageType.RADIAL_GRADIENT
  };
};

var CSSImageType;

(function (CSSImageType) {
  CSSImageType[CSSImageType["URL"] = 0] = "URL";
  CSSImageType[CSSImageType["LINEAR_GRADIENT"] = 1] = "LINEAR_GRADIENT";
  CSSImageType[CSSImageType["RADIAL_GRADIENT"] = 2] = "RADIAL_GRADIENT";
})(CSSImageType || (CSSImageType = {}));

var isLinearGradient = function (background) {
  return background.type === CSSImageType.LINEAR_GRADIENT;
};

var isRadialGradient = function (background) {
  return background.type === CSSImageType.RADIAL_GRADIENT;
};

var CSSRadialShape;

(function (CSSRadialShape) {
  CSSRadialShape[CSSRadialShape["CIRCLE"] = 0] = "CIRCLE";
  CSSRadialShape[CSSRadialShape["ELLIPSE"] = 1] = "ELLIPSE";
})(CSSRadialShape || (CSSRadialShape = {}));

var CSSRadialExtent;

(function (CSSRadialExtent) {
  CSSRadialExtent[CSSRadialExtent["CLOSEST_SIDE"] = 0] = "CLOSEST_SIDE";
  CSSRadialExtent[CSSRadialExtent["FARTHEST_SIDE"] = 1] = "FARTHEST_SIDE";
  CSSRadialExtent[CSSRadialExtent["CLOSEST_CORNER"] = 2] = "CLOSEST_CORNER";
  CSSRadialExtent[CSSRadialExtent["FARTHEST_CORNER"] = 3] = "FARTHEST_CORNER";
})(CSSRadialExtent || (CSSRadialExtent = {}));

var image = {
  name: 'image',
  parse: function (value) {
    if (value.type === TokenType.URL_TOKEN) {
      var image_1 = {
        url: value.value,
        type: CSSImageType.URL
      };
      CacheStorage.getInstance().addImage(value.value);
      return image_1;
    }

    if (value.type === TokenType.FUNCTION) {
      var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];

      if (typeof imageFunction === 'undefined') {
        throw new Error("Attempting to parse an unsupported image function \"" + value.name + "\"");
      }

      return imageFunction(value.values);
    }

    throw new Error("Unsupported image type");
  }
};

function isSupportedImage(value) {
  return value.type !== TokenType.FUNCTION || SUPPORTED_IMAGE_FUNCTIONS[value.name];
}

var SUPPORTED_IMAGE_FUNCTIONS = {
  'linear-gradient': linearGradient,
  '-moz-linear-gradient': prefixLinearGradient,
  '-ms-linear-gradient': prefixLinearGradient,
  '-o-linear-gradient': prefixLinearGradient,
  '-webkit-linear-gradient': prefixLinearGradient,
  'radial-gradient': radialGradient,
  '-moz-radial-gradient': prefixRadialGradient,
  '-ms-radial-gradient': prefixRadialGradient,
  '-o-radial-gradient': prefixRadialGradient,
  '-webkit-radial-gradient': prefixRadialGradient,
  '-webkit-gradient': webkitGradient
};
var backgroundImage = {
  name: 'background-image',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    if (tokens.length === 0) {
      return [];
    }

    var first = tokens[0];

    if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
      return [];
    }

    return tokens.filter(function (value) {
      return nonFunctionArgSeparator(value) && isSupportedImage(value);
    }).map(image.parse);
  }
};
var backgroundOrigin = {
  name: 'background-origin',
  initialValue: 'border-box',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.map(function (token) {
      if (isIdentToken(token)) {
        switch (token.value) {
          case 'padding-box':
            return 1
            /* PADDING_BOX */
            ;

          case 'content-box':
            return 2
            /* CONTENT_BOX */
            ;
        }
      }

      return 0
      /* BORDER_BOX */
      ;
    });
  }
};
var backgroundPosition = {
  name: 'background-position',
  initialValue: '0% 0%',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    return parseFunctionArgs(tokens).map(function (values) {
      return values.filter(isLengthPercentage);
    }).map(parseLengthPercentageTuple);
  }
};
var BACKGROUND_REPEAT;

(function (BACKGROUND_REPEAT) {
  BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT"] = 0] = "REPEAT";
  BACKGROUND_REPEAT[BACKGROUND_REPEAT["NO_REPEAT"] = 1] = "NO_REPEAT";
  BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_X"] = 2] = "REPEAT_X";
  BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_Y"] = 3] = "REPEAT_Y";
})(BACKGROUND_REPEAT || (BACKGROUND_REPEAT = {}));

var backgroundRepeat = {
  name: 'background-repeat',
  initialValue: 'repeat',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return parseFunctionArgs(tokens).map(function (values) {
      return values.filter(isIdentToken).map(function (token) {
        return token.value;
      }).join(' ');
    }).map(parseBackgroundRepeat);
  }
};

var parseBackgroundRepeat = function (value) {
  switch (value) {
    case 'no-repeat':
      return BACKGROUND_REPEAT.NO_REPEAT;

    case 'repeat-x':
    case 'repeat no-repeat':
      return BACKGROUND_REPEAT.REPEAT_X;

    case 'repeat-y':
    case 'no-repeat repeat':
      return BACKGROUND_REPEAT.REPEAT_Y;

    case 'repeat':
    default:
      return BACKGROUND_REPEAT.REPEAT;
  }
};

var BACKGROUND_SIZE;

(function (BACKGROUND_SIZE) {
  BACKGROUND_SIZE["AUTO"] = "auto";
  BACKGROUND_SIZE["CONTAIN"] = "contain";
  BACKGROUND_SIZE["COVER"] = "cover";
})(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));

var backgroundSize = {
  name: 'background-size',
  initialValue: '0',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return parseFunctionArgs(tokens).map(function (values) {
      return values.filter(isBackgroundSizeInfoToken);
    });
  }
};

var isBackgroundSizeInfoToken = function (value) {
  return isIdentToken(value) || isLengthPercentage(value);
};

var borderColorForSide = function (side) {
  return {
    name: "border-" + side + "-color",
    initialValue: 'transparent',
    prefix: false,
    type: PropertyDescriptorParsingType.TYPE_VALUE,
    format: 'color'
  };
};

var borderTopColor = borderColorForSide('top');
var borderRightColor = borderColorForSide('right');
var borderBottomColor = borderColorForSide('bottom');
var borderLeftColor = borderColorForSide('left');

var borderRadiusForSide = function (side) {
  return {
    name: "border-radius-" + side,
    initialValue: '0 0',
    prefix: false,
    type: PropertyDescriptorParsingType.LIST,
    parse: function (tokens) {
      return parseLengthPercentageTuple(tokens.filter(isLengthPercentage));
    }
  };
};

var borderTopLeftRadius = borderRadiusForSide('top-left');
var borderTopRightRadius = borderRadiusForSide('top-right');
var borderBottomRightRadius = borderRadiusForSide('bottom-right');
var borderBottomLeftRadius = borderRadiusForSide('bottom-left');
var BORDER_STYLE;

(function (BORDER_STYLE) {
  BORDER_STYLE[BORDER_STYLE["NONE"] = 0] = "NONE";
  BORDER_STYLE[BORDER_STYLE["SOLID"] = 1] = "SOLID";
})(BORDER_STYLE || (BORDER_STYLE = {}));

var borderStyleForSide = function (side) {
  return {
    name: "border-" + side + "-style",
    initialValue: 'solid',
    prefix: false,
    type: PropertyDescriptorParsingType.IDENT_VALUE,
    parse: function (style) {
      switch (style) {
        case 'none':
          return BORDER_STYLE.NONE;
      }

      return BORDER_STYLE.SOLID;
    }
  };
};

var borderTopStyle = borderStyleForSide('top');
var borderRightStyle = borderStyleForSide('right');
var borderBottomStyle = borderStyleForSide('bottom');
var borderLeftStyle = borderStyleForSide('left');

var borderWidthForSide = function (side) {
  return {
    name: "border-" + side + "-width",
    initialValue: '0',
    type: PropertyDescriptorParsingType.VALUE,
    prefix: false,
    parse: function (token) {
      if (isDimensionToken(token)) {
        return token.number;
      }

      return 0;
    }
  };
};

var borderTopWidth = borderWidthForSide('top');
var borderRightWidth = borderWidthForSide('right');
var borderBottomWidth = borderWidthForSide('bottom');
var borderLeftWidth = borderWidthForSide('left');
var color$1 = {
  name: "color",
  initialValue: 'transparent',
  prefix: false,
  type: PropertyDescriptorParsingType.TYPE_VALUE,
  format: 'color'
};
var display = {
  name: 'display',
  initialValue: 'inline-block',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.filter(isIdentToken).reduce(function (bit, token) {
      return bit | parseDisplayValue(token.value);
    }, 0
    /* NONE */
    );
  }
};

var parseDisplayValue = function (display) {
  switch (display) {
    case 'block':
      return 2
      /* BLOCK */
      ;

    case 'inline':
      return 4
      /* INLINE */
      ;

    case 'run-in':
      return 8
      /* RUN_IN */
      ;

    case 'flow':
      return 16
      /* FLOW */
      ;

    case 'flow-root':
      return 32
      /* FLOW_ROOT */
      ;

    case 'table':
      return 64
      /* TABLE */
      ;

    case 'flex':
    case '-webkit-flex':
      return 128
      /* FLEX */
      ;

    case 'grid':
    case '-ms-grid':
      return 256
      /* GRID */
      ;

    case 'ruby':
      return 512
      /* RUBY */
      ;

    case 'subgrid':
      return 1024
      /* SUBGRID */
      ;

    case 'list-item':
      return 2048
      /* LIST_ITEM */
      ;

    case 'table-row-group':
      return 4096
      /* TABLE_ROW_GROUP */
      ;

    case 'table-header-group':
      return 8192
      /* TABLE_HEADER_GROUP */
      ;

    case 'table-footer-group':
      return 16384
      /* TABLE_FOOTER_GROUP */
      ;

    case 'table-row':
      return 32768
      /* TABLE_ROW */
      ;

    case 'table-cell':
      return 65536
      /* TABLE_CELL */
      ;

    case 'table-column-group':
      return 131072
      /* TABLE_COLUMN_GROUP */
      ;

    case 'table-column':
      return 262144
      /* TABLE_COLUMN */
      ;

    case 'table-caption':
      return 524288
      /* TABLE_CAPTION */
      ;

    case 'ruby-base':
      return 1048576
      /* RUBY_BASE */
      ;

    case 'ruby-text':
      return 2097152
      /* RUBY_TEXT */
      ;

    case 'ruby-base-container':
      return 4194304
      /* RUBY_BASE_CONTAINER */
      ;

    case 'ruby-text-container':
      return 8388608
      /* RUBY_TEXT_CONTAINER */
      ;

    case 'contents':
      return 16777216
      /* CONTENTS */
      ;

    case 'inline-block':
      return 33554432
      /* INLINE_BLOCK */
      ;

    case 'inline-list-item':
      return 67108864
      /* INLINE_LIST_ITEM */
      ;

    case 'inline-table':
      return 134217728
      /* INLINE_TABLE */
      ;

    case 'inline-flex':
      return 268435456
      /* INLINE_FLEX */
      ;

    case 'inline-grid':
      return 536870912
      /* INLINE_GRID */
      ;
  }

  return 0
  /* NONE */
  ;
};

var FLOAT;

(function (FLOAT) {
  FLOAT[FLOAT["NONE"] = 0] = "NONE";
  FLOAT[FLOAT["LEFT"] = 1] = "LEFT";
  FLOAT[FLOAT["RIGHT"] = 2] = "RIGHT";
  FLOAT[FLOAT["INLINE_START"] = 3] = "INLINE_START";
  FLOAT[FLOAT["INLINE_END"] = 4] = "INLINE_END";
})(FLOAT || (FLOAT = {}));

var float = {
  name: 'float',
  initialValue: 'none',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (float) {
    switch (float) {
      case 'left':
        return FLOAT.LEFT;

      case 'right':
        return FLOAT.RIGHT;

      case 'inline-start':
        return FLOAT.INLINE_START;

      case 'inline-end':
        return FLOAT.INLINE_END;
    }

    return FLOAT.NONE;
  }
};
var letterSpacing = {
  name: 'letter-spacing',
  initialValue: '0',
  prefix: false,
  type: PropertyDescriptorParsingType.VALUE,
  parse: function (token) {
    if (token.type === TokenType.IDENT_TOKEN && token.value === 'normal') {
      return 0;
    }

    if (token.type === TokenType.NUMBER_TOKEN) {
      return token.number;
    }

    if (token.type === TokenType.DIMENSION_TOKEN) {
      return token.number;
    }

    return 0;
  }
};
var LINE_BREAK;

(function (LINE_BREAK) {
  LINE_BREAK["NORMAL"] = "normal";
  LINE_BREAK["STRICT"] = "strict";
})(LINE_BREAK || (LINE_BREAK = {}));

var lineBreak = {
  name: 'line-break',
  initialValue: 'normal',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (lineBreak) {
    switch (lineBreak) {
      case 'strict':
        return LINE_BREAK.STRICT;

      case 'normal':
      default:
        return LINE_BREAK.NORMAL;
    }
  }
};
var lineHeight = {
  name: 'line-height',
  initialValue: 'normal',
  prefix: false,
  type: PropertyDescriptorParsingType.TOKEN_VALUE
};

var computeLineHeight = function (token, fontSize) {
  if (isIdentToken(token) && token.value === 'normal') {
    return 1.2 * fontSize;
  } else if (token.type === TokenType.NUMBER_TOKEN) {
    return fontSize * token.number;
  } else if (isLengthPercentage(token)) {
    return getAbsoluteValue(token, fontSize);
  }

  return fontSize;
};

var listStyleImage = {
  name: 'list-style-image',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.VALUE,
  prefix: false,
  parse: function (token) {
    if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
      return null;
    }

    return image.parse(token);
  }
};
var LIST_STYLE_POSITION;

(function (LIST_STYLE_POSITION) {
  LIST_STYLE_POSITION[LIST_STYLE_POSITION["INSIDE"] = 0] = "INSIDE";
  LIST_STYLE_POSITION[LIST_STYLE_POSITION["OUTSIDE"] = 1] = "OUTSIDE";
})(LIST_STYLE_POSITION || (LIST_STYLE_POSITION = {}));

var listStylePosition = {
  name: 'list-style-position',
  initialValue: 'outside',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (position) {
    switch (position) {
      case 'inside':
        return LIST_STYLE_POSITION.INSIDE;

      case 'outside':
      default:
        return LIST_STYLE_POSITION.OUTSIDE;
    }
  }
};
var LIST_STYLE_TYPE;

(function (LIST_STYLE_TYPE) {
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["NONE"] = -1] = "NONE";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISC"] = 0] = "DISC";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CIRCLE"] = 1] = "CIRCLE";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["SQUARE"] = 2] = "SQUARE";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL"] = 3] = "DECIMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_DECIMAL"] = 4] = "CJK_DECIMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL_LEADING_ZERO"] = 5] = "DECIMAL_LEADING_ZERO";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ROMAN"] = 6] = "LOWER_ROMAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ROMAN"] = 7] = "UPPER_ROMAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_GREEK"] = 8] = "LOWER_GREEK";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ALPHA"] = 9] = "LOWER_ALPHA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ALPHA"] = 10] = "UPPER_ALPHA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARABIC_INDIC"] = 11] = "ARABIC_INDIC";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARMENIAN"] = 12] = "ARMENIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["BENGALI"] = 13] = "BENGALI";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CAMBODIAN"] = 14] = "CAMBODIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_EARTHLY_BRANCH"] = 15] = "CJK_EARTHLY_BRANCH";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_HEAVENLY_STEM"] = 16] = "CJK_HEAVENLY_STEM";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_IDEOGRAPHIC"] = 17] = "CJK_IDEOGRAPHIC";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DEVANAGARI"] = 18] = "DEVANAGARI";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["ETHIOPIC_NUMERIC"] = 19] = "ETHIOPIC_NUMERIC";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["GEORGIAN"] = 20] = "GEORGIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["GUJARATI"] = 21] = "GUJARATI";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["GURMUKHI"] = 22] = "GURMUKHI";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["HEBREW"] = 22] = "HEBREW";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA"] = 23] = "HIRAGANA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA_IROHA"] = 24] = "HIRAGANA_IROHA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_FORMAL"] = 25] = "JAPANESE_FORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_INFORMAL"] = 26] = "JAPANESE_INFORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KANNADA"] = 27] = "KANNADA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA"] = 28] = "KATAKANA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA_IROHA"] = 29] = "KATAKANA_IROHA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KHMER"] = 30] = "KHMER";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANGUL_FORMAL"] = 31] = "KOREAN_HANGUL_FORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_FORMAL"] = 32] = "KOREAN_HANJA_FORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_INFORMAL"] = 33] = "KOREAN_HANJA_INFORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["LAO"] = 34] = "LAO";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ARMENIAN"] = 35] = "LOWER_ARMENIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["MALAYALAM"] = 36] = "MALAYALAM";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["MONGOLIAN"] = 37] = "MONGOLIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["MYANMAR"] = 38] = "MYANMAR";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["ORIYA"] = 39] = "ORIYA";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["PERSIAN"] = 40] = "PERSIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_FORMAL"] = 41] = "SIMP_CHINESE_FORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_INFORMAL"] = 42] = "SIMP_CHINESE_INFORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["TAMIL"] = 43] = "TAMIL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["TELUGU"] = 44] = "TELUGU";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["THAI"] = 45] = "THAI";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["TIBETAN"] = 46] = "TIBETAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_FORMAL"] = 47] = "TRAD_CHINESE_FORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_INFORMAL"] = 48] = "TRAD_CHINESE_INFORMAL";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ARMENIAN"] = 49] = "UPPER_ARMENIAN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_OPEN"] = 50] = "DISCLOSURE_OPEN";
  LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_CLOSED"] = 51] = "DISCLOSURE_CLOSED";
})(LIST_STYLE_TYPE || (LIST_STYLE_TYPE = {}));

var listStyleType = {
  name: 'list-style-type',
  initialValue: 'none',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (type) {
    switch (type) {
      case 'disc':
        return LIST_STYLE_TYPE.DISC;

      case 'circle':
        return LIST_STYLE_TYPE.CIRCLE;

      case 'square':
        return LIST_STYLE_TYPE.SQUARE;

      case 'decimal':
        return LIST_STYLE_TYPE.DECIMAL;

      case 'cjk-decimal':
        return LIST_STYLE_TYPE.CJK_DECIMAL;

      case 'decimal-leading-zero':
        return LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO;

      case 'lower-roman':
        return LIST_STYLE_TYPE.LOWER_ROMAN;

      case 'upper-roman':
        return LIST_STYLE_TYPE.UPPER_ROMAN;

      case 'lower-greek':
        return LIST_STYLE_TYPE.LOWER_GREEK;

      case 'lower-alpha':
        return LIST_STYLE_TYPE.LOWER_ALPHA;

      case 'upper-alpha':
        return LIST_STYLE_TYPE.UPPER_ALPHA;

      case 'arabic-indic':
        return LIST_STYLE_TYPE.ARABIC_INDIC;

      case 'armenian':
        return LIST_STYLE_TYPE.ARMENIAN;

      case 'bengali':
        return LIST_STYLE_TYPE.BENGALI;

      case 'cambodian':
        return LIST_STYLE_TYPE.CAMBODIAN;

      case 'cjk-earthly-branch':
        return LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH;

      case 'cjk-heavenly-stem':
        return LIST_STYLE_TYPE.CJK_HEAVENLY_STEM;

      case 'cjk-ideographic':
        return LIST_STYLE_TYPE.CJK_IDEOGRAPHIC;

      case 'devanagari':
        return LIST_STYLE_TYPE.DEVANAGARI;

      case 'ethiopic-numeric':
        return LIST_STYLE_TYPE.ETHIOPIC_NUMERIC;

      case 'georgian':
        return LIST_STYLE_TYPE.GEORGIAN;

      case 'gujarati':
        return LIST_STYLE_TYPE.GUJARATI;

      case 'gurmukhi':
        return LIST_STYLE_TYPE.GURMUKHI;

      case 'hebrew':
        return LIST_STYLE_TYPE.HEBREW;

      case 'hiragana':
        return LIST_STYLE_TYPE.HIRAGANA;

      case 'hiragana-iroha':
        return LIST_STYLE_TYPE.HIRAGANA_IROHA;

      case 'japanese-formal':
        return LIST_STYLE_TYPE.JAPANESE_FORMAL;

      case 'japanese-informal':
        return LIST_STYLE_TYPE.JAPANESE_INFORMAL;

      case 'kannada':
        return LIST_STYLE_TYPE.KANNADA;

      case 'katakana':
        return LIST_STYLE_TYPE.KATAKANA;

      case 'katakana-iroha':
        return LIST_STYLE_TYPE.KATAKANA_IROHA;

      case 'khmer':
        return LIST_STYLE_TYPE.KHMER;

      case 'korean-hangul-formal':
        return LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL;

      case 'korean-hanja-formal':
        return LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL;

      case 'korean-hanja-informal':
        return LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL;

      case 'lao':
        return LIST_STYLE_TYPE.LAO;

      case 'lower-armenian':
        return LIST_STYLE_TYPE.LOWER_ARMENIAN;

      case 'malayalam':
        return LIST_STYLE_TYPE.MALAYALAM;

      case 'mongolian':
        return LIST_STYLE_TYPE.MONGOLIAN;

      case 'myanmar':
        return LIST_STYLE_TYPE.MYANMAR;

      case 'oriya':
        return LIST_STYLE_TYPE.ORIYA;

      case 'persian':
        return LIST_STYLE_TYPE.PERSIAN;

      case 'simp-chinese-formal':
        return LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL;

      case 'simp-chinese-informal':
        return LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL;

      case 'tamil':
        return LIST_STYLE_TYPE.TAMIL;

      case 'telugu':
        return LIST_STYLE_TYPE.TELUGU;

      case 'thai':
        return LIST_STYLE_TYPE.THAI;

      case 'tibetan':
        return LIST_STYLE_TYPE.TIBETAN;

      case 'trad-chinese-formal':
        return LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL;

      case 'trad-chinese-informal':
        return LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL;

      case 'upper-armenian':
        return LIST_STYLE_TYPE.UPPER_ARMENIAN;

      case 'disclosure-open':
        return LIST_STYLE_TYPE.DISCLOSURE_OPEN;

      case 'disclosure-closed':
        return LIST_STYLE_TYPE.DISCLOSURE_CLOSED;

      case 'none':
      default:
        return LIST_STYLE_TYPE.NONE;
    }
  }
};

var marginForSide = function (side) {
  return {
    name: "margin-" + side,
    initialValue: '0',
    prefix: false,
    type: PropertyDescriptorParsingType.TOKEN_VALUE
  };
};

var marginTop = marginForSide('top');
var marginRight = marginForSide('right');
var marginBottom = marginForSide('bottom');
var marginLeft = marginForSide('left');
var OVERFLOW;

(function (OVERFLOW) {
  OVERFLOW[OVERFLOW["VISIBLE"] = 0] = "VISIBLE";
  OVERFLOW[OVERFLOW["HIDDEN"] = 1] = "HIDDEN";
  OVERFLOW[OVERFLOW["SCROLL"] = 2] = "SCROLL";
  OVERFLOW[OVERFLOW["AUTO"] = 3] = "AUTO";
})(OVERFLOW || (OVERFLOW = {}));

var overflow = {
  name: 'overflow',
  initialValue: 'visible',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.filter(isIdentToken).map(function (overflow) {
      switch (overflow.value) {
        case 'hidden':
          return OVERFLOW.HIDDEN;

        case 'scroll':
          return OVERFLOW.SCROLL;

        case 'auto':
          return OVERFLOW.AUTO;

        case 'visible':
        default:
          return OVERFLOW.VISIBLE;
      }
    });
  }
};
var OVERFLOW_WRAP;

(function (OVERFLOW_WRAP) {
  OVERFLOW_WRAP["NORMAL"] = "normal";
  OVERFLOW_WRAP["BREAK_WORD"] = "break-word";
})(OVERFLOW_WRAP || (OVERFLOW_WRAP = {}));

var overflowWrap = {
  name: 'overflow-wrap',
  initialValue: 'normal',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (overflow) {
    switch (overflow) {
      case 'break-word':
        return OVERFLOW_WRAP.BREAK_WORD;

      case 'normal':
      default:
        return OVERFLOW_WRAP.NORMAL;
    }
  }
};

var paddingForSide = function (side) {
  return {
    name: "padding-" + side,
    initialValue: '0',
    prefix: false,
    type: PropertyDescriptorParsingType.TYPE_VALUE,
    format: 'length-percentage'
  };
};

var paddingTop = paddingForSide('top');
var paddingRight = paddingForSide('right');
var paddingBottom = paddingForSide('bottom');
var paddingLeft = paddingForSide('left');
var TEXT_ALIGN;

(function (TEXT_ALIGN) {
  TEXT_ALIGN[TEXT_ALIGN["LEFT"] = 0] = "LEFT";
  TEXT_ALIGN[TEXT_ALIGN["CENTER"] = 1] = "CENTER";
  TEXT_ALIGN[TEXT_ALIGN["RIGHT"] = 2] = "RIGHT";
})(TEXT_ALIGN || (TEXT_ALIGN = {}));

var textAlign = {
  name: 'text-align',
  initialValue: 'left',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (textAlign) {
    switch (textAlign) {
      case 'right':
        return TEXT_ALIGN.RIGHT;

      case 'center':
      case 'justify':
        return TEXT_ALIGN.CENTER;

      case 'left':
      default:
        return TEXT_ALIGN.LEFT;
    }
  }
};
var POSITION;

(function (POSITION) {
  POSITION[POSITION["STATIC"] = 0] = "STATIC";
  POSITION[POSITION["RELATIVE"] = 1] = "RELATIVE";
  POSITION[POSITION["ABSOLUTE"] = 2] = "ABSOLUTE";
  POSITION[POSITION["FIXED"] = 3] = "FIXED";
  POSITION[POSITION["STICKY"] = 4] = "STICKY";
})(POSITION || (POSITION = {}));

var position = {
  name: 'position',
  initialValue: 'static',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (position) {
    switch (position) {
      case 'relative':
        return POSITION.RELATIVE;

      case 'absolute':
        return POSITION.ABSOLUTE;

      case 'fixed':
        return POSITION.FIXED;

      case 'sticky':
        return POSITION.STICKY;
    }

    return POSITION.STATIC;
  }
};
var textShadow = {
  name: 'text-shadow',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
      return [];
    }

    return parseFunctionArgs(tokens).map(function (values) {
      var shadow = {
        color: COLORS.TRANSPARENT,
        offsetX: ZERO_LENGTH,
        offsetY: ZERO_LENGTH,
        blur: ZERO_LENGTH
      };
      var c = 0;

      for (var i = 0; i < values.length; i++) {
        var token = values[i];

        if (isLength(token)) {
          if (c === 0) {
            shadow.offsetX = token;
          } else if (c === 1) {
            shadow.offsetY = token;
          } else {
            shadow.blur = token;
          }

          c++;
        } else {
          shadow.color = color.parse(token);
        }
      }

      return shadow;
    });
  }
};
var TEXT_TRANSFORM;

(function (TEXT_TRANSFORM) {
  TEXT_TRANSFORM[TEXT_TRANSFORM["NONE"] = 0] = "NONE";
  TEXT_TRANSFORM[TEXT_TRANSFORM["LOWERCASE"] = 1] = "LOWERCASE";
  TEXT_TRANSFORM[TEXT_TRANSFORM["UPPERCASE"] = 2] = "UPPERCASE";
  TEXT_TRANSFORM[TEXT_TRANSFORM["CAPITALIZE"] = 3] = "CAPITALIZE";
})(TEXT_TRANSFORM || (TEXT_TRANSFORM = {}));

var textTransform = {
  name: 'text-transform',
  initialValue: 'none',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (textTransform) {
    switch (textTransform) {
      case 'uppercase':
        return TEXT_TRANSFORM.UPPERCASE;

      case 'lowercase':
        return TEXT_TRANSFORM.LOWERCASE;

      case 'capitalize':
        return TEXT_TRANSFORM.CAPITALIZE;
    }

    return TEXT_TRANSFORM.NONE;
  }
};
var transform = {
  name: 'transform',
  initialValue: 'none',
  prefix: true,
  type: PropertyDescriptorParsingType.VALUE,
  parse: function (token) {
    if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
      return null;
    }

    if (token.type === TokenType.FUNCTION) {
      var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];

      if (typeof transformFunction === 'undefined') {
        throw new Error("Attempting to parse an unsupported transform function \"" + token.name + "\"");
      }

      return transformFunction(token.values);
    }

    return null;
  }
};

var matrix = function (args) {
  var values = args.filter(function (arg) {
    return arg.type === TokenType.NUMBER_TOKEN;
  }).map(function (arg) {
    return arg.number;
  });
  return values.length === 6 ? values : null;
}; // doesn't support 3D transforms at the moment


var matrix3d = function (args) {
  var values = args.filter(function (arg) {
    return arg.type === TokenType.NUMBER_TOKEN;
  }).map(function (arg) {
    return arg.number;
  });
  var a1 = values[0],
      b1 = values[1],
      _a = values[2],
      _b = values[3],
      a2 = values[4],
      b2 = values[5],
      _c = values[6],
      _d = values[7],
      _e = values[8],
      _f = values[9],
      _g = values[10],
      _h = values[11],
      a4 = values[12],
      b4 = values[13],
      _j = values[14],
      _k = values[15];
  return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
};

var SUPPORTED_TRANSFORM_FUNCTIONS = {
  matrix: matrix,
  matrix3d: matrix3d
};
var DEFAULT_VALUE = {
  type: TokenType.PERCENTAGE_TOKEN,
  number: 50,
  flags: FLAG_INTEGER
};
var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
var transformOrigin = {
  name: 'transform-origin',
  initialValue: '50% 50%',
  prefix: true,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    var origins = tokens.filter(isLengthPercentage);

    if (origins.length !== 2) {
      return DEFAULT;
    }

    return [origins[0], origins[1]];
  }
};
var VISIBILITY;

(function (VISIBILITY) {
  VISIBILITY[VISIBILITY["VISIBLE"] = 0] = "VISIBLE";
  VISIBILITY[VISIBILITY["HIDDEN"] = 1] = "HIDDEN";
  VISIBILITY[VISIBILITY["COLLAPSE"] = 2] = "COLLAPSE";
})(VISIBILITY || (VISIBILITY = {}));

var visibility = {
  name: 'visible',
  initialValue: 'none',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (visibility) {
    switch (visibility) {
      case 'hidden':
        return VISIBILITY.HIDDEN;

      case 'collapse':
        return VISIBILITY.COLLAPSE;

      case 'visible':
      default:
        return VISIBILITY.VISIBLE;
    }
  }
};
var WORD_BREAK;

(function (WORD_BREAK) {
  WORD_BREAK["NORMAL"] = "normal";
  WORD_BREAK["BREAK_ALL"] = "break-all";
  WORD_BREAK["KEEP_ALL"] = "keep-all";
})(WORD_BREAK || (WORD_BREAK = {}));

var wordBreak = {
  name: 'word-break',
  initialValue: 'normal',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (wordBreak) {
    switch (wordBreak) {
      case 'break-all':
        return WORD_BREAK.BREAK_ALL;

      case 'keep-all':
        return WORD_BREAK.KEEP_ALL;

      case 'normal':
      default:
        return WORD_BREAK.NORMAL;
    }
  }
};
var zIndex = {
  name: 'z-index',
  initialValue: 'auto',
  prefix: false,
  type: PropertyDescriptorParsingType.VALUE,
  parse: function (token) {
    if (token.type === TokenType.IDENT_TOKEN) {
      return {
        auto: true,
        order: 0
      };
    }

    if (isNumberToken(token)) {
      return {
        auto: false,
        order: token.number
      };
    }

    throw new Error("Invalid z-index number parsed");
  }
};
var opacity = {
  name: 'opacity',
  initialValue: '1',
  type: PropertyDescriptorParsingType.VALUE,
  prefix: false,
  parse: function (token) {
    if (isNumberToken(token)) {
      return token.number;
    }

    return 1;
  }
};
var textDecorationColor = {
  name: "text-decoration-color",
  initialValue: 'transparent',
  prefix: false,
  type: PropertyDescriptorParsingType.TYPE_VALUE,
  format: 'color'
};
var textDecorationLine = {
  name: 'text-decoration-line',
  initialValue: 'none',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.filter(isIdentToken).map(function (token) {
      switch (token.value) {
        case 'underline':
          return 1
          /* UNDERLINE */
          ;

        case 'overline':
          return 2
          /* OVERLINE */
          ;

        case 'line-through':
          return 3
          /* LINE_THROUGH */
          ;

        case 'none':
          return 4
          /* BLINK */
          ;
      }

      return 0
      /* NONE */
      ;
    }).filter(function (line) {
      return line !== 0
      /* NONE */
      ;
    });
  }
};
var fontFamily = {
  name: "font-family",
  initialValue: '',
  prefix: false,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    return tokens.filter(isStringToken$1).map(function (token) {
      return token.value;
    });
  }
};

var isStringToken$1 = function (token) {
  return token.type === TokenType.STRING_TOKEN || token.type === TokenType.IDENT_TOKEN;
};

var fontSize = {
  name: "font-size",
  initialValue: '0',
  prefix: false,
  type: PropertyDescriptorParsingType.TYPE_VALUE,
  format: 'length'
};
var fontWeight = {
  name: 'font-weight',
  initialValue: 'normal',
  type: PropertyDescriptorParsingType.VALUE,
  prefix: false,
  parse: function (token) {
    if (isNumberToken(token)) {
      return token.number;
    }

    if (isIdentToken(token)) {
      switch (token.value) {
        case 'bold':
          return 700;

        case 'normal':
        default:
          return 400;
      }
    }

    return 400;
  }
};
var fontVariant = {
  name: 'font-variant',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    return tokens.filter(isIdentToken).map(function (token) {
      return token.value;
    });
  }
};
var FONT_STYLE;

(function (FONT_STYLE) {
  FONT_STYLE["NORMAL"] = "normal";
  FONT_STYLE["ITALIC"] = "italic";
  FONT_STYLE["OBLIQUE"] = "oblique";
})(FONT_STYLE || (FONT_STYLE = {}));

var fontStyle = {
  name: 'font-style',
  initialValue: 'normal',
  prefix: false,
  type: PropertyDescriptorParsingType.IDENT_VALUE,
  parse: function (overflow) {
    switch (overflow) {
      case 'oblique':
        return FONT_STYLE.OBLIQUE;

      case 'italic':
        return FONT_STYLE.ITALIC;

      case 'normal':
      default:
        return FONT_STYLE.NORMAL;
    }
  }
};

var contains = function (bit, value) {
  return (bit & value) !== 0;
};

var content = {
  name: 'content',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    if (tokens.length === 0) {
      return [];
    }

    var first = tokens[0];

    if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
      return [];
    }

    return tokens;
  }
};
var counterIncrement = {
  name: 'counter-increment',
  initialValue: 'none',
  prefix: true,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    if (tokens.length === 0) {
      return null;
    }

    var first = tokens[0];

    if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
      return null;
    }

    var increments = [];
    var filtered = tokens.filter(nonWhiteSpace);

    for (var i = 0; i < filtered.length; i++) {
      var counter = filtered[i];
      var next = filtered[i + 1];

      if (counter.type === TokenType.IDENT_TOKEN) {
        var increment = next && isNumberToken(next) ? next.number : 1;
        increments.push({
          counter: counter.value,
          increment: increment
        });
      }
    }

    return increments;
  }
};
var counterReset = {
  name: 'counter-reset',
  initialValue: 'none',
  prefix: true,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    if (tokens.length === 0) {
      return [];
    }

    var resets = [];
    var filtered = tokens.filter(nonWhiteSpace);

    for (var i = 0; i < filtered.length; i++) {
      var counter = filtered[i];
      var next = filtered[i + 1];

      if (isIdentToken(counter) && counter.value !== 'none') {
        var reset = next && isNumberToken(next) ? next.number : 0;
        resets.push({
          counter: counter.value,
          reset: reset
        });
      }
    }

    return resets;
  }
};
var quotes = {
  name: 'quotes',
  initialValue: 'none',
  prefix: true,
  type: PropertyDescriptorParsingType.LIST,
  parse: function (tokens) {
    if (tokens.length === 0) {
      return null;
    }

    var first = tokens[0];

    if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
      return null;
    }

    var quotes = [];
    var filtered = tokens.filter(isStringToken);

    if (filtered.length % 2 !== 0) {
      return null;
    }

    for (var i = 0; i < filtered.length; i += 2) {
      var open_1 = filtered[i].value;
      var close_1 = filtered[i + 1].value;
      quotes.push({
        open: open_1,
        close: close_1
      });
    }

    return quotes;
  }
};

var getQuote = function (quotes, depth, open) {
  if (!quotes) {
    return '';
  }

  var quote = quotes[Math.min(depth, quotes.length - 1)];

  if (!quote) {
    return '';
  }

  return open ? quote.open : quote.close;
};

var boxShadow = {
  name: 'box-shadow',
  initialValue: 'none',
  type: PropertyDescriptorParsingType.LIST,
  prefix: false,
  parse: function (tokens) {
    if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
      return [];
    }

    return parseFunctionArgs(tokens).map(function (values) {
      var shadow = {
        color: 0x000000ff,
        offsetX: ZERO_LENGTH,
        offsetY: ZERO_LENGTH,
        blur: ZERO_LENGTH,
        spread: ZERO_LENGTH,
        inset: false
      };
      var c = 0;

      for (var i = 0; i < values.length; i++) {
        var token = values[i];

        if (isIdentWithValue(token, 'inset')) {
          shadow.inset = true;
        } else if (isLength(token)) {
          if (c === 0) {
            shadow.offsetX = token;
          } else if (c === 1) {
            shadow.offsetY = token;
          } else if (c === 2) {
            shadow.blur = token;
          } else {
            shadow.spread = token;
          }

          c++;
        } else {
          shadow.color = color.parse(token);
        }
      }

      return shadow;
    });
  }
};

var CSSParsedDeclaration =
/** @class */
function () {
  function CSSParsedDeclaration(declaration) {
    this.backgroundClip = parse(backgroundClip, declaration.backgroundClip);
    this.backgroundColor = parse(backgroundColor, declaration.backgroundColor);
    this.backgroundImage = parse(backgroundImage, declaration.backgroundImage);
    this.backgroundOrigin = parse(backgroundOrigin, declaration.backgroundOrigin);
    this.backgroundPosition = parse(backgroundPosition, declaration.backgroundPosition);
    this.backgroundRepeat = parse(backgroundRepeat, declaration.backgroundRepeat);
    this.backgroundSize = parse(backgroundSize, declaration.backgroundSize);
    this.borderTopColor = parse(borderTopColor, declaration.borderTopColor);
    this.borderRightColor = parse(borderRightColor, declaration.borderRightColor);
    this.borderBottomColor = parse(borderBottomColor, declaration.borderBottomColor);
    this.borderLeftColor = parse(borderLeftColor, declaration.borderLeftColor);
    this.borderTopLeftRadius = parse(borderTopLeftRadius, declaration.borderTopLeftRadius);
    this.borderTopRightRadius = parse(borderTopRightRadius, declaration.borderTopRightRadius);
    this.borderBottomRightRadius = parse(borderBottomRightRadius, declaration.borderBottomRightRadius);
    this.borderBottomLeftRadius = parse(borderBottomLeftRadius, declaration.borderBottomLeftRadius);
    this.borderTopStyle = parse(borderTopStyle, declaration.borderTopStyle);
    this.borderRightStyle = parse(borderRightStyle, declaration.borderRightStyle);
    this.borderBottomStyle = parse(borderBottomStyle, declaration.borderBottomStyle);
    this.borderLeftStyle = parse(borderLeftStyle, declaration.borderLeftStyle);
    this.borderTopWidth = parse(borderTopWidth, declaration.borderTopWidth);
    this.borderRightWidth = parse(borderRightWidth, declaration.borderRightWidth);
    this.borderBottomWidth = parse(borderBottomWidth, declaration.borderBottomWidth);
    this.borderLeftWidth = parse(borderLeftWidth, declaration.borderLeftWidth);
    this.boxShadow = parse(boxShadow, declaration.boxShadow);
    this.color = parse(color$1, declaration.color);
    this.display = parse(display, declaration.display);
    this.float = parse(float, declaration.cssFloat);
    this.fontFamily = parse(fontFamily, declaration.fontFamily);
    this.fontSize = parse(fontSize, declaration.fontSize);
    this.fontStyle = parse(fontStyle, declaration.fontStyle);
    this.fontVariant = parse(fontVariant, declaration.fontVariant);
    this.fontWeight = parse(fontWeight, declaration.fontWeight);
    this.letterSpacing = parse(letterSpacing, declaration.letterSpacing);
    this.lineBreak = parse(lineBreak, declaration.lineBreak);
    this.lineHeight = parse(lineHeight, declaration.lineHeight);
    this.listStyleImage = parse(listStyleImage, declaration.listStyleImage);
    this.listStylePosition = parse(listStylePosition, declaration.listStylePosition);
    this.listStyleType = parse(listStyleType, declaration.listStyleType);
    this.marginTop = parse(marginTop, declaration.marginTop);
    this.marginRight = parse(marginRight, declaration.marginRight);
    this.marginBottom = parse(marginBottom, declaration.marginBottom);
    this.marginLeft = parse(marginLeft, declaration.marginLeft);
    this.opacity = parse(opacity, declaration.opacity);
    var overflowTuple = parse(overflow, declaration.overflow);
    this.overflowX = overflowTuple[0];
    this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
    this.overflowWrap = parse(overflowWrap, declaration.overflowWrap);
    this.paddingTop = parse(paddingTop, declaration.paddingTop);
    this.paddingRight = parse(paddingRight, declaration.paddingRight);
    this.paddingBottom = parse(paddingBottom, declaration.paddingBottom);
    this.paddingLeft = parse(paddingLeft, declaration.paddingLeft);
    this.position = parse(position, declaration.position);
    this.textAlign = parse(textAlign, declaration.textAlign);
    this.textDecorationColor = parse(textDecorationColor, declaration.textDecorationColor || declaration.color);
    this.textDecorationLine = parse(textDecorationLine, declaration.textDecorationLine);
    this.textShadow = parse(textShadow, declaration.textShadow);
    this.textTransform = parse(textTransform, declaration.textTransform);
    this.transform = parse(transform, declaration.transform);
    this.transformOrigin = parse(transformOrigin, declaration.transformOrigin);
    this.visibility = parse(visibility, declaration.visibility);
    this.wordBreak = parse(wordBreak, declaration.wordBreak);
    this.zIndex = parse(zIndex, declaration.zIndex);
  }

  CSSParsedDeclaration.prototype.isVisible = function () {
    return this.display > 0 && this.opacity > 0 && this.visibility === VISIBILITY.VISIBLE;
  };

  CSSParsedDeclaration.prototype.isTransparent = function () {
    return isTransparent(this.backgroundColor);
  };

  CSSParsedDeclaration.prototype.isTransformed = function () {
    return this.transform !== null;
  };

  CSSParsedDeclaration.prototype.isPositioned = function () {
    return this.position !== POSITION.STATIC;
  };

  CSSParsedDeclaration.prototype.isPositionedWithZIndex = function () {
    return this.isPositioned() && !this.zIndex.auto;
  };

  CSSParsedDeclaration.prototype.isFloating = function () {
    return this.float !== FLOAT.NONE;
  };

  CSSParsedDeclaration.prototype.isInlineLevel = function () {
    return contains(this.display, 4
    /* INLINE */
    ) || contains(this.display, 33554432
    /* INLINE_BLOCK */
    ) || contains(this.display, 268435456
    /* INLINE_FLEX */
    ) || contains(this.display, 536870912
    /* INLINE_GRID */
    ) || contains(this.display, 67108864
    /* INLINE_LIST_ITEM */
    ) || contains(this.display, 134217728
    /* INLINE_TABLE */
    );
  };

  return CSSParsedDeclaration;
}();

var CSSParsedPseudoDeclaration =
/** @class */
function () {
  function CSSParsedPseudoDeclaration(declaration) {
    this.content = parse(content, declaration.content);
    this.quotes = parse(quotes, declaration.quotes);
  }

  return CSSParsedPseudoDeclaration;
}();

var CSSParsedCounterDeclaration =
/** @class */
function () {
  function CSSParsedCounterDeclaration(declaration) {
    this.counterIncrement = parse(counterIncrement, declaration.counterIncrement);
    this.counterReset = parse(counterReset, declaration.counterReset);
  }

  return CSSParsedCounterDeclaration;
}(); // eslint-disable-next-line @typescript-eslint/no-explicit-any


var parse = function (descriptor, style) {
  var tokenizer = new Tokenizer();
  var value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
  tokenizer.write(value);
  var parser = new Parser(tokenizer.read());

  switch (descriptor.type) {
    case PropertyDescriptorParsingType.IDENT_VALUE:
      var token = parser.parseComponentValue();
      return descriptor.parse(isIdentToken(token) ? token.value : descriptor.initialValue);

    case PropertyDescriptorParsingType.VALUE:
      return descriptor.parse(parser.parseComponentValue());

    case PropertyDescriptorParsingType.LIST:
      return descriptor.parse(parser.parseComponentValues());

    case PropertyDescriptorParsingType.TOKEN_VALUE:
      return parser.parseComponentValue();

    case PropertyDescriptorParsingType.TYPE_VALUE:
      switch (descriptor.format) {
        case 'angle':
          return angle.parse(parser.parseComponentValue());

        case 'color':
          return color.parse(parser.parseComponentValue());

        case 'image':
          return image.parse(parser.parseComponentValue());

        case 'length':
          var length_1 = parser.parseComponentValue();
          return isLength(length_1) ? length_1 : ZERO_LENGTH;

        case 'length-percentage':
          var value_1 = parser.parseComponentValue();
          return isLengthPercentage(value_1) ? value_1 : ZERO_LENGTH;
      }

  }

  throw new Error("Attempting to parse unsupported css format type " + descriptor.format);
};

var ElementContainer =
/** @class */
function () {
  function ElementContainer(element) {
    this.styles = new CSSParsedDeclaration(window.getComputedStyle(element, null));
    this.textNodes = [];
    this.elements = [];

    if (this.styles.transform !== null && isHTMLElementNode(element)) {
      // getBoundingClientRect takes transforms into account
      element.style.transform = 'none';
    }

    this.bounds = parseBounds(element);
    this.flags = 0;
  }

  return ElementContainer;
}();

var TextBounds =
/** @class */
function () {
  function TextBounds(text, bounds) {
    this.text = text;
    this.bounds = bounds;
  }

  return TextBounds;
}();

var parseTextBounds = function (value, styles, node) {
  var textList = breakText(value, styles);
  var textBounds = [];
  var offset = 0;
  textList.forEach(function (text) {
    if (styles.textDecorationLine.length || text.trim().length > 0) {
      if (FEATURES.SUPPORT_RANGE_BOUNDS) {
        textBounds.push(new TextBounds(text, getRangeBounds(node, offset, text.length)));
      } else {
        var replacementNode = node.splitText(text.length);
        textBounds.push(new TextBounds(text, getWrapperBounds(node)));
        node = replacementNode;
      }
    } else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
      node = node.splitText(text.length);
    }

    offset += text.length;
  });
  return textBounds;
};

var getWrapperBounds = function (node) {
  var ownerDocument = node.ownerDocument;

  if (ownerDocument) {
    var wrapper = ownerDocument.createElement('html2canvaswrapper');
    wrapper.appendChild(node.cloneNode(true));
    var parentNode = node.parentNode;

    if (parentNode) {
      parentNode.replaceChild(wrapper, node);
      var bounds = parseBounds(wrapper);

      if (wrapper.firstChild) {
        parentNode.replaceChild(wrapper.firstChild, wrapper);
      }

      return bounds;
    }
  }

  return new Bounds(0, 0, 0, 0);
};

var getRangeBounds = function (node, offset, length) {
  var ownerDocument = node.ownerDocument;

  if (!ownerDocument) {
    throw new Error('Node has no owner document');
  }

  var range = ownerDocument.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset + length);
  return Bounds.fromClientRect(range.getBoundingClientRect());
};

var breakText = function (value, styles) {
  return styles.letterSpacing !== 0 ? toCodePoints(value).map(function (i) {
    return fromCodePoint(i);
  }) : breakWords(value, styles);
};

var breakWords = function (str, styles) {
  var breaker = LineBreaker(str, {
    lineBreak: styles.lineBreak,
    wordBreak: styles.overflowWrap === OVERFLOW_WRAP.BREAK_WORD ? 'break-word' : styles.wordBreak
  });
  var words = [];
  var bk;

  while (!(bk = breaker.next()).done) {
    if (bk.value) {
      words.push(bk.value.slice());
    }
  }

  return words;
};

var TextContainer =
/** @class */
function () {
  function TextContainer(node, styles) {
    this.text = transform$1(node.data, styles.textTransform);
    this.textBounds = parseTextBounds(this.text, styles, node);
  }

  return TextContainer;
}();

var transform$1 = function (text, transform) {
  switch (transform) {
    case TEXT_TRANSFORM.LOWERCASE:
      return text.toLowerCase();

    case TEXT_TRANSFORM.CAPITALIZE:
      return text.replace(CAPITALIZE, capitalize);

    case TEXT_TRANSFORM.UPPERCASE:
      return text.toUpperCase();

    default:
      return text;
  }
};

var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;

var capitalize = function (m, p1, p2) {
  if (m.length > 0) {
    return p1 + p2.toUpperCase();
  }

  return m;
};

var ImageElementContainer =
/** @class */
function (_super) {
  __extends(ImageElementContainer, _super);

  function ImageElementContainer(img) {
    var _this = _super.call(this, img) || this;

    _this.src = img.currentSrc || img.src;
    _this.intrinsicWidth = img.naturalWidth;
    _this.intrinsicHeight = img.naturalHeight;
    CacheStorage.getInstance().addImage(_this.src);
    return _this;
  }

  return ImageElementContainer;
}(ElementContainer);

var CanvasElementContainer =
/** @class */
function (_super) {
  __extends(CanvasElementContainer, _super);

  function CanvasElementContainer(canvas) {
    var _this = _super.call(this, canvas) || this;

    _this.canvas = canvas;
    _this.intrinsicWidth = canvas.width;
    _this.intrinsicHeight = canvas.height;
    return _this;
  }

  return CanvasElementContainer;
}(ElementContainer);

var SVGElementContainer =
/** @class */
function (_super) {
  __extends(SVGElementContainer, _super);

  function SVGElementContainer(img) {
    var _this = _super.call(this, img) || this;

    var s = new XMLSerializer();
    _this.svg = "data:image/svg+xml," + encodeURIComponent(s.serializeToString(img));
    _this.intrinsicWidth = img.width.baseVal.value;
    _this.intrinsicHeight = img.height.baseVal.value;
    CacheStorage.getInstance().addImage(_this.svg);
    return _this;
  }

  return SVGElementContainer;
}(ElementContainer);

var LIElementContainer =
/** @class */
function (_super) {
  __extends(LIElementContainer, _super);

  function LIElementContainer(element) {
    var _this = _super.call(this, element) || this;

    _this.value = element.value;
    return _this;
  }

  return LIElementContainer;
}(ElementContainer);

var OLElementContainer =
/** @class */
function (_super) {
  __extends(OLElementContainer, _super);

  function OLElementContainer(element) {
    var _this = _super.call(this, element) || this;

    _this.start = element.start;
    _this.reversed = typeof element.reversed === 'boolean' && element.reversed === true;
    return _this;
  }

  return OLElementContainer;
}(ElementContainer);

var CHECKBOX_BORDER_RADIUS = [{
  type: TokenType.DIMENSION_TOKEN,
  flags: 0,
  unit: 'px',
  number: 3
}];
var RADIO_BORDER_RADIUS = [{
  type: TokenType.PERCENTAGE_TOKEN,
  flags: 0,
  number: 50
}];

var reformatInputBounds = function (bounds) {
  if (bounds.width > bounds.height) {
    return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
  } else if (bounds.width < bounds.height) {
    return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
  }

  return bounds;
};

var getInputValue = function (node) {
  var value = node.type === PASSWORD ? new Array(node.value.length + 1).join('\u2022') : node.value;
  return value.length === 0 ? node.placeholder || '' : value;
};

var CHECKBOX = 'checkbox';
var RADIO = 'radio';
var PASSWORD = 'password';
var INPUT_COLOR = 0x2a2a2aff;

var InputElementContainer =
/** @class */
function (_super) {
  __extends(InputElementContainer, _super);

  function InputElementContainer(input) {
    var _this = _super.call(this, input) || this;

    _this.type = input.type.toLowerCase();
    _this.checked = input.checked;
    _this.value = getInputValue(input);

    if (_this.type === CHECKBOX || _this.type === RADIO) {
      _this.styles.backgroundColor = 0xdededeff;
      _this.styles.borderTopColor = _this.styles.borderRightColor = _this.styles.borderBottomColor = _this.styles.borderLeftColor = 0xa5a5a5ff;
      _this.styles.borderTopWidth = _this.styles.borderRightWidth = _this.styles.borderBottomWidth = _this.styles.borderLeftWidth = 1;
      _this.styles.borderTopStyle = _this.styles.borderRightStyle = _this.styles.borderBottomStyle = _this.styles.borderLeftStyle = BORDER_STYLE.SOLID;
      _this.styles.backgroundClip = [BACKGROUND_CLIP.BORDER_BOX];
      _this.styles.backgroundOrigin = [0
      /* BORDER_BOX */
      ];
      _this.bounds = reformatInputBounds(_this.bounds);
    }

    switch (_this.type) {
      case CHECKBOX:
        _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
        break;

      case RADIO:
        _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
        break;
    }

    return _this;
  }

  return InputElementContainer;
}(ElementContainer);

var SelectElementContainer =
/** @class */
function (_super) {
  __extends(SelectElementContainer, _super);

  function SelectElementContainer(element) {
    var _this = _super.call(this, element) || this;

    var option = element.options[element.selectedIndex || 0];
    _this.value = option ? option.text || '' : '';
    return _this;
  }

  return SelectElementContainer;
}(ElementContainer);

var TextareaElementContainer =
/** @class */
function (_super) {
  __extends(TextareaElementContainer, _super);

  function TextareaElementContainer(element) {
    var _this = _super.call(this, element) || this;

    _this.value = element.value;
    return _this;
  }

  return TextareaElementContainer;
}(ElementContainer);

var parseColor = function (value) {
  return color.parse(Parser.create(value).parseComponentValue());
};

var IFrameElementContainer =
/** @class */
function (_super) {
  __extends(IFrameElementContainer, _super);

  function IFrameElementContainer(iframe) {
    var _this = _super.call(this, iframe) || this;

    _this.src = iframe.src;
    _this.width = parseInt(iframe.width, 10) || 0;
    _this.height = parseInt(iframe.height, 10) || 0;
    _this.backgroundColor = _this.styles.backgroundColor;

    try {
      if (iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.documentElement) {
        _this.tree = parseTree(iframe.contentWindow.document.documentElement); // http://www.w3.org/TR/css3-background/#special-backgrounds

        var documentBackgroundColor = iframe.contentWindow.document.documentElement ? parseColor(getComputedStyle(iframe.contentWindow.document.documentElement).backgroundColor) : COLORS.TRANSPARENT;
        var bodyBackgroundColor = iframe.contentWindow.document.body ? parseColor(getComputedStyle(iframe.contentWindow.document.body).backgroundColor) : COLORS.TRANSPARENT;
        _this.backgroundColor = isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? _this.styles.backgroundColor : bodyBackgroundColor : documentBackgroundColor;
      }
    } catch (e) {}

    return _this;
  }

  return IFrameElementContainer;
}(ElementContainer);

var LIST_OWNERS = ['OL', 'UL', 'MENU'];

var parseNodeTree = function (node, parent, root) {
  for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
    nextNode = childNode.nextSibling;

    if (isTextNode(childNode) && childNode.data.trim().length > 0) {
      parent.textNodes.push(new TextContainer(childNode, parent.styles));
    } else if (isElementNode(childNode)) {
      var container = createContainer(childNode);

      if (container.styles.isVisible()) {
        if (createsRealStackingContext(childNode, container, root)) {
          container.flags |= 4
          /* CREATES_REAL_STACKING_CONTEXT */
          ;
        } else if (createsStackingContext(container.styles)) {
          container.flags |= 2
          /* CREATES_STACKING_CONTEXT */
          ;
        }

        if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
          container.flags |= 8
          /* IS_LIST_OWNER */
          ;
        }

        parent.elements.push(container);

        if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
          parseNodeTree(childNode, container, root);
        }
      }
    }
  }
};

var createContainer = function (element) {
  if (isImageElement(element)) {
    return new ImageElementContainer(element);
  }

  if (isCanvasElement(element)) {
    return new CanvasElementContainer(element);
  }

  if (isSVGElement(element)) {
    return new SVGElementContainer(element);
  }

  if (isLIElement(element)) {
    return new LIElementContainer(element);
  }

  if (isOLElement(element)) {
    return new OLElementContainer(element);
  }

  if (isInputElement(element)) {
    return new InputElementContainer(element);
  }

  if (isSelectElement(element)) {
    return new SelectElementContainer(element);
  }

  if (isTextareaElement(element)) {
    return new TextareaElementContainer(element);
  }

  if (isIFrameElement(element)) {
    return new IFrameElementContainer(element);
  }

  return new ElementContainer(element);
};

var parseTree = function (element) {
  var container = createContainer(element);
  container.flags |= 4
  /* CREATES_REAL_STACKING_CONTEXT */
  ;
  parseNodeTree(element, container, container);
  return container;
};

var createsRealStackingContext = function (node, container, root) {
  return container.styles.isPositionedWithZIndex() || container.styles.opacity < 1 || container.styles.isTransformed() || isBodyElement(node) && root.styles.isTransparent();
};

var createsStackingContext = function (styles) {
  return styles.isPositioned() || styles.isFloating();
};

var isTextNode = function (node) {
  return node.nodeType === Node.TEXT_NODE;
};

var isElementNode = function (node) {
  return node.nodeType === Node.ELEMENT_NODE;
};

var isHTMLElementNode = function (node) {
  return typeof node.style !== 'undefined';
};

var isLIElement = function (node) {
  return node.tagName === 'LI';
};

var isOLElement = function (node) {
  return node.tagName === 'OL';
};

var isInputElement = function (node) {
  return node.tagName === 'INPUT';
};

var isHTMLElement = function (node) {
  return node.tagName === 'HTML';
};

var isSVGElement = function (node) {
  return node.tagName === 'svg';
};

var isBodyElement = function (node) {
  return node.tagName === 'BODY';
};

var isCanvasElement = function (node) {
  return node.tagName === 'CANVAS';
};

var isImageElement = function (node) {
  return node.tagName === 'IMG';
};

var isIFrameElement = function (node) {
  return node.tagName === 'IFRAME';
};

var isStyleElement = function (node) {
  return node.tagName === 'STYLE';
};

var isScriptElement = function (node) {
  return node.tagName === 'SCRIPT';
};

var isTextareaElement = function (node) {
  return node.tagName === 'TEXTAREA';
};

var isSelectElement = function (node) {
  return node.tagName === 'SELECT';
};

var CounterState =
/** @class */
function () {
  function CounterState() {
    this.counters = {};
  }

  CounterState.prototype.getCounterValue = function (name) {
    var counter = this.counters[name];

    if (counter && counter.length) {
      return counter[counter.length - 1];
    }

    return 1;
  };

  CounterState.prototype.getCounterValues = function (name) {
    var counter = this.counters[name];
    return counter ? counter : [];
  };

  CounterState.prototype.pop = function (counters) {
    var _this = this;

    counters.forEach(function (counter) {
      return _this.counters[counter].pop();
    });
  };

  CounterState.prototype.parse = function (style) {
    var _this = this;

    var counterIncrement = style.counterIncrement;
    var counterReset = style.counterReset;
    var canReset = true;

    if (counterIncrement !== null) {
      counterIncrement.forEach(function (entry) {
        var counter = _this.counters[entry.counter];

        if (counter && entry.increment !== 0) {
          canReset = false;
          counter[Math.max(0, counter.length - 1)] += entry.increment;
        }
      });
    }

    var counterNames = [];

    if (canReset) {
      counterReset.forEach(function (entry) {
        var counter = _this.counters[entry.counter];
        counterNames.push(entry.counter);

        if (!counter) {
          counter = _this.counters[entry.counter] = [];
        }

        counter.push(entry.reset);
      });
    }

    return counterNames;
  };

  return CounterState;
}();

var ROMAN_UPPER = {
  integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
  values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
};
var ARMENIAN = {
  integers: [9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  values: ['Ք', 'Փ', 'Ւ', 'Ց', 'Ր', 'Տ', 'Վ', 'Ս', 'Ռ', 'Ջ', 'Պ', 'Չ', 'Ո', 'Շ', 'Ն', 'Յ', 'Մ', 'Ճ', 'Ղ', 'Ձ', 'Հ', 'Կ', 'Ծ', 'Խ', 'Լ', 'Ի', 'Ժ', 'Թ', 'Ը', 'Է', 'Զ', 'Ե', 'Դ', 'Գ', 'Բ', 'Ա']
};
var HEBREW = {
  integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 19, 18, 17, 16, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  values: ['י׳', 'ט׳', 'ח׳', 'ז׳', 'ו׳', 'ה׳', 'ד׳', 'ג׳', 'ב׳', 'א׳', 'ת', 'ש', 'ר', 'ק', 'צ', 'פ', 'ע', 'ס', 'נ', 'מ', 'ל', 'כ', 'יט', 'יח', 'יז', 'טז', 'טו', 'י', 'ט', 'ח', 'ז', 'ו', 'ה', 'ד', 'ג', 'ב', 'א']
};
var GEORGIAN = {
  integers: [10000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  values: ['ჵ', 'ჰ', 'ჯ', 'ჴ', 'ხ', 'ჭ', 'წ', 'ძ', 'ც', 'ჩ', 'შ', 'ყ', 'ღ', 'ქ', 'ფ', 'ჳ', 'ტ', 'ს', 'რ', 'ჟ', 'პ', 'ო', 'ჲ', 'ნ', 'მ', 'ლ', 'კ', 'ი', 'თ', 'ჱ', 'ზ', 'ვ', 'ე', 'დ', 'გ', 'ბ', 'ა']
};

var createAdditiveCounter = function (value, min, max, symbols, fallback, suffix) {
  if (value < min || value > max) {
    return createCounterText(value, fallback, suffix.length > 0);
  }

  return symbols.integers.reduce(function (string, integer, index) {
    while (value >= integer) {
      value -= integer;
      string += symbols.values[index];
    }

    return string;
  }, '') + suffix;
};

var createCounterStyleWithSymbolResolver = function (value, codePointRangeLength, isNumeric, resolver) {
  var string = '';

  do {
    if (!isNumeric) {
      value--;
    }

    string = resolver(value) + string;
    value /= codePointRangeLength;
  } while (value * codePointRangeLength >= codePointRangeLength);

  return string;
};

var createCounterStyleFromRange = function (value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
  var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
  return (value < 0 ? '-' : '') + (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {
    return fromCodePoint(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
  }) + suffix);
};

var createCounterStyleFromSymbols = function (value, symbols, suffix) {
  if (suffix === void 0) {
    suffix = '. ';
  }

  var codePointRangeLength = symbols.length;
  return createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) {
    return symbols[Math.floor(codePoint % codePointRangeLength)];
  }) + suffix;
};

var CJK_ZEROS = 1 << 0;
var CJK_TEN_COEFFICIENTS = 1 << 1;
var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
var CJK_HUNDRED_COEFFICIENTS = 1 << 3;

var createCJKCounter = function (value, numbers, multipliers, negativeSign, suffix, flags) {
  if (value < -9999 || value > 9999) {
    return createCounterText(value, LIST_STYLE_TYPE.CJK_DECIMAL, suffix.length > 0);
  }

  var tmp = Math.abs(value);
  var string = suffix;

  if (tmp === 0) {
    return numbers[0] + string;
  }

  for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
    var coefficient = tmp % 10;

    if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== '') {
      string = numbers[coefficient] + string;
    } else if (coefficient > 1 || coefficient === 1 && digit === 0 || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS) || coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100 || coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS)) {
      string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;
    } else if (coefficient === 1 && digit > 0) {
      string = multipliers[digit - 1] + string;
    }

    tmp = Math.floor(tmp / 10);
  }

  return (value < 0 ? negativeSign : '') + string;
};

var CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';
var CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';
var JAPANESE_NEGATIVE = 'マイナス';
var KOREAN_NEGATIVE = '마이너스';

var createCounterText = function (value, type, appendSuffix) {
  var defaultSuffix = appendSuffix ? '. ' : '';
  var cjkSuffix = appendSuffix ? '、' : '';
  var koreanSuffix = appendSuffix ? ', ' : '';
  var spaceSuffix = appendSuffix ? ' ' : '';

  switch (type) {
    case LIST_STYLE_TYPE.DISC:
      return '•' + spaceSuffix;

    case LIST_STYLE_TYPE.CIRCLE:
      return '◦' + spaceSuffix;

    case LIST_STYLE_TYPE.SQUARE:
      return '◾' + spaceSuffix;

    case LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO:
      var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
      return string.length < 4 ? "0" + string : string;

    case LIST_STYLE_TYPE.CJK_DECIMAL:
      return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);

    case LIST_STYLE_TYPE.LOWER_ROMAN:
      return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();

    case LIST_STYLE_TYPE.UPPER_ROMAN:
      return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);

    case LIST_STYLE_TYPE.LOWER_GREEK:
      return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);

    case LIST_STYLE_TYPE.LOWER_ALPHA:
      return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);

    case LIST_STYLE_TYPE.UPPER_ALPHA:
      return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);

    case LIST_STYLE_TYPE.ARABIC_INDIC:
      return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);

    case LIST_STYLE_TYPE.ARMENIAN:
    case LIST_STYLE_TYPE.UPPER_ARMENIAN:
      return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);

    case LIST_STYLE_TYPE.LOWER_ARMENIAN:
      return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();

    case LIST_STYLE_TYPE.BENGALI:
      return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);

    case LIST_STYLE_TYPE.CAMBODIAN:
    case LIST_STYLE_TYPE.KHMER:
      return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);

    case LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH:
      return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);

    case LIST_STYLE_TYPE.CJK_HEAVENLY_STEM:
      return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);

    case LIST_STYLE_TYPE.CJK_IDEOGRAPHIC:
    case LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL:
      return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);

    case LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL:
      return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);

    case LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL:
      return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);

    case LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL:
      return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);

    case LIST_STYLE_TYPE.JAPANESE_INFORMAL:
      return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);

    case LIST_STYLE_TYPE.JAPANESE_FORMAL:
      return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);

    case LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL:
      return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);

    case LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL:
      return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);

    case LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL:
      return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);

    case LIST_STYLE_TYPE.DEVANAGARI:
      return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);

    case LIST_STYLE_TYPE.GEORGIAN:
      return createAdditiveCounter(value, 1, 19999, GEORGIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);

    case LIST_STYLE_TYPE.GUJARATI:
      return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);

    case LIST_STYLE_TYPE.GURMUKHI:
      return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);

    case LIST_STYLE_TYPE.HEBREW:
      return createAdditiveCounter(value, 1, 10999, HEBREW, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);

    case LIST_STYLE_TYPE.HIRAGANA:
      return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');

    case LIST_STYLE_TYPE.HIRAGANA_IROHA:
      return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');

    case LIST_STYLE_TYPE.KANNADA:
      return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);

    case LIST_STYLE_TYPE.KATAKANA:
      return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);

    case LIST_STYLE_TYPE.KATAKANA_IROHA:
      return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);

    case LIST_STYLE_TYPE.LAO:
      return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);

    case LIST_STYLE_TYPE.MONGOLIAN:
      return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);

    case LIST_STYLE_TYPE.MYANMAR:
      return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);

    case LIST_STYLE_TYPE.ORIYA:
      return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);

    case LIST_STYLE_TYPE.PERSIAN:
      return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);

    case LIST_STYLE_TYPE.TAMIL:
      return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);

    case LIST_STYLE_TYPE.TELUGU:
      return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);

    case LIST_STYLE_TYPE.THAI:
      return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);

    case LIST_STYLE_TYPE.TIBETAN:
      return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);

    case LIST_STYLE_TYPE.DECIMAL:
    default:
      return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
  }
};

var IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';

var DocumentCloner =
/** @class */
function () {
  function DocumentCloner(element, options) {
    this.options = options;
    this.scrolledElements = [];
    this.referenceElement = element;
    this.counters = new CounterState();
    this.quoteDepth = 0;

    if (!element.ownerDocument) {
      throw new Error('Cloned element does not have an owner document');
    }

    this.documentElement = this.cloneNode(element.ownerDocument.documentElement);
  }

  DocumentCloner.prototype.toIFrame = function (ownerDocument, windowSize) {
    var _this = this;

    var iframe = createIFrameContainer(ownerDocument, windowSize);

    if (!iframe.contentWindow) {
      return Promise.reject("Unable to find iframe window");
    }

    var scrollX = ownerDocument.defaultView.pageXOffset;
    var scrollY = ownerDocument.defaultView.pageYOffset;
    var cloneWindow = iframe.contentWindow;
    var documentClone = cloneWindow.document;
    /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
     if window url is about:blank, we can assign the url to current by writing onto the document
     */

    var iframeLoad = iframeLoader(iframe).then(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var onclone;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              this.scrolledElements.forEach(restoreNodeScroll);

              if (cloneWindow) {
                cloneWindow.scrollTo(windowSize.left, windowSize.top);

                if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) && (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                  documentClone.documentElement.style.top = -windowSize.top + 'px';
                  documentClone.documentElement.style.left = -windowSize.left + 'px';
                  documentClone.documentElement.style.position = 'absolute';
                }
              }

              onclone = this.options.onclone;

              if (typeof this.clonedReferenceElement === 'undefined') {
                return [2
                /*return*/
                , Promise.reject("Error finding the " + this.referenceElement.nodeName + " in the cloned document")];
              }

              if (!(documentClone.fonts && documentClone.fonts.ready)) return [3
              /*break*/
              , 2];
              return [4
              /*yield*/
              , documentClone.fonts.ready];

            case 1:
              _a.sent();

              _a.label = 2;

            case 2:
              if (typeof onclone === 'function') {
                return [2
                /*return*/
                , Promise.resolve().then(function () {
                  return onclone(documentClone);
                }).then(function () {
                  return iframe;
                })];
              }

              return [2
              /*return*/
              , iframe];
          }
        });
      });
    });
    documentClone.open();
    documentClone.write(serializeDoctype(document.doctype) + "<html></html>"); // Chrome scrolls the parent document for some reason after the write to the cloned window???

    restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
    documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
    documentClone.close();
    return iframeLoad;
  };

  DocumentCloner.prototype.createElementClone = function (node) {
    if (isCanvasElement(node)) {
      return this.createCanvasClone(node);
    }
    /*
    if (isIFrameElement(node)) {
        return this.createIFrameClone(node);
    }
    */


    if (isStyleElement(node)) {
      return this.createStyleClone(node);
    }

    return node.cloneNode(false);
  };

  DocumentCloner.prototype.createStyleClone = function (node) {
    try {
      var sheet = node.sheet;

      if (sheet && sheet.cssRules) {
        var css = [].slice.call(sheet.cssRules, 0).reduce(function (css, rule) {
          if (rule && typeof rule.cssText === 'string') {
            return css + rule.cssText;
          }

          return css;
        }, '');
        var style = node.cloneNode(false);
        style.textContent = css;
        return style;
      }
    } catch (e) {
      // accessing node.sheet.cssRules throws a DOMException
      Logger.getInstance(this.options.id).error('Unable to access cssRules property', e);

      if (e.name !== 'SecurityError') {
        throw e;
      }
    }

    return node.cloneNode(false);
  };

  DocumentCloner.prototype.createCanvasClone = function (canvas) {
    if (this.options.inlineImages && canvas.ownerDocument) {
      var img = canvas.ownerDocument.createElement('img');

      try {
        img.src = canvas.toDataURL();
        return img;
      } catch (e) {
        Logger.getInstance(this.options.id).info("Unable to clone canvas contents, canvas is tainted");
      }
    }

    var clonedCanvas = canvas.cloneNode(false);

    try {
      clonedCanvas.width = canvas.width;
      clonedCanvas.height = canvas.height;
      var ctx = canvas.getContext('2d');
      var clonedCtx = clonedCanvas.getContext('2d');

      if (clonedCtx) {
        if (ctx) {
          clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
        } else {
          clonedCtx.drawImage(canvas, 0, 0);
        }
      }

      return clonedCanvas;
    } catch (e) {}

    return clonedCanvas;
  };
  /*
  createIFrameClone(iframe: HTMLIFrameElement) {
      const tempIframe = <HTMLIFrameElement>iframe.cloneNode(false);
      const iframeKey = generateIframeKey();
      tempIframe.setAttribute('data-html2canvas-internal-iframe-key', iframeKey);
       const {width, height} = parseBounds(iframe);
       this.resourceLoader.cache[iframeKey] = getIframeDocumentElement(iframe, this.options)
          .then(documentElement => {
              return this.renderer(
                  documentElement,
                  {
                      allowTaint: this.options.allowTaint,
                      backgroundColor: '#ffffff',
                      canvas: null,
                      imageTimeout: this.options.imageTimeout,
                      logging: this.options.logging,
                      proxy: this.options.proxy,
                      removeContainer: this.options.removeContainer,
                      scale: this.options.scale,
                      foreignObjectRendering: this.options.foreignObjectRendering,
                      useCORS: this.options.useCORS,
                      target: new CanvasRenderer(),
                      width,
                      height,
                      x: 0,
                      y: 0,
                      windowWidth: documentElement.ownerDocument.defaultView.innerWidth,
                      windowHeight: documentElement.ownerDocument.defaultView.innerHeight,
                      scrollX: documentElement.ownerDocument.defaultView.pageXOffset,
                      scrollY: documentElement.ownerDocument.defaultView.pageYOffset
                  },
              );
          })
          .then(
              (canvas: HTMLCanvasElement) =>
                  new Promise((resolve, reject) => {
                      const iframeCanvas = document.createElement('img');
                      iframeCanvas.onload = () => resolve(canvas);
                      iframeCanvas.onerror = (event) => {
                          // Empty iframes may result in empty "data:," URLs, which are invalid from the <img>'s point of view
                          // and instead of `onload` cause `onerror` and unhandled rejection warnings
                          // https://github.com/niklasvh/html2canvas/issues/1502
                          iframeCanvas.src == 'data:,' ? resolve(canvas) : reject(event);
                      };
                      iframeCanvas.src = canvas.toDataURL();
                      if (tempIframe.parentNode && iframe.ownerDocument && iframe.ownerDocument.defaultView) {
                          tempIframe.parentNode.replaceChild(
                              copyCSSStyles(
                                  iframe.ownerDocument.defaultView.getComputedStyle(iframe),
                                  iframeCanvas
                              ),
                              tempIframe
                          );
                      }
                  })
          );
      return tempIframe;
  }
  */


  DocumentCloner.prototype.cloneNode = function (node) {
    if (isTextNode(node)) {
      return document.createTextNode(node.data);
    }

    if (!node.ownerDocument) {
      return node.cloneNode(false);
    }

    var window = node.ownerDocument.defaultView;

    if (isHTMLElementNode(node) && window) {
      var clone = this.createElementClone(node);
      var style = window.getComputedStyle(node);
      var styleBefore = window.getComputedStyle(node, ':before');
      var styleAfter = window.getComputedStyle(node, ':after');

      if (this.referenceElement === node) {
        this.clonedReferenceElement = clone;
      }

      if (isBodyElement(clone)) {
        createPseudoHideStyles(clone);
      }

      var counters = this.counters.parse(new CSSParsedCounterDeclaration(style));
      var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);

      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (!isElementNode(child) || !isScriptElement(child) && !child.hasAttribute(IGNORE_ATTRIBUTE) && (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child))) {
          if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
            clone.appendChild(this.cloneNode(child));
          }
        }
      }

      if (before) {
        clone.insertBefore(before, clone.firstChild);
      }

      var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);

      if (after) {
        clone.appendChild(after);
      }

      this.counters.pop(counters);

      if (style && this.options.copyStyles && !isIFrameElement(node)) {
        copyCSSStyles(style, clone);
      } //this.inlineAllImages(clone);


      if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
        this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
      }

      if ((isTextareaElement(node) || isSelectElement(node)) && (isTextareaElement(clone) || isSelectElement(clone))) {
        clone.value = node.value;
      }

      return clone;
    }

    return node.cloneNode(false);
  };

  DocumentCloner.prototype.resolvePseudoContent = function (node, clone, style, pseudoElt) {
    var _this = this;

    if (!style) {
      return;
    }

    var value = style.content;
    var document = clone.ownerDocument;

    if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
      return;
    }

    this.counters.parse(new CSSParsedCounterDeclaration(style));
    var declaration = new CSSParsedPseudoDeclaration(style);
    var anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
    copyCSSStyles(style, anonymousReplacedElement);
    declaration.content.forEach(function (token) {
      if (token.type === TokenType.STRING_TOKEN) {
        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
      } else if (token.type === TokenType.URL_TOKEN) {
        var img = document.createElement('img');
        img.src = token.value;
        img.style.opacity = '1';
        anonymousReplacedElement.appendChild(img);
      } else if (token.type === TokenType.FUNCTION) {
        if (token.name === 'attr') {
          var attr = token.values.filter(isIdentToken);

          if (attr.length) {
            anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
          }
        } else if (token.name === 'counter') {
          var _a = token.values.filter(nonFunctionArgSeparator),
              counter = _a[0],
              counterStyle = _a[1];

          if (counter && isIdentToken(counter)) {
            var counterState = _this.counters.getCounterValue(counter.value);

            var counterType = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(counterStyle.value) : LIST_STYLE_TYPE.DECIMAL;
            anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
          }
        } else if (token.name === 'counters') {
          var _b = token.values.filter(nonFunctionArgSeparator),
              counter = _b[0],
              delim = _b[1],
              counterStyle = _b[2];

          if (counter && isIdentToken(counter)) {
            var counterStates = _this.counters.getCounterValues(counter.value);

            var counterType_1 = counterStyle && isIdentToken(counterStyle) ? listStyleType.parse(counterStyle.value) : LIST_STYLE_TYPE.DECIMAL;
            var separator = delim && delim.type === TokenType.STRING_TOKEN ? delim.value : '';
            var text = counterStates.map(function (value) {
              return createCounterText(value, counterType_1, false);
            }).join(separator);
            anonymousReplacedElement.appendChild(document.createTextNode(text));
          }
        }
      } else if (token.type === TokenType.IDENT_TOKEN) {
        switch (token.value) {
          case 'open-quote':
            anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
            break;

          case 'close-quote':
            anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
            break;

          default:
            // safari doesn't parse string tokens correctly because of lack of quotes
            anonymousReplacedElement.appendChild(document.createTextNode(token.value));
        }
      }
    });
    anonymousReplacedElement.className = PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
    clone.className += pseudoElt === PseudoElementType.BEFORE ? " " + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE : " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
    return anonymousReplacedElement;
  };

  DocumentCloner.destroy = function (container) {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
      return true;
    }

    return false;
  };

  return DocumentCloner;
}();

var PseudoElementType;

(function (PseudoElementType) {
  PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
  PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
})(PseudoElementType || (PseudoElementType = {}));

var createIFrameContainer = function (ownerDocument, bounds) {
  var cloneIframeContainer = ownerDocument.createElement('iframe');
  cloneIframeContainer.className = 'html2canvas-container';
  cloneIframeContainer.style.visibility = 'hidden';
  cloneIframeContainer.style.position = 'fixed';
  cloneIframeContainer.style.left = '-10000px';
  cloneIframeContainer.style.top = '0px';
  cloneIframeContainer.style.border = '0';
  cloneIframeContainer.width = bounds.width.toString();
  cloneIframeContainer.height = bounds.height.toString();
  cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it

  cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
  ownerDocument.body.appendChild(cloneIframeContainer);
  return cloneIframeContainer;
};

var iframeLoader = function (iframe) {
  return new Promise(function (resolve, reject) {
    var cloneWindow = iframe.contentWindow;

    if (!cloneWindow) {
      return reject("No window assigned for iframe");
    }

    var documentClone = cloneWindow.document;

    cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = function () {
      cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = null;
      var interval = setInterval(function () {
        if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
          clearInterval(interval);
          resolve(iframe);
        }
      }, 50);
    };
  });
};

var copyCSSStyles = function (style, target) {
  // Edge does not provide value for cssText
  for (var i = style.length - 1; i >= 0; i--) {
    var property = style.item(i); // Safari shows pseudoelements if content is set

    if (property !== 'content') {
      target.style.setProperty(property, style.getPropertyValue(property));
    }
  }

  return target;
};

var serializeDoctype = function (doctype) {
  var str = '';

  if (doctype) {
    str += '<!DOCTYPE ';

    if (doctype.name) {
      str += doctype.name;
    }

    if (doctype.internalSubset) {
      str += doctype.internalSubset;
    }

    if (doctype.publicId) {
      str += "\"" + doctype.publicId + "\"";
    }

    if (doctype.systemId) {
      str += "\"" + doctype.systemId + "\"";
    }

    str += '>';
  }

  return str;
};

var restoreOwnerScroll = function (ownerDocument, x, y) {
  if (ownerDocument && ownerDocument.defaultView && (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
    ownerDocument.defaultView.scrollTo(x, y);
  }
};

var restoreNodeScroll = function (_a) {
  var element = _a[0],
      x = _a[1],
      y = _a[2];
  element.scrollLeft = x;
  element.scrollTop = y;
};

var PSEUDO_BEFORE = ':before';
var PSEUDO_AFTER = ':after';
var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
var PSEUDO_HIDE_ELEMENT_STYLE = "{\n    content: \"\" !important;\n    display: none !important;\n}";

var createPseudoHideStyles = function (body) {
  createStyles(body, "." + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + PSEUDO_BEFORE + PSEUDO_HIDE_ELEMENT_STYLE + "\n         ." + PSEUDO_HIDE_ELEMENT_CLASS_AFTER + PSEUDO_AFTER + PSEUDO_HIDE_ELEMENT_STYLE);
};

var createStyles = function (body, styles) {
  var document = body.ownerDocument;

  if (document) {
    var style = document.createElement('style');
    style.textContent = styles;
    body.appendChild(style);
  }
};

var PathType;

(function (PathType) {
  PathType[PathType["VECTOR"] = 0] = "VECTOR";
  PathType[PathType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
})(PathType || (PathType = {}));

var equalPath = function (a, b) {
  if (a.length === b.length) {
    return a.some(function (v, i) {
      return v === b[i];
    });
  }

  return false;
};

var transformPath = function (path, deltaX, deltaY, deltaW, deltaH) {
  return path.map(function (point, index) {
    switch (index) {
      case 0:
        return point.add(deltaX, deltaY);

      case 1:
        return point.add(deltaX + deltaW, deltaY);

      case 2:
        return point.add(deltaX + deltaW, deltaY + deltaH);

      case 3:
        return point.add(deltaX, deltaY + deltaH);
    }

    return point;
  });
};

var Vector =
/** @class */
function () {
  function Vector(x, y) {
    this.type = PathType.VECTOR;
    this.x = x;
    this.y = y;
  }

  Vector.prototype.add = function (deltaX, deltaY) {
    return new Vector(this.x + deltaX, this.y + deltaY);
  };

  return Vector;
}();

var lerp = function (a, b, t) {
  return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};

var BezierCurve =
/** @class */
function () {
  function BezierCurve(start, startControl, endControl, end) {
    this.type = PathType.BEZIER_CURVE;
    this.start = start;
    this.startControl = startControl;
    this.endControl = endControl;
    this.end = end;
  }

  BezierCurve.prototype.subdivide = function (t, firstHalf) {
    var ab = lerp(this.start, this.startControl, t);
    var bc = lerp(this.startControl, this.endControl, t);
    var cd = lerp(this.endControl, this.end, t);
    var abbc = lerp(ab, bc, t);
    var bccd = lerp(bc, cd, t);
    var dest = lerp(abbc, bccd, t);
    return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
  };

  BezierCurve.prototype.add = function (deltaX, deltaY) {
    return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
  };

  BezierCurve.prototype.reverse = function () {
    return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
  };

  return BezierCurve;
}();

var isBezierCurve = function (path) {
  return path.type === PathType.BEZIER_CURVE;
};

var BoundCurves =
/** @class */
function () {
  function BoundCurves(element) {
    var styles = element.styles;
    var bounds = element.bounds;

    var _a = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height),
        tlh = _a[0],
        tlv = _a[1];

    var _b = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height),
        trh = _b[0],
        trv = _b[1];

    var _c = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height),
        brh = _c[0],
        brv = _c[1];

    var _d = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height),
        blh = _d[0],
        blv = _d[1];

    var factors = [];
    factors.push((tlh + trh) / bounds.width);
    factors.push((blh + brh) / bounds.width);
    factors.push((tlv + blv) / bounds.height);
    factors.push((trv + brv) / bounds.height);
    var maxFactor = Math.max.apply(Math, factors);

    if (maxFactor > 1) {
      tlh /= maxFactor;
      tlv /= maxFactor;
      trh /= maxFactor;
      trv /= maxFactor;
      brh /= maxFactor;
      brv /= maxFactor;
      blh /= maxFactor;
      blv /= maxFactor;
    }

    var topWidth = bounds.width - trh;
    var rightHeight = bounds.height - brv;
    var bottomWidth = bounds.width - brh;
    var leftHeight = bounds.height - blv;
    var borderTopWidth = styles.borderTopWidth;
    var borderRightWidth = styles.borderRightWidth;
    var borderBottomWidth = styles.borderBottomWidth;
    var borderLeftWidth = styles.borderLeftWidth;
    var paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
    var paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
    var paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
    var paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
    this.topLeftBorderBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT) : new Vector(bounds.left, bounds.top);
    this.topRightBorderBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top);
    this.bottomRightBorderBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
    this.bottomLeftBorderBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT) : new Vector(bounds.left, bounds.top + bounds.height);
    this.topLeftPaddingBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
    this.topRightPaddingBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderLeftWidth ? 0 : trh - borderLeftWidth, trv - borderTopWidth, CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
    this.bottomRightPaddingBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth), Math.max(0, brh - borderRightWidth), brv - borderBottomWidth, CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
    this.bottomLeftPaddingBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + leftHeight, Math.max(0, blh - borderLeftWidth), blv - borderBottomWidth, CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
    this.topLeftContentBox = tlh > 0 || tlv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
    this.topRightContentBox = trh > 0 || trv > 0 ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
    this.bottomRightContentBox = brh > 0 || brv > 0 ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT) : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
    this.bottomLeftContentBox = blh > 0 || blv > 0 ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT) : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
  }

  return BoundCurves;
}();

var CORNER;

(function (CORNER) {
  CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
  CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
  CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
  CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
})(CORNER || (CORNER = {}));

var getCurvePoints = function (x, y, r1, r2, position) {
  var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
  var ox = r1 * kappa; // control point offset horizontal

  var oy = r2 * kappa; // control point offset vertical

  var xm = x + r1; // x-middle

  var ym = y + r2; // y-middle

  switch (position) {
    case CORNER.TOP_LEFT:
      return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));

    case CORNER.TOP_RIGHT:
      return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));

    case CORNER.BOTTOM_RIGHT:
      return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));

    case CORNER.BOTTOM_LEFT:
    default:
      return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
  }
};

var calculateBorderBoxPath = function (curves) {
  return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
};

var calculateContentBoxPath = function (curves) {
  return [curves.topLeftContentBox, curves.topRightContentBox, curves.bottomRightContentBox, curves.bottomLeftContentBox];
};

var calculatePaddingBoxPath = function (curves) {
  return [curves.topLeftPaddingBox, curves.topRightPaddingBox, curves.bottomRightPaddingBox, curves.bottomLeftPaddingBox];
};

var TransformEffect =
/** @class */
function () {
  function TransformEffect(offsetX, offsetY, matrix) {
    this.type = 0
    /* TRANSFORM */
    ;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.matrix = matrix;
    this.target = 2
    /* BACKGROUND_BORDERS */
    | 4
    /* CONTENT */
    ;
  }

  return TransformEffect;
}();

var ClipEffect =
/** @class */
function () {
  function ClipEffect(path, target) {
    this.type = 1
    /* CLIP */
    ;
    this.target = target;
    this.path = path;
  }

  return ClipEffect;
}();

var isTransformEffect = function (effect) {
  return effect.type === 0
  /* TRANSFORM */
  ;
};

var isClipEffect = function (effect) {
  return effect.type === 1
  /* CLIP */
  ;
};

var StackingContext =
/** @class */
function () {
  function StackingContext(container) {
    this.element = container;
    this.inlineLevel = [];
    this.nonInlineLevel = [];
    this.negativeZIndex = [];
    this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
    this.positiveZIndex = [];
    this.nonPositionedFloats = [];
    this.nonPositionedInlineLevel = [];
  }

  return StackingContext;
}();

var ElementPaint =
/** @class */
function () {
  function ElementPaint(element, parentStack) {
    this.container = element;
    this.effects = parentStack.slice(0);
    this.curves = new BoundCurves(element);

    if (element.styles.transform !== null) {
      var offsetX = element.bounds.left + element.styles.transformOrigin[0].number;
      var offsetY = element.bounds.top + element.styles.transformOrigin[1].number;
      var matrix = element.styles.transform;
      this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
    }

    if (element.styles.overflowX !== OVERFLOW.VISIBLE) {
      var borderBox = calculateBorderBoxPath(this.curves);
      var paddingBox = calculatePaddingBoxPath(this.curves);

      if (equalPath(borderBox, paddingBox)) {
        this.effects.push(new ClipEffect(borderBox, 2
        /* BACKGROUND_BORDERS */
        | 4
        /* CONTENT */
        ));
      } else {
        this.effects.push(new ClipEffect(borderBox, 2
        /* BACKGROUND_BORDERS */
        ));
        this.effects.push(new ClipEffect(paddingBox, 4
        /* CONTENT */
        ));
      }
    }
  }

  ElementPaint.prototype.getParentEffects = function () {
    var effects = this.effects.slice(0);

    if (this.container.styles.overflowX !== OVERFLOW.VISIBLE) {
      var borderBox = calculateBorderBoxPath(this.curves);
      var paddingBox = calculatePaddingBoxPath(this.curves);

      if (!equalPath(borderBox, paddingBox)) {
        effects.push(new ClipEffect(paddingBox, 2
        /* BACKGROUND_BORDERS */
        | 4
        /* CONTENT */
        ));
      }
    }

    return effects;
  };

  return ElementPaint;
}();

var parseStackTree = function (parent, stackingContext, realStackingContext, listItems) {
  parent.container.elements.forEach(function (child) {
    var treatAsRealStackingContext = contains(child.flags, 4
    /* CREATES_REAL_STACKING_CONTEXT */
    );
    var createsStackingContext = contains(child.flags, 2
    /* CREATES_STACKING_CONTEXT */
    );
    var paintContainer = new ElementPaint(child, parent.getParentEffects());

    if (contains(child.styles.display, 2048
    /* LIST_ITEM */
    )) {
      listItems.push(paintContainer);
    }

    var listOwnerItems = contains(child.flags, 8
    /* IS_LIST_OWNER */
    ) ? [] : listItems;

    if (treatAsRealStackingContext || createsStackingContext) {
      var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
      var stack = new StackingContext(paintContainer);

      if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
        var order_1 = child.styles.zIndex.order;

        if (order_1 < 0) {
          var index_1 = 0;
          parentStack.negativeZIndex.some(function (current, i) {
            if (order_1 > current.element.container.styles.zIndex.order) {
              index_1 = i;
              return false;
            } else if (index_1 > 0) {
              return true;
            }

            return false;
          });
          parentStack.negativeZIndex.splice(index_1, 0, stack);
        } else if (order_1 > 0) {
          var index_2 = 0;
          parentStack.positiveZIndex.some(function (current, i) {
            if (order_1 > current.element.container.styles.zIndex.order) {
              index_2 = i + 1;
              return false;
            } else if (index_2 > 0) {
              return true;
            }

            return false;
          });
          parentStack.positiveZIndex.splice(index_2, 0, stack);
        } else {
          parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
        }
      } else {
        if (child.styles.isFloating()) {
          parentStack.nonPositionedFloats.push(stack);
        } else {
          parentStack.nonPositionedInlineLevel.push(stack);
        }
      }

      parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
    } else {
      if (child.styles.isInlineLevel()) {
        stackingContext.inlineLevel.push(paintContainer);
      } else {
        stackingContext.nonInlineLevel.push(paintContainer);
      }

      parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
    }

    if (contains(child.flags, 8
    /* IS_LIST_OWNER */
    )) {
      processListItems(child, listOwnerItems);
    }
  });
};

var processListItems = function (owner, elements) {
  var numbering = owner instanceof OLElementContainer ? owner.start : 1;
  var reversed = owner instanceof OLElementContainer ? owner.reversed : false;

  for (var i = 0; i < elements.length; i++) {
    var item = elements[i];

    if (item.container instanceof LIElementContainer && typeof item.container.value === 'number' && item.container.value !== 0) {
      numbering = item.container.value;
    }

    item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
    numbering += reversed ? -1 : 1;
  }
};

var parseStackingContexts = function (container) {
  var paintContainer = new ElementPaint(container, []);
  var root = new StackingContext(paintContainer);
  var listItems = [];
  parseStackTree(paintContainer, root, root, listItems);
  processListItems(paintContainer.container, listItems);
  return root;
};

var parsePathForBorder = function (curves, borderSide) {
  switch (borderSide) {
    case 0:
      return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);

    case 1:
      return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);

    case 2:
      return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);

    case 3:
    default:
      return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
  }
};

var createPathFromCurves = function (outer1, inner1, outer2, inner2) {
  var path = [];

  if (isBezierCurve(outer1)) {
    path.push(outer1.subdivide(0.5, false));
  } else {
    path.push(outer1);
  }

  if (isBezierCurve(outer2)) {
    path.push(outer2.subdivide(0.5, true));
  } else {
    path.push(outer2);
  }

  if (isBezierCurve(inner2)) {
    path.push(inner2.subdivide(0.5, true).reverse());
  } else {
    path.push(inner2);
  }

  if (isBezierCurve(inner1)) {
    path.push(inner1.subdivide(0.5, false).reverse());
  } else {
    path.push(inner1);
  }

  return path;
};

var paddingBox = function (element) {
  var bounds = element.bounds;
  var styles = element.styles;
  return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
};

var contentBox = function (element) {
  var styles = element.styles;
  var bounds = element.bounds;
  var paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
  var paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
  var paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
  var paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
  return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
};

var calculateBackgroundPositioningArea = function (backgroundOrigin, element) {
  if (backgroundOrigin === 0
  /* BORDER_BOX */
  ) {
      return element.bounds;
    }

  if (backgroundOrigin === 2
  /* CONTENT_BOX */
  ) {
      return contentBox(element);
    }

  return paddingBox(element);
};

var calculateBackgroundPaintingArea = function (backgroundClip, element) {
  if (backgroundClip === BACKGROUND_CLIP.BORDER_BOX) {
    return element.bounds;
  }

  if (backgroundClip === BACKGROUND_CLIP.CONTENT_BOX) {
    return contentBox(element);
  }

  return paddingBox(element);
};

var calculateBackgroundRendering = function (container, index, intrinsicSize) {
  var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
  var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
  var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
  var sizeWidth = backgroundImageSize[0],
      sizeHeight = backgroundImageSize[1];
  var position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
  var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
  var offsetX = Math.round(backgroundPositioningArea.left + position[0]);
  var offsetY = Math.round(backgroundPositioningArea.top + position[1]);
  return [path, offsetX, offsetY, sizeWidth, sizeHeight];
};

var isAuto = function (token) {
  return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO;
};

var hasIntrinsicValue = function (value) {
  return typeof value === 'number';
};

var calculateBackgroundSize = function (size, _a, bounds) {
  var intrinsicWidth = _a[0],
      intrinsicHeight = _a[1],
      intrinsicProportion = _a[2];
  var first = size[0],
      second = size[1];

  if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
    return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
  }

  var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);

  if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
    if (hasIntrinsicValue(intrinsicProportion)) {
      var targetRatio = bounds.width / bounds.height;
      return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER) ? [bounds.width, bounds.width / intrinsicProportion] : [bounds.height * intrinsicProportion, bounds.height];
    }

    return [bounds.width, bounds.height];
  }

  var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
  var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
  var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight; // If the background-size is auto or auto auto:

  if (isAuto(first) && (!second || isAuto(second))) {
    // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
    if (hasIntrinsicWidth && hasIntrinsicHeight) {
      return [intrinsicWidth, intrinsicHeight];
    } // If the image has no intrinsic dimensions and has no intrinsic proportions,
    // it's rendered at the size of the background positioning area.


    if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
      return [bounds.width, bounds.height];
    } // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
    // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
    // The other dimension is computed using the specified dimension and the intrinsic proportions.


    if (hasIntrinsicDimensions && hasIntrinsicProportion) {
      var width_1 = hasIntrinsicWidth ? intrinsicWidth : intrinsicHeight * intrinsicProportion;
      var height_1 = hasIntrinsicHeight ? intrinsicHeight : intrinsicWidth / intrinsicProportion;
      return [width_1, height_1];
    } // If the image has only one intrinsic dimension but has no intrinsic proportions,
    // it's rendered using the specified dimension and the other dimension of the background positioning area.


    var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
    var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
    return [width_2, height_2];
  } // If the image has intrinsic proportions, it's stretched to the specified dimension.
  // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.


  if (hasIntrinsicProportion) {
    var width_3 = 0;
    var height_3 = 0;

    if (isLengthPercentage(first)) {
      width_3 = getAbsoluteValue(first, bounds.width);
    } else if (isLengthPercentage(second)) {
      height_3 = getAbsoluteValue(second, bounds.height);
    }

    if (isAuto(first)) {
      width_3 = height_3 * intrinsicProportion;
    } else if (!second || isAuto(second)) {
      height_3 = width_3 / intrinsicProportion;
    }

    return [width_3, height_3];
  } // If the image has no intrinsic proportions, it's stretched to the specified dimension.
  // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
  // if there is one. If there is no such intrinsic dimension,
  // it becomes the corresponding dimension of the background positioning area.


  var width = null;
  var height = null;

  if (isLengthPercentage(first)) {
    width = getAbsoluteValue(first, bounds.width);
  } else if (second && isLengthPercentage(second)) {
    height = getAbsoluteValue(second, bounds.height);
  }

  if (width !== null && (!second || isAuto(second))) {
    height = hasIntrinsicWidth && hasIntrinsicHeight ? width / intrinsicWidth * intrinsicHeight : bounds.height;
  }

  if (height !== null && isAuto(first)) {
    width = hasIntrinsicWidth && hasIntrinsicHeight ? height / intrinsicHeight * intrinsicWidth : bounds.width;
  }

  if (width !== null && height !== null) {
    return [width, height];
  }

  throw new Error("Unable to calculate background-size for element");
};

var getBackgroundValueForIndex = function (values, index) {
  var value = values[index];

  if (typeof value === 'undefined') {
    return values[0];
  }

  return value;
};

var calculateBackgroundRepeatPath = function (repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
  var x = _a[0],
      y = _a[1];
  var width = _b[0],
      height = _b[1];

  switch (repeat) {
    case BACKGROUND_REPEAT.REPEAT_X:
      return [new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))];

    case BACKGROUND_REPEAT.REPEAT_Y:
      return [new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)), new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))];

    case BACKGROUND_REPEAT.NO_REPEAT:
      return [new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)), new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)), new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))];

    default:
      return [new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)), new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))];
  }
};

var SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
var SAMPLE_TEXT = 'Hidden Text';

var FontMetrics =
/** @class */
function () {
  function FontMetrics(document) {
    this._data = {};
    this._document = document;
  }

  FontMetrics.prototype.parseMetrics = function (fontFamily, fontSize) {
    var container = this._document.createElement('div');

    var img = this._document.createElement('img');

    var span = this._document.createElement('span');

    var body = this._document.body;
    container.style.visibility = 'hidden';
    container.style.fontFamily = fontFamily;
    container.style.fontSize = fontSize;
    container.style.margin = '0';
    container.style.padding = '0';
    body.appendChild(container);
    img.src = SMALL_IMAGE;
    img.width = 1;
    img.height = 1;
    img.style.margin = '0';
    img.style.padding = '0';
    img.style.verticalAlign = 'baseline';
    span.style.fontFamily = fontFamily;
    span.style.fontSize = fontSize;
    span.style.margin = '0';
    span.style.padding = '0';
    span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
    container.appendChild(span);
    container.appendChild(img);
    var baseline = img.offsetTop - span.offsetTop + 2;
    container.removeChild(span);
    container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
    container.style.lineHeight = 'normal';
    img.style.verticalAlign = 'super';
    var middle = img.offsetTop - container.offsetTop + 2;
    body.removeChild(container);
    return {
      baseline: baseline,
      middle: middle
    };
  };

  FontMetrics.prototype.getMetrics = function (fontFamily, fontSize) {
    var key = fontFamily + " " + fontSize;

    if (typeof this._data[key] === 'undefined') {
      this._data[key] = this.parseMetrics(fontFamily, fontSize);
    }

    return this._data[key];
  };

  return FontMetrics;
}();

var MASK_OFFSET = 10000;

var CanvasRenderer =
/** @class */
function () {
  function CanvasRenderer(options) {
    this._activeEffects = [];
    this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.options = options;

    if (!options.canvas) {
      this.canvas.width = Math.floor(options.width * options.scale);
      this.canvas.height = Math.floor(options.height * options.scale);
      this.canvas.style.width = options.width + "px";
      this.canvas.style.height = options.height + "px";
    }

    this.fontMetrics = new FontMetrics(document);
    this.ctx.scale(this.options.scale, this.options.scale);
    this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
    this.ctx.textBaseline = 'bottom';
    this._activeEffects = [];
    Logger.getInstance(options.id).debug("Canvas renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
  }

  CanvasRenderer.prototype.applyEffects = function (effects, target) {
    var _this = this;

    while (this._activeEffects.length) {
      this.popEffect();
    }

    effects.filter(function (effect) {
      return contains(effect.target, target);
    }).forEach(function (effect) {
      return _this.applyEffect(effect);
    });
  };

  CanvasRenderer.prototype.applyEffect = function (effect) {
    this.ctx.save();

    if (isTransformEffect(effect)) {
      this.ctx.translate(effect.offsetX, effect.offsetY);
      this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
      this.ctx.translate(-effect.offsetX, -effect.offsetY);
    }

    if (isClipEffect(effect)) {
      this.path(effect.path);
      this.ctx.clip();
    }

    this._activeEffects.push(effect);
  };

  CanvasRenderer.prototype.popEffect = function () {
    this._activeEffects.pop();

    this.ctx.restore();
  };

  CanvasRenderer.prototype.renderStack = function (stack) {
    return __awaiter(this, void 0, void 0, function () {
      var styles;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            styles = stack.element.container.styles;
            if (!styles.isVisible()) return [3
            /*break*/
            , 2];
            this.ctx.globalAlpha = styles.opacity;
            return [4
            /*yield*/
            , this.renderStackContent(stack)];

          case 1:
            _a.sent();

            _a.label = 2;

          case 2:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.renderNode = function (paint) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!paint.container.styles.isVisible()) return [3
            /*break*/
            , 3];
            return [4
            /*yield*/
            , this.renderNodeBackgroundAndBorders(paint)];

          case 1:
            _a.sent();

            return [4
            /*yield*/
            , this.renderNodeContent(paint)];

          case 2:
            _a.sent();

            _a.label = 3;

          case 3:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.renderTextWithLetterSpacing = function (text, letterSpacing) {
    var _this = this;

    if (letterSpacing === 0) {
      this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
    } else {
      var letters = toCodePoints(text.text).map(function (i) {
        return fromCodePoint(i);
      });
      letters.reduce(function (left, letter) {
        _this.ctx.fillText(letter, left, text.bounds.top + text.bounds.height);

        return left + _this.ctx.measureText(letter).width;
      }, text.bounds.left);
    }
  };

  CanvasRenderer.prototype.createFontStyle = function (styles) {
    var fontVariant = styles.fontVariant.filter(function (variant) {
      return variant === 'normal' || variant === 'small-caps';
    }).join('');
    var fontFamily = styles.fontFamily.join(', ');
    var fontSize = isDimensionToken(styles.fontSize) ? "" + styles.fontSize.number + styles.fontSize.unit : styles.fontSize.number + "px";
    return [[styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '), fontFamily, fontSize];
  };

  CanvasRenderer.prototype.renderTextNode = function (text, styles) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, font, fontFamily, fontSize;

      var _this = this;

      return __generator(this, function (_b) {
        _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
        this.ctx.font = font;
        text.textBounds.forEach(function (text) {
          _this.ctx.fillStyle = asString(styles.color);

          _this.renderTextWithLetterSpacing(text, styles.letterSpacing);

          var textShadows = styles.textShadow;

          if (textShadows.length && text.text.trim().length) {
            textShadows.slice(0).reverse().forEach(function (textShadow) {
              _this.ctx.shadowColor = asString(textShadow.color);
              _this.ctx.shadowOffsetX = textShadow.offsetX.number * _this.options.scale;
              _this.ctx.shadowOffsetY = textShadow.offsetY.number * _this.options.scale;
              _this.ctx.shadowBlur = textShadow.blur.number;

              _this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
            });
            _this.ctx.shadowColor = '';
            _this.ctx.shadowOffsetX = 0;
            _this.ctx.shadowOffsetY = 0;
            _this.ctx.shadowBlur = 0;
          }

          if (styles.textDecorationLine.length) {
            _this.ctx.fillStyle = asString(styles.textDecorationColor || styles.color);
            styles.textDecorationLine.forEach(function (textDecorationLine) {
              switch (textDecorationLine) {
                case 1
                /* UNDERLINE */
                :
                  // Draws a line at the baseline of the font
                  // TODO As some browsers display the line as more than 1px if the font-size is big,
                  // need to take that into account both in position and size
                  var baseline = _this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;

                  _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);

                  break;

                case 2
                /* OVERLINE */
                :
                  _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);

                  break;

                case 3
                /* LINE_THROUGH */
                :
                  // TODO try and find exact position for line-through
                  var middle = _this.fontMetrics.getMetrics(fontFamily, fontSize).middle;

                  _this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);

                  break;
              }
            });
          }
        });
        return [2
        /*return*/
        ];
      });
    });
  };

  CanvasRenderer.prototype.renderReplacedElement = function (container, curves, image) {
    if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
      var box = contentBox(container);
      var path = calculatePaddingBoxPath(curves);
      this.path(path);
      this.ctx.save();
      this.ctx.clip();
      this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
      this.ctx.restore();
    }
  };

  CanvasRenderer.prototype.renderNodeContent = function (paint) {
    return __awaiter(this, void 0, void 0, function () {
      var container, curves, styles, _i, _a, child, image, e_1, image, e_2, iframeRenderer, canvas, size, bounds, x, textBounds, img, image, url, e_3, bounds;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            this.applyEffects(paint.effects, 4
            /* CONTENT */
            );
            container = paint.container;
            curves = paint.curves;
            styles = container.styles;
            _i = 0, _a = container.textNodes;
            _b.label = 1;

          case 1:
            if (!(_i < _a.length)) return [3
            /*break*/
            , 4];
            child = _a[_i];
            return [4
            /*yield*/
            , this.renderTextNode(child, styles)];

          case 2:
            _b.sent();

            _b.label = 3;

          case 3:
            _i++;
            return [3
            /*break*/
            , 1];

          case 4:
            if (!(container instanceof ImageElementContainer)) return [3
            /*break*/
            , 8];
            _b.label = 5;

          case 5:
            _b.trys.push([5, 7,, 8]);

            return [4
            /*yield*/
            , this.options.cache.match(container.src)];

          case 6:
            image = _b.sent();
            this.renderReplacedElement(container, curves, image);
            return [3
            /*break*/
            , 8];

          case 7:
            e_1 = _b.sent();
            Logger.getInstance(this.options.id).error("Error loading image " + container.src);
            return [3
            /*break*/
            , 8];

          case 8:
            if (container instanceof CanvasElementContainer) {
              this.renderReplacedElement(container, curves, container.canvas);
            }

            if (!(container instanceof SVGElementContainer)) return [3
            /*break*/
            , 12];
            _b.label = 9;

          case 9:
            _b.trys.push([9, 11,, 12]);

            return [4
            /*yield*/
            , this.options.cache.match(container.svg)];

          case 10:
            image = _b.sent();
            this.renderReplacedElement(container, curves, image);
            return [3
            /*break*/
            , 12];

          case 11:
            e_2 = _b.sent();
            Logger.getInstance(this.options.id).error("Error loading svg " + container.svg.substring(0, 255));
            return [3
            /*break*/
            , 12];

          case 12:
            if (!(container instanceof IFrameElementContainer && container.tree)) return [3
            /*break*/
            , 14];
            iframeRenderer = new CanvasRenderer({
              id: this.options.id,
              scale: this.options.scale,
              backgroundColor: container.backgroundColor,
              x: 0,
              y: 0,
              scrollX: 0,
              scrollY: 0,
              width: container.width,
              height: container.height,
              cache: this.options.cache,
              windowWidth: container.width,
              windowHeight: container.height
            });
            return [4
            /*yield*/
            , iframeRenderer.render(container.tree)];

          case 13:
            canvas = _b.sent();

            if (container.width && container.height) {
              this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
            }

            _b.label = 14;

          case 14:
            if (container instanceof InputElementContainer) {
              size = Math.min(container.bounds.width, container.bounds.height);

              if (container.type === CHECKBOX) {
                if (container.checked) {
                  this.ctx.save();
                  this.path([new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79), new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549), new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071), new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649), new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23), new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085), new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)]);
                  this.ctx.fillStyle = asString(INPUT_COLOR);
                  this.ctx.fill();
                  this.ctx.restore();
                }
              } else if (container.type === RADIO) {
                if (container.checked) {
                  this.ctx.save();
                  this.ctx.beginPath();
                  this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                  this.ctx.fillStyle = asString(INPUT_COLOR);
                  this.ctx.fill();
                  this.ctx.restore();
                }
              }
            }

            if (isTextInputElement(container) && container.value.length) {
              this.ctx.font = this.createFontStyle(styles)[0];
              this.ctx.fillStyle = asString(styles.color);
              this.ctx.textBaseline = 'middle';
              this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
              bounds = contentBox(container);
              x = 0;

              switch (container.styles.textAlign) {
                case TEXT_ALIGN.CENTER:
                  x += bounds.width / 2;
                  break;

                case TEXT_ALIGN.RIGHT:
                  x += bounds.width;
                  break;
              }

              textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
              this.ctx.save();
              this.path([new Vector(bounds.left, bounds.top), new Vector(bounds.left + bounds.width, bounds.top), new Vector(bounds.left + bounds.width, bounds.top + bounds.height), new Vector(bounds.left, bounds.top + bounds.height)]);
              this.ctx.clip();
              this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles.letterSpacing);
              this.ctx.restore();
              this.ctx.textBaseline = 'bottom';
              this.ctx.textAlign = 'left';
            }

            if (!contains(container.styles.display, 2048
            /* LIST_ITEM */
            )) return [3
            /*break*/
            , 20];
            if (!(container.styles.listStyleImage !== null)) return [3
            /*break*/
            , 19];
            img = container.styles.listStyleImage;
            if (!(img.type === CSSImageType.URL)) return [3
            /*break*/
            , 18];
            image = void 0;
            url = img.url;
            _b.label = 15;

          case 15:
            _b.trys.push([15, 17,, 18]);

            return [4
            /*yield*/
            , this.options.cache.match(url)];

          case 16:
            image = _b.sent();
            this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
            return [3
            /*break*/
            , 18];

          case 17:
            e_3 = _b.sent();
            Logger.getInstance(this.options.id).error("Error loading list-style-image " + url);
            return [3
            /*break*/
            , 18];

          case 18:
            return [3
            /*break*/
            , 20];

          case 19:
            if (paint.listValue && container.styles.listStyleType !== LIST_STYLE_TYPE.NONE) {
              this.ctx.font = this.createFontStyle(styles)[0];
              this.ctx.fillStyle = asString(styles.color);
              this.ctx.textBaseline = 'middle';
              this.ctx.textAlign = 'right';
              bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
              this.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles.letterSpacing);
              this.ctx.textBaseline = 'bottom';
              this.ctx.textAlign = 'left';
            }

            _b.label = 20;

          case 20:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.renderStackContent = function (stack) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;

      return __generator(this, function (_p) {
        switch (_p.label) {
          case 0:
            // https://www.w3.org/TR/css-position-3/#painting-order
            // 1. the background and borders of the element forming the stacking context.
            return [4
            /*yield*/
            , this.renderNodeBackgroundAndBorders(stack.element)];

          case 1:
            // https://www.w3.org/TR/css-position-3/#painting-order
            // 1. the background and borders of the element forming the stacking context.
            _p.sent();

            _i = 0, _a = stack.negativeZIndex;
            _p.label = 2;

          case 2:
            if (!(_i < _a.length)) return [3
            /*break*/
            , 5];
            child = _a[_i];
            return [4
            /*yield*/
            , this.renderStack(child)];

          case 3:
            _p.sent();

            _p.label = 4;

          case 4:
            _i++;
            return [3
            /*break*/
            , 2];

          case 5:
            // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
            return [4
            /*yield*/
            , this.renderNodeContent(stack.element)];

          case 6:
            // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
            _p.sent();

            _b = 0, _c = stack.nonInlineLevel;
            _p.label = 7;

          case 7:
            if (!(_b < _c.length)) return [3
            /*break*/
            , 10];
            child = _c[_b];
            return [4
            /*yield*/
            , this.renderNode(child)];

          case 8:
            _p.sent();

            _p.label = 9;

          case 9:
            _b++;
            return [3
            /*break*/
            , 7];

          case 10:
            _d = 0, _e = stack.nonPositionedFloats;
            _p.label = 11;

          case 11:
            if (!(_d < _e.length)) return [3
            /*break*/
            , 14];
            child = _e[_d];
            return [4
            /*yield*/
            , this.renderStack(child)];

          case 12:
            _p.sent();

            _p.label = 13;

          case 13:
            _d++;
            return [3
            /*break*/
            , 11];

          case 14:
            _f = 0, _g = stack.nonPositionedInlineLevel;
            _p.label = 15;

          case 15:
            if (!(_f < _g.length)) return [3
            /*break*/
            , 18];
            child = _g[_f];
            return [4
            /*yield*/
            , this.renderStack(child)];

          case 16:
            _p.sent();

            _p.label = 17;

          case 17:
            _f++;
            return [3
            /*break*/
            , 15];

          case 18:
            _h = 0, _j = stack.inlineLevel;
            _p.label = 19;

          case 19:
            if (!(_h < _j.length)) return [3
            /*break*/
            , 22];
            child = _j[_h];
            return [4
            /*yield*/
            , this.renderNode(child)];

          case 20:
            _p.sent();

            _p.label = 21;

          case 21:
            _h++;
            return [3
            /*break*/
            , 19];

          case 22:
            _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
            _p.label = 23;

          case 23:
            if (!(_k < _l.length)) return [3
            /*break*/
            , 26];
            child = _l[_k];
            return [4
            /*yield*/
            , this.renderStack(child)];

          case 24:
            _p.sent();

            _p.label = 25;

          case 25:
            _k++;
            return [3
            /*break*/
            , 23];

          case 26:
            _m = 0, _o = stack.positiveZIndex;
            _p.label = 27;

          case 27:
            if (!(_m < _o.length)) return [3
            /*break*/
            , 30];
            child = _o[_m];
            return [4
            /*yield*/
            , this.renderStack(child)];

          case 28:
            _p.sent();

            _p.label = 29;

          case 29:
            _m++;
            return [3
            /*break*/
            , 27];

          case 30:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.mask = function (paths) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(this.canvas.width, 0);
    this.ctx.lineTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(0, this.canvas.height);
    this.ctx.lineTo(0, 0);
    this.formatPath(paths.slice(0).reverse());
    this.ctx.closePath();
  };

  CanvasRenderer.prototype.path = function (paths) {
    this.ctx.beginPath();
    this.formatPath(paths);
    this.ctx.closePath();
  };

  CanvasRenderer.prototype.formatPath = function (paths) {
    var _this = this;

    paths.forEach(function (point, index) {
      var start = isBezierCurve(point) ? point.start : point;

      if (index === 0) {
        _this.ctx.moveTo(start.x, start.y);
      } else {
        _this.ctx.lineTo(start.x, start.y);
      }

      if (isBezierCurve(point)) {
        _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
      }
    });
  };

  CanvasRenderer.prototype.renderRepeat = function (path, pattern, offsetX, offsetY) {
    this.path(path);
    this.ctx.fillStyle = pattern;
    this.ctx.translate(offsetX, offsetY);
    this.ctx.fill();
    this.ctx.translate(-offsetX, -offsetY);
  };

  CanvasRenderer.prototype.resizeImage = function (image, width, height) {
    if (image.width === width && image.height === height) {
      return image;
    }

    var canvas = this.canvas.ownerDocument.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
    return canvas;
  };

  CanvasRenderer.prototype.renderBackgroundImage = function (container) {
    return __awaiter(this, void 0, void 0, function () {
      var index, _loop_1, this_1, _i, _a, backgroundImage;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            index = container.styles.backgroundImage.length - 1;

            _loop_1 = function (backgroundImage) {
              var image, url, e_4, _a, path, x, y, width, height, pattern, _b, path, x, y, width, height, _c, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _d, path, left, top_1, width, height, position, x, y, _e, rx, ry, radialGradient_1, midX, midY, f, invF;

              return __generator(this, function (_f) {
                switch (_f.label) {
                  case 0:
                    if (!(backgroundImage.type === CSSImageType.URL)) return [3
                    /*break*/
                    , 5];
                    image = void 0;
                    url = backgroundImage.url;
                    _f.label = 1;

                  case 1:
                    _f.trys.push([1, 3,, 4]);

                    return [4
                    /*yield*/
                    , this_1.options.cache.match(url)];

                  case 2:
                    image = _f.sent();
                    return [3
                    /*break*/
                    , 4];

                  case 3:
                    e_4 = _f.sent();
                    Logger.getInstance(this_1.options.id).error("Error loading background-image " + url);
                    return [3
                    /*break*/
                    , 4];

                  case 4:
                    if (image) {
                      _a = calculateBackgroundRendering(container, index, [image.width, image.height, image.width / image.height]), path = _a[0], x = _a[1], y = _a[2], width = _a[3], height = _a[4];
                      pattern = this_1.ctx.createPattern(this_1.resizeImage(image, width, height), 'repeat');
                      this_1.renderRepeat(path, pattern, x, y);
                    }

                    return [3
                    /*break*/
                    , 6];

                  case 5:
                    if (isLinearGradient(backgroundImage)) {
                      _b = calculateBackgroundRendering(container, index, [null, null, null]), path = _b[0], x = _b[1], y = _b[2], width = _b[3], height = _b[4];
                      _c = calculateGradientDirection(backgroundImage.angle, width, height), lineLength = _c[0], x0 = _c[1], x1 = _c[2], y0 = _c[3], y1 = _c[4];
                      canvas = document.createElement('canvas');
                      canvas.width = width;
                      canvas.height = height;
                      ctx = canvas.getContext('2d');
                      gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                      processColorStops(backgroundImage.stops, lineLength).forEach(function (colorStop) {
                        return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                      });
                      ctx.fillStyle = gradient_1;
                      ctx.fillRect(0, 0, width, height);

                      if (width > 0 && height > 0) {
                        pattern = this_1.ctx.createPattern(canvas, 'repeat');
                        this_1.renderRepeat(path, pattern, x, y);
                      }
                    } else if (isRadialGradient(backgroundImage)) {
                      _d = calculateBackgroundRendering(container, index, [null, null, null]), path = _d[0], left = _d[1], top_1 = _d[2], width = _d[3], height = _d[4];
                      position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                      x = getAbsoluteValue(position[0], width);
                      y = getAbsoluteValue(position[position.length - 1], height);
                      _e = calculateRadius(backgroundImage, x, y, width, height), rx = _e[0], ry = _e[1];

                      if (rx > 0 && rx > 0) {
                        radialGradient_1 = this_1.ctx.createRadialGradient(left + x, top_1 + y, 0, left + x, top_1 + y, rx);
                        processColorStops(backgroundImage.stops, rx * 2).forEach(function (colorStop) {
                          return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                        });
                        this_1.path(path);
                        this_1.ctx.fillStyle = radialGradient_1;

                        if (rx !== ry) {
                          midX = container.bounds.left + 0.5 * container.bounds.width;
                          midY = container.bounds.top + 0.5 * container.bounds.height;
                          f = ry / rx;
                          invF = 1 / f;
                          this_1.ctx.save();
                          this_1.ctx.translate(midX, midY);
                          this_1.ctx.transform(1, 0, 0, f, 0, 0);
                          this_1.ctx.translate(-midX, -midY);
                          this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                          this_1.ctx.restore();
                        } else {
                          this_1.ctx.fill();
                        }
                      }
                    }

                    _f.label = 6;

                  case 6:
                    index--;
                    return [2
                    /*return*/
                    ];
                }
              });
            };

            this_1 = this;
            _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
            _b.label = 1;

          case 1:
            if (!(_i < _a.length)) return [3
            /*break*/
            , 4];
            backgroundImage = _a[_i];
            return [5
            /*yield**/
            , _loop_1(backgroundImage)];

          case 2:
            _b.sent();

            _b.label = 3;

          case 3:
            _i++;
            return [3
            /*break*/
            , 1];

          case 4:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.renderBorder = function (color, side, curvePoints) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.path(parsePathForBorder(curvePoints, side));
        this.ctx.fillStyle = asString(color);
        this.ctx.fill();
        return [2
        /*return*/
        ];
      });
    });
  };

  CanvasRenderer.prototype.renderNodeBackgroundAndBorders = function (paint) {
    return __awaiter(this, void 0, void 0, function () {
      var styles, hasBackground, borders, backgroundPaintingArea, side, _i, borders_1, border;

      var _this = this;

      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            this.applyEffects(paint.effects, 2
            /* BACKGROUND_BORDERS */
            );
            styles = paint.container.styles;
            hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
            borders = [{
              style: styles.borderTopStyle,
              color: styles.borderTopColor
            }, {
              style: styles.borderRightStyle,
              color: styles.borderRightColor
            }, {
              style: styles.borderBottomStyle,
              color: styles.borderBottomColor
            }, {
              style: styles.borderLeftStyle,
              color: styles.borderLeftColor
            }];
            backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
            if (!(hasBackground || styles.boxShadow.length)) return [3
            /*break*/
            , 2];
            this.ctx.save();
            this.path(backgroundPaintingArea);
            this.ctx.clip();

            if (!isTransparent(styles.backgroundColor)) {
              this.ctx.fillStyle = asString(styles.backgroundColor);
              this.ctx.fill();
            }

            return [4
            /*yield*/
            , this.renderBackgroundImage(paint.container)];

          case 1:
            _a.sent();

            this.ctx.restore();
            styles.boxShadow.slice(0).reverse().forEach(function (shadow) {
              _this.ctx.save();

              var borderBoxArea = calculateBorderBoxPath(paint.curves);
              var maskOffset = shadow.inset ? 0 : MASK_OFFSET;
              var shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));

              if (shadow.inset) {
                _this.path(borderBoxArea);

                _this.ctx.clip();

                _this.mask(shadowPaintingArea);
              } else {
                _this.mask(borderBoxArea);

                _this.ctx.clip();

                _this.path(shadowPaintingArea);
              }

              _this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
              _this.ctx.shadowOffsetY = shadow.offsetY.number;
              _this.ctx.shadowColor = asString(shadow.color);
              _this.ctx.shadowBlur = shadow.blur.number;
              _this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : 'rgba(0,0,0,1)';

              _this.ctx.fill();

              _this.ctx.restore();
            });
            _a.label = 2;

          case 2:
            side = 0;
            _i = 0, borders_1 = borders;
            _a.label = 3;

          case 3:
            if (!(_i < borders_1.length)) return [3
            /*break*/
            , 7];
            border = borders_1[_i];
            if (!(border.style !== BORDER_STYLE.NONE && !isTransparent(border.color))) return [3
            /*break*/
            , 5];
            return [4
            /*yield*/
            , this.renderBorder(border.color, side, paint.curves)];

          case 4:
            _a.sent();

            _a.label = 5;

          case 5:
            side++;
            _a.label = 6;

          case 6:
            _i++;
            return [3
            /*break*/
            , 3];

          case 7:
            return [2
            /*return*/
            ];
        }
      });
    });
  };

  CanvasRenderer.prototype.render = function (element) {
    return __awaiter(this, void 0, void 0, function () {
      var stack;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.options.backgroundColor) {
              this.ctx.fillStyle = asString(this.options.backgroundColor);
              this.ctx.fillRect(this.options.x - this.options.scrollX, this.options.y - this.options.scrollY, this.options.width, this.options.height);
            }

            stack = parseStackingContexts(element);
            return [4
            /*yield*/
            , this.renderStack(stack)];

          case 1:
            _a.sent();

            this.applyEffects([], 2
            /* BACKGROUND_BORDERS */
            );
            return [2
            /*return*/
            , this.canvas];
        }
      });
    });
  };

  return CanvasRenderer;
}();

var isTextInputElement = function (container) {
  if (container instanceof TextareaElementContainer) {
    return true;
  } else if (container instanceof SelectElementContainer) {
    return true;
  } else if (container instanceof InputElementContainer && container.type !== RADIO && container.type !== CHECKBOX) {
    return true;
  }

  return false;
};

var calculateBackgroundCurvedPaintingArea = function (clip, curves) {
  switch (clip) {
    case BACKGROUND_CLIP.BORDER_BOX:
      return calculateBorderBoxPath(curves);

    case BACKGROUND_CLIP.CONTENT_BOX:
      return calculateContentBoxPath(curves);

    case BACKGROUND_CLIP.PADDING_BOX:
    default:
      return calculatePaddingBoxPath(curves);
  }
};

var canvasTextAlign = function (textAlign) {
  switch (textAlign) {
    case TEXT_ALIGN.CENTER:
      return 'center';

    case TEXT_ALIGN.RIGHT:
      return 'right';

    case TEXT_ALIGN.LEFT:
    default:
      return 'left';
  }
};

var ForeignObjectRenderer =
/** @class */
function () {
  function ForeignObjectRenderer(options) {
    this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.options = options;
    this.canvas.width = Math.floor(options.width * options.scale);
    this.canvas.height = Math.floor(options.height * options.scale);
    this.canvas.style.width = options.width + "px";
    this.canvas.style.height = options.height + "px";
    this.ctx.scale(this.options.scale, this.options.scale);
    this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
    Logger.getInstance(options.id).debug("EXPERIMENTAL ForeignObject renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
  }

  ForeignObjectRenderer.prototype.render = function (element) {
    return __awaiter(this, void 0, void 0, function () {
      var svg, img;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            svg = createForeignObjectSVG(Math.max(this.options.windowWidth, this.options.width) * this.options.scale, Math.max(this.options.windowHeight, this.options.height) * this.options.scale, this.options.scrollX * this.options.scale, this.options.scrollY * this.options.scale, element);
            return [4
            /*yield*/
            , loadSerializedSVG$1(svg)];

          case 1:
            img = _a.sent();

            if (this.options.backgroundColor) {
              this.ctx.fillStyle = asString(this.options.backgroundColor);
              this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
            }

            this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
            return [2
            /*return*/
            , this.canvas];
        }
      });
    });
  };

  return ForeignObjectRenderer;
}();

var loadSerializedSVG$1 = function (svg) {
  return new Promise(function (resolve, reject) {
    var img = new Image();

    img.onload = function () {
      resolve(img);
    };

    img.onerror = reject;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  });
};

var _this = undefined;

var parseColor$1 = function (value) {
  return color.parse(Parser.create(value).parseComponentValue());
};

var html2canvas$1 = function (element, options) {
  if (options === void 0) {
    options = {};
  }

  return renderElement(element, options);
};

CacheStorage.setContext(window);

var renderElement = function (element, opts) {
  return __awaiter(_this, void 0, void 0, function () {
    var ownerDocument, defaultView, instanceName, _a, width, height, left, top, defaultResourceOptions, resourceOptions, defaultOptions, options, windowBounds, documentCloner, clonedElement, container, documentBackgroundColor, bodyBackgroundColor, bgColor, defaultBackgroundColor, backgroundColor, renderOptions, canvas, renderer, root, renderer;

    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          ownerDocument = element.ownerDocument;

          if (!ownerDocument) {
            throw new Error("Element is not attached to a Document");
          }

          defaultView = ownerDocument.defaultView;

          if (!defaultView) {
            throw new Error("Document is not attached to a Window");
          }

          instanceName = (Math.round(Math.random() * 1000) + Date.now()).toString(16);
          _a = isBodyElement(element) || isHTMLElement(element) ? parseDocumentSize(ownerDocument) : parseBounds(element), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
          defaultResourceOptions = {
            allowTaint: false,
            imageTimeout: 15000,
            proxy: undefined,
            useCORS: false
          };
          resourceOptions = __assign({}, defaultResourceOptions, opts);
          defaultOptions = {
            backgroundColor: '#ffffff',
            cache: opts.cache ? opts.cache : CacheStorage.create(instanceName, resourceOptions),
            logging: true,
            removeContainer: true,
            foreignObjectRendering: false,
            scale: defaultView.devicePixelRatio || 1,
            windowWidth: defaultView.innerWidth,
            windowHeight: defaultView.innerHeight,
            scrollX: defaultView.pageXOffset,
            scrollY: defaultView.pageYOffset,
            x: left,
            y: top,
            width: Math.ceil(width),
            height: Math.ceil(height),
            id: instanceName
          };
          options = __assign({}, defaultOptions, resourceOptions, opts);
          windowBounds = new Bounds(options.scrollX, options.scrollY, options.windowWidth, options.windowHeight);
          Logger.create({
            id: instanceName,
            enabled: options.logging
          });
          Logger.getInstance(instanceName).debug("Starting document clone");
          documentCloner = new DocumentCloner(element, {
            id: instanceName,
            onclone: options.onclone,
            ignoreElements: options.ignoreElements,
            inlineImages: options.foreignObjectRendering,
            copyStyles: options.foreignObjectRendering
          });
          clonedElement = documentCloner.clonedReferenceElement;

          if (!clonedElement) {
            return [2
            /*return*/
            , Promise.reject("Unable to find element in cloned iframe")];
          }

          return [4
          /*yield*/
          , documentCloner.toIFrame(ownerDocument, windowBounds)];

        case 1:
          container = _b.sent();
          documentBackgroundColor = ownerDocument.documentElement ? parseColor$1(getComputedStyle(ownerDocument.documentElement).backgroundColor) : COLORS.TRANSPARENT;
          bodyBackgroundColor = ownerDocument.body ? parseColor$1(getComputedStyle(ownerDocument.body).backgroundColor) : COLORS.TRANSPARENT;
          bgColor = opts.backgroundColor;
          defaultBackgroundColor = typeof bgColor === 'string' ? parseColor$1(bgColor) : bgColor === null ? COLORS.TRANSPARENT : 0xffffffff;
          backgroundColor = element === ownerDocument.documentElement ? isTransparent(documentBackgroundColor) ? isTransparent(bodyBackgroundColor) ? defaultBackgroundColor : bodyBackgroundColor : documentBackgroundColor : defaultBackgroundColor;
          renderOptions = {
            id: instanceName,
            cache: options.cache,
            canvas: options.canvas,
            backgroundColor: backgroundColor,
            scale: options.scale,
            x: options.x,
            y: options.y,
            scrollX: options.scrollX,
            scrollY: options.scrollY,
            width: options.width,
            height: options.height,
            windowWidth: options.windowWidth,
            windowHeight: options.windowHeight
          };
          if (!options.foreignObjectRendering) return [3
          /*break*/
          , 3];
          Logger.getInstance(instanceName).debug("Document cloned, using foreign object rendering");
          renderer = new ForeignObjectRenderer(renderOptions);
          return [4
          /*yield*/
          , renderer.render(clonedElement)];

        case 2:
          canvas = _b.sent();
          return [3
          /*break*/
          , 5];

        case 3:
          Logger.getInstance(instanceName).debug("Document cloned, using computed rendering");
          CacheStorage.attachInstance(options.cache);
          Logger.getInstance(instanceName).debug("Starting DOM parsing");
          root = parseTree(clonedElement);
          CacheStorage.detachInstance();

          if (backgroundColor === root.styles.backgroundColor) {
            root.styles.backgroundColor = COLORS.TRANSPARENT;
          }

          Logger.getInstance(instanceName).debug("Starting renderer");
          renderer = new CanvasRenderer(renderOptions);
          return [4
          /*yield*/
          , renderer.render(root)];

        case 4:
          canvas = _b.sent();
          _b.label = 5;

        case 5:
          if (options.removeContainer === true) {
            if (!DocumentCloner.destroy(container)) {
              Logger.getInstance(instanceName).error("Cannot detach cloned iframe as it is not in the DOM anymore");
            }
          }

          Logger.getInstance(instanceName).debug("Finished rendering");
          Logger.destroy(instanceName);
          CacheStorage.destroy(instanceName);
          return [2
          /*return*/
          , canvas];
      }
    });
  });
};

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
            return html2canvas$1(element, {
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

var isElementNode$1 = (function (node) {
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

var isTextNode$1 = (function (node) {
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
                        cloneDrawPageParams.pdf = new jspdf_min(pdfOptions);
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
                        if (isElementNode$1(childNode)) childNode.index = index++;
                        return childNode;
                      });

                      if (!isElementNode$1(node)) {
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
                      if (!isTextNode$1(node)) {
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
                        cloneDrawPageParams.pdf = new jspdf_min(pdfOptions);
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

var html2pdf$1 = /*#__PURE__*/(function () {
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
            pdf = new jspdf_min({
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

module.exports = html2pdf$1;
