// Licensed under the Apache License. See footer for details.

var pkg = require("../package.json")

var utils = exports

utils.PROGRAM = pkg.name

//------------------------------------------------------------------------------
utils.wsc2s = function wsc2s(wsConn) {
  return "{" + [
    "wsConnection:",
    wsConn.remoteAddress,
    wsConn.protocol,
    wsConn.connected ? "connected" : "disconnected"
  ].join(" ") + "}"
}

utils.createSequencer = function createSequencer() {
  var curr = 0
  var max  = 0xFFFFFFFF

  return {next: next}

  //-----------------------------------
  function next() {
    var result = curr

    curr++
    if (curr >= max) curr = 0

    return result
  }
}

//------------------------------------------------------------------------------
utils.log = function log(message) {
  console.log(utils.PROGRAM + ": " + message)
}

//------------------------------------------------------------------------------
utils.JS = function JS(object) { return JSON.stringify(object) }
utils.JL = function JL(object) { return JSON.stringify(object, null, 4) }

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
