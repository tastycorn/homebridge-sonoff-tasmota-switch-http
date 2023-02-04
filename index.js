var Service, Characteristic;
var request = require('request');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-sonoff-tasmota-switch-http", "SonoffTasmotaSwitchHTTP", SonoffTasmotaSwitchHTTPAccessory);
}

function SonoffTasmotaSwitchHTTPAccessory(log, config) {
  this.log = log;
  this.config = config;
  this.name = config["name"];
  this.relay = config["relay"] || "";
  this.hostname = config["hostname"] || "sonoff";
  this.password = config["password"] || "";
  this.disablelogging = config["disablelogging"] || false;
  
  this.service = new Service.Switch(this.name);
  
  this.service
  .getCharacteristic(Characteristic.On)
  .on('get', this.getState.bind(this))
  .on('set', this.setState.bind(this));
  
  this.log("Sonoff Tasmota Switch HTTP Initialized")
}

SonoffTasmotaSwitchHTTPAccessory.prototype.getState = function(callback) {
  var that = this
  request("http://" + that.hostname + "/cm?user=admin&password=" + that.password + "&cmnd=Power" + that.relay, function(error, response, body) {
    if (error) return callback(error);
    var sonoff_reply = JSON.parse(body); // {"POWER":"ON"}
    if(that.disablelogging){
      that.log("Sonoff HTTP: " + that.hostname + ", Relay " + that.relay + ", Get State: " + JSON.stringify(sonoff_reply));
    }
    switch (sonoff_reply["POWER" + that.relay]) {
      case "ON":
        callback(null, 1);
        break;
      case "OFF":
        callback(null, 0);
        break;
    }
  })
}

SonoffTasmotaSwitchHTTPAccessory.prototype.setState = function(toggle, callback) {
  var newstate = "%20Off"
  if (toggle) newstate = "%20On"
  var that = this
  request("http://" + that.hostname + "/cm?user=admin&password=" + that.password + "&cmnd=Power" + that.relay + newstate, function(error, response, body) {
    if (error) return callback(error);
    var sonoff_reply = JSON.parse(body); // {"POWER":"ON"}
    if(that.disablelogging){
      that.log("Sonoff HTTP: " + that.hostname + ", Relay " + that.relay + ", Set State: " + JSON.stringify(sonoff_reply));
    }
    switch (sonoff_reply["POWER" + that.relay]) {
      case "ON":
        callback();
        break;
      case "OFF":
        callback();
        break;
    }
  })
}

SonoffTasmotaSwitchHTTPAccessory.prototype.getServices = function() {
  return [this.service];
}

