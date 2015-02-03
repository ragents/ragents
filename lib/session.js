// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var _ = require("underscore")

var SMap     = require("./smap")
var utils    = require("./utils")
var agents   = require("./agents")
var channels = require("./channels")

exports.createSession = createSession

var DEBUG = utils.createDEBUG(__filename)

//------------------------------------------------------------------------------
function createSession(opts, cb) {
  cb = utils.callOnce(cb)

  var channel = channels.createChannel(opts.url)
  var session = new Session(channel, opts, cb)
}

//------------------------------------------------------------------------------
function Session(channel, opts, cb) {
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

  channel.connect(onConnect)

  var session = this

  //-----------------------------------
  function onConnect(err) {
    if (err) return cb(err)

    channel.sendMessage({
      type: "request",
      name: "connect",
      to:   "server",
      id:   "0",
      body: {
        key: opts.key
      }
    })
  }

  //-----------------------------------
  function onMessage(message) {
// DEBUG("onMessage:  ", JSON.stringify(message))

    if (!session._channel) {
      if (message.type != "response") return
      if (message.name != "connect") return
      if (message.from != "server") return
      if (message.id   != "0") return

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

    if      (message.type == "request")  agent._onRequest(message)
    else if (message.type == "response") agent._onResponse(message)
    else if (message.type == "event")    agent._onEvent(message)
  }

  //-----------------------------------
  function onClose() {
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
    session.emit("error", err)
  }

  //-----------------------------------
  function onRAgentCreated(agentInfo) {
    var ragent = agents.createRAgent(session, agentInfo)

    session._ragents.set(agentInfo.id, ragent)
    session.emit("ragentCreated", ragent)
  }

  //-----------------------------------
  function onRAgentDestroyed(agentInfo) {
    var ragent = session._ragents.get(agentInfo.id)
    if (!ragent) return

    session._ragents.delete(agentInfo.id)
    session.emit("ragentDestroyed", ragent)
  }

}

util.inherits(Session, events.EventEmitter)

Session.prototype.close               = Session_close
Session.prototype.createAgent         = Session_createAgent
Session.prototype.getRemoteAgents     = Session_getRemoteAgents
Session.prototype._sendMessage        = Session_sendMessage

//------------------------------------------------------------------------------
function Session_close() {
  if (!this._channel) return

  this._channel.close()
}

//------------------------------------------------------------------------------
function Session_createAgent(agentInfo, cb) {
  if (!this._channel) return

  var session = this

  this._ragentServer.send("createAgent", agentInfo, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfo) {
    if (err) return cb(err)

    var agent = agents.createAgent(session, agentInfo)
    session._agents.set(agentInfo.id, agent)

    cb(null, agent)
  }
}

//------------------------------------------------------------------------------
function Session_getRemoteAgents(cb) {
  if (!this._channel) return

  var session = this

  this._ragentServer.send("getAgents", null, onResponse)

  //-----------------------------------
  function onResponse(err, agentInfos) {
    if (err) return cb(err)

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

// DEBUG("sendMessage:", JSON.stringify(message))
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
