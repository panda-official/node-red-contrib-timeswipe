const timeswipe = require("timeswipe");

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
  SET_DRIVER_SETTINGS: "SET_DRIVER_SETTINGS",
  SET_NODE_SETTINGS: "SET_NODE_SETTINGS"
};

/**
 * Possible node statuses
 */
const STATUS = {
  RUNNING: "running",
  STOPPED: "stopped"
};

const BUFFER_TYPE = {
  TIME: "time",
  SAMPLES: "samples"
};

module.exports = function registerTimeswipeSensorsNode(RED) {
  function TimeswipeSensorsNode(config) {
    const node = this;
    RED.nodes.createNode(node, config);

    const settings = {
      mode: config.mode,
      bufferType: config.bufferType,
      bufferValue: parseInt(config.bufferValue, 10),
      sampleRate: parseInt(config.sampleRate, 10),
      sensorOffsets: [
        parseInt(config.sensorOffset0, 10),
        parseInt(config.sensorOffset1, 10),
        parseInt(config.sensorOffset2, 10),
        parseInt(config.sensorOffset3, 10)
      ],
      sensorGains: [
        parseFloat(config.sensorGain0),
        parseFloat(config.sensorGain1),
        parseFloat(config.sensorGain2),
        parseFloat(config.sensorGain3)
      ],
      sensorTransmissions: [
        parseFloat(config.sensorTransmission0),
        parseFloat(config.sensorTransmission1),
        parseFloat(config.sensorTransmission2),
        parseFloat(config.sensorTransmission3)
      ]
    };

    node._started = false;
    node._buffer = [];
    node._interval = null;

    /**
     * Send message to the specified output
     * https://nodered.org/docs/creating-nodes/node-js#sending-messages
     */
    function send(output, payload) {
      const messages = [undefined, undefined, undefined];

      if (output === OUTPUTS.stdout && node._started && settings.bufferType) {
        setImmediate(() => {
          switch (settings.bufferType) {
            case BUFFER_TYPE.TIME:
              node._buffer = node._buffer.concat(payload);
              if (!node._interval) {
                node._interval = setInterval(() => {
                  messages[output] = { payload: node._buffer };
                  node.send(messages);
                  node._buffer = [];
                }, settings.bufferValue);
              }
              break;
            case BUFFER_TYPE.SAMPLES:
              messages[output] = { payload };
              node.send(messages);
              break;
          }
        });
      } else {
        messages[output] = { payload };
        node.send(messages);
      }
    }

    /**
     * Node-RED logger wrapper
     * https://nodered.org/docs/creating-nodes/node-js#logging-events
     */
    function log(msg, level = "log") {
      const logMethod = node[level];
      logMethod(`timeswipe ${config.name || "sensors"}: ${msg}`);
    }

    /**
     * Update the node status
     * https://nodered.org/docs/creating-nodes/node-js#setting-status
     */
    function setRunningStatus() {
      node.status({ fill: "green", shape: "dot", text: STATUS.RUNNING });
    }
    function setStoppedStatus() {
      node.status({ fill: "red", shape: "ring", text: STATUS.STOPPED });
    }

    /**
     * Start the timeswipe.Start run loop and send results to the according output
     */
    function runLoop() {
      log("start the loop");
      setRunningStatus();
      node._started = true;
      timeswipe.Start((data, error) => {
        if (error) {
          send(OUTPUTS.stderr, error);
        } else if (data.length > 0) {
          send(OUTPUTS.stdout, data);
        }
      });
    }

    /**
     * Breaks the timeswipe loop
     */
    function stopLoop() {
      log("stop the loop");
      setStoppedStatus();
      timeswipe.Stop();
      node._started = false;

      setImmediate(() => {
        node._buffer = [];
        if (node._interval) {
          clearInterval(node._interval);
          node._interval = null;
        }
      });
    }

    /**
     * Update timeswipe settings
     *
     * @param {number} settings.mode – "PRIMARY", "NORM", or "DIGITAL"
     * @param {[number, number, number, number]} settings.sensorOffsets – Array of 4 uint16, [0, 0, 0, 0]
     * @param {[number, number, number, number]} settings.sensorGains – Array of 4 floats, [1.0, 1.0, 1.0, 1.0]
     * @param {[number, number, number, number]} settings.sensorTransmissions - Array of 4 floats, [1.0, 1.0, 1.0, 1.0]
     * @param {number} settings.bufferValue - float
     * @param {number} settings.sampleRate - float
     */
    function init(settings) {
      log(`set settings: mode: ${settings.mode}`);
      timeswipe.SetMode(settings.mode);
      log(`set settings: sensorOffsets: ${settings.sensorOffsets}`);
      timeswipe.SetSensorOffsets(...settings.sensorOffsets);
      log(`set settings: sensorGains: ${settings.sensorGains}`);
      timeswipe.SetSensorGains(...settings.sensorGains);
      log(`set settings: sensorTransmissions: ${settings.sensorTransmissions}`);
      timeswipe.SetSensorTransmissions(...settings.sensorTransmissions);
      log(`set settings: bufferValue: ${settings.bufferValue}`);
      timeswipe.SetBurstSize(settings.bufferValue);
      log(`set settings: sampleRate: ${settings.sampleRate}`);
      timeswipe.SetSampleRate(settings.sampleRate);
    }

    function setDriverSettings(settings) {
      log(`set settings: ${settings}`);
      timeswipe.SetSettings(JSON.stringify(settings))
    }

    function setNodeSettings(settings) {
      if (settings.mode) {
        log(`set settings: mode: ${settings.mode}`);
        timeswipe.SetMode(settings.mode);
      }
      if (settings.sensorOffsets) {
        log(`set settings: sensorOffsets: ${settings.sensorOffsets}`);
        timeswipe.SetSensorOffsets(...settings.sensorOffsets);
      }      
      if (settings.sensorGains) {
        log(`set settings: sensorGains: ${settings.sensorGains}`);
        timeswipe.SetSensorGains(...settings.sensorGains);
      }
      if (settings.sensorTransmissions) {
        log(`set settings: sensorTransmissions: ${settings.sensorTransmissions}`);
        timeswipe.SetSensorTransmissions(...settings.sensorTransmissions);
      }
      if (settings.bufferValue) {
        log(`set settings: bufferValue: ${settings.bufferValue}`);
        timeswipe.SetBurstSize(settings.bufferValue);
      }
      if (settings.sampleRate) {
        log(`set settings: sampleRate: ${settings.sampleRate}`);
        timeswipe.SetSampleRate(settings.sampleRate);
      }
    }

    // There starts the actual work
    log("init");
    setStoppedStatus();
    init(settings);

    log("setup error handler");
    timeswipe.onError(error => {
      log(error, "error");
      send(OUTPUTS.stderr, error);
    });

    // log("setup button handler");
    // timeswipe.onButton((pressed, counter) => {
    //   send(OUTPUTS.btn, { pressed, counter });
    // });

    log("setup close handler");
    node.on("close", stopLoop);

    log("setup input handler");
    node.on("input", msg => {
      switch (msg.payload && msg.payload.cmd) {
        case CMD.START:
          runLoop();
          break;
        case CMD.STOP:
          stopLoop();
          break;
        case CMD.SET_DRIVER_SETTINGS:
          setDriverSettings(msg.payload.options);
          break;
        case CMD.SET_NODE_SETTINGS:
          setNodeSettings(msg.payload.options);
          break;
        default:
          log(`${msg.payload && msg.payload.cmd}: unknown input`);
      }
    });
  }

  /**
   * Register timeswipe node with Node-RED
   * https://nodered.org/docs/creating-nodes/node-js#node-constructor
   */
  RED.nodes.registerType("timeswipe-sensors", TimeswipeSensorsNode);

  /**
   * Handle button click
   */
  RED.httpAdmin.post(
    "/timeswipe-sensors/:id",
    RED.auth.needsPermission("inject.write"),
    (req, res) => {
      const node = RED.nodes.getNode(req.params.id);
      if (node) {
        try {
          node.receive({
            payload: { cmd: node._started ? CMD.STOP : CMD.START }
          });
          res.sendStatus(200);
        } catch (error) {
          res.sendStatus(500);
          log(`Unexpected error: ${err.toString()}`, "error");
        }
      } else {
        res.sendStatus(404);
      }
    }
  );
};

