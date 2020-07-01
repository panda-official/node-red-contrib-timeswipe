# [TimeSwipe](https://www.npmjs.com/package/timeswipe) wrapper for Node-RED [![npm version](https://badge.fury.io/js/node-red-contrib-timeswipe.svg)](https://badge.fury.io/js/node-red-contrib-timeswipe)

## Prerequisites
- Node-Red Installation ([for Raspberry Pi](https://nodered.org/docs/getting-started/raspberrypi))
- Driver installation ([instructions](https://github.com/panda-official/TimeSwipe/tree/master/driver)) - latest driver for [download](https://github.com/panda-official/TimeSwipe/releases)
- Run Node-Red with root permission (`sudo`)

## Installation
```
npm install --save node-red-contrib-timeswipe
```

## Example
```json 
[
    {
        "id":"96fd5c6d.0de8a",
        "type":"tab",
        "label":"TimeSwipe",
        "disabled":false,
        "info":""
    },
    {
        "id":"f8029fbf.95b4b",
        "type":"timeswipe-sensors",
        "z":"96fd5c6d.0de8a",
        "name":"",
        "mode":"PRIMARY",
        "bufferType":"samples",
        "bufferValue":48000,
        "sampleRate":48000,
        "sensorOffset0":0,
        "sensorOffset1":0,
        "sensorOffset2":0,
        "sensorOffset3":0,
        "sensorGain0":1,
        "sensorGain1":1,
        "sensorGain2":1,
        "sensorGain3":1,
        "sensorTransmission0":1,
        "sensorTransmission1":1,
        "sensorTransmission2":1,
        "sensorTransmission3":1,
        "x":480,
        "y":200,
        "wires":[
            ["a908638e.6e4e18"],
            [],
            []
        ]
    },
    {
        "id":"a908638e.6e4e18",
        "type":"function",
        "z":"96fd5c6d.0de8a",
        "name":"",
        "func":"\nreturn {payload: msg.payload[0][0]};",
        "outputs":1,
        "noerr":0,
        "x":620,
        "y":200,
        "wires":[
            ["888d599d.1a7a78"]
        ]
    },
        {
        "id":"888d599d.1a7a78",
        "type":"debug",
        "z":"96fd5c6d.0de8a",
        "name":"",
        "active":true,
        "tosidebar":true,
        "console":false,
        "tostatus":false,
        "complete":"false",
        "x":770,
        "y":200,
        "wires":[]
    }
]
```