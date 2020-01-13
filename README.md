# [TimeSwipe](https://www.npmjs.com/package/timeswipe) wrapper for Node-RED [![npm version](https://badge.fury.io/js/node-red-contrib-timeswipe.svg)](https://badge.fury.io/js/node-red-contrib-timeswipe)

## Prerequisites
- Node-Red Installation ([for Raspberry Pi](https://nodered.org/docs/getting-started/raspberrypi))
- Driver installation ([instructions](https://github.com/panda-official/TimeSwipe/tree/master/driver)) - latest driver for [download](https://github.com/panda-official/TimeSwipe/releases)
- Run Node-Red with root permission (`sudo`)

## Installation
```
npm install --save node-red-contrib-timeswipe`
```

## Example
```json 
[
  {
    "id": "5b34e7fb.c2072",
    "type": "tab",
    "label": "TimeSwipe",
    "disabled": false,
    "info": ""
  },
  {
    "id": "1f6909e7.d53ef6",
    "type": "timeswipe-sensors",
    "z": "5b34e7fb.c2072",
    "name": "sensor 1",
    "bridge": 0,
    "sensorOffset0": 0,
    "sensorOffset1": 0,
    "sensorOffset2": 0,
    "sensorOffset3": 0,
    "sensorGain0": 1,
    "sensorGain1": 1,
    "sensorGain2": 1,
    "sensorGain3": 1,
    "sensorTransmission0": 1,
    "sensorTransmission1": 1,
    "sensorTransmission2": 1,
    "sensorTransmission3": 1,
    "x": 360,
    "y": 140,
    "wires": [["b11e4c0f.f4c86"], ["77cff12c.00bee8"], ["4ceb22e8.b0383c"]]
  },
  {
    "id": "170a23c0.22df3c",
    "type": "inject",
    "z": "5b34e7fb.c2072",
    "name": "",
    "topic": "",
    "payload": "{\"cmd\":\"START\"}",
    "payloadType": "json",
    "repeat": "",
    "crontab": "",
    "once": false,
    "onceDelay": "0",
    "x": 140,
    "y": 80,
    "wires": [["1f6909e7.d53ef6"]]
  },
  {
    "id": "b74d1732.3832e8",
    "type": "inject",
    "z": "5b34e7fb.c2072",
    "name": "",
    "topic": "",
    "payload": "{\"cmd\": \"STOP\"}",
    "payloadType": "json",
    "repeat": "",
    "crontab": "",
    "once": true,
    "onceDelay": "10",
    "x": 150,
    "y": 200,
    "wires": [["1f6909e7.d53ef6"]]
  },
  {
    "id": "68be857b.269814",
    "type": "debug",
    "z": "5b34e7fb.c2072",
    "name": "",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "payload",
    "targetType": "msg",
    "x": 770,
    "y": 40,
    "wires": []
  },
  {
    "id": "77cff12c.00bee8",
    "type": "debug",
    "z": "5b34e7fb.c2072",
    "name": "",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "false",
    "x": 570,
    "y": 140,
    "wires": []
  },
  {
    "id": "4ceb22e8.b0383c",
    "type": "debug",
    "z": "5b34e7fb.c2072",
    "name": "",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "false",
    "x": 570,
    "y": 200,
    "wires": []
  },
  {
    "id": "b11e4c0f.f4c86",
    "type": "function",
    "z": "5b34e7fb.c2072",
    "name": "counter 1",
    "func": "let count = context.get('count')||0;\ncount += msg.payload.length;\n// store the value back\ncontext.set('count',count);\n\nreturn { payload: `counter 1: ${count}` };",
    "outputs": 1,
    "noerr": 0,
    "x": 570,
    "y": 40,
    "wires": [["68be857b.269814"]]
  }
]
```
