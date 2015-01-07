// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

//------------------------------------------------------------------------------
exports.createTarget = createTarget
exports.createClient = createClient

//------------------------------------------------------------------------------
function createTarget(ws, connectedMessage) {
  return new Target(ws, connectedMessage)
}

//------------------------------------------------------------------------------
function createClient(ws, connectedMessage) {
  return new Client(ws, connectedMessage)
}

//------------------------------------------------------------------------------
util.inherits(Agent, events.EventEmitter)
util.inherits(Client, Agent)
util.inherits(Target, Agent)

//------------------------------------------------------------------------------
function Agent(ws, connectedMessage) {
  events.EventEmitter.call(this)

  this._ws        = ws
  this._id        = connectedMessage.id
  this._connected = true

  this._handler = new SessionHandler(this)
}

//------------------------------------------------------------------------------
function Client(ws, connectedMessage) {
  Agent.call(this, ws, connectedMessage)

  self._requestID  = 0
  self._requestCBs = {}
  self._sequencer  = utils.createSequencer()
}

//------------------------------------------------------------------------------
Client.prototype.getTargets = function getTargets(cb) {
  this._sendRequest("getTargets", null, cb)
}

//------------------------------------------------------------------------------
Client.prototype.attachTarget = function attachTarget(targetID, cb) {
  this._sendRequest("attachTarget", {targetID: targetID}, cb)
}

//------------------------------------------------------------------------------
Client.prototype.detachTarget = function detachTarget(targetID, cb) {
  this._sendRequest("detachTarget", {targetID: targetID}, cb)
}

//------------------------------------------------------------------------------
Client.prototype._sendRequest = function _sendRequest(type, data, cb) {
  if (!this._isConnected) {
    return cb(Error("WebSocket is not connected"))
  }

  var requestID = this._sequencer.next()

  var message = {
    packet:    "request",
    type:      type,
    data:      data,
    requestID: requestID
  }

  this._requestCBs[requestID] = cb

  sendObject(this, message)
}

//------------------------------------------------------------------------------
Client.prototype._onMessage = function _onMessage(message) {
  if (message.package != "response") return
  if (!message.requestID) return

  var cb = this._requestCBs[message.requestID]
  if (!cb) return

  delete this._requestCBs[message.requestID]

  if (message.error) return cb(message.error)
  cb(null, message.data)
}

//------------------------------------------------------------------------------
function Target(ws, connectedMessage) {
  Agent.call(this, ws, connectedMessage)
}

//------------------------------------------------------------------------------
Target.prototype.sendEvent = function sendEvent(type, data) {
  if (!this._isConnected) return

  var message = {
    packet: "event",
    type:   type,
    data:   data
  }

  sendObject(this, message)
}

//------------------------------------------------------------------------------
Target.prototype._onMessage = function _onMessage(message) {
  if (message.packet != "request") return

  var request = new Request(this, message)

  this.emit("request", request)
}

//------------------------------------------------------------------------------
function Request(target, message) {
  this.argv = message.argv

  this._target  = target
  this._message = message
  this._handled = false
}

//------------------------------------------------------------------------------
Request.prototype.wasHandled = function wasHandled(response) {
  return this._handled
}

//------------------------------------------------------------------------------
Request.prototype.sendResponse = function sendResponse(response) {
  if (this._handled) return

  this._handled = true

  var message = {
    packet:    "response",
    type:      this._message.type,
    requestID: this._message.requestID,
    data:      response
  }

  sendObject(this._target, message)
}

//------------------------------------------------------------------------------
Request.prototype.sendError = function sendError(error) {
  if (this._handled) return

  this._handled = true

  var message = {
    packet:    "response",
    type:      this._message.type,
    requestID: this._message.requestID,
    error:     error
  }

  sendObject(this._target, message)
}

//------------------------------------------------------------------------------
function SessionHandler(agent) {
  this.agent = agent
}

//------------------------------------------------------------------------------
SessionHandler.prototype.onOpen = function onOpen() {
  throw Error("unexpected websocket open event")
}

//------------------------------------------------------------------------------
SessionHandler.prototype.onMessage = function onMessage(event) {
  var message = JSON.parse(event.data)

  this.agent._onMessage(message)
}

//------------------------------------------------------------------------------
SessionHandler.prototype.onClose = function onClose(event) {
  this.agent.emit("close", {reason: event.reason})
  this.agent._connected = false
}

//------------------------------------------------------------------------------
SessionHandler.prototype.onError = function onError() {
  this.agent.emit("error", Error("websocket error"))
  this.agent._connected = false
}

//------------------------------------------------------------------------------
function sendObject(agent, obj) {
  if (!agent._isConnected) return

  obj = JSON.stringify(obj, null, 2)
  agent._ws.send(obj)
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
