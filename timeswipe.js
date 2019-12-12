const { timeswipe } = require("./timeswipe-async");

module.exports = function registerTimeswipeNode(RED) {
  function TimeswipeNode(config) {
    RED.nodes.createNode(this, config);
    this.status({ fill: "green", shape: "dot", text: "started" });

    const send = (output, payload) => {
      const messages = [undefined, undefined, undefined];
      messages[output] = { payload };
      this.send(messages);
    };

    const log = (msg, level = "log") => {
      const logMethod = this[level];
      logMethod("timeswipe: " + msg);
    };

    log("init");
    const settings = {
      bridge: config.bridge ? 1 : 0,
      sensorGains: [
        parseInt(config.sensorGain0, 10),
        parseInt(config.sensorGain1, 10),
        parseInt(config.sensorGain2, 10),
        parseInt(config.sensorGain3, 10)
      ],
      sensorOffsets: [
        parseFloat(config.sensorOffset0),
        parseFloat(config.sensorOffset1),
        parseFloat(config.sensorOffset2),
        parseFloat(config.sensorOffset3)
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
      this.status({ fill: "red", shape: "ring", text: "not started" });
      done();
    });

    log("looping");
  }

  RED.nodes.registerType("timeswipe", TimeswipeNode, {});
};
