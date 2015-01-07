// Licensed under the Apache License. See footer for details.

var _ = require("underscore")

var utils = require("./utils")

exports.getSession = getSession
exports.shutDown   = shutDown

var Sessions = {}

//------------------------------------------------------------------------------
function getSession(apiKey) {
  var key = "-x-" + apiKey
  var session = Sessions[key]

  if (session) return session

  session = new Session(key)
  Sessions[key] = session

  return session
}

//------------------------------------------------------------------------------
function Session(key) {
  this.apiKey  = apiKey
  this.clients = {}
  this.targets = {}

  this.clientSequencer = utils.createSequencer()
  this.targetSequencer = utils.createSequencer()
}

//------------------------------------------------------------------------------
Session.prototype.addClient = function addClient(client) {
  client.id = this.clientSequencer.next()

  this.clients[id] = client
}

//------------------------------------------------------------------------------
Session.prototype.addTarget = function addTarget(target) {
  target.id = this.targetSequencer.next()

  this.targets[id] = target
}

//------------------------------------------------------------------------------
Session.prototype.delClient = function delClient(client) {
  delete this.clients[client.id]
}

//------------------------------------------------------------------------------
Session.prototype.delTarget = function delTarget(target) {
  delete this.targets[target.id]
}

//------------------------------------------------------------------------------
Session.prototype.shutdown = function shutDown() {
  for ()
}


//------------------------------------------------------------------------------
function shutDown() {
  for (var key in Sessions) {
    var session = Sessions[key]

    session.shutDown()

    delete Sessions[key]
  }

  Sessions = {}
}


//------------------------------------------------------------------------------
function hasProperties(object) {
  for (var key in object) {
    return true
  }
  return false
}



//------------------------------------------------------------------------------
Session.hasConnections = function hasConnections() {
  var len = _.keys(this._clients).length + _.keys(this._targets).length
  return len != 0
}

//------------------------------------------------------------------------------
Session.addClient = function addClient(client) {
  this._clients[client.id] = client
}

//------------------------------------------------------------------------------
Session.addTarget = function addTarget(target) {
  this._targets[target.id] = client
}

//------------------------------------------------------------------------------
Session.delClient = function delClient(client) {
  delete this._clients[client.id]
}

//------------------------------------------------------------------------------
Session.delTarget = function delTarget(target) {
  delete this._targets[target.id]
}

//------------------------------------------------------------------------------
Session.gelClients = function getClients() {
  return _.extend({}, this._clients)
}

//------------------------------------------------------------------------------
Session.gelTargets = function getTargets() {
  return _.extend({}, this._targets)
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
