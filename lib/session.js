// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var _     = require("underscore")
var debug = require("debug")

var SMap     = require("./smap")
var utils    = require("./utils")
var agents   = require("./agents")
var channels = require("./channels")

exports.createSession = createSession

var DEBUG    = debug("ragents:session")
var DEBUGMSG = debug("ragents-messages")

//------------------------------------------------------------------------------
function createSession(config, cb) {
  cb = utils.callOnce(cb)

  DEBUG("create", utils.JS(config))

  var channel = channels.createChannel(config.url)
  var session = new Session(channel, config, cb)
}

//------------------------------------------------------------------------------
function Session(channel, config, cb) {
  events.EventEmitter.call(this)

  this._agents  = new SMap()
  this._ragents = new SMap()

  var agentInfo = {
    id:    "server",
    name:  "server",
    title: "server"
  }

  this._ragentServer = agents.createRAgent(this, agentInfo)

  this._ragentServer.addListener("agentCreated",   onRAgentCreated)
  this._ragentServer.addListener("agentDestroyed", onRAgentDestroyed)

  channel.on("message", onMessage)
  channel.on("close",   onClose)
  channel.on("error",   onError)

  DEBUG("connect")

  channel.connect(onConnect)

  var session = this

  //-----------------------------------
  function onConnect(err) {
    if (err) {
      DEBUG("connect error", err)
      return cb(err)
    }

    DEBUG("connected")

    channel.sendMessage({
      type: "request",
      name: "connect",
      to:   "server",
      id:   "0",
      body: {
        key: config.key
      }
    })
  }

  //-----------------------------------
  function onMessage(message) {

    if (!session._channel) {
      DEBUG("channel connection message received")
      if (message.type != "response") return
      if (message.name != "connect") return
      if (message.from != "server") return
      if (message.id   != "0") return

      DEBUG("channel connection message accepted")

      session._channel = channel
      cb(null, session)
      return
    }

    var agent

    if (message.to == "server") {
      if (message.type == "request")     agent = session._ragentServer
    }

    else if (message.from == "server") {
      if (message.type == "response")    agent = session._ragentServer
      if (message.type == "event")       agent = session._ragentServer
    }

    else if (message.type == "request")  agent = session._agents.get(message.to)
    else if (message.type == "response") agent = session._ragents.get(message.from)
    else if (message.type == "event")    agent = session._ragents.get(message.from)

    if (!agent) return

    DEBUGMSG("message dispatched to agent", utils.JL(message))

    if      (message.type == "request")  agent._onRequest(message)
    else if (message.type == "response") agent._onResponse(message)
    else if (message.type == "event")    agent._onEvent(message)
  }

  //-----------------------------------
  function onClose() {
    DEBUG("closing")

    session._agents.forEach(function (agent) {
      agent.destroy()
    })

    session._agents  = null
    session._channel = null
    session.emit("close")

    // only 'works' if the cb has not already been called
    cb(new Error("closed"))
  }

  //-----------------------------------
  function onError(err) {
    DEBUG("error", err)
    session.emit("error", err)
  }

  //-----------------------------------
  function onRAgentCreated(agentInfo) {
    DEBUG("ragentCreated", utils.JS(agentInfo))
    var ragent = agents.createRAgent(session, agentInfo)

    session._ragents.set(agentInfo.id, ragent)
    session.emit("ragentCreated", ragent)
  }

  //-----------------------------------
  function onRAgentDestroyed(agentInfo) {
    DEBUG("ragentDestroyed", utils.JS(agentInfo))
    var ragent = session._ragents.get(agentInfo.id)
    if (!ragent) return

    session._ragents.delete(agentInfo.id)
    session.emit("ragentDestroyed", ragent)
  }

}

util.inherits(Session, events.EventEmitter)

Session.prototype.close               = Session_close
Session.prototype.createAgent         = Session_createAgent
Session.prototype.destroyAgent        = Session_destroyAgent
Session.prototype.getRemoteAgents     = Session_getRemoteAgents
Session.prototype._sendMessage        = Session_sendMessage

//------------------------------------------------------------------------------
function Session_close() {
  DEBUG("session.close()")
  if (!this._channel) return

  this._channel.close()
}

//------------------------------------------------------------------------------
function Session_createAgent(agentInfo, cb) {
  if (!this._channel) return

  DEBUG("session.createAgent()", utils.JS(agentInfo))

  var session = this

  this._ragentServer.send("createAgent", agentInfo, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfo) {
    if (err) {
      DEBUG("session.createAgent() error", err)
      return cb(err)
    }

    DEBUG("session.createAgent() success", utils.JS(agentInfo))
    var agent = agents.createAgent(session, agentInfo)
    session._agents.set(agentInfo.id, agent)

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function Session_destroyAgent(agentInfo, cb) {
  if (!this._channel) return

  DEBUG("session.destroyAgent()", utils.JS(agentInfo))

  var agent = this._agents.get(agentInfo.id)

  var session = this

  this._ragentServer.send("destroyAgent", agentInfo, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfo) {
    if (err) {
      DEBUG("session.destroyAgent() error", err)
      return cb(err)
    }

    DEBUG("session.destroyAgent() success", utils.JS(agentInfo))
    session._agents.delete(agentInfo.id, agent)

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function Session_getRemoteAgents(cb) {
  if (!this._channel) return

  DEBUG("session.getRemoteAgents()")

  var session = this

  this._ragentServer.send("getAgents", null, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfos) {
    if (err) {
      DEBUG("session.getRemoteAgents() error", err)
      return cb(err)
    }

    DEBUG("session.getRemoteAgents() success", utils.JS(agentInfos))

    var ragents = []
    agentInfos.forEach(function(agentInfo) {
      var ragent = session._ragents.get(agentInfo.id)
      if (ragent) {
        ragents.push(ragent)
        return
      }

      ragent = agents.createRAgent(session, agentInfo)
      session._ragents.set(agentInfo.id, ragent)
      ragents.push(ragent)
    })

    cb(null, ragents)
  }
}

//------------------------------------------------------------------------------
function Session_sendMessage(message) {
  if (!this._channel) return

  DEBUGMSG("session.sendMessage()", utils.JL(message))

  this._channel.sendMessage(message)
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
