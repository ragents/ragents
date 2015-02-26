// Licensed under the Apache License. See footer for details.

var URL    = require("url")
var util   = require("util")
var events = require("events")

var debug = require("debug")

var utils = require("./utils")

var protocol = "ragents-protocol"

//------------------------------------------------------------------------------
exports.createChannel = createChannel

//------------------------------------------------------------------------------
function createChannel(url) {
  var parsed = URL.parse(url)

  if (parsed.protocol == "ws:")  return fromWebSocketURL(url)
  if (parsed.protocol == "wss:") return fromWebSocketURL(url)

  throw new Error("unhandleable url")
}

//------------------------------------------------------------------------------
function fromWebSocketURL(url) {

  if (typeof WebSocket != "undefined") {
    return require("./channels/WebSocket").createChannel(url, protocol)
  }

  // indirect so that browserify won't package it
  var mod_WebSocketConnection = "./channels/WebSocketConnection"

  return require(mod_WebSocketConnection).createChannel(url, protocol)
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
