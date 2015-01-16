// Licensed under the Apache License. See footer for details.

var session = require("./session")
var utils   = require("./utils")

// get the appropriate WebSocket constructor
var WS = getWS()

// indirect so will be ignored by browserify
var Package_websocket = "websocket"

//------------------------------------------------------------------------------
exports.version       = utils.VERSION
exports.createSession = createSession

//------------------------------------------------------------------------------
function createSession(opts, cb) {
  checkOpts(opts, cb)

  var url = opts.url
  var key = opts.key

  opts = {
    url: url,
    key: key
  }

  session.createSession(WS, opts, cb)
}

//------------------------------------------------------------------------------
function checkOpts(opts, cb) {
  var prefix = "ragents.createSession(): "

  if (opts == null) throw Error(prefix + "opts is null")

  if (opts.url == null) throw Error(prefix + "opts.url is null")
  if (opts.key == null) throw Error(prefix + "opts.key is null")

  if (null == cb)        throw Error(prefix + "callback is null")
  if (!_.isFunction(cb)) throw Error(prefix + "callback is not a function")
}

//------------------------------------------------------------------------------
function getWS() {
  if (typeof WebSocket != "undefined") return WebSocket

  try {
    return require(Package_websocket).w3cwebsocket
  }
  catch (e) {
    throw Error("unable to load package `" + Package_websocket + "`: " + e)
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
