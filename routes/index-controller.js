var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
var url = require('url');

router.get('/', function(req, res, next) {
  // if cookie && has(auth) => reroute to /dashboard
  if(req.cookies.mqttHostname != undefined){
    if(req.cookies.mqttPort != undefined){
      console.log("Session = " + req.session);
      req.session.hostname = req.cookies.mqttHostname;
      req.session.port = req.cookies.mqttPort;
      req.session.save((err) => {
        console.log("Session = " + req.session.hostname);
        console.log("redirecting via get\n");
        res.redirect('/dashboard');
      });
    }
  }else{
    // else: render the index
    return res.render('index', { title: 'Express' });
  }

});

router.post('/', (req, res, next) => {
  // Check if remember-me checkbox is ticked
  if(req.body.mqttRemember == 'on'){
    // Store the data in a Cookie
    // set the expiry for now + 10 days
    var expiry = new Date(Date.now() + 10*100*60*60*24);

    res.cookie('mqttHostname', req.body.mqttHostName, { expires: expiry });
    res.cookie('mqttPort', req.body.mqttHostPort, { expires: expiry })
  }
  req.session.hostname = req.body.mqttHostName;
  req.session.port = req.body.mqttHostPort;
  console.log("redirecting via post\n");
  return res.redirect('/dashboard');
});
module.exports = router;
