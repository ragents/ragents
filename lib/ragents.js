// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var pkg    = require("../package.json")
var agents = require("./client-agents")

// protocol we're using over WebSocket
var WSProtocolName = "ragents-protocol"

// get the appropriate WebSocket constructor
var WS = getWS()

// indirect so will be ignored by browserify
var Package_ragentsd  = "./ragentsd"
var Package_websocket = "websocket"

//------------------------------------------------------------------------------
exports.version       = pkg.version
exports.protocol      = WSProtocolName
exports.connectAgent  = connectAgent

if (!isBrowser()) {
  exports.server = require(Package_ragentsd)
}

//------------------------------------------------------------------------------
function connectAgent(opts, cb) {
  var err = checkOpts(opts, cb)

  if (err) {
    if (cb) return cb(err)
    throw err
  }

  var url      = opts.url
  var key      = opts.key
  var protocol = opts.protocol || "*"
  var name     = opts.name

  if (!name) {
    if      (typeof window  != "undefined") name = window.location.origin
    else if (typeof process != "undefined") name = process.argv.join(" ")
    else                                    name = "<anonymous>"
  }

  if (url.match(/^https?:/)) {
    url = url.replace(/^http/, "ws")
  }

  var ws  = new WS(url, WSProtocolName)

  var message = {
    packet:    "request",
    type:      "connect-" + type,
    requestId: 0,
    data: {
      key:      key,
      protocol: protocol,
      name:     name
    },
  }

  var handler = new ConnectionHandler(ws, message, onConnected)

  ws.onOpen(    function(event) { handler.onOpen(    event ) } )
  ws.onMessage( function(event) { handler.onMessage( event ) } )
  ws.onClose(   function(event) { handler.onClose(   event ) } )
  ws.onError(   function(event) { handler.onError(   event ) } )

  //-----------------------------------
  var onConnectedHandled = false

  function onConnected(err, response) {
    if (onConnectedHandled) return
    onConnectedHandled = true

    if (err) return cb(err)

    var agent

    switch(type) {
      case "target": agent = agents.createTarget(ws, response); break;
      case "client": agent = agents.createClient(ws, response); break;
    }

    handler = agent._handler

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function checkOpts(opts, cb) {
  if (opts == null) return Error("opts is null")

  var url      = opts.url
  var key      = opts.key
  var protocol = opts.protocol

  if (url      == null) return Error("opts.url is null")
  if (key      == null) return Error("opts.key is null")
  if (protocol == null) return Error("opts.protocol is null")

  if (null == cb)              return Error("callback is null")
  if (typeof cb != "function") return Error("callback is not a function")
}

//------------------------------------------------------------------------------
function ConnectionHandler(ws, message, cb) {
  this.ws      = ws
  this.message = message
  this.cb      = cb
}

//------------------------------------------------------------------------------
ConnectionHandler.prototype.onOpen = function onOpen(event) {
  this.ws.send(JSON.stringify(this.message, null, 2))
}

//------------------------------------------------------------------------------
ConnectionHandler.prototype.onMessage = function onMessage(event) {
  var message = JSON.parse(event.data)

  if (message.packet    != "response") return
  if (message.type      != "connect") return
  if (message.requestID != this.message.requestID) return

  if (message.error) return this.cb(Error(message.error))
  return this.cb(null, message.data)
}

//------------------------------------------------------------------------------
ConnectionHandler.prototype.onClose = function onClose(event) {
  this.cb(new Error(event.reason))
}

//------------------------------------------------------------------------------
ConnectionHandler.prototype.onError = function onError(event) {
  this.cb(new Error("WebSocket error"))
}

//------------------------------------------------------------------------------
function isBrowser() {
  return typeof WebSocket != "undefined"

//------------------------------------------------------------------------------
function getWS() {
  if (isBrowser()) return WebSocket

  return require(Package_websocket).w3cwebsocket
}

//------------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------
