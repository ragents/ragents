// Licensed under the Apache License. See footer for details.

var util   = require("util")
var events = require("events")

var websocket = require("websocket")

var utils   = require("../utils")

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

  var wsClient = new websocket.client()

  wsClient.addListener("connect",       onConnect)
  wsClient.addListener("connectFailed", onConnectFailed)

  wsClient.connect(this._url, [this._protocol])

  var channel = this

  //-----------------------------------
  function onConnect(wsConn) {
    channel._wsConn = wsConn

    wsConn.addListener("message", onMessage)
    wsConn.addListener("close",   onClose)

    cb(null)
  }

  //-----------------------------------
  function onConnectFailed(text) {
    cb(new Error(text))
  }

  //-----------------------------------
  function onMessage(message) {
    if (!channel._wsConn) return
    if (message.type != "utf8") return

    message = JSON.parse(message.utf8Data)

    channel.emit("message", message)
  }

  //-----------------------------------
  function onClose(event) {
    if (!channel._wsConn) return

    channel._wsConn = null
    channel.emit("close")
  }
}

//------------------------------------------------------------------------------
function Channel_sendMessage(message) {
  if (!this._wsConn) return

  message = JSON.stringify(message)
  this._wsConn.sendUTF(message)
}

//------------------------------------------------------------------------------
function Channel_close() {
  if (!this._wsConn) return

  this._wsConn.close(1000, "close")
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
