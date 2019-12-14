const { timeswipe, CMD } = require("./timeswipe-async");

module.exports = function registerTimeswipeNode(RED) {
  function TimeswipeNode(config) {
    RED.nodes.createNode(this, config);

    /**
     * Send message to the specified output
     * https://nodered.org/docs/creating-nodes/node-js#sending-messages
     */
    const send = (output, payload) => {
      const messages = [undefined, undefined, undefined];
      messages[output] = { payload };
      this.send(messages);
    };

    /**
     * Node-RED logger wrapper
     * https://nodered.org/docs/creating-nodes/node-js#logging-events
     */
    const log = (msg, level = "log") => {
      const logMethod = this[level];
      logMethod("timeswipe: " + msg);
    };

    /**
     * Update the node status
     * https://nodered.org/docs/creating-nodes/node-js#setting-status
     */
    const setStartedStatus = () => {
      this.status({ fill: "green", shape: "dot", text: "running" });
    };
    const setStoppedStatus = () => {
      this.status({ fill: "red", shape: "ring", text: "stoped" });
    };

    log("init");
    setStoppedStatus();
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
    const worker = timeswipe({
      ...settings,
      debug: true
    });

    log("setup data handler");
    worker.on("message", ({ output, payload }) => {
      setImmediate(() => {
        send(output, payload);
      });
    });

    log("setup error handler");
    worker.on("error", error => {
      log(error, "error");
      send("stderr", error);
    });

    log("setup close handler");
    this.on("close", async done => {
      await worker.terminate();
      setStoppedStatus();
      done();
    });

    log("setup input handler");
    this.on("input", msg => {
      switch (msg.payload && msg.payload.cmd) {
        case CMD.START:
          setStartedStatus();
          worker.postMessage({ cmd: CMD.START });
          break;
        case CMD.STOP:
          setStoppedStatus();
          worker.postMessage({ cmd: CMD.STOP });
          break;
        case CMD.SET_SETTINGS:
          worker.postMessage({ cmd: CMD.SET_SETTINGS, options: cmd.options });
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
  RED.nodes.registerType("timeswipe", TimeswipeNode);
};
