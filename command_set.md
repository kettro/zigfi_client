#Command Set for the MQTT ZigBee Router

This is a command set for the MQTT ZigBee router, to be set between the
Express.js Client (hereafter 'client'), through the MQTT Broker
(hereafter 'broker'), to the Receiving client on the BeagleBoneBlack
(hereafter 'bbone'). Commands are modeled after a CRUD framework:
Create, Read, Update, Destroy. This allows the commands to be
RESTful, and be regularly handled.

##Message Format
These commands will be embedded in JavaScript Object Notation (JSON)
packets. This format is a standardized, simple message format that
is rapidly beginning to be used. It is chosen over the more verbose
and complicated XML, or other similar formats for a number of reasons,
outlined below.

##Arguments
Each command will contain zero or more arguments. When a message of a
given command is sent, it will contain, inside the JSON message, the
required arguments. The format of the arguments, as well a the valid
values of those arguments, will be given below.

###Types
Arguments to each message will have a type. These types are as follows:
String, Integer, Boolean. These types are given in the message, as
specified by the command in its description.

###Arrangement
Each argument is given in a key-value pair in the JSON schema. This
allows for simple retrieval of the values sent. JSON allows for values
to be sent as a member of either an Object, or an Array. An Object, in
the JSON schema, is a collection of values, each with a key-value
relationship. An array is a collection of other valid JSON data types,
such as Object, Array, Integers, Strings, or Booleans.

##Topics
Commands can be send over the MQTT connection to a specific topic. Topics
exist for certain management functionality, as well as for each device.
Clients can receive on multiple channels, but messages can only be sent on
a single topic. For each request, the type of topic is given. Responses are
always sent to the specific topic supplied in the request, which is the
Client's current ID, assigned by the client prior to make the request.

##Commands
Commands will be given in the format below, for a given command.Each
command is in a similar format as below. Each request has a "cmd" field,
and "topic" field, and a "payload" command. Each response will have a
"cmd" and a "response" field. The response generally echos the sent
information back to the client as a part of the response, to help
coordinate commands.

Request:
```json
{
  "cmd": STRING,
  "topic": STRING,
  "topic": STRING,
  "payload":{
    "name": STRING,
    "type": STRING,
    "value": STRING | INTEGER | BOOLEAN
  }
}
```
Response:
```json
{
  "cmd": STRING,
  "response":{
    "name": STRING,
    "type": STRING,
    "value": STRING | INTEGER | BOOLEAN
  }
}
```

For all forms that an argument can take, an example will be given that
is similar to the one above.

#Command List

| CRUD Verb | Command |
|:---------:|:-------:|
| Create    | create_dev |
|           | create_grp |
|           | create_devctrl |
| Read      | read_connman |
|           | read_unconnman |
|           | read_devman |
|           | read_grpman |
|           | read_ctrlman |
|           | read_devdata |
| Update    | update_dev |
|           | update_grp |
|           | update_devdata |
| Destroy   | destroy_dev |
|           | destroy_grp |
|           | destroy_devctrl |

##Create Commands
###create_dev
Add a device to a grouping. In the response, "valid" corresponds to whether
the device name and grouping name are valid. the integer values are given
below in Error Codes

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "create_device",
  "topic": STRING,
  "payload":{
    "dev_name": STRING,
    "grp_name": STRING,
    "dev_id": INTEGER | STRING
  }
}
```
Response:
```json
{
  "cmd": create_device,
  "response":{
    "valid": INTEGER,
    "dev_name": STRING,
    "grp_name": STRING,
    "controls": [
      {
        "type": STRING,
        "value": STRING | INTEGER | BOOLEAN,
        "name": STRING
      }
    ]
  }
}
```

###create_grp
Create a group.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "create_grp",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
  }
}
```
Response:
```json
{
  "cmd": "create_grp",
  "response":{
    "valid" INTEGER,
    "grp_name": STRING,
  }
}
```

###create_devctrl
Create a control for a given device. This control must be valid for the
device type (eg: Temperature Sensors have no gradient controls).

Request:
```json
{
  "cmd": "create_devctrl",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING,
    "id": INTEGER,
    "type": STRING,
    "control": [
      {
        "type": STRING,
        "value": STRING | INTEGER | BOOLEAN,
        "name": STRING
      }
    ]
  }
}
```
Response:
```json
{
  "cmd": "create_devctrl",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "dev_name": STRING,
    "id": INTEGER,
    "type": STRING,
    "control": [
      {
        "type": STRING,
        "value": STRING | INTEGER | BOOLEAN,
        "name": STRING
      }
    ]
  }
}
```

##Read Commands
###read_connman
Query for the manifest of all devices currently organized in the network.
Here, the response contains the manifest, which is an array of the
registered groups, which contains the devices per group, and the controls
per device.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "read_connman",
  "topic": STRING,
  "payload":{
  }
}
```
Response:
```json
{
  "cmd": "read_connman",
  "response":{
    "manifest": [
      {
        "grp_name": STRING,
        "devices":[
          {
            "name": STRING,
            "id": INTEGER,
            "type": STRING,
            "controls": [
              {
                "name": STRING,
                "type": STRING,
                "value": STRING | INTEGER | BOOLEAN,
              }
            ]
          }
        ]
      }
    ]
  }
}
```

###read_unconnman
Query for the manifest of all devices currently not organized in the
network. The ID is a unique identifier.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "read_unconnman",
  "topic": STRING,
  "payload":{
  }
}
```
Response:
```json
{
  "cmd": "read_unconnman"
  "response":{
    "manifest":[
      {
        "id": INTEGER,
        "type": STRING
      }
    ]
  }
}
```

###read_ctrlman
Query for all controls currently available for a given device.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "read_ctrlman",
  "topic": STRING,
  "payload":{
    "dev_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "read_ctrlman",
  "response":{
    "dev_name": STRING,
    "manifest": [
      {
        "name": STRING,
        "type": STRING,
        "value": STRING | INTEGER | BOOLEAN
      }
    ]
  }
}
```

###read_devman
Query for all devices currently organized under a given group, excluding
controls

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "read_grpman",
  "topic": STRING,
  "payload":{
    "grp_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "read_grpman",
  "response":{
    "grp_name": STRING,
    "manifest": [
      {
        "name": STRING,
        "type": STRING,
        "id": INTEGER
      }
    ]
  }
}
```

###read_grpman
Query for all groups currently organized, excluding devices.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "read_grpman",
  "topic": STRING,
  "payload":{
  }
}
```
Response:
```json
{
  "cmd": "read_grpman",
  "response":{
    "manifest": [
      {
        "name": STRING
      }
    ]
  }
}
```

###read_devdata
Query for the values of a given control in a given device.

Request:
```json
{
  "cmd": "read_devdata",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "read_devdata"
  "response":{
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING
    "manifest":[
      {
        "name": STRING,
        "type": STRING,
        "value": STRING | INTEGER | BOOLEAN,
      }
    ]
  }
}
```

##Update Commands
###update_dev
Change the information of a device.

Request:
```json
{
  "cmd": "update_dev",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING,
    "info": {
      "name": STRING,
      "controls": [
        {
          "name": STRING,
          "type": STRING,
          "value": STRING | INTEGER | BOOLEAN
        }
      ]
    }
  }
}
```
Response:
```json
{
  "cmd": "update_dev",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "dev_name": STRING,
    "info": {
      "name": STRING,
      "controls": [
        {
          "name": STRING,
        }
      ]
    }
  }
}
```

###update_grp
Change the information of a group, where "name" is the new name, if
applicable.

Request:
```json
{
  "cmd": "update_grp",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "name": STRING,
  }
}
```
Response:
```json
{
  "cmd": "update_grp",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "name": STRING
  }
}
```

###update_devdata
Change the values of a given control in a device.

Request:
```json
{
  "cmd": "update_devdata",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING,
    "name": STRING,
    "type": STRING,
    "value": STRING | INTEGER | BOOLEAN
    }
  }
}
```
Response:
```json
{
  "cmd": "update_devdata",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING,
    "name": STRING,
    "type": STRING,
    "value": STRING | INTEGER | BOOLEAN
  }
}
```

##Destroy Commands
###destroy_dev
Remove a given device from the network.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "destroy_dev",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "destroy_dev",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "dev_name": STRING
  }
}
```

###destroy_grp
Remove a given group from the network. All devices within that group
will be also removed from the network.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "destroy_grp",
  "topic": STRING,
  "payload":{
    "grp_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "destroy_grp",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING
  }
}
```

###destroy_ctrl
Remove a given control from a device. This control can be added again
using the create\_devctrl command.

Request:
```json
Topic: /deviceid/mgmt
{
  "cmd": "destroy_ctrl",
  "topic": STRING,
  "payload":{
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING
  }
}
```
Response:
```json
{
  "cmd": "destroy_ctrl",
  "response":{
    "valid": INTEGER,
    "grp_name": STRING,
    "dev_name": STRING,
    "ctrl_name": STRING
  }
}
```

#Response Codes

| Field | Value |       Description      |
|:-----:|:-----:|:----------------------:|
| Valid | 0     | Valid                  |
|       | 1     | Invalid: invalid input |
|       | 2     | Invalid: invalid type  |
|       | 3     | Invalid: invalid name  |
