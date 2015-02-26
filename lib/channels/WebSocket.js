// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var debug = require("debug")

var utils = require("../utils")

//------------------------------------------------------------------------------
exports.createChannel = createChannel

//------------------------------------------------------------------------------
function createChannel(url, protocol) {
  return new Channel(url, protocol)
}

//------------------------------------------------------------------------------
function Channel(url, protocol) {
  events.EventEmitter.call(this)

  this._url      = url
  this._protocol = protocol
}

util.inherits(Channel, events.EventEmitter)

Channel.prototype.connect     = Channel_connect
Channel.prototype.sendMessage = Channel_sendMessage
Channel.prototype.close       = Channel_close

//------------------------------------------------------------------------------
function Channel_connect(cb) {
  cb = utils.callOnce(cb)

  var websocket = new WebSocket(this._url, [this._protocol])

  websocket.addEventListener("open",    onOpen)
  websocket.addEventListener("message", onMessage)
  websocket.addEventListener("close",   onClose)
  websocket.addEventListener("error",   onError)

  var channel = this

  //-----------------------------------
  function onOpen() {
    channel._websocket = websocket

    cb(null)
  }

  //-----------------------------------
  function onMessage(event) {
    if (!channel._websocket) return

    var message = JSON.parse(event.data)

    channel.emit("message", message)
  }

  //-----------------------------------
  function onClose() {
    if (!channel._websocket) return

    channel._websocket = null

    channel.emit("close")
    cb(new Error("closed"))
  }

  //-----------------------------------
  function onError() {
    channel.emit("error", new Error("undisclosed error"))
  }

}

//------------------------------------------------------------------------------
function Channel_sendMessage(message) {
  if (!this._websocket) return

  message = JSON.stringify(message)
  this._websocket.send(message)
}

//------------------------------------------------------------------------------
function Channel_close() {
  if (!this._websocket) return

  this._websocket.close(1000, "close")
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
