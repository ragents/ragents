// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

//------------------------------------------------------------------------------
exports.createAgent = createAgent

//------------------------------------------------------------------------------
function createAgent(ws, connectedMessage) {
  return new Agent(ws, connectedMessage)
}

//------------------------------------------------------------------------------
function Agent(ws, connectedMessage) {
  events.EventEmitter.call(this)

  this._ws        = ws
  this._id        = connectedMessage.id
  this._connected = true

  this._handler = new SessionHandler(this)
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
function defaultTitle() {
  if      (typeof window  != "undefined") name = window.location.origin
  else if (typeof process != "undefined") name = process.argv.join(" ")
  else                                    name = "<anonymous>"
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
