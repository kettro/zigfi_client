var express = require('express');
var app = express();
var router = express.Router();
const mqtt = require('mqtt');
var fs = require('fs');

var host;
var server_options = {
  servers: [{
    host: '159.203.56.195',
    port: 1883,
    protocol: 'mqtt'
  }]
};

router.get('/', (req, res, next) => { 
  if(req.session.hostname == undefined){
  }

  var curr_topic = generateTopicID();
  var connman_request = {

  };
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      // When gateway is functional, make request for read_connman
      fs.readFile('example.json', 'utf8', (err, data) => {
      // When the gateway is functional, replace topic with the mgmt topic
        mqtt_client.publish(curr_topic, data, () => {
          console.log("Published read_connman");
        });
      });
    });
  });
  mqtt_client.on('message', (topic, message) => {
    // unsubscribe from the topic
    // Prevent any other messages coming through: as already got the one you need
    mqtt_client.unsubscribe(topic);
    mqtt_client.end();
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
  });
});

router.get('/:type', (req, res, next) => {
  console.log(req.params);
  var type = req.params.type;
  switch(type){
    case 'add':{
      var add_modal;
      // Need to query the server for the unconns
      console.log("getting unconns and etc");
      queryReadMan("read_unconnman", (unconnman) => {
        console.log(unconnman);
        queryReadMan("read_grpman", (grpman) => {
          console.log(grpman);
          res.render('add_modal', {dev_unconn: unconnman, group_list: grpman}, (err, html) => {
            if(err != null) console.log(err);
            add_modal = html;
          });
          res.send({modal: add_modal});
        })
      });
      break;
    }
    case 'remove':{
      break;
    }
    case 'settings':{
      break;
    }
  }
});

router.post('/:type', (req, res, next) => {
  console.log("post called to the :type listener");
  var type = req.params.type;
  switch(type){
    case 'add':{
      createItemCall(req.body.cmd, JSON.parse(req.body.payload), (reply) => {
        // compensate for no response: payload == response
        var response = JSON.parse(reply.payload);
        res.status(200).send({response: response});
      });
      break;
    }
  }
});

router.post('/', (req, res, next) => {
  console.log("Post called");
  // Relay on the webpage to have a well-formatted JSON value;
  // probably breaks something if it isn't well formed
  var curr_topic = generateTopicID();
  var datagram = buildCommand(req.body, curr_topic);
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      // When the gateway is functional, replace topic with the mgmt topic
      mqtt_client.publish(curr_topic, datagram, () => {
        console.log("published POST message");
      });
    })
  }).on('message', (topic, message) => {
    // Response at the moment is just going to be the original request
    console.log("POST reply from server received");
    var msg = JSON.parse(message);
    msg.payload = JSON.parse(msg.payload);
    // To compensate for it not being a real response
    var new_msg = {
      cmd: msg.cmd,
      response: msg.payload
    };
    new_msg.response.valid = true;
    var manifest = JSON.stringify(new_msg);
    console.log(manifest);
    res.send(manifest);
    mqtt_client.end();
  });
});


function generateTopicID(){
  // Generate a topic ID for a given request
  // size 9 random string, to "ensure" a unique ID
  return (Math.random()).toString(36).substr(2,9);
}

function buildCommand(msg, id){
  // Generate a JSON package for sending via an ajax call
  // payload is stringified on the client-side
  var payload = JSON.parse(msg.payload);
  var request = {
    cmd: msg.cmd,
    topic: id,
    payload: msg.payload
  };
  var json = JSON.stringify(request);
  console.log(json);
  return json;
}

function queryReadMan(cmd, callback){
  var curr_topic = generateTopicID();
  var datagram = JSON.stringify({
    cmd: cmd,
    topic: curr_topic,
    payload: '{}'
  });
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      mqtt_client.publish(curr_topic, datagram, () => {
        console.log("QueryReadMan pub made");
      });
    });
  }).on('message', (topic, message) => {
    // Response at the moment is just going to be the original request
    // source from a file, as there isn't anything for me yet
    mqtt_client.unsubscribe(topic);
    mqtt_client.end();
    var msg = JSON.parse(message);
    if(msg.cmd == 'read_unconnman'){
      fs.readFile('example_unconnman.json', 'utf8', (err, data) => {
        mqtt_client.unsubscribe(topic);
        mqtt_client.end();
        var manifest = JSON.parse(data).response.manifest;
        callback(manifest);
      });
    }else if(msg.cmd == 'read_grpman'){
      // = JSON.parse(data).response.manifest
      console.log(msg);
      var manifest = [
        { name: "upper-level" },
        { name: "main-level" }
      ];
      callback(manifest);
    }
  });
}

function createItemCall(cmd, payload, callback){
  var curr_topic = generateTopicID();
  var datagram = JSON.stringify({
    cmd: cmd,
    topic: curr_topic,
    payload: JSON.stringify(payload) // Not sure the error, Stringify pumps out a strange bit here
  });
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      mqtt_client.publish(curr_topic, datagram, () => {
        console.log("createItem pub made");
      });
    });
  }).on('message', (topic, message) => {
    mqtt_client.unsubscribe(topic);
    mqtt_client.end();
    var msg = JSON.parse(message);
    callback(msg);
  })
}

function parseCommand(msg){
  // In some cases, manifest is returned as an object, not an array
  // for example: read_connman returns an array, but read_devdata is an obj
  // The difference is in what the commands are requesting: if the commands are
  // requesting info on all x in y, then it will return an array. For info on
  // a single item (eg, control), the manifest is an object of the returned values
  var manifest = [];
  var topic = [];
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
          manifest = res.manifest;
          break;
        }case "ctrlman":
          topic.push(res.dev_name);
        case "devman":
          topic.unshift(res.grp_name);
        case "grpman":
          manifest = {};
          manifest["topic"] = topic;
          manifest["manifest"] = res.manifest;
          break;
        case "devdata":{
          topic = [res.grp_name, res.dev_name, res.ctrl_name].join('/');
          manifest = {
            topic: topic,
            manifest: res.manifest
          }
          break;
        }
      }
      break;
    }
    case "update":{
      valid = res.valid;
      switch(target){
        case "dev":
          topic.push(res.dev_name);
        case "grp":{
          topic.unshift(res.grp_name);
          var new_data = {name: res.name};
          manifest = {
            topic: topic,
            new_data: new_data
          };
          break;
        }case "devdata":{
          var topic = [res.grp_name, res.dev_name, res.ctrl_name].join('/');
          var new_data = {
            name: res.name,
            type: res.type,
            value: res.value
          };
          manifest = {
            topic: topic,
            new_data: new_data
          };
          break;
        }
      }
      break;

    }
    case "destroy":{
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
  }

  return manifest;
}

module.exports = router;
