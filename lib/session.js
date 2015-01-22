// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var SMap    = require("./smap")
var utils   = require("./utils")
var channel = require("./channel")
var ragent  = require("./ragent")

exports.createSession = createSession

//------------------------------------------------------------------------------
function createSession(opts, cb) {
  cb = utils.callOnce(cb)

  var channel = channel.createChannel(opts.url)
  var session = new Session(channel, opts)

  channel.connect(onConnect)

  //-----------------------------------
  function onConnect(err) {
    if (err) return cb(err)

    session._channel   = channel
    session._connectCB = cb

    channel.sendMessage(
      type: "request"
      name: "connect"
      to:   "server"
      from: "0"
      id:   "0"
      body: {
        key: opts.key
      }
    )
  }
}

//------------------------------------------------------------------------------
function Session(channel, opts) {
  events.EventEmitter.call(this)

  this._agents      = new Map()
  this._ragents     = new Map()
  this._isConnected = false

  var agentInfo = {
    id:    "server",
    name:  "server",
    title: "server"
  }

  this._ragentServer = ragent.createRAgent(this, agentInfo)

  this._ragentServer.subscribe("ragentCreated",   onRAgentCreated)
  this._ragentServer.subscribe("ragentDestroyed", onRAgentDestroyed)

  channel.on("message", onMessage)
  channel.on("close",   onClose)

  var session = this

  //-----------------------------------
  function onMessage(message) {
    if (!this._isConnected) {
      if (!this._connectCB) return
      if (message.type != "response") return
      if (message.name != "connect") return
      if (message.to   != "0") return
      if (message.from != "server") return
      if (message.id   != "0") return

      this._isConnected = true
      this._connectCB(null)
      this._connectCB = null
      return
    }

    var agent = this._agents.get(message.to)
    if (!agent) return

    agent._onMessage(message)
  }

  //-----------------------------------
  function onClose() {
    session._isConnected = false
    session._channel     = null
    session.emit("close")

    if (!this._isConnected) {
      if (this._connectCB) {
        this._connectCB(new Error("closed"))
        this._connectCB = null
      }
    }
  }

  //-----------------------------------
  function onRAgentCreated(body) {
    var ragent = ragent.createRAgent(session, body)

    session._ragents.set(body.id, ragent)
    session.emit("ragentCreated", ragent)
  }

  //-----------------------------------
  function onRAgentDestroyed(body) {
    var ragent = session._ragents.get(body.id)
    if (!ragent) return

    session._ragents.delete(body.id)
    session.emit("ragentDestroyed", ragent)
  }

}

util.inherits(Session, events.EventEmitter)

Session.prototype.close               = Session_close
Session.prototype.createAgent         = Session_createAgent
Session.prototype.getRemoteAgents     = Session_getRemoteAgents
Session.prototype.getAgents           = Session_getAgents
Session.prototype._handShake          = Session_handShake
Session.prototype._sendMessage        = Session_sendMessage

//------------------------------------------------------------------------------
function Session_sendMessage(message) {
  if (!this._channel) return
  if (!this._isConnected) return

  this._channel.sendMessage(message)
}

//------------------------------------------------------------------------------
function Session_close() {
  if (!this._channel) return

  _.(this._agents).each(function (agent) {
    agent._shutdown()
  })

  session._agents = null

  this._channel.close()
  this._channel = null
}

//------------------------------------------------------------------------------
function Session_createAgent(agentInfo, cb) {
  if (!this._channel)   return
  if (!this._connected) return

  this._ragentServer.send("createAgent", agentInfo, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfo) {
    if (err) return cb(err)

    var agent = 
    cb(body)
  }
  var session = this

  var message = {
    type: "request"
    name: "createAgent",
    to:   "server",
    data: {
      agentInfo: agentInfo
    }
  }

  sendRequest(session, message, onCreateAgent)

  //-----------------------------------
  function onCreateAgent(err, message) {
    if (err) return cb(err)

    var agentInfo = message.data.agentInfo
    var agent = agent.createAgent(agentInfo)

    session._agents[agentInfo.agentID] = agent

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function Session_getRemoteAgents(cb) {
  var session = this

  if (!session._ws) return cb(new Error("WebSocket closed"))

  var message = {
    name: "getAgents",
    to:   "sys",
  }

  sendRequest(session, message, onGetRemoteAgents)

  //-----------------------------------
  function onGetRemoteAgents(err, message) {
    if (err) return cb(err)

    var agentInfos = message.data.agentInfos

    var agents = agentInfos.map(function(agentInfo) {
      var agent = session._agents[agentInfo.agentID]
      if (agent) return agent

      agent = agent.createRAgent(agentInfo)
      return agent
    })

    cb(null, agents)
  }
}

//------------------------------------------------------------------------------
function Session_getAgents() {
  var session = this

  if (!session._ws) return cb(new Error("WebSocket closed"))

  return session._agents.values()
}

//------------------------------------------------------------------------------
function shutdown(session) {
  if (!session._ws) return

  var ws = session._ws
  delete session._ws

  ws.removeEventListener("open",    session._el.open )
  ws.removeEventListener("message", session._el.message )
  ws.removeEventListener("close",   session._el.close )
  ws.removeEventListener("error",   session._el.error )
}

//------------------------------------------------------------------------------
function onWsOpen(session, event) {
  var message = {
    name: "connect",
    to:   "sys",
  }

  sendRequest(session, message, onConnect)

  //-----------------------------------
  function onConnect(err, message) {
    if (err) return cb(err)

    if (message.error) {
      err = new Error("error connecting")
      err.detail = message.error

      cb(err)
      return
    }

    session._connected = true
    cb(null, session)
  }
}

//------------------------------------------------------------------------------
function onWsMessage(session, event) {
  var message = JSON.parse(event.data)

  if (!session._connected) {
    if (message.type != "response") return
    if (message.name != "connect") return
    if (message.from != "sys") return
  }

  if      (message.type == "request")  onMessageRequest(session, message)
  else if (message.type == "response") onMessageResponse(session, message)
  else if (message.type == "event")    onMessageEvent(session, message)
}

//------------------------------------------------------------------------------
function onMessageRequest(session, message) {
}

//------------------------------------------------------------------------------
function onMessageResponse(session, message) {
  var response = {}

  var reqID = message.requestID
  var cb    = session._reqCBs.get(reqID)

  session._reqCBs.delete(reqID)

  if (!cb) return

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
function getRAgent(session, id) {

}

//------------------------------------------------------------------------------
function onWsClose(session, event, cb) {
  // event.code   = unsigned long
  // event.reason = DOMString

  session.shutdown()

  var data = {
    code:   event.code,
    reason: event.reason
  }

  if (!session._connected) {
    err = new Error("WebSocket closed")
    err.detail = data

    cb(err)
  }

  session.emit("close", data)
}

//------------------------------------------------------------------------------
function onWsError(session, event, cb) {
  session.shutdown()

  var err = new Error("WebSocket error")

  if (!session._connected) {
    cb(err)
  }

  session.emit("error", err)
}

//------------------------------------------------------------------------------
function sendRequest(session, message, onResponse) {
  if (!session._ws) return

  var reqID = session._nextReqID()

  message.type      = "request"
  message.requestID = reqID

  session._reqCBs.set(reqID, onResponse)

  sendMessage(session, message)
}

//------------------------------------------------------------------------------
function sendResponse(session, message) {
  message.type = "response"

  sendMessage(session, message)
}

//------------------------------------------------------------------------------
function sendEvent(session, message) {
  message.type = "event"

  sendMessage(session, message)
}

//------------------------------------------------------------------------------
function sendMessage(session, message) {
  if (!session._ws) return

  message = validateMessage(message)

  session._ws.send(message)
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
