// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var _     = require("underscore")
var debug = require("debug")

var SMap  = require("./smap")
var utils = require("./utils")

var DEBUG = debug("ragents:agents")

//------------------------------------------------------------------------------
exports.createAgent  = createAgent
exports.createRAgent = createRAgent

//------------------------------------------------------------------------------
function createAgent( session, agentInfo) { return new Agent( session, agentInfo) }
function createRAgent(session, agentInfo) { return new RAgent(session, agentInfo) }

//------------------------------------------------------------------------------
function Agent(session, agentInfo) {
  this.info         = utils.roCopy(agentInfo)
  this._session     = session
  this._isDestroyed = false
  this._receiveCBs  = new SMap()
}

Agent.prototype.destroy    = Agent_destroy
Agent.prototype.emit       = Agent_emit
Agent.prototype.receive    = Agent_receive
Agent.prototype._onRequest = Agent_onRequest

//------------------------------------------------------------------------------
function Agent_destroy() {
  this._session.destroyAgent(this.info, agentDestroyed)

  //-----------------------------------
  function agentDestroyed(err, agent) {
    agent._isDestroyed = true
  }
}

//------------------------------------------------------------------------------
function Agent_emit(name, body) {
  if (this._isDestroyed) throw new Error("destroyed")
  if (!_.isString(name)) throw new Error("name is not a string")

  var message = {
    type: "event",
    from: this.info.id,
    name: name,
    body: body
  }

  this._session._sendMessage(message)
}

//------------------------------------------------------------------------------
function Agent_receive(name, cb) {
  if (this._isDestroyed) throw new Error("destroyed")
  if (!_.isString(name)) throw new Error("name is not a string")
  if (!_.isFunction(cb)) throw new Error("cb is not a function")

  this._receiveCBs.set(name, cb)
}

//------------------------------------------------------------------------------
function Agent_onRequest(message) {
  var mName = message.name

  var cb = this._receiveCBs.get(mName)

  if (!cb) {
    message = {
      type:  "response",
      name:  mName,
      from:  this.info.id,
      id:    message.id,
      error: "agent does not handle messages named '" + mName + "'"
    }

    this._session._sendMessage(message)
    return
  }

  var agent = this

  try {
    cb(message.body, reply)

  }
  catch (e) {
    reply(err, null)
  }

  //-----------------------------------
  var replied = false

  function reply(err, body) {
    if (replied) return
    replied = true

    var rMessage = {
      type:  "response",
      name:  mName,
      from:  agent.info.id,
      id:    message.id,
      body:  body
    }

    if (err) rMessage.error = err

    agent._session._sendMessage(rMessage)
  }
}

//------------------------------------------------------------------------------
function RAgent(session, agentInfo) {
  events.EventEmitter.call(this)

  this.info         = utils.roCopy(agentInfo)
  this._session     = session
  this._requestCBs  = new SMap()
  this._subscrCBs   = new SMap()
  this._nextReqID   = utils.sequencer()
}

util.inherits(RAgent, events.EventEmitter)

RAgent.prototype.send         = RAgent_send
RAgent.prototype._onDestroyed = RAgent_onDestroyed
RAgent.prototype._onResponse  = RAgent_onResponse
RAgent.prototype._onEvent     = RAgent_onEvent

//------------------------------------------------------------------------------
function RAgent_send(name, body, cb) {
  if (!this._session) return

  var reqID = this._nextReqID()

  this._requestCBs.set(reqID, cb)

  var message = {
    type: "request",
    name: name,
    to:   this.info.id,
    id:   reqID,
    body: body
  }

  this._session._sendMessage(message)
}

//------------------------------------------------------------------------------
function RAgent_onDestroyed() {
  this._session = null
}

//------------------------------------------------------------------------------
function RAgent_onResponse(message) {
  var reqID = message.id

  if (!this._requestCBs.has(reqID)) return

  var cb = this._requestCBs.get(reqID)
  this._requestCBs.delete(reqID)

  if (message.error) {
    var err = new Error(message.error)
    return cb(err, message.body)
  }

  cb(null, message.body)
}

//------------------------------------------------------------------------------
function RAgent_onEvent(message) {
  DEBUG("RAgent.onEvent(" + message.name + ")")
  var name = message.name
  var body = message.body
  var agent

  if (message.from == "server") {
    if ((name == "agentCreated") || (name == "agentDestroyed")) {
      agent = this._session._ragents.get(body.id)
      if (null == agent) {
        agent = new RAgent(this._session, body)
        this._session._ragents.set(body.id, agent)
      }

      this.emit(name, agent.info)
    }
    else {
      this.emit(name, body)
    }
  }
  else {
    this.emit(name, body)
  }
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
