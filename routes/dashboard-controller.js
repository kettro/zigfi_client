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
    mqtt_client.subscribe("client", (err, granted) => {
      fs.readFile('example.json', 'utf8', (err, data) => {
        mqtt_client.publish("client", data, () => {
          console.log("published");
        });
      });
    });
  });
  mqtt_client.on('message', (topic, message) => {
    console.log("Topic = " + topic);
    var msg = JSON.parse(message);
    mgmt = msg;
    res.render('dashboard', {
      groups: msg.nodes,
      scripts: [
        '/javascripts/widgets.js',
        '/javascripts/options_menu.js'
      ]
    });
    mqtt_client.end();
    //mgmt_response = JSON.parse(message);
    //var topic_path = topic.split("/");
    // => respond to the various types of message that could be received
    // if (topic_path[0] == mgmt_response)
      // res.render('dashboard', groups: mgmt_response.groups)

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

module.exports = router;
