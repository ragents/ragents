// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

//------------------------------------------------------------------------------
exports.createAgent  = createAgent
exports.createRAgent = createRAgent

//------------------------------------------------------------------------------
function createAgent(session, agentInfo) {
  return new Agent(session, agentInfo)
}

//------------------------------------------------------------------------------
function createRAgent(session, agentInfo) {
  return new RAgent(session, agentInfo)
}

//------------------------------------------------------------------------------
function Agent(session, agentInfo) {

  this._session   = session
  this._agentInfo = agentInfo
}

Agent.prototype.publish = Agent_publish
Agent.prototype.receive = Agent_receive

//------------------------------------------------------------------------------
function Agent_publish(message) {

}

//------------------------------------------------------------------------------
function Agent_receive(cb) {

}


//------------------------------------------------------------------------------
function RAgent(session, agentInfo) {

  this._session   = session
  this._agentInfo = agentInfo
}

RAgent.prototype.send        = RAgent_send
RAgent.prototype.subscribe   = RAgent_subscribe
RAgent.prototype.unsubscribe = RAgent_unsubscribe

//------------------------------------------------------------------------------
function RAgent_send(message, cb) {

}

//------------------------------------------------------------------------------
function RAgent_subscribe(cb) {

}

//------------------------------------------------------------------------------
function RAgent_unsubscribe(subID) {

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
