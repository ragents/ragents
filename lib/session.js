// Licensed under the Apache License. See footer for details.

var util = require("util")

var _ = require("underscore")

var utils = require("./utils")

exports.createSession = createSession

var WSProtocol = "ragents-protocol"

//------------------------------------------------------------------------------
function createSession(WebSocket, opts, cb) {
  cb = utils.callOnce(cb)

  new Session(WebSocket, opts, cb)
}

//------------------------------------------------------------------------------
function Session(WebSocket, opts, cb) {
  events.EventEmitter.call(this)

  this._agents    = {}
  this._ragents   = {}
  this._cbSent    = false
  this._connected = false
  this._nextReqID = utils.sequencer("reqID")
  this._reqCBs    = {}

  this._ws = WebSocket(opts.url, [WSProtocol])

  var self = this

  this._ws.addEventListener("open",    function(e) {self.onOpen(e, cb)} )
  this._ws.addEventListener("message", function(e) {self.onMessage(e)} )
  this._ws.addEventListener("close",   function(e) {self.onClose(e, cb)} )
  this._ws.addEventListener("error",   function(e) {self.onError(e, cb)} )
}

util.inherits(Session, events.EventEmitter)

Session.prototype.close           = Session_close
Session.prototype.createAgent     = Session_createAgent
Session.prototype.getRemoteAgents = Session_getRemoteAgents
Session.prototype._sendmessage    = Session_sendMessage
Session.prototype._onOpen         = Session_onOpen
Session.prototype._onMessage      = Session_onMessage
Session.prototype._onClose        = Session_onClose
Session.prototype._onError        = Session_onError
Session.prototype._onResponse     = Session_onResponse

//------------------------------------------------------------------------------
function Session_close(code, reason) {
  if (!this._ws) return

  this._ws.close(code, reason)
  delete this._ws
}

//------------------------------------------------------------------------------
function Session_createAgent(agentInfo, cb) {
  var reqID   = this._nextReqID()
  var message = {
    type:      "request",
    name:      "createAgent",
    to:        "sys",
    requestID: reqID,
    data:      {
      agentInfo: agentInfo
    }
  }

  var self = this

  self._sendMessage(message)
  self._onResponse(reqID, onCreateAgent)

  //-----------------------------------
  function onCreateAgent(message) {
    var agentInfo = message.data.agentInfo
    var agent = agent.createAgent(agentInfo)

    self._agents[agentInfo.agentID] = agent

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function Session_getRemoteAgents(cb) {
  var reqID   = this._nextReqID()
  var message = {
    type:      "request",
    name:      "getAgents",
    to:        "sys",
    requestID: reqID
  }

  var self = this

  self._sendMessage(message)
  self._onResponse(reqID, onGetRemoteAgents)

  //-----------------------------------
  function onGetRemoteAgents(message) {
    var agentInfos = message.data.agentInfos

    var agents = agentInfos.map(function(agentInfo) {
      var agent = self._agents[agentInfo.agentID]
      if (agent) return agent

      agent = agent.createRAgent(agentInfo)
      return agent
    })

    cb(null, agents)
  }
}

//------------------------------------------------------------------------------
function Session_onOpen(event) {
  var reqID   = this._nextReqID()
  var message = {
    type:      "request",
    name:      "connect",
    to:        "sys",
    requestID: reqID
  }

  this._sendMessage(message)
  this._onResponse(reqID, onConnect)

  //-----------------------------------
  function onConnect(message) {
    if (message.error) {
      var err = new Error("error connecting")
      err.detail = message.error

      cb(err)
      return
    }

    this._connected = true
    cb(null, this)
  }
}

//------------------------------------------------------------------------------
function Session_onMessage(event) {
  var message = JSON.parse(event.data)

  if (!this._connected) {
    if (message.type != "response") return
    if (message.name != "connect") return
    if (message.from != "sys") return
  }

  if      (message.type == "request")  onMessageRequest(this, message)
  else if (message.type == "response") onMessageResponse(this, message)
  else if (message.type == "event")    onMessageEvent(this, message)
}

//------------------------------------------------------------------------------
function onMessageRequest(session, message) {
}

//------------------------------------------------------------------------------
function onMessageResponse(session, message) {
  var response = {}

  var reqID = message.requestID
  var cb    = this._reqCBs[reqID]

  if (!cb) return

  delete this._reqCBs[reqID]

  if (message.error) {
    var err = new Error("request error")
    err.detail = message.error
    return cb(err)
  }

  response.name = message.name
  response.body = message.body

  if (message.from != "sys") {
    response.ragent = getRAgent(session, message.from)
  }
  
  cb(null, response)
}

//------------------------------------------------------------------------------
function onMessageEvent(session, message) {
}

//------------------------------------------------------------------------------
function onConnectMessage(session, message) {
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

//------------------------------------------------------------------------------
function Session_onClose(event, cb) {
  // event.code   = unsigned long
  // event.reason = DOMString

  var data = {
    code:   event.code,
    reason: event.reason
  }

  if (!self._connected) {
    err = new Error("WebSocket closed")
    err.detail = data

    cb(err)
  }

  self.emit("close", data)
}

//------------------------------------------------------------------------------
function Session_onError(event, cb) {
  var err = new Error("WebSocket error")

  if (!self._connected) {
    cb(err)
  }

  self.emit("error", err)
}

//------------------------------------------------------------------------------
function Session_sendMessage(message) {
  message = validateMessage(message)

  if (!this._ws) return

  this._ws.send(message)
}

//------------------------------------------------------------------------------
function Session_onResponse(reqID, cb) {
  this._reqCBs[reqID] = cb
}

//------------------------------------------------------------------------------
function validateMessage(message) {
  return JSON.stringify(message, null, 2)
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
