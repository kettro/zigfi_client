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

##Commands
Commands will be given in the format below, for a given command. Here, the
command take arguments "cmd", a String, and "payload", an Object, which
has as fields "type", a String, and "value", an Integer. It then returns
a response with the fields "cmd", a String, and "response", an Object,
which has as fields "type", a String, and "value", an Integer.

Request:
```json
{
  "cmd": STRING,
  "payload":{
    "type": STRING,
    "value": INTEGER
  }
}
```
Response:
```json
{
  "cmd": STRING,
  "response":{
    "type": STRING,
    "value": INTEGER
  }
}
```

For all forms that an argument can take, an example will be given that
is similar to the one above.

#Command List

##Create Commands
###create\_dev
Add a device to a grouping. In the response, "valid" corresponds to whether
the device name and grouping name are valid. If the device was
successfully added, it returns a 0. If an error was encountered, then it
returns the corresponding error code.

Request:
```json
{
  "cmd": create_device,
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
        "value": STRING | INTEGER | BOOLEAN
      }
    ]
  }
}
```

###create\_grp
Create a group.

Request:
```json
{
  "cmd": create_grp,
  "payload":{
    "grp_name": STRING,
  }
}
```
Response:
```json
{
  "cmd": create_grp,
  "response":{
    "valid" INTEGER,
    "grp_name": STRING,
  }
}
```

###create\_devctrl
Create a control for a given device. This control must be valid for the
device type (eg: Temperature Sensors have no gradient controls).

##Read Commands
###read\_connman
Query for the manifest of all devices currently organized in the network.

###read\_unconnman
Query for the manifest of all devices currently not organized in the
network.

###read\_devman
Query for all controls currently available for a given device.

###read\_grpman
Query for all devices currently organized under a given group.

###read\_devdata
Query for the values of a given control in a given device.

##Update Commands
###update\_dev
Change the information of a device. May take values of: "name", "controls",
"num\_controls".

###update\_grp
Change the information of a group. May take values of: "name", "devices",
"num\_devices".

###update\_devdata
Change the values of a given control in a device.

##Destroy Commands
###destroy\_dev
Remove a given device from the network.

###destroy\_grp
Remove a given group from the network. All devices within that group
will be also removed from the network.

###destroy\_devctrl
Remove a given control from a device. This control can be added again
using the create\_devctrl command.

