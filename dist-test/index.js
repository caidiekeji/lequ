var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    __name(PerformanceEntry, "PerformanceEntry");
    PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    }, "PerformanceMark");
    PerformanceMeasure = class extends PerformanceEntry {
      entryType = "measure";
    };
    __name(PerformanceMeasure, "PerformanceMeasure");
    PerformanceResourceTiming = class extends PerformanceEntry {
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    __name(PerformanceResourceTiming, "PerformanceResourceTiming");
    PerformanceObserverEntryList = class {
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    __name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
    Performance = class {
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    __name(Performance, "Performance");
    PerformanceObserver = class {
      __unenv__ = true;
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    __name(PerformanceObserver, "PerformanceObserver");
    __publicField(PerformanceObserver, "supportedEntryTypes", []);
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class extends Socket {
      fd;
      constructor(fd) {
        super();
        this.fd = fd;
      }
      isRaw = false;
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
      isTTY = false;
    };
    __name(ReadStream, "ReadStream");
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class extends Socket2 {
      fd;
      constructor(fd) {
        super();
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      columns = 80;
      rows = 24;
      isTTY = false;
    };
    __name(WriteStream, "WriteStream");
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    Process = class extends EventEmitter {
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return "";
      }
      get versions() {
        return {};
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      ref() {
      }
      unref() {
      }
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: () => 0 });
      mainModule = void 0;
      domain = void 0;
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
    __name(Process, "Process");
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, exit, platform, nextTick, unenvProcess, abort, addListener, allowedNodeEnvironmentFlags, hasUncaughtExceptionCaptureCallback, setUncaughtExceptionCaptureCallback, loadEnvFile, sourceMapsEnabled, arch, argv, argv0, chdir, config, connected, constrainedMemory, availableMemory, cpuUsage, cwd, debugPort, dlopen, disconnect, emit, emitWarning, env, eventNames, execArgv, execPath, finalization, features, getActiveResourcesInfo, getMaxListeners, hrtime3, kill, listeners, listenerCount, memoryUsage, on, off, once, pid, ppid, prependListener, prependOnceListener, rawListeners, release, removeAllListeners, removeListener, report, resourceUsage, setMaxListeners, setSourceMapsEnabled, stderr, stdin, stdout, title, throwDeprecation, traceDeprecation, umask, uptime, version, versions, domain, initgroups, moduleLoadList, reallyExit, openStdin, assert2, binding, send, exitCode, channel, getegid, geteuid, getgid, getgroups, getuid, setegid, seteuid, setgid, setgroups, setuid, permission, mainModule, _events, _eventsCount, _exiting, _maxListeners, _debugEnd, _debugProcess, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, _disconnect, _handleQueue, _pendingMessage, _channel, _send, _linkedBinding, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    ({ exit, platform, nextTick } = getBuiltinModule(
      "node:process"
    ));
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      nextTick
    });
    ({
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      finalization,
      features,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      on,
      off,
      once,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// src/utils.js
var utils_exports = {};
__export(utils_exports, {
  createJWT: () => createJWT,
  generateLicenseKey: () => generateLicenseKey,
  generateUUID: () => generateUUID,
  hashPassword: () => hashPassword,
  sha256: () => sha256,
  verifyJWT: () => verifyJWT,
  verifyPassword: () => verifyPassword
});
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltStr = bufferToHex(salt);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  const hashStr = bufferToHex(new Uint8Array(bits));
  return saltStr + ":" + hashStr;
}
async function verifyPassword(password, stored) {
  const parts = stored.split(":");
  if (parts.length !== 2)
    return false;
  const salt = hexToBuffer(parts[0]);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 1e5, hash: "SHA-256" }, key, 256);
  const hashStr = bufferToHex(new Uint8Array(bits));
  return hashStr === parts[1];
}
async function createJWT(payload, secret, expiresIn = 28800) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1e3);
  const tokenPayload = { ...payload, iat: now, exp: now + expiresIn, iss: "shouquan" };
  const encoder = new TextEncoder();
  const headerStr = base64url(encoder.encode(JSON.stringify(header)));
  const payloadStr = base64url(encoder.encode(JSON.stringify(tokenPayload)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(headerStr + "." + payloadStr));
  const sigStr = base64url(new Uint8Array(signature));
  return headerStr + "." + payloadStr + "." + sigStr;
}
async function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3)
    return null;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sig = urlbase64ToBuffer(parts[2]);
  const valid = await crypto.subtle.verify("HMAC", key, sig, encoder.encode(parts[0] + "." + parts[1]));
  if (!valid)
    return null;
  const payloadStr = new TextDecoder().decode(urlbase64ToBuffer(parts[1]));
  const payload = JSON.parse(payloadStr);
  const now = Math.floor(Date.now() / 1e3);
  if (payload.exp && payload.exp < now)
    return null;
  if (payload.iss !== "shouquan")
    return null;
  return payload;
}
function generateLicenseKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let i = 0; i < 4; i++) {
    let seg = "";
    for (let j = 0; j < 4; j++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return "POS-" + segments.join("-");
}
function generateUUID() {
  return crypto.randomUUID();
}
function bufferToHex(buf) {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBuffer(hex) {
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return new Uint8Array(bytes);
}
function base64url(buf) {
  const base64 = btoa(String.fromCharCode(...buf));
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function urlbase64ToBuffer(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4)
    str += "=";
  const binaryStr = atob(str);
  const buf = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    buf[i] = binaryStr.charCodeAt(i);
  }
  return buf;
}
async function sha256(data) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return bufferToHex(new Uint8Array(hash));
}
var init_utils2 = __esm({
  "src/utils.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(hashPassword, "hashPassword");
    __name(verifyPassword, "verifyPassword");
    __name(createJWT, "createJWT");
    __name(verifyJWT, "verifyJWT");
    __name(generateLicenseKey, "generateLicenseKey");
    __name(generateUUID, "generateUUID");
    __name(bufferToHex, "bufferToHex");
    __name(hexToBuffer, "hexToBuffer");
    __name(base64url, "base64url");
    __name(urlbase64ToBuffer, "urlbase64ToBuffer");
    __name(sha256, "sha256");
  }
});

// src/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/hono-base.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/compose.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/context.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/http-exception.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/request/constants.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/reg-exp-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/reg-exp-router/matcher.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/smart-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router4 = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router4.add(...routes[i2]);
        }
        res = router4.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router4.match.bind(router4);
      this.#routers = [router4];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// node_modules/hono/dist/router/trie-router/node.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = /* @__PURE__ */ __name((children) => {
  for (const _ in children) {
    return true;
  }
  return false;
}, "hasChildren");
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/middleware/cors/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/db.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_utils2();
async function initDatabase(db, env2) {
  const adminCount = await db.prepare("SELECT COUNT(*) as cnt FROM admins").first();
  if (adminCount.cnt === 0) {
    const { hashPassword: hashPassword2 } = await Promise.resolve().then(() => (init_utils2(), utils_exports));
    const passwordHash = await hashPassword2(env2.ADMIN_PASSWORD || "admin123");
    await db.prepare(
      "INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'super_admin')"
    ).bind("admin", passwordHash).run();
    console.log("[Init] \u9ED8\u8BA4\u7BA1\u7406\u5458\u5DF2\u521B\u5EFA: admin");
  }
}
__name(initDatabase, "initDatabase");
async function createLicense(db, data) {
  const edition = EDITIONS[data.product_edition] || EDITIONS.basic;
  let licenseKey;
  let exists = true;
  while (exists) {
    licenseKey = generateLicenseKey();
    const check = await db.prepare("SELECT id FROM licenses WHERE license_key = ?").bind(licenseKey).first();
    exists = !!check;
  }
  const validFrom = /* @__PURE__ */ new Date();
  const validUntil = new Date(validFrom.getTime() + data.valid_days * 24 * 60 * 60 * 1e3);
  const features2 = JSON.stringify(data.features || edition.features);
  const maxTerminals = data.max_terminals ?? edition.max_terminals;
  const maxProducts = data.max_products ?? edition.max_products;
  const maxMembers = data.max_members ?? edition.max_members;
  const result = await db.prepare(`
    INSERT INTO licenses (license_key, product_edition, max_stores, max_terminals,
      max_products, max_members, features, bind_mode, valid_from, valid_until, note, customer_name, customer_contact, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    RETURNING *
  `).bind(
    licenseKey,
    data.product_edition,
    data.max_stores || 1,
    maxTerminals,
    maxProducts,
    maxMembers,
    features2,
    data.bind_mode || "strict",
    validFrom.toISOString(),
    validUntil.toISOString(),
    data.note || "",
    data.customer_name || "",
    data.customer_contact || ""
  ).first();
  return result;
}
__name(createLicense, "createLicense");
async function activateLicense(db, licenseKey, hardwareFingerprint, fingerprintDetail, storeName) {
  const lic = await db.prepare("SELECT * FROM licenses WHERE license_key = ?").bind(licenseKey).first();
  if (!lic) {
    return { error: true, code: 40001, message: "\u6388\u6743\u7801\u65E0\u6548", status: 400 };
  }
  if (lic.status === "revoked") {
    return { error: true, code: 40301, message: "\u8BE5\u6388\u6743\u7801\u5DF2\u88AB\u540A\u9500", status: 403 };
  }
  const now = /* @__PURE__ */ new Date();
  if (lic.valid_until && new Date(lic.valid_until) < now) {
    await db.prepare("UPDATE licenses SET status = 'expired', updated_at = datetime('now') WHERE id = ?").bind(lic.id).run();
    return { error: true, code: 40302, message: "\u8BE5\u6388\u6743\u7801\u5DF2\u8FC7\u671F", status: 403 };
  }
  const count3 = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE license_id = ? AND status = 'active'"
  ).bind(lic.id).first();
  if (lic.max_stores > 0 && count3.cnt >= lic.max_stores) {
    return { error: true, code: 40303, message: `\u6FC0\u6D3B\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650\uFF08${lic.max_stores}\uFF09`, status: 403 };
  }
  const instanceId = crypto.randomUUID();
  const nowISO = (/* @__PURE__ */ new Date()).toISOString();
  await db.prepare(`
    INSERT INTO license_instances (license_id, instance_id, store_name,
      hardware_fingerprint, fingerprint_detail, activated_at, last_heartbeat, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `).bind(
    lic.id,
    instanceId,
    storeName,
    hardwareFingerprint,
    JSON.stringify(fingerprintDetail),
    nowISO,
    nowISO
  ).run();
  await createAuditLog(db, lic.id, instanceId, "activate", {
    store_name: storeName,
    fingerprint: hardwareFingerprint
  });
  return {
    license_id: lic.id,
    instance_id: instanceId,
    product_edition: lic.product_edition,
    features: JSON.parse(lic.features || "[]"),
    max_terminals: lic.max_terminals,
    max_products: lic.max_products,
    max_members: lic.max_members,
    valid_from: lic.valid_from,
    valid_until: lic.valid_until,
    bind_mode: lic.bind_mode
  };
}
__name(activateLicense, "activateLicense");
async function heartbeatLicense(db, instanceId, hardwareFingerprint) {
  const inst = await db.prepare("SELECT * FROM license_instances WHERE instance_id = ?").bind(instanceId).first();
  if (!inst) {
    return { success: false, message: "\u5B9E\u4F8B\u4E0D\u5B58\u5728" };
  }
  const lic = await db.prepare("SELECT * FROM licenses WHERE id = ?").bind(inst.license_id).first();
  if (!lic || lic.status === "revoked") {
    await db.prepare("UPDATE license_instances SET status = 'revoked', updated_at = datetime('now') WHERE id = ?").bind(inst.id).run();
    return { success: false, status: "revoked", message: "\u6388\u6743\u5DF2\u88AB\u505C\u7528" };
  }
  if (lic.bind_mode === "strict" && inst.hardware_fingerprint !== hardwareFingerprint) {
    return { success: false, status: "fingerprint_mismatch", message: "\u786C\u4EF6\u6307\u7EB9\u4E0D\u5339\u914D\uFF0C\u8BF7\u91CD\u65B0\u6FC0\u6D3B" };
  }
  await db.prepare(
    "UPDATE license_instances SET last_heartbeat = datetime('now') WHERE id = ?"
  ).bind(inst.id).run();
  return { success: true };
}
__name(heartbeatLicense, "heartbeatLicense");
async function getInstanceStatus(db, instanceId) {
  const inst = await db.prepare(`
    SELECT li.*, l.license_key, l.product_edition, l.features, l.max_terminals,
      l.max_products, l.max_members, l.valid_from, l.valid_until, l.bind_mode, l.status as license_status
    FROM license_instances li
    LEFT JOIN licenses l ON li.license_id = l.id
    WHERE li.instance_id = ?
  `).bind(instanceId).first();
  if (!inst)
    return { activated: false, message: "\u5B9E\u4F8B\u4E0D\u5B58\u5728" };
  if (inst.license_status === "revoked")
    return { activated: false, status: "revoked", message: "\u6388\u6743\u5DF2\u88AB\u505C\u7528" };
  return {
    activated: true,
    instance_id: inst.instance_id,
    store_name: inst.store_name,
    product_edition: inst.product_edition,
    features: JSON.parse(inst.features || "[]"),
    max_terminals: inst.max_terminals,
    max_products: inst.max_products,
    max_members: inst.max_members,
    valid_until: inst.valid_until,
    last_heartbeat: inst.last_heartbeat,
    status: inst.status
  };
}
__name(getInstanceStatus, "getInstanceStatus");
async function getLicenseList(db, { page = 1, pageSize = 20, status, keyword } = {}) {
  const conditions = [];
  const params = [];
  if (status) {
    conditions.push("l.status = ?");
    params.push(status);
  }
  if (keyword) {
    conditions.push("(l.license_key LIKE ? OR l.note LIKE ? OR l.customer_name LIKE ?)");
    const kw = "%" + keyword + "%";
    params.push(kw, kw, kw);
  }
  const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const offset = (page - 1) * pageSize;
  const totalResult = await db.prepare("SELECT COUNT(*) as cnt FROM licenses l " + where).bind(...params).first();
  const total = totalResult.cnt;
  const list = await db.prepare(`
    SELECT l.*, COUNT(li.id) as instance_count
    FROM licenses l
    LEFT JOIN license_instances li ON li.license_id = l.id
    ${where}
    GROUP BY l.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(...params, pageSize, offset).all();
  return { list: list.results, total };
}
__name(getLicenseList, "getLicenseList");
async function getLicenseDetail(db, id) {
  const lic = await db.prepare("SELECT * FROM licenses WHERE id = ?").bind(id).first();
  if (!lic)
    return null;
  const instances = await db.prepare(
    "SELECT * FROM license_instances WHERE license_id = ? ORDER BY created_at DESC"
  ).bind(id).all();
  const auditLogs = await db.prepare(
    "SELECT * FROM license_audit_logs WHERE license_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(id).all();
  return { ...lic, instances: instances.results, audit_logs: auditLogs.results };
}
__name(getLicenseDetail, "getLicenseDetail");
async function revokeLicense(db, id) {
  const lic = await db.prepare("SELECT * FROM licenses WHERE id = ?").bind(id).first();
  if (!lic)
    return { error: true, message: "\u6388\u6743\u7801\u4E0D\u5B58\u5728" };
  await db.prepare("UPDATE licenses SET status = 'revoked', updated_at = datetime('now') WHERE id = ?").bind(id).run();
  await db.prepare("UPDATE license_instances SET status = 'revoked', updated_at = datetime('now') WHERE license_id = ?").bind(id).run();
  const instances = await db.prepare("SELECT instance_id FROM license_instances WHERE license_id = ?").bind(id).all();
  for (const inst of instances.results) {
    await createAuditLog(db, id, inst.instance_id, "revoke", { reason: "\u7BA1\u7406\u5458\u540A\u9500" });
  }
  return { success: true };
}
__name(revokeLicense, "revokeLicense");
async function getDashboardStats(db) {
  const totalLicenses = await db.prepare("SELECT COUNT(*) as cnt FROM licenses").first().then((r) => r.cnt);
  const activeLicenses = await db.prepare("SELECT COUNT(*) as cnt FROM licenses WHERE status = 'active'").first().then((r) => r.cnt);
  const totalInstances = await db.prepare("SELECT COUNT(*) as cnt FROM license_instances").first().then((r) => r.cnt);
  const activeInstances = await db.prepare("SELECT COUNT(*) as cnt FROM license_instances WHERE status = 'active'").first().then((r) => r.cnt);
  const todayActivations = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE date(activated_at) = date('now')"
  ).first().then((r) => r.cnt);
  const weeklyActivations = await db.prepare(
    "SELECT COUNT(*) as cnt FROM license_instances WHERE activated_at >= datetime('now', '-7 days')"
  ).first().then((r) => r.cnt);
  const editionStats = await db.prepare(
    "SELECT product_edition, COUNT(*) as cnt FROM licenses GROUP BY product_edition ORDER BY cnt DESC"
  ).all();
  return {
    total_licenses: totalLicenses,
    active_licenses: activeLicenses,
    total_instances: totalInstances,
    active_instances: activeInstances,
    today_activations: todayActivations,
    weekly_activations: weeklyActivations,
    edition_stats: editionStats.results
  };
}
__name(getDashboardStats, "getDashboardStats");
async function createAuditLog(db, licenseId, instanceId, action, detail) {
  const prev = await db.prepare(
    "SELECT row_hash FROM license_audit_logs ORDER BY id DESC LIMIT 1"
  ).first();
  const prevHash = prev ? prev.row_hash : "GENESIS";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const detailStr = JSON.stringify(detail);
  const hashInput = prevHash + action + timestamp + detailStr + instanceId + String(licenseId);
  const rowHash = await sha256(hashInput);
  await db.prepare(`
    INSERT INTO license_audit_logs (license_id, instance_id, action, detail, prev_hash, row_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(licenseId, instanceId, action, detailStr, prevHash, rowHash, timestamp).run();
}
__name(createAuditLog, "createAuditLog");
var EDITIONS = {
  basic: { name: "\u57FA\u7840\u7248", max_terminals: 1, max_products: 5e3, max_members: 2e3, features: ["base"] },
  standard: { name: "\u6807\u51C6\u7248", max_terminals: 3, max_products: 1e4, max_members: 5e3, features: ["base", "member", "promotion"] },
  premium: { name: "\u9AD8\u7EA7\u7248", max_terminals: 10, max_products: 5e4, max_members: 2e4, features: ["base", "member", "promotion", "report", "stock", "supplier"] },
  enterprise: { name: "\u4F01\u4E1A\u7248", max_terminals: -1, max_products: -1, max_members: -1, features: ["*"] }
};

// src/routes/auth.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_utils2();

// src/middleware/auth.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_utils2();
async function authenticate(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ code: 40100, message: "\u672A\u767B\u5F55\uFF0C\u8BF7\u5148\u767B\u5F55" }, 401);
  }
  const token = authHeader.split(" ")[1];
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ code: 40101, message: "\u767B\u5F55\u5DF2\u8FC7\u671F\u6216\u65E0\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
  }
  c.set("admin", { id: payload.id, username: payload.username, role: payload.role });
  await next();
}
__name(authenticate, "authenticate");

// src/routes/auth.js
var router = new Hono2();
router.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ code: 4e4, message: "\u8BF7\u8F93\u5165\u7528\u6237\u540D\u548C\u5BC6\u7801" }, 400);
  }
  const db = c.env.DB;
  const admin = await db.prepare(
    "SELECT * FROM admins WHERE username = ? AND status = 'active'"
  ).bind(username).first();
  if (!admin) {
    return c.json({ code: 40100, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return c.json({ code: 40100, message: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  await db.prepare("UPDATE admins SET last_login = datetime('now') WHERE id = ?").bind(admin.id).run();
  const token = await createJWT(
    { id: admin.id, username: admin.username, role: admin.role },
    c.env.JWT_SECRET
  );
  return c.json({
    data: {
      token,
      admin: { id: admin.id, username: admin.username, role: admin.role }
    },
    message: "\u767B\u5F55\u6210\u529F"
  });
});
router.get("/me", authenticate, async (c) => {
  const admin = c.get("admin");
  return c.json({ data: admin });
});
var auth_default = router;

// src/routes/licenses.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var router2 = new Hono2();
router2.use("*", authenticate);
router2.get("/dashboard", async (c) => {
  const stats = await getDashboardStats(c.env.DB);
  return c.json({ data: stats });
});
router2.get("/licenses", async (c) => {
  const { page, pageSize, status, keyword } = c.req.query();
  const result = await getLicenseList(c.env.DB, {
    page: parseInt(page) || 1,
    pageSize: parseInt(pageSize) || 20,
    status,
    keyword
  });
  return c.json({ data: result });
});
router2.post("/licenses", async (c) => {
  const body = await c.req.json();
  const { product_edition, valid_days } = body;
  if (!product_edition || !valid_days) {
    return c.json({ code: 4e4, message: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570\uFF08\u4EA7\u54C1\u7248\u672C\u3001\u6709\u6548\u5929\u6570\uFF09" }, 400);
  }
  const result = await createLicense(c.env.DB, {
    product_edition,
    valid_days: parseInt(valid_days),
    max_stores: body.max_stores,
    max_terminals: body.max_terminals,
    max_products: body.max_products,
    max_members: body.max_members,
    features: body.features,
    note: body.note,
    customer_name: body.customer_name,
    customer_contact: body.customer_contact,
    bind_mode: body.bind_mode
  });
  return c.json({ data: result, message: "\u6388\u6743\u7801\u521B\u5EFA\u6210\u529F" });
});
router2.get("/licenses/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const result = await getLicenseDetail(c.env.DB, id);
  if (!result) {
    return c.json({ code: 40400, message: "\u6388\u6743\u7801\u4E0D\u5B58\u5728" }, 404);
  }
  return c.json({ data: result });
});
router2.post("/licenses/:id/revoke", async (c) => {
  const id = parseInt(c.req.param("id"));
  const result = await revokeLicense(c.env.DB, id);
  if (result.error) {
    return c.json({ code: 40400, message: result.message }, 404);
  }
  return c.json({ data: result, message: "\u6388\u6743\u7801\u5DF2\u540A\u9500" });
});
var licenses_default = router2;

// src/routes/api-v1.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var router3 = new Hono2();
router3.post("/v1/activate", async (c) => {
  const { license_key, hardware_fingerprint, fingerprint_detail, store_name } = await c.req.json();
  if (!license_key || !hardware_fingerprint) {
    return c.json({ code: 4e4, message: "\u7F3A\u5C11\u5FC5\u8981\u53C2\u6570" }, 400);
  }
  const result = await activateLicense(
    c.env.DB,
    license_key,
    hardware_fingerprint,
    fingerprint_detail || {},
    store_name || "\u9ED8\u8BA4\u95E8\u5E97"
  );
  if (result.error) {
    return c.json({ code: result.code, message: result.message }, result.status);
  }
  return c.json({ data: result });
});
router3.post("/v1/heartbeat", async (c) => {
  const { instance_id, hardware_fingerprint } = await c.req.json();
  if (!instance_id) {
    return c.json({ code: 4e4, message: "\u7F3A\u5C11\u5B9E\u4F8B ID" }, 400);
  }
  const result = await heartbeatLicense(c.env.DB, instance_id, hardware_fingerprint || "");
  return c.json({ data: result });
});
router3.get("/v1/status/:instanceId", async (c) => {
  const instanceId = c.req.param("instanceId");
  const result = await getInstanceStatus(c.env.DB, instanceId);
  return c.json({ data: result });
});
var api_v1_default = router3;

// src/routes/website.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var TOKENS = {
  "--bg-primary": "#0B0F19",
  "--bg-secondary": "#111827",
  "--bg-card": "#1A2332",
  "--bg-card-hover": "#1E2A3D",
  "--bg-section": "#0F1522",
  "--text-primary": "#F1F5F9",
  "--text-secondary": "#94A3B8",
  "--text-muted": "#64748B",
  "--accent": "#3B82F6",
  "--accent-hover": "#60A5FA",
  "--accent-glow": "rgba(59,130,246,0.25)",
  "--accent-secondary": "#06B6D4",
  "--border": "#1E293B",
  "--radius-sm": "6px",
  "--radius-md": "12px",
  "--radius-lg": "20px",
  "--shadow-sm": "0 1px 3px rgba(0,0,0,0.3)",
  "--shadow-md": "0 4px 20px rgba(0,0,0,0.4)",
  "--shadow-lg": "0 8px 40px rgba(0,0,0,0.5)",
  "--shadow-glow": "0 0 30px rgba(59,130,246,0.15)",
  "--transition": "0.3s cubic-bezier(0.4,0,0.2,1)",
  "--font-sans": "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans SC','PingFang SC',sans-serif",
  "--font-mono": "'JetBrains Mono','Fira Code',monospace"
};
function buildCSS() {
  const vars = Object.entries(TOKENS).map(([k, v]) => `${k}:${v}`).join(";");
  return `:root{${vars}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-sans);background:var(--bg-primary);color:var(--text-primary);line-height:1.7;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-decoration:none;transition:color var(--transition)}
a:hover{color:var(--accent-hover)}
img{max-width:100%}

/* Container */
.container{max-width:1120px;margin:0 auto;padding:0 24px;width:100%}

/* ===== Navigation ===== */
nav{background:rgba(11,15,25,0.85);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border-bottom:1px solid rgba(30,41,59,0.6);position:sticky;top:0;z-index:1000;height:68px}
nav .container{display:flex;align-items:center;justify-content:space-between;height:100%}
nav .logo{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:800;color:var(--text-primary);letter-spacing:-0.5px}
nav .logo svg{width:32px;height:32px}
nav .logo span{color:var(--accent);background:linear-gradient(135deg,var(--accent),var(--accent-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:32px;align-items:center}
.nav-links a{color:var(--text-secondary);font-size:14px;font-weight:500;position:relative;padding:4px 0}
.nav-links a::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:2px;background:var(--accent);transition:width var(--transition);border-radius:2px}
.nav-links a:hover::after,.nav-links a.active::after{width:100%}
.nav-links a:hover{color:var(--text-primary)}
.nav-links a.active{color:var(--accent);font-weight:600}
.nav-links .btn-nav{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:10px 24px;border-radius:var(--radius-md);font-weight:600;font-size:14px;border:1px solid rgba(59,130,246,0.3);transition:all var(--transition)}
.nav-links .btn-nav:hover{box-shadow:var(--shadow-glow);transform:translateY(-1px);color:#fff}
.nav-links .btn-nav::after{display:none}
.nav-toggle{display:none;cursor:pointer;width:28px;height:20px;position:relative;z-index:1001}
.nav-toggle span{display:block;width:100%;height:2px;background:var(--text-primary);position:absolute;transition:all var(--transition);border-radius:2px}
.nav-toggle span:nth-child(1){top:0}
.nav-toggle span:nth-child(2){top:9px}
.nav-toggle span:nth-child(3){top:18px}
.nav-toggle.open span:nth-child(1){transform:translateY(9px)rotate(45deg)}
.nav-toggle.open span:nth-child(2){opacity:0}
.nav-toggle.open span:nth-child(3){transform:translateY(-9px)rotate(-45deg)}

/* ===== Hero ===== */
.hero{position:relative;padding:120px 0 100px;text-align:center;overflow:hidden;background:var(--bg-primary)}
.hero::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(ellipse 600px 400px at 50% 30%,rgba(59,130,246,0.08),transparent),radial-gradient(ellipse 400px 300px at 70% 60%,rgba(6,182,212,0.06),transparent);pointer-events:none;animation:heroPulse 8s ease-in-out infinite alternate}
@keyframes heroPulse{0%{transform:scale(1)rotate(0deg)}100%{transform:scale(1.05)rotate(2deg)}}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(59,130,246,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03)1px,transparent 1px);background-size:60px 60px;pointer-events:none;mask-image:radial-gradient(ellipse 60% 50% at 50% 30%,black,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 30%,black,transparent 70%)}
.hero .container{position:relative;z-index:1}
.hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.2);border-radius:20px;padding:6px 16px;font-size:13px;color:var(--accent);margin-bottom:28px}
.hero-badge .dot{width:6px;height:6px;background:#22C55E;border-radius:50%;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.hero h1{font-size:clamp(36px,5vw,60px);font-weight:800;line-height:1.15;margin-bottom:20px;letter-spacing:-1px}
.hero h1 .gradient{background:linear-gradient(135deg,var(--accent),var(--accent-secondary),var(--accent));background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:gradientShift 4s ease-in-out infinite}
@keyframes gradientShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.hero p{font-size:clamp(16px,1.3vw,19px);color:var(--text-secondary);max-width:600px;margin:0 auto 36px;line-height:1.7}
.hero .btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.hero .btns .primary{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:14px 36px;border-radius:var(--radius-md);font-weight:700;font-size:16px;display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(59,130,246,0.3);transition:all var(--transition);box-shadow:0 4px 14px rgba(59,130,246,0.25)}
.hero .btns .primary:hover{box-shadow:0 6px 24px rgba(59,130,246,0.35);transform:translateY(-2px)}
.hero .btns .secondary{background:rgba(255,255,255,0.05);color:var(--text-primary);padding:14px 36px;border-radius:var(--radius-md);font-weight:600;font-size:16px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);transition:all var(--transition)}
.hero .btns .secondary:hover{border-color:var(--accent);color:var(--accent);background:rgba(59,130,246,0.08)}
.hero-stats{display:flex;justify-content:center;gap:48px;margin-top:60px;flex-wrap:wrap}
.hero-stat{text-align:center}
.hero-stat .num{font-size:36px;font-weight:800;background:linear-gradient(135deg,var(--text-primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-stat .label{font-size:13px;color:var(--text-muted);margin-top:4px}

/* ===== Fade In Scroll ===== */
.fade-up{opacity:0;transform:translateY(30px);transition:opacity 0.6s ease,transform 0.6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}
.stagger-1{transition-delay:0.1s!important}
.stagger-2{transition-delay:0.2s!important}
.stagger-3{transition-delay:0.3s!important}
.stagger-4{transition-delay:0.4s!important}

/* ===== Sections ===== */
section{padding:100px 0}
.section-dark{background:var(--bg-secondary)}
.section-alt{background:var(--bg-section)}
.section-title{font-size:clamp(26px,2.8vw,36px);font-weight:800;text-align:center;margin-bottom:12px;letter-spacing:-0.5px}
.section-title .highlight{background:linear-gradient(135deg,var(--accent),var(--accent-secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.section-subtitle{text-align:center;color:var(--text-secondary);font-size:16px;margin-bottom:56px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.7}

/* ===== Features ===== */
.features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.feature-card{background:var(--bg-card);border-radius:var(--radius-md);padding:32px;border:1px solid var(--border);transition:all var(--transition);position:relative;overflow:hidden}
.feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:0;transition:opacity var(--transition)}
.feature-card:hover{background:var(--bg-card-hover);transform:translateY(-4px);border-color:rgba(59,130,246,0.2);box-shadow:var(--shadow-glow)}
.feature-card:hover::before{opacity:1}
.feature-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px;position:relative}
.feature-icon.glow-blue{background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.15)}
.feature-icon.glow-cyan{background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.15)}
.feature-icon.glow-green{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.15)}
.feature-icon.glow-purple{background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.15)}
.feature-icon.glow-amber{background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.15)}
.feature-icon.glow-pink{background:rgba(236,72,153,0.12);border:1px solid rgba(236,72,153,0.15)}
.feature-card h3{font-size:18px;font-weight:700;margin-bottom:10px}
.feature-card p{font-size:14px;color:var(--text-secondary);line-height:1.7}

/* ===== Stats Counter ===== */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.stat-card{background:var(--bg-card);border-radius:var(--radius-md);padding:36px 24px;text-align:center;border:1px solid var(--border);transition:all var(--transition)}
.stat-card:hover{box-shadow:var(--shadow-glow);border-color:rgba(59,130,246,0.2)}
.stat-card .num{font-size:clamp(32px,3vw,44px);font-weight:800;background:linear-gradient(135deg,var(--text-primary),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.stat-card .label{font-size:14px;color:var(--text-muted)}
.stat-card .suffix{font-size:20px;color:var(--accent);-webkit-text-fill-color:var(--accent)}

/* ===== Pricing ===== */
.pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;align-items:start}
.pricing-card{background:var(--bg-card);border-radius:var(--radius-md);padding:36px 28px;border:1px solid var(--border);transition:all var(--transition);position:relative}
.pricing-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-glow)}
.pricing-card.featured{border-color:var(--accent);background:linear-gradient(135deg,var(--bg-card),rgba(59,130,246,0.06));box-shadow:0 0 40px rgba(59,130,246,0.08)}
.pricing-card.featured::before{content:'\u63A8\u8350';position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:4px 18px;border-radius:12px;font-size:12px;font-weight:700;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(59,130,246,0.3)}
.pricing-card .plan-name{font-size:15px;font-weight:600;color:var(--text-muted);margin-bottom:4px}
.pricing-card .price{font-size:42px;font-weight:800;margin:12px 0 4px;letter-spacing:-1px}
.pricing-card .price .currency{font-size:20px;vertical-align:super}
.pricing-card .price .period{font-size:14px;color:var(--text-muted);font-weight:400}
.pricing-card .price-desc{font-size:13px;color:var(--text-muted);margin-bottom:20px}
.pricing-card ul{list-style:none;padding:0;margin:20px 0 28px}
.pricing-card ul li{padding:10px 0;font-size:14px;color:var(--text-secondary);border-bottom:1px solid rgba(30,41,59,0.5);display:flex;align-items:center;gap:10px}
.pricing-card ul li:last-child{border-bottom:none}
.pricing-card ul li .check{color:#22C55E;font-weight:700}
.pricing-card .btn{display:block;text-align:center;padding:12px;border-radius:var(--radius-md);font-weight:600;font-size:15px;transition:all var(--transition)}
.pricing-card .btn-outline{background:rgba(255,255,255,0.04);border:1px solid var(--border);color:var(--text-primary)}
.pricing-card .btn-outline:hover{background:rgba(59,130,246,0.1);border-color:var(--accent);color:var(--accent)}
.pricing-card.featured .btn-primary{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;border:1px solid rgba(59,130,246,0.3);box-shadow:0 4px 14px rgba(59,130,246,0.25)}
.pricing-card.featured .btn-primary:hover{box-shadow:0 6px 24px rgba(59,130,246,0.35);transform:translateY(-1px)}

/* ===== CTA ===== */
.cta-section{position:relative;overflow:hidden;padding:100px 0;text-align:center}
.cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 800px 400px at 50% 50%,rgba(59,130,246,0.1),transparent);pointer-events:none}
.cta-section .container{position:relative;z-index:1}
.cta-section h2{font-size:clamp(28px,3vw,40px);font-weight:800;margin-bottom:14px}
.cta-section p{color:var(--text-secondary);font-size:16px;margin-bottom:32px;max-width:500px;margin-left:auto;margin-right:auto}
.cta-section .btn-cta{background:linear-gradient(135deg,var(--accent),#2563EB);color:#fff;padding:16px 44px;border-radius:var(--radius-md);font-weight:700;font-size:17px;display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(59,130,246,0.3);box-shadow:0 4px 20px rgba(59,130,246,0.25);transition:all var(--transition)}
.cta-section .btn-cta:hover{box-shadow:0 8px 32px rgba(59,130,246,0.35);transform:translateY(-2px)}

/* ===== Footer ===== */
footer{background:var(--bg-secondary);border-top:1px solid var(--border);padding:60px 0 32px}
footer .grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px}
footer .brand-desc{font-size:14px;color:var(--text-muted);line-height:1.8;margin-top:12px;max-width:300px}
footer h4{color:var(--text-primary);font-size:15px;font-weight:700;margin-bottom:18px;letter-spacing:-0.3px}
footer a{display:block;font-size:14px;color:var(--text-muted);padding:5px 0;transition:color var(--transition)}
footer a:hover{color:var(--accent)}
footer .social{display:flex;gap:12px;margin-top:16px}
footer .social a{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;padding:0;transition:all var(--transition)}
footer .social a:hover{background:rgba(59,130,246,0.1);border-color:var(--accent);color:var(--accent)}
footer .bottom{border-top:1px solid var(--border);margin-top:40px;padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
footer .bottom span{font-size:13px;color:var(--text-muted)}

/* ===== Docs ===== */
.docs-page{padding:60px 0;max-width:860px;margin:0 auto}
.docs-page h1{font-size:clamp(28px,3vw,38px);font-weight:800;margin-bottom:8px;letter-spacing:-0.5px}
.docs-page .lead{color:var(--text-secondary);font-size:16px;margin-bottom:48px}
.docs-page h2{font-size:22px;font-weight:700;margin:40px 0 16px;padding-bottom:10px;border-bottom:1px solid var(--border);color:var(--text-primary)}
.docs-page h3{font-size:17px;font-weight:600;margin:28px 0 10px;color:var(--accent)}
.docs-page p{color:var(--text-secondary);margin-bottom:14px;line-height:1.8;font-size:15px}
.docs-page code{background:rgba(59,130,246,0.08);padding:2px 8px;border-radius:4px;font-size:13px;font-family:var(--font-mono);color:var(--accent)}
.docs-page pre{background:var(--bg-card);color:var(--text-primary);padding:20px 24px;border-radius:var(--radius-md);overflow-x:auto;margin-bottom:20px;font-size:13px;line-height:1.6;font-family:var(--font-mono);border:1px solid var(--border)}
.docs-page .endpoint{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:10px 16px;background:rgba(59,130,246,0.04);border-radius:var(--radius-sm);border:1px solid var(--border)}
.docs-page .method{background:var(--accent);color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;text-transform:uppercase}
.docs-page .method.get{background:#22C55E}
.docs-page .method.post{background:var(--accent)}
.docs-page .method.del{background:#EF4444}
.docs-page .tip-box{background:rgba(59,130,246,0.06);border:1px solid rgba(59,130,246,0.15);border-radius:var(--radius-md);padding:20px 24px;margin:32px 0}
.docs-page .tip-box strong{color:var(--accent)}

/* ===== Page Hero ===== */
.page-hero{padding:80px 0 60px;text-align:center;background:var(--bg-primary);border-bottom:1px solid var(--border)}
.page-hero h1{font-size:clamp(28px,3vw,40px);font-weight:800;margin-bottom:8px}
.page-hero p{color:var(--text-secondary);font-size:16px}

/* ===== Feature detail list ===== */
.feature-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
@media(max-width:768px){.feature-detail-grid{grid-template-columns:1fr}}

/* ===== Responsive ===== */
@media(max-width:768px){
  nav .container{padding:0 16px}
  .nav-links{position:fixed;top:0;right:-280px;width:280px;height:100vh;background:var(--bg-secondary);flex-direction:column;gap:8px;padding:80px 24px 24px;transition:right 0.3s ease;border-left:1px solid var(--border);align-items:stretch}
  .nav-links.open{right:0}
  .nav-toggle{display:block}
  .nav-links .btn-nav{text-align:center;margin-top:8px}
  .hero{padding:80px 0 60px}
  .hero-stats{gap:24px;margin-top:40px}
  .hero-stat .num{font-size:28px}
  .features-grid,.pricing-grid,.stats-row{grid-template-columns:1fr;gap:16px}
  .pricing-grid{grid-template-columns:1fr;max-width:360px;margin:0 auto}
  section{padding:60px 0}
  footer .grid{grid-template-columns:1fr 1fr;gap:24px}
  .docs-page pre{font-size:12px;padding:14px}
  .section-subtitle{margin-bottom:36px}
  .hero h1{font-size:clamp(28px,7vw,36px)}
}
@media(min-width:769px)and(max-width:1024px){
  .features-grid,.stats-row{grid-template-columns:repeat(2,1fr)}
  .pricing-grid{grid-template-columns:repeat(2,1fr);max-width:600px;margin:0 auto}
}`;
}
__name(buildCSS, "buildCSS");
function navComponent(currentPath, env2) {
  const adminUrl = env2?.ADMIN_URL || "/admin";
  const links = [
    { href: "/", label: "\u9996\u9875", exact: true },
    { href: "/features", label: "\u529F\u80FD" },
    { href: "/pricing", label: "\u5B9A\u4EF7" },
    { href: "/docs", label: "\u5F00\u53D1\u6587\u6863" }
  ];
  const navLinks = links.map((l) => {
    const active = l.exact ? currentPath === "/" : currentPath.startsWith(l.href);
    return `<a href="${l.href}" class="${active ? "active" : ""}">${l.label}</a>`;
  }).join("");
  return `<nav>
  <div class="container">
    <a href="/" class="logo">
      <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#lg)"/><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#06B6D4"/></linearGradient></defs><text x="5" y="23" fill="#fff" font-size="20" font-weight="800" font-family="sans-serif">S</text></svg>
      Shou<span>Yin</span>POS
    </a>
    <div class="nav-links" id="navMenu">
      ${navLinks}
      <a href="${adminUrl}" class="btn-nav" target="_blank">\u7BA1\u7406\u540E\u53F0 \u2192</a>
    </div>
    <div class="nav-toggle" id="navToggle" onclick="toggleNav()">
      <span></span><span></span><span></span>
    </div>
  </div>
</nav>`;
}
__name(navComponent, "navComponent");
function footerComponent(env2) {
  const adminUrl = env2?.ADMIN_URL || "/admin";
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return `<footer>
  <div class="container">
    <div class="grid">
      <div>
        <h4>ShouYinPOS</h4>
        <p class="brand-desc">\u4E13\u4E1A\u7684\u5E97\u94FA\u6536\u94F6\u7BA1\u7406\u7CFB\u7EDF\u3002\u652F\u6301\u591A\u95E8\u5E97\u3001\u591A\u7EC8\u7AEF\u3001\u591A\u652F\u4ED8\u65B9\u5F0F\u3002\u5546\u54C1\u7BA1\u7406\u3001\u4F1A\u5458\u8425\u9500\u3001\u5E93\u5B58\u7BA1\u7406\u3001\u7ECF\u8425\u62A5\u8868\u4E00\u7AD9\u5F0F\u8986\u76D6\u3002</p>
        <div class="social">
          <a href="mailto:support@example.com" title="\u90AE\u7BB1">\u2709</a>
          <a href="#" title="\u5FAE\u4FE1">\u{1F4AC}</a>
          <a href="/docs" title="\u6587\u6863">\u{1F4C4}</a>
        </div>
      </div>
      <div>
        <h4>\u4EA7\u54C1</h4>
        <a href="/features">\u529F\u80FD\u7279\u6027</a>
        <a href="/pricing">\u5B9A\u4EF7\u65B9\u6848</a>
        <a href="/docs">\u5F00\u53D1\u6587\u6863</a>
      </div>
      <div>
        <h4>\u652F\u6301</h4>
        <a href="/docs">API \u6587\u6863</a>
        <a href="mailto:support@example.com">\u8054\u7CFB\u6211\u4EEC</a>
        <a href="#">\u5E38\u89C1\u95EE\u9898</a>
      </div>
      <div>
        <h4>\u7BA1\u7406</h4>
        <a href="${adminUrl}">\u7BA1\u7406\u540E\u53F0</a>
        <a href="/docs#api">API \u53C2\u8003</a>
        <a href="/pricing">\u5B9A\u4EF7</a>
      </div>
    </div>
    <div class="bottom">
      <span>\xA9 ${year} ShouYinPOS. All rights reserved.</span>
      <span>Built on Cloudflare Workers</span>
    </div>
  </div>
</footer>`;
}
__name(footerComponent, "footerComponent");
function clientJS() {
  return `<script>
document.addEventListener('DOMContentLoaded',function(){
  /* IntersectionObserver \u6EDA\u52A8\u6DE1\u5165 */
  var fadeEls=document.querySelectorAll('.fade-up');
  if(fadeEls.length>0&&'IntersectionObserver'in window){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}})
    },{threshold:0.1});
    fadeEls.forEach(function(el){obs.observe(el)})
  }else{fadeEls.forEach(function(el){el.classList.add('visible')})}
  /* \u6570\u5B57\u6EDA\u52A8\u52A8\u753B */
  var countEls=document.querySelectorAll('.count-up');
  countEls.forEach(function(el){
    var target=parseInt(el.getAttribute('data-target'))||0;
    var duration=parseInt(el.getAttribute('data-duration'))||2000;
    var start=performance.now();
    function update(now){
      var elapsed=now-start;
      var progress=Math.min(elapsed/duration,1);
      var eased=1-Math.pow(1-progress,3);
      el.textContent=Math.round(eased*target);
      if(progress<1)requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  })
});
function toggleNav(){
  var menu=document.getElementById('navMenu');
  var toggle=document.getElementById('navToggle');
  if(menu&&toggle){menu.classList.toggle('open');toggle.classList.toggle('open')}
}
document.addEventListener('click',function(e){
  var menu=document.getElementById('navMenu');
  var toggle=document.getElementById('navToggle');
  if(menu&&menu.classList.contains('open')&&!menu.contains(e.target)&&e.target!==toggle&&!toggle.contains(e.target)){
    menu.classList.remove('open');toggle.classList.remove('open')
  }
});
<\/script>`;
}
__name(clientJS, "clientJS");
function shell(opts) {
  const siteName = opts.env?.SITE_NAME || "ShouYinPOS";
  const css = buildCSS();
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${opts.title} - ${siteName}</title>
<meta name="description" content="${opts.description}">
<style>${css}</style>
</head>
<body>
${navComponent(opts.currentPath, opts.env)}
${opts.content}
${footerComponent(opts.env)}
${clientJS()}
</body>
</html>`;
}
__name(shell, "shell");
function homePage(env2) {
  const adminUrl = env2?.ADMIN_URL || "/admin";
  const content = `
<section class="hero">
  <div class="hero-grid"></div>
  <div class="container">
    <div class="hero-badge fade-up"><span class="dot"></span> v2.0 \u2014 \u5168\u65B0 Cloudflare \u539F\u751F\u67B6\u6784</div>
    <h1 class="fade-up stagger-1">\u8F7B\u76C8\u9AD8\u6548\u7684<br><span class="gradient">\u5E97\u94FA\u6536\u94F6\u7BA1\u7406\u7CFB\u7EDF</span></h1>
    <p class="fade-up stagger-2">\u652F\u6301\u591A\u95E8\u5E97\u3001\u591A\u7EC8\u7AEF\u3001\u591A\u652F\u4ED8\u65B9\u5F0F\u3002\u63D0\u4F9B\u5546\u54C1\u7BA1\u7406\u3001\u4F1A\u5458\u8425\u9500\u3001\u5E93\u5B58\u7BA1\u7406\u3001\u7ECF\u8425\u62A5\u8868\u7B49\u5B8C\u6574\u529F\u80FD\u3002\u57FA\u4E8E Cloudflare Workers \u6784\u5EFA\uFF0C\u5168\u7403\u52A0\u901F\u3002</p>
    <div class="btns fade-up stagger-3">
      <a href="/pricing" class="primary">\u67E5\u770B\u5B9A\u4EF7 <span>\u2192</span></a>
      <a href="/features" class="secondary">\u4E86\u89E3\u66F4\u591A</a>
    </div>
    <div class="hero-stats fade-up stagger-4">
      <div class="hero-stat"><div class="num count-up" data-target="4" data-duration="1000">0</div><div class="label">\u4EA7\u54C1\u7248\u672C</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="50000" data-duration="2000">0</div><div class="label">\u6700\u5927\u5546\u54C1\u6570</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="99" data-duration="1500">0</div><div class="label">% \u6B63\u5E38\u8FD0\u884C</div></div>
      <div class="hero-stat"><div class="num count-up" data-target="10" data-duration="1000">0</div><div class="label">\u6BEB\u79D2\u54CD\u5E94</div></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">\u6838\u5FC3<span class="highlight">\u529F\u80FD</span></h2>
    <p class="section-subtitle fade-up">\u8986\u76D6\u5E97\u94FA\u7ECF\u8425\u7684\u6BCF\u4E00\u4E2A\u73AF\u8282\uFF0C\u4ECE\u6536\u94F6\u5230\u7BA1\u7406\u5168\u94FE\u8DEF\u8986\u76D6</p>
    <div class="features-grid">
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-blue">\u{1F6D2}</div><h3>\u5FEB\u901F\u6536\u94F6</h3><p>\u652F\u6301\u626B\u7801\u67AA\u3001\u641C\u7D22\u3001\u5206\u7C7B\u6D4F\u89C8\u7B49\u591A\u79CD\u5546\u54C1\u67E5\u627E\u65B9\u5F0F\uFF0C\u6DF7\u5408\u652F\u4ED8\u4E00\u5355\u5B8C\u6210\u3002</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">\u{1F3F7}\uFE0F</div><h3>\u5546\u54C1\u7BA1\u7406</h3><p>\u5B8C\u6574\u7684\u5546\u54C1\u4FE1\u606F\u7BA1\u7406\uFF0C\u652F\u6301\u591A\u89C4\u683C SKU\u3001\u7EC4\u5408\u5546\u54C1\u3001\u8BA1\u91CD\u5546\u54C1\u3001\u670D\u52A1\u7C7B\u5546\u54C1\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-green">\u{1F4B3}</div><h3>\u4F1A\u5458\u7CFB\u7EDF</h3><p>\u4F1A\u5458\u7B49\u7EA7\u3001\u79EF\u5206\u3001\u4F59\u989D\u3001\u4F18\u60E0\u5238\u3001\u8425\u9500\u6D3B\u52A8\u4E00\u7AD9\u5F0F\u7BA1\u7406\uFF0C\u63D0\u5347\u590D\u8D2D\u7387\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">\u{1F4CA}</div><h3>\u7ECF\u8425\u62A5\u8868</h3><p>\u9500\u552E\u989D\u8D8B\u52BF\u3001\u5546\u54C1\u6392\u884C\u3001\u5206\u7C7B\u5206\u6790\u3001\u5229\u6DA6\u7EDF\u8BA1\uFF0C\u6570\u636E\u9A71\u52A8\u7ECF\u8425\u51B3\u7B56\u3002</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-amber">\u{1F4E6}</div><h3>\u5E93\u5B58\u7BA1\u7406</h3><p>\u91C7\u8D2D\u5165\u5E93\u3001\u5E93\u5B58\u76D8\u70B9\u3001\u4FDD\u8D28\u671F\u9884\u8B66\u3001\u591A\u4ED3\u5E93\u7BA1\u7406\uFF0C\u5E93\u5B58\u6570\u636E\u5B9E\u65F6\u66F4\u65B0\u3002</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">\u{1F517}</div><h3>\u591A\u7EC8\u7AEF\u540C\u6B65</h3><p>\u652F\u6301\u591A\u53F0\u6536\u94F6\u7EC8\u7AEF\u540C\u65F6\u8FD0\u884C\uFF0C\u6570\u636E\u5B9E\u65F6\u540C\u6B65\u3002\u540E\u53F0\u53EF\u8FDC\u7A0B\u7BA1\u7406\u6240\u6709\u7EC8\u7AEF\u3002</p></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <h2 class="section-title fade-up">\u503C\u5F97<span class="highlight">\u4FE1\u8D56</span></h2>
    <p class="section-subtitle fade-up">\u5168\u7403\u52A0\u901F\u90E8\u7F72\uFF0C\u6BEB\u79D2\u7EA7\u54CD\u5E94</p>
    <div class="stats-row">
      <div class="stat-card fade-up"><div class="num count-up" data-target="99.9" data-duration="2000">0</div><div class="label">SLA \u4FDD\u969C</div></div>
      <div class="stat-card fade-up stagger-1"><div class="num"><span class="count-up" data-target="100" data-duration="1500">0</span><span class="suffix">k+</span></div><div class="label">\u65E5\u5747\u8BF7\u6C42\u5904\u7406</div></div>
      <div class="stat-card fade-up stagger-2"><div class="num"><span class="count-up" data-target="50" data-duration="1000">0</span><span class="suffix">+</span></div><div class="label">\u5168\u7403\u8FB9\u7F18\u8282\u70B9</div></div>
      <div class="stat-card fade-up stagger-3"><div class="num"><span class="count-up" data-target="10" data-duration="1000">0</span><span class="suffix">ms</span></div><div class="label">\u5E73\u5747\u54CD\u5E94\u65F6\u95F4</div></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">\u9009\u62E9<span class="highlight">\u65B9\u6848</span></h2>
    <p class="section-subtitle fade-up">\u7075\u6D3B\u5B9A\u4EF7\uFF0C\u6309\u9700\u9009\u62E9\uFF0C\u514D\u8D39\u5165\u95E8</p>
    <div class="pricing-grid">
      <div class="pricing-card fade-up">
        <div class="plan-name">\u57FA\u7840\u7248</div>
        <div class="price"><span class="currency">\xA5</span>0</div>
        <div class="price-desc">\u514D\u8D39\u4F7F\u7528</div>
        <ul>
          <li><span class="check">\u2713</span> 1 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 5,000 \u5546\u54C1\u7BA1\u7406</li>
          <li><span class="check">\u2713</span> 2,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u57FA\u7840\u6536\u94F6\u529F\u80FD</li>
          <li><span class="check">\u2713</span> \u57FA\u7840\u7ECF\u8425\u62A5\u8868</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-outline">\u514D\u8D39\u5F00\u59CB</a>
      </div>
      <div class="pricing-card featured fade-up stagger-1">
        <div class="plan-name">\u6807\u51C6\u7248</div>
        <div class="price"><span class="currency">\xA5</span>99<span class="period">/\u6708</span></div>
        <div class="price-desc">\u9002\u5408\u6210\u957F\u578B\u5E97\u94FA</div>
        <ul>
          <li><span class="check">\u2713</span> 3 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 10,000 \u5546\u54C1\u7BA1\u7406</li>
          <li><span class="check">\u2713</span> 5,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u4F1A\u5458 + \u8425\u9500\u529F\u80FD</li>
          <li><span class="check">\u2713</span> \u4F18\u60E0\u5238\u7CFB\u7EDF</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-primary">\u7ACB\u5373\u8BA2\u9605</a>
      </div>
      <div class="pricing-card fade-up stagger-2">
        <div class="plan-name">\u9AD8\u7EA7\u7248</div>
        <div class="price"><span class="currency">\xA5</span>299<span class="period">/\u6708</span></div>
        <div class="price-desc">\u9002\u5408\u5927\u89C4\u6A21\u8FD0\u8425</div>
        <ul>
          <li><span class="check">\u2713</span> 10 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 50,000 \u5546\u54C1\u7BA1\u7406</li>
          <li><span class="check">\u2713</span> 20,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u5168\u90E8\u529F\u80FD\u89E3\u9501</li>
          <li><span class="check">\u2713</span> \u5E93\u5B58 + \u4F9B\u5E94\u5546\u7BA1\u7406</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-outline">\u7ACB\u5373\u8BA2\u9605</a>
      </div>
      <div class="pricing-card fade-up stagger-3">
        <div class="plan-name">\u4F01\u4E1A\u7248</div>
        <div class="price">\u5B9A\u5236</div>
        <div class="price-desc">\u4E13\u5C5E\u89E3\u51B3\u65B9\u6848</div>
        <ul>
          <li><span class="check">\u2713</span> \u4E0D\u9650\u7EC8\u7AEF\u6570\u91CF</li>
          <li><span class="check">\u2713</span> \u4E0D\u9650\u5546\u54C1\u6570\u91CF</li>
          <li><span class="check">\u2713</span> \u4E0D\u9650\u4F1A\u5458\u6570\u91CF</li>
          <li><span class="check">\u2713</span> \u5168\u90E8\u9AD8\u7EA7\u529F\u80FD</li>
          <li><span class="check">\u2713</span> \u4E13\u5C5E\u6280\u672F\u652F\u6301</li>
        </ul>
        <a href="mailto:support@example.com" class="btn btn-outline">\u8054\u7CFB\u6211\u4EEC</a>
      </div>
    </div>
  </div>
</section>

<section class="cta-section section-dark" style="border-top:1px solid var(--border)">
  <div class="container">
    <h2 class="fade-up">\u51C6\u5907\u597D\u5F00\u59CB\u4E86\u5417\uFF1F</h2>
    <p class="fade-up stagger-1">\u514D\u8D39\u8BD5\u7528\uFF0C\u65E0\u9700\u4FE1\u7528\u5361\u3002\u57FA\u4E8E Cloudflare Workers \u67B6\u6784\uFF0C\u5168\u7403\u52A0\u901F\u90E8\u7F72\u3002</p>
    <div class="fade-up stagger-2"><a href="${adminUrl}" class="btn-cta">\u8FDB\u5165\u7BA1\u7406\u540E\u53F0 <span>\u2192</span></a></div>
  </div>
</section>`;
  return shell({ title: "\u9996\u9875", description: "\u4E13\u4E1A\u7684\u5E97\u94FA\u6536\u94F6\u7BA1\u7406\u7CFB\u7EDF - \u57FA\u4E8E Cloudflare Workers \u6784\u5EFA\uFF0C\u652F\u6301\u591A\u95E8\u5E97\u3001\u591A\u7EC8\u7AEF\u3001\u591A\u652F\u4ED8\u65B9\u5F0F", content, env: env2, currentPath: "/" });
}
__name(homePage, "homePage");
function featuresPage(env2) {
  const content = `
<section class="page-hero">
  <div class="container">
    <h1 class="fade-up">\u5B8C\u6574<span class="gradient">\u529F\u80FD\u7279\u6027</span></h1>
    <p class="fade-up stagger-1">\u4ECE\u6536\u94F6\u5230\u7BA1\u7406\uFF0C\u8986\u76D6\u5E97\u94FA\u8FD0\u8425\u5168\u573A\u666F</p>
  </div>
</section>

<section>
  <div class="container">
    <h2 class="section-title fade-up"><span class="highlight">\u6536\u94F6</span>\u529F\u80FD</h2>
    <p class="section-subtitle fade-up">\u6536\u94F6\u73AF\u8282\u7684\u9AD8\u6548\u4E0E\u51C6\u786E</p>
    <div class="features-grid">
      <div class="feature-card fade-up"><div class="feature-icon glow-blue">\u{1F4F7}</div><h3>\u5FEB\u901F\u626B\u7801</h3><p>\u652F\u6301\u6761\u7801/\u4E8C\u7EF4\u7801\u626B\u7801\u67AA\uFF0C\u5373\u626B\u5373\u552E\uFF0C\u65E0\u9700\u624B\u52A8\u8F93\u5165\u3002</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">\u{1F4B3}</div><h3>\u6DF7\u5408\u652F\u4ED8</h3><p>\u73B0\u91D1\u3001\u5FAE\u4FE1\u3001\u652F\u4ED8\u5B9D\u3001\u4F1A\u5458\u4F59\u989D\u3001\u4F18\u60E0\u5238\u81EA\u7531\u7EC4\u5408\u652F\u4ED8\u3002</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-green">\u{1F4CB}</div><h3>\u6302\u5355/\u53D6\u5355</h3><p>\u4E34\u65F6\u6302\u8D77\u5F53\u524D\u8BA2\u5355\uFF0C\u5904\u7406\u5B8C\u5176\u4ED6\u987E\u5BA2\u540E\u518D\u53D6\u5355\u7EE7\u7EED\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">\u{1F3A8}</div><h3>\u591A\u89C4\u683C\u5546\u54C1</h3><p>\u652F\u6301\u989C\u8272\u3001\u5C3A\u7801\u7B49\u591A\u89C4\u683C SKU\uFF0C\u81EA\u52A8\u5339\u914D\u4EF7\u683C\u548C\u5E93\u5B58\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-amber">\u2696\uFE0F</div><h3>\u8BA1\u91CD\u5546\u54C1</h3><p>\u652F\u6301\u7535\u5B50\u79E4\u8F93\u5165\uFF0C\u6309\u91CD\u91CF\u8BA1\u4EF7\uFF0C\u9002\u7528\u4E8E\u6563\u88C5/\u79F0\u91CD\u5546\u54C1\u3002</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">\u21A9</div><h3>\u9000\u6B3E\u5904\u7406</h3><p>\u652F\u6301\u6574\u5355\u9000\u6B3E\u548C\u90E8\u5206\u9000\u6B3E\uFF0C\u81EA\u52A8\u56DE\u6EDA\u5E93\u5B58\u548C\u7EDF\u8BA1\u6570\u636E\u3002</p></div>
    </div>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up"><span class="highlight">\u7BA1\u7406</span>\u529F\u80FD</h2>
    <p class="section-subtitle fade-up">\u540E\u53F0\u7BA1\u7406\uFF0C\u8FD0\u7B79\u5E37\u5E44</p>
    <div class="features-grid">
      <div class="feature-card fade-up"><div class="feature-icon glow-blue">\u{1F3F7}\uFE0F</div><h3>\u5546\u54C1\u7BA1\u7406</h3><p>\u5546\u54C1\u5206\u7C7B\u3001\u54C1\u724C\u3001\u6807\u7B7E\u3001\u56FE\u7247\u7BA1\u7406\uFF0C\u652F\u6301\u6279\u91CF\u5BFC\u5165\u5BFC\u51FA\u3002</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-cyan">\u{1F3AF}</div><h3>\u4F1A\u5458\u8425\u9500</h3><p>\u7B49\u7EA7\u4F53\u7CFB\u3001\u79EF\u5206\u89C4\u5219\u3001\u4F18\u60E0\u5238\u751F\u6210\u3001\u6EE1\u51CF\u6D3B\u52A8\u7075\u6D3B\u914D\u7F6E\u3002</p></div>
      <div class="feature-card fade-up stagger-1"><div class="feature-icon glow-green">\u26A0\uFE0F</div><h3>\u5E93\u5B58\u9884\u8B66</h3><p>\u8BBE\u7F6E\u5B89\u5168\u5E93\u5B58\uFF0C\u81EA\u52A8\u9884\u8B66\uFF0C\u9632\u6B62\u7F3A\u8D27\u5F71\u54CD\u9500\u552E\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-purple">\u{1F4C8}</div><h3>\u7ECF\u8425\u62A5\u8868</h3><p>\u65E5/\u5468/\u6708\u62A5\uFF0C\u5229\u6DA6\u5206\u6790\uFF0C\u5546\u54C1\u6392\u884C\uFF0C\u8D8B\u52BF\u56FE\u8868\u76F4\u89C2\u5C55\u793A\u3002</p></div>
      <div class="feature-card fade-up stagger-2"><div class="feature-icon glow-amber">\u{1F465}</div><h3>\u5458\u5DE5\u7BA1\u7406</h3><p>\u89D2\u8272\u6743\u9650\u3001\u5458\u5DE5\u8D26\u53F7\u3001PIN \u7801\u767B\u5F55\u3001\u73ED\u6B21\u7BA1\u7406\u4E00\u5E94\u4FF1\u5168\u3002</p></div>
      <div class="feature-card fade-up stagger-3"><div class="feature-icon glow-pink">\u{1F4E6}</div><h3>\u91C7\u8D2D\u7BA1\u7406</h3><p>\u91C7\u8D2D\u8BA2\u5355\u3001\u4F9B\u5E94\u5546\u7BA1\u7406\u3001\u5165\u5E93\u9A8C\u6536\u5B8C\u6574\u95ED\u73AF\u3002</p></div>
    </div>
  </div>
</section>`;
  return shell({ title: "\u529F\u80FD\u7279\u6027", description: "\u5E97\u94FA\u6536\u94F6\u7CFB\u7EDF\u7684\u5B8C\u6574\u529F\u80FD\u5217\u8868 - \u6536\u94F6 / \u5546\u54C1 / \u4F1A\u5458 / \u5E93\u5B58 / \u62A5\u8868", content, env: env2, currentPath: "/features" });
}
__name(featuresPage, "featuresPage");
function pricingPage(env2) {
  const adminUrl = env2?.ADMIN_URL || "/admin";
  const content = `
<section class="page-hero">
  <div class="container">
    <h1 class="fade-up">\u9009\u62E9<span class="gradient">\u9002\u5408\u60A8\u7684\u65B9\u6848</span></h1>
    <p class="fade-up stagger-1">\u7075\u6D3B\u5B9A\u4EF7\uFF0C\u6309\u9700\u9009\u62E9\uFF0C\u4ECE\u514D\u8D39\u5F00\u59CB</p>
  </div>
</section>

<section class="section-dark">
  <div class="container">
    <h2 class="section-title fade-up">\u5B9A\u4EF7<span class="highlight">\u65B9\u6848</span></h2>
    <p class="section-subtitle fade-up">\u900F\u660E\u5B9A\u4EF7\uFF0C\u65E0\u9690\u6027\u8D39\u7528</p>
    <div class="pricing-grid">
      <div class="pricing-card fade-up">
        <div class="plan-name">\u57FA\u7840\u7248</div>
        <div class="price"><span class="currency">\xA5</span>0</div>
        <div class="price-desc">\u9002\u5408\u5C0F\u578B\u5E97\u94FA</div>
        <ul>
          <li><span class="check">\u2713</span> 1 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 5,000 \u5546\u54C1</li>
          <li><span class="check">\u2713</span> 2,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u57FA\u7840\u6536\u94F6 + \u62A5\u8868</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-outline">\u514D\u8D39\u4F7F\u7528</a>
      </div>
      <div class="pricing-card featured fade-up stagger-1">
        <div class="plan-name">\u6807\u51C6\u7248</div>
        <div class="price"><span class="currency">\xA5</span>99<span class="period">/\u6708</span></div>
        <div class="price-desc">\u9002\u5408\u6210\u957F\u578B\u5E97\u94FA</div>
        <ul>
          <li><span class="check">\u2713</span> 3 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 10,000 \u5546\u54C1</li>
          <li><span class="check">\u2713</span> 5,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u4F1A\u5458 + \u8425\u9500 + \u4F18\u60E0\u5238</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-primary">\u7ACB\u5373\u8BA2\u9605</a>
      </div>
      <div class="pricing-card fade-up stagger-2">
        <div class="plan-name">\u9AD8\u7EA7\u7248</div>
        <div class="price"><span class="currency">\xA5</span>299<span class="period">/\u6708</span></div>
        <div class="price-desc">\u9002\u5408\u5927\u89C4\u6A21\u8FD0\u8425</div>
        <ul>
          <li><span class="check">\u2713</span> 10 \u53F0\u6536\u94F6\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> 50,000 \u5546\u54C1</li>
          <li><span class="check">\u2713</span> 20,000 \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u5168\u90E8\u529F\u80FD + \u5E93\u5B58\u7BA1\u7406</li>
        </ul>
        <a href="${adminUrl}" class="btn btn-outline">\u7ACB\u5373\u8BA2\u9605</a>
      </div>
      <div class="pricing-card fade-up stagger-3">
        <div class="plan-name">\u4F01\u4E1A\u7248</div>
        <div class="price">\u8054\u7CFB</div>
        <div class="price-desc">\u4E13\u5C5E\u5B9A\u5236</div>
        <ul>
          <li><span class="check">\u2713</span> \u4E0D\u9650\u7EC8\u7AEF</li>
          <li><span class="check">\u2713</span> \u4E0D\u9650\u5546\u54C1 + \u4F1A\u5458</li>
          <li><span class="check">\u2713</span> \u5168\u90E8\u9AD8\u7EA7\u529F\u80FD</li>
          <li><span class="check">\u2713</span> \u4E13\u5C5E\u6280\u672F\u652F\u6301</li>
        </ul>
        <a href="mailto:support@example.com" class="btn btn-outline">\u8054\u7CFB\u6211\u4EEC</a>
      </div>
    </div>
  </div>
</section>`;
  return shell({ title: "\u5B9A\u4EF7\u65B9\u6848", description: "\u9009\u62E9\u9002\u5408\u60A8\u5E97\u94FA\u7684\u5B9A\u4EF7\u65B9\u6848 - \u514D\u8D39\u57FA\u7840\u7248 / \u6807\u51C6\u7248 \xA599/\u6708 / \u9AD8\u7EA7\u7248 \xA5299/\u6708", content, env: env2, currentPath: "/pricing" });
}
__name(pricingPage, "pricingPage");
function docsPage(env2) {
  const content = `
<div class="docs-page">
  <h1 class="fade-up">\u5F00\u53D1<span class="gradient">\u6587\u6863</span></h1>
  <p class="lead fade-up stagger-1">\u6536\u94F6\u7CFB\u7EDF\u6388\u6743 API \u63A5\u5165\u6587\u6863</p>

  <h2>\u6388\u6743 API</h2>
  <p>\u6536\u94F6\u7CFB\u7EDF\u901A\u8FC7\u4EE5\u4E0B API \u4E0E\u6388\u6743\u7CFB\u7EDF\u901A\u4FE1\uFF0C\u5B8C\u6210\u6FC0\u6D3B\u548C\u5FC3\u8DF3\u68C0\u6D4B\u3002\u6240\u6709\u8BF7\u6C42 Content-Type \u4E3A <code>application/json</code>\u3002</p>

  <h3>\u5728\u7EBF\u6FC0\u6D3B</h3>
  <p>\u4F7F\u7528\u6388\u6743\u7801\u548C\u786C\u4EF6\u6307\u7EB9\u5B8C\u6210\u9996\u6B21\u6FC0\u6D3B\uFF0C\u8FD4\u56DE\u5B9E\u4F8B ID \u548C\u6388\u6743\u4FE1\u606F\u3002</p>
  <div class="endpoint"><span class="method post">POST</span><code>/api/v1/activate</code></div>
  <pre>{
  "license_key": "POS-XXXX-XXXX-XXXX-XXXX",
  "hardware_fingerprint": "sha256_fingerprint",
  "store_name": "\u5E97\u94FA\u540D\u79F0",
  "fingerprint_detail": { ... }
}</pre>

  <h3>\u5FC3\u8DF3\u4E0A\u62A5</h3>
  <p>\u5B9A\u671F\u4E0A\u62A5\u5FC3\u8DF3\uFF0C\u7EF4\u6301\u6388\u6743\u6709\u6548\u6027\u3002\u5EFA\u8BAE\u95F4\u9694 5-10 \u5206\u949F\u3002</p>
  <div class="endpoint"><span class="method post">POST</span><code>/api/v1/heartbeat</code></div>
  <pre>{
  "instance_id": "uuid_v4",
  "hardware_fingerprint": "sha256_fingerprint"
}</pre>

  <h3 id="api">\u67E5\u8BE2\u5B9E\u4F8B\u72B6\u6001</h3>
  <p>\u67E5\u8BE2\u6307\u5B9A\u5B9E\u4F8B\u7684\u6388\u6743\u72B6\u6001\u3002</p>
  <div class="endpoint"><span class="method get">GET</span><code>/api/v1/status/:instanceId</code></div>

  <h2>\u7BA1\u7406 API</h2>
  <p>\u7BA1\u7406\u540E\u53F0 API \u9700\u8981 JWT \u8BA4\u8BC1\uFF0C\u5728\u8BF7\u6C42\u5934\u4E2D\u643A\u5E26 <code>Authorization: Bearer &lt;token&gt;</code>\u3002</p>

  <h3>\u7BA1\u7406\u5458\u767B\u5F55</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/auth/login</code></div>
  <pre>{
  "username": "admin",
  "password": "your_password"
}</pre>

  <h3>\u521B\u5EFA\u6388\u6743\u7801</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/licenses</code></div>
  <pre>{
  "product_edition": "standard",
  "valid_days": 365,
  "customer_name": "\u5BA2\u6237\u540D\u79F0",
  "note": "\u5907\u6CE8"
}</pre>

  <h3>\u83B7\u53D6\u6388\u6743\u7801\u5217\u8868</h3>
  <div class="endpoint"><span class="method get">GET</span><code>/api/licenses?page=1&pageSize=20</code></div>

  <h3>\u540A\u9500\u6388\u6743\u7801</h3>
  <div class="endpoint"><span class="method post">POST</span><code>/api/licenses/:id/revoke</code></div>

  <div class="tip-box">
    <strong>\u{1F4A1} \u63D0\u793A\uFF1A</strong> \u6240\u6709\u7BA1\u7406 API \u9700\u8981\u5728\u8BF7\u6C42\u5934\u4E2D\u643A\u5E26 <code>Authorization: Bearer &lt;token&gt;</code>\u3002Token \u6709\u6548\u671F\u4E3A 8 \u5C0F\u65F6\uFF0C\u8FC7\u671F\u9700\u91CD\u65B0\u767B\u5F55\u3002
  </div>
</div>`;
  return shell({ title: "\u5F00\u53D1\u6587\u6863", description: "\u6388\u6743\u7CFB\u7EDF API \u5F00\u53D1\u6587\u6863 - \u5728\u7EBF\u6FC0\u6D3B / \u5FC3\u8DF3\u4E0A\u62A5 / \u6388\u6743\u7801\u7BA1\u7406", content, env: env2, currentPath: "/docs" });
}
__name(docsPage, "docsPage");

// src/index.js
var app = new Hono2();
app.use("*", cors({
  origin: "*"
}));
app.get("/", (c) => c.html(homePage(c.env)));
app.get("/features", (c) => c.html(featuresPage(c.env)));
app.get("/pricing", (c) => c.html(pricingPage(c.env)));
app.get("/docs", (c) => c.html(docsPage(c.env)));
app.get("/health", (c) => {
  return c.json({ status: "ok", service: "shouquan", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.route("/api/auth", auth_default);
app.route("/api", licenses_default);
app.route("/api", api_v1_default);
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ code: 40400, message: "\u63A5\u53E3\u4E0D\u5B58\u5728" }, 404);
  }
  return c.html(`<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif"><div style="text-align:center"><h1 style="font-size:72px;color:#1a1a2e">404</h1><p style="color:#888">\u9875\u9762\u4E0D\u5B58\u5728</p><a href="/" style="color:#0f3460">\u8FD4\u56DE\u9996\u9875</a></div></body></html>`);
});
app.onError((err, c) => {
  console.error("[Error]", err.message);
  const isProd = c.env.SITE_URL && !c.env.SITE_URL.includes("localhost");
  return c.json({ code: 5e4, message: isProd ? "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" : err.message }, 500);
});
var src_default = {
  async fetch(request, env2, ctx) {
    ctx.waitUntil(initDatabase(env2.DB, env2));
    return app.fetch(request, env2, ctx);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
