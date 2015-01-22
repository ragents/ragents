// Licensed under the Apache License. See footer for details.

var _ = require("underscore")

var SMap  = require("./smap")
var utils = require("./utils")

//------------------------------------------------------------------------------
exports.createRAgent  = createRAgent

//------------------------------------------------------------------------------
function createAgent(session, agentInfo) {
  return new RAgent(session, agentInfo)
}

//------------------------------------------------------------------------------
function RAgent(session, agentInfo) {
  this._session     = session
  this._agentInfo   = utils.roCopy(agentInfo)
  this._requestCBs  = new SMap()
  this._subscrCBs   = new SMap()
  this._nextReqID   = utils.sequencer()
}

RAgent.prototype.send         = RAgent_send
RAgent.prototype.subscribe    = RAgent_subscribe
RAgent.prototype.unsubscribe  = RAgent_unsubscribe
RAgent.prototype._onDestroyed = RAgent_onDestroyed
RAgent.prototype._onResponse  = RAgent_onResponse
RAgent.prototype._onEvent     = RAgent_onEvent

//------------------------------------------------------------------------------
function RAgent_send(name, body, cb) {
  if (!this._session) {
    process.nextTick(function() {
      cb(new Error("destroyed"))
    })
  }

  var reqID = this._nextReqID()

  this._requestCBs.set(reqID, cb)

  var message = {
    type: "request",
    name: name,
    to:   this._agentInfo.id,
    id:   reqID,
    body: body
  }

  this._channel.sendMessage(message)
}

//------------------------------------------------------------------------------
function RAgent_subscribe(name, cb) {
  if (!this._session) return

  if (this._subscrCBs.has(name)) return

  this._subscrCBs.set(name, cb)
}

//------------------------------------------------------------------------------
function RAgent_unsubscribe(name) {
  this._subscrCBs.delete(name)
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
    err.body = message.body
    return cb(err)
  }

  cb(null, message.body)
}

//------------------------------------------------------------------------------
function RAgent_onEvent(message) {
  var name = message.name
  var cb   = this._subscrCBs.get(name)

  if (!cb) return

  cb(message.body)
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
