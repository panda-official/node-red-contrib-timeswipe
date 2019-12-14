const {
  Worker,
  isMainThread,
  workerData,
  parentPort
} = require("worker_threads");

/**
 * Node has 3 outputs:
 * 1. Data output - stdout
 * 2. Error output - stderr
 * 3. Button output - btn
 */
const OUTPUTS = { stdout: 0, stderr: 1, btn: 2 };

/**
 * Commands that worker can handle
 * Example cmd payload:
 * { cmd: CMD.START }
 */
const CMD = {
  START: "START",
  STOP: "STOP",
  SET_SETTINGS: "SET_SETTINGS"
};

module.exports.CMD = CMD;

if (isMainThread) {
  /**
   * In the main thread we create a new worker
   * and further interaction will be with this worker directly
   * via .on() and .postMessage methods.
   *
   * https://nodejs.org/docs/latest-v12.x/api/worker_threads.html
   */
  module.exports.timeswipe = function timeswipe(settings) {
    return new Worker(__filename, { workerData: settings });
  };
} else {
  /**
   * In the worker thread we do the actual job.
   * timeswipe.Start blocks the thread so we must move it into the worker thread
   * and communicated with the main one with messages
   */

  /**
   * Logger for debugging purposes.
   * Accepts the same args as the console.log()
   * https://developer.mozilla.org/en-US/docs/Web/API/Console/log
   */
  function log(...args) {
    if (workerData.debug) console.log("timeswipe worker:", ...args);
  }

  /**
   * SYNCHRONOUS sleep to pause the thread for rate limiting purposes.
   * Pause cannot be more than 50ms(timeswipe limit).
   *
   * @param {number} duration – Duration of the sleep in the milliseconds.
   */
  function sleep(duration) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, duration);
  }

  const timeswipe = require("timeswipe");

  /**
   * Start the timeswipe.Start run loop and send results to the according output
   * setImmediate wrapper used to run it after IO otherwise it will block the thread
   * immediately
   */
  function runLoop() {
    log("start the loop");
    setImmediate(() => {
      timeswipe.Start((data, error) => {
        if (error) {
          parentPort.postMessage({ output: OUTPUTS.stderr, payload: error });
        } else {
          parentPort.postMessage({ output: OUTPUTS.stdout, payload: data });
          sleep(50);
        }
      });
    });
  }

  /**
   * Breaks the timeswipe loop
   */
  function stopLoop() {
    log("stop the loop");
    timeswipe.Stop();
  }

  /**
   * Update timeswipe settings
   *
   * @param {number} settings.bridge – 0 or 1
   * @param {[number, number, number, number]} settings.sensorOffsets – Array of 4 uint16, [0, 0, 0, 0]
   * @param {[number, number, number, number]} settings.sensorGains – Array of 4 floats, [1.0, 1.0, 1.0, 1.0]
   * @param {[number, number, number, number]} settings.sensorTransmissions - Array of 4 floats, [1.0, 1.0, 1.0, 1.0]
   */
  function setSettings(settings) {
    log("set settings: bridge:", settings.bridge);
    timeswipe.SetBridge(settings.bridge);
    log("set settings: sensorOffsets:", settings.sensorOffsets);
    timeswipe.SetSensorOffsets(...settings.sensorOffsets);
    log("set settings: sensorGains:", settings.sensorGains);
    timeswipe.SetSensorGains(...settings.sensorGains);
    log("set settings: sensorTransmissions:", settings.sensorTransmissions);
    timeswipe.SetSensorTransmissions(...settings.sensorTransmissions);
  }

  log("set initial settings");
  setSettings(workerData);

  log("setup close handler");
  parentPort.once("close", stopLoop);

  log("setup message handler");
  parentPort.on("message", msg => {
    switch (msg.cmd) {
      case CMD.START:
        runLoop();
        break;
      case CMD.STOP:
        stopLoop();
        break;
      case CMD.SET_SETTINGS:
        settings(msg.options);
        break;
    }
  });

  log("setup error handler");
  timeswipe.onError(error => {
    parentPort.postMessage({ output: OUTPUTS.stderr, payload: error });
  });

  log("setup button handler");
  timeswipe.onButton((pressed, counter) => {
    parentPort.postMessage({
      output: OUTPUTS.btn,
      payload: { pressed, counter }
    });
  });
}
