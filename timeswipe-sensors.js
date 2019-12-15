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
  SET_SETTINGS: "SET_SETTINGS"
};

module.exports = function registerTimeswipeSensorsNode(RED) {
  function TimeswipeSensorsNode(config) {
    const node = this;
    RED.nodes.createNode(node, config);

    const settings = {
      bridge: config.bridge ? 1 : 0,
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

    /**
     * Send message to the specified output
     * https://nodered.org/docs/creating-nodes/node-js#sending-messages
     */
    function send(output, payload) {
      const messages = [undefined, undefined, undefined];
      messages[output] = { payload };
      node.send(messages);
    }

    /**
     * Node-RED logger wrapper
     * https://nodered.org/docs/creating-nodes/node-js#logging-events
     */
    function log(msg, level = "log") {
      const logMethod = node[level];
      logMethod("timeswipe sensors: " + msg);
    }

    /**
     * Update the node status
     * https://nodered.org/docs/creating-nodes/node-js#setting-status
     */
    function setStartedStatus() {
      node.status({ fill: "green", shape: "dot", text: "running" });
    }
    function setStoppedStatus() {
      node.status({ fill: "red", shape: "ring", text: "stoped" });
    }

    /**
     * Start the timeswipe.Start run loop and send results to the according output
     */
    function runLoop() {
      log("start the loop");
      timeswipe.Start((data, error) => {
        if (error) {
          send(OUTPUTS.stderr, error);
        } else if (data.length > 0) {
          send(OUTPUTS.stdout, data);
        }
      });
      setStartedStatus();
    }

    /**
     * Breaks the timeswipe loop
     */
    function stopLoop() {
      log("stop the loop");
      timeswipe.Stop();
      setStoppedStatus();
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
      log(`set settings: bridge: ${settings.bridge}`);
      timeswipe.SetBridge(settings.bridge);
      log(`set settings: sensorOffsets: ${settings.sensorOffsets}`);
      timeswipe.SetSensorOffsets(...settings.sensorOffsets);
      log(`set settings: sensorGains: ${settings.sensorGains}`);
      timeswipe.SetSensorGains(...settings.sensorGains);
      log(`set settings: sensorTransmissions: ${settings.sensorTransmissions}`);
      timeswipe.SetSensorTransmissions(...settings.sensorTransmissions);
    }

    // There starts the actual work
    log("init");
    setStoppedStatus();
    setSettings(settings);

    log("setup error handler");
    timeswipe.onError(error => {
      log(error, "error");
      send(OUTPUTS.stderr, error);
    });

    log("setup button handler");
    timeswipe.onButton((pressed, counter) => {
      send(OUTPUTS.btn, { pressed, counter });
    });

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
        case CMD.SET_SETTINGS:
          setSettings(msg.payload.options);
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
};
