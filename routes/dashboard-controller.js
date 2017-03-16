var express = require('express');
var app = express();
var router = express.Router();
const mqtt = require('mqtt');
var fs = require('fs');

var host;

router.get('/', (req, res, next) => {
  if(req.session.hostname == undefined){
  }
  options = {
    servers: [{
      host: '159.203.56.195',
      port: 1883,
      protocol: 'mqtt'
    }]
  };

  var mqtt_client = mqtt.connect(options);
  mqtt_client.on('connect', () => {
    var topic = generateTopicID();
    mqtt_client.subscribe(topic, (err, granted) => {
      fs.readFile('example.json', 'utf8', (err, data) => {
        mqtt_client.publish(topic, data, () => {
          console.log("published");
        });
      });
    });
  });
  mqtt_client.on('message', (topic, message) => {
    // unsubscribe from the topic
    // Prevent any other messages coming through: as already got the one you need
    mqtt_client.unsubscribe(topic);
    console.log("Topic = " + topic);
    var msg = JSON.parse(message);
    var manifest = parseCommand(msg);
    mgmt = manifest;
    res.render('dashboard', {
      groups: manifest,
      scripts: [
        '/javascripts/widgets.js',
        '/javascripts/options_menu.js'
      ]
    });
    mqtt_client.end();
  });
});

router.post('/', (req, res, next) => {
  console.log("Post called");
  console.log(req.body);
  return res.send(req.body);
  // reconnect to the MQTT server
  // build a JSON request
  // send out a request to the mqtt server, wait for the response
  // mqtt_client.on('message', (topic, message) => {});
});


function generateTopicID(){
  // Generate a topic ID for a given request
  // size 9 random string, to "ensure" a unique ID
  return (Math.random()).toString(36).substr(2,9);
}

function buildCommand(cmd, id, payload){
  // Generate a JSON package for sending via an ajax call
  var request = {
    cmd: cmd,
    topic: id,
    payload: payload
  };
  return JSON.stringify(request);
}

function parseCommand(msg){
  var manifest = [];
  var valid = 0;
  var command = msg.cmd.split("_");
  var res = msg.response;

  var crud_verb = command[0];
  var target = command[1];
  switch(crud_verb){
    case "create":{
      valid = res.valid;
      switch(target){
        case "dev":{
          break;
        }case "grp":{
          break;
        }case "devctrl":{
          break;
        }
      }
      break;
    }
    case "read":{

      switch(target){
        case "connman":
        case "unconnman":{
          for(var group_index in res.manifest){
            manifest.push(res.manifest[group_index]);
          }
          break;
        }case "devman":{
          break;
        }case "grpman":{
          break;
        }case "ctrlman":{
          break;
        }case "devdata":{
          break;
        }
      }
      break;
    }
    case "update":{
      valid = response_body.valid;
      switch(target){
        case "dev":{
        }case "grp":{
          break;
        }case "devdata":{
          break;
        }
      }
      break;

    }
    case "destroy":{
      valid = response_body.valid;
      switch(target){
        case "dev":{
          break;
        }case "grp":{
          break;
        }case "devctrl":{
          break;
        }
      }
      break;
    }
  }

  return manifest;
}

module.exports = router;
