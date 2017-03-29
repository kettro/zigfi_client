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
var client_topic = "mgmt";

router.get('/', (req, res, next) => { 
  if(req.session.hostname == undefined){
  }

  var curr_topic = generateTopicID();

  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      datagram = JSON.stringify({
        cmd: "read_connman",
        topic: curr_topic,
        payload: {}
      });
      mqtt_client.publish(client_topic, datagram, () => {
      });
    });
  });
  mqtt_client.on('message', (topic, message) => {
    // unsubscribe from the topic
    // Prevent any other messages coming through: as already got the one you need
    mqtt_client.end();
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
  var type = req.params.type;
  switch(type){
    case 'add':{
      var add_modal;
      // Need to query the server for the unconns
      console.log("getting unconns and etc");
      queryReadMan("read_unconnman", (unconnman) => {
        unconns = unconnman.response.manifest;
        queryReadMan("read_grpman", (grpman) => {
          groups = grpman.response.manifest;
          res.render(
            'add_modal',
            {dev_unconn: unconns, group_list: groups},
            (err, html) => {
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
  var type = req.params.type;
  switch(type){
    case 'add':{
      console.log(req.body);
      createItemCall(req.body.cmd, JSON.parse(req.body.payload), (reply) => {
        // compensate for no response: payload == response
        res.status(200).send({response: reply.response});
      });
      break;
    }
  }
});

router.post('/', (req, res, next) => {
  // Relay on the webpage to have a well-formatted JSON value;
  // probably breaks something if it isn't well formed
  var curr_topic = generateTopicID();
  var datagram = buildCommand(req.body, curr_topic);
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      mqtt_client.publish(client_topic, datagram, () => {
      });
    })
  }).on('message', (topic, message) => {
    mqtt_client.unsubscribe(curr_topic);
    mqtt_client.end();
    //var msg = JSON.parse(message);
    // Bad, but forcing goodness
    //var manifest = JSON.stringify(msg);
    //res.send(manifest);
    console.log(message);
    res.send(message);
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
    payload: payload
  };
  var json = JSON.stringify(request);
  return json;
}

function queryReadMan(cmd, callback){
  var curr_topic = generateTopicID();
  var datagram = JSON.stringify({
    cmd: cmd,
    topic: curr_topic,
    payload: {}
  });
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      mqtt_client.publish(client_topic, datagram, () => {
        console.log("QueryReadMan pub made");
      });
    });
  }).on('message', (topic, message) => {
    // Response at the moment is just going to be the original request
    // source from a file, as there isn't anything for me yet
    mqtt_client.unsubscribe(curr_topic);
    mqtt_client.end();
    var msg = JSON.parse(message);
    if(msg.cmd == 'read_unconnman'){
      callback(msg);
    }else if(msg.cmd == 'read_grpman'){
      callback(msg)
    }
    else{
      callback(msg);
    }
  });
}

function createItemCall(cmd, payload, callback){
  var curr_topic = generateTopicID();
  //var datagram = JSON.stringify({
  //  cmd: cmd,
  //  topic: curr_topic,
  //  payload: JSON.stringify(payload) // Not sure the error, Stringify pumps out a strange bit here
  //});
  var datagram = JSON.stringify({
    cmd: cmd,
    topic: curr_topic,
    payload: payload
  });
  var mqtt_client = mqtt.connect(server_options);
  mqtt_client.on('connect', () => {
    mqtt_client.subscribe(curr_topic, (err, granted) => {
      mqtt_client.publish(client_topic, datagram, () => {
        console.log("createItem pub made");
      });
    });
  }).on('message', (topic, message) => {
    mqtt_client.unsubscribe(curr_topic);
    mqtt_client.end();
    console.log(message)
    var msg = JSON.parse(message);
    callback(msg);
  })
}

function parseCommand(msg){
  // In some cases, manifest is returned as an object, not an array
  // for example: read_connman returns an array, but read_devdata is an obj
  // The difference is in what the commands are requesting: if the commands are
  // requesting info on all x in y, then it will return an array. For info on
  // a single item, the manifest is an object of the returned values
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
