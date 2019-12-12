const {
  Worker,
  isMainThread,
  workerData,
  parentPort
} = require("worker_threads");

const OUTPUTS = { stdout: 0, stderr: 1, btn: 2 };

if (isMainThread) {
  module.exports.timeswipe = function timeswipe(settings) {
    return new Worker(__filename, { workerData: settings });
  };
} else {
  function log(...args) {
    if (workerData.debug) console.log("timeswipe worker:", ...args);
  }

  function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  const timeswipe = require("timeswipe");

  log("set settings: bridge:", workerData.bridge);
  timeswipe.SetBridge(workerData.bridge);
  log("set settings: sensorOffsets:", workerData.sensorOffsets);
  timeswipe.SetSensorOffsets(...workerData.sensorOffsets);
  log("set settings: sensorGains:", workerData.sensorGains);
  timeswipe.SetSensorGains(...workerData.sensorGains);
  log("set settings: sensorTransmissions:", workerData.sensorTransmissions);
  timeswipe.SetSensorTransmissions(...workerData.sensorTransmissions);

  log("setup close handler");
  parentPort.once("close", () => {
    timeswipe.Close();
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

  log("start the loop");
  // setImmediate(() => {
  //   timeswipe.Start(async (data, error) => {
  //     if (error) {
  //       parentPort.postMessage({ output: OUTPUTS.stderr, payload: error });
  //     } else {
  //       data.forEach(entry => {
  //         parentPort.postMessage({ output: OUTPUTS.stdout, payload: entry });
  //       });
  //     }
  //     await sleep(100);
  //   });
  // });
}
