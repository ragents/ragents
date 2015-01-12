// Licensed under the Apache License. See footer for details.

var util = require("util")

var _ = require("underscore")

var utils = require("./utils")

exports.createSession = createSession

var WSProtocol = "ragents-protocol"

//------------------------------------------------------------------------------
function createSession(WebSocket, opts, cb) {
  var session = new Session(WebSocket, opts, onCreated)

  //-----------------------------------
  function onCreated(err) {
    if (err) return cb(err)

    cb(null, session)
  }
}

//------------------------------------------------------------------------------
function Session(WebSocket, opts, cb) {
  this._agents    = {}
  this._connected = false
  this._cbSent    = false

  var ws = this._ws = WebSocket(opts.url, [WSProtocol])
  ws.addEventListener("open",    onOpen)
  ws.addEventListener("message", onMessage)
  ws.addEventListener("close",   onClose)
  ws.addEventListener("error",   onError)

  var self = this

  //-----------------------------------
  function onOpen(event) {
    var message = {
      type:      "request",
      name:      "sys/connect",
      requestID: "0",
      data: {
        key:     opts.key
      }
    }

    message = utils.JL(message)
    ws.send(message)
  }

  //-----------------------------------
  function onMessage(event) {
    // event.data = DOMString | Blob | ArrayBuffer

    var message = JSON.parse(event.data)

    if (!self._connected) return onConnectMessage(message)
  }

  //-----------------------------------
  function onConnectMessage(message) {
    if (message.type != "response") return
    if (message.name != "sys/connect") return
    if (message.requestID != "0") return

    var data = message.data || {}
    if (!data.id) return

    self._id = data.id

    self._connected = true
    self._cbSent    = true
    cb(null, self)
  }

  //-----------------------------------
  function onClose(event) {
    // event.code   = unsigned long
    // event.reason = DOMString

    var data

    if (!self._connected) {
      data = new Error("close")
    }
    else {
      data = {}
    }

    data.code   = event.code
    data.reason = event.reason

    if (!self._connected) {
      if (self._cbSent) return

      self._cbSent = true
      return cb(data)
    }


    self.emit("close", data)
  }

  //-----------------------------------
  function onError(event) {
    var err = new Error("error")

    if (!self._connected) {
      if (self._cbSent) return

      self._cbSent = true
      return cb(err)
    }

    self.emit("error", err)
  }
}

util.inherits(Session, events.EventEmitter)

Session.prototype.close           = Session_close
Session.prototype.createAgent     = Session_createAgent
Session.prototype.getRemoteAgents = Session_getRemoteAgents

//------------------------------------------------------------------------------
function Session_close(code, reason) {

}

//------------------------------------------------------------------------------
function Session_createAgent(agentInfo, cb) {

}

//------------------------------------------------------------------------------
function Session_getRemoteAgents(cb) {

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
