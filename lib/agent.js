// Licensed under the Apache License. See footer for details.

var _ = require("underscore")

var SMap  = require("./smap")
var utils = require("./utils")

//------------------------------------------------------------------------------
exports.createAgent  = createAgent

//------------------------------------------------------------------------------
function createAgent(session, agentInfo) {
  return new Agent(session, agentInfo)
}

//------------------------------------------------------------------------------
function Agent(session, agentInfo) {
  this._session     = session
  this._agentInfo   = utils.roCopy(agentInfo)
  this._isDestroyed = false
  this._receiveCBs  = new SMap()
}

Agent.prototype.destroy    = Agent_destroy
Agent.prototype.publish    = Agent_publish
Agent.prototype.receive    = Agent_receive
Agent.prototype._onRequest = Agent_onRequest

//------------------------------------------------------------------------------
function Agent_destroy() {
  this._isDestroyed = true
}

//------------------------------------------------------------------------------
function Agent_publish(name, body) {
  if (this._isDestroyed) throw new Error("destroyed")
  if (!_.isString(name)) throw new Error("name is not a string")

  message = {
    type: "event",
    from: agent._agentInfo.id,
    name: name,
    body: body
  }

  this._session.sendMessage(message)
}

//------------------------------------------------------------------------------
function Agent_receive(name, cb) {
  if (this._isDestroyed) throw new Error("destroyed")
  if (!_.isString(name)) throw new Error("name is not a string")
  if (!_.isFunction(cb)) throw new Error("cb is not a function")
  if (this._receiveCBs.has(name)) throw new Error("receiver already defined for '" + name + "'")

  this._receiveCBs.set(name, cb)
}

//------------------------------------------------------------------------------
function Agent_onRequest(message) {
  var mName = message.name
  var mFrom = message.from

  if (!this._receiveCBs.has(mName)) {
    message = {
      type:  "response",
      name:  mName,
      from:  this._agentInfo.id,
      to:    mFrom,
      error: "agent does not handle messages named '" + mName + "'"
    }

    this._session.sendMessage(message)
    return
  }

  var cbRecord = this._receiveCBs.set(mName)
  var agent    = this

  cbRecord.cb(message.body, reply)

  //-----------------------------------
  function reply(err, body) {
    var rMessage = {
      type:  "response",
      name:  mName,
      from:  agent._agentInfo.id,
      to:    mFrom
    }

    if (err) {
      rMessage.error = err
    }
    else {
      rMessage.body = body
    }

    agent._session.sendMessage(rMessage)
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
