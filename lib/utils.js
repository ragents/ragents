// Licensed under the Apache License. See footer for details.

var pkg = require("../package.json")

var _ = require("underscore")

var exports = exports

exports.PROGRAM = pkg.name
exports.VERSION = pkg.version

exports.sequencer = sequencer
exports.JS        = JS
exports.JL        = JL

var Verbose = false

//------------------------------------------------------------------------------
function sequencer(prefix) {
  var curr = 0
  var max  = 0xFFFFFFFF

  if (prefix) {
    prefix = "" + prefix
  }
  else {
    prefix = ""
  }

  return getNext

  //-----------------------------------
  function getNext() {
    var result = curr

    curr++
    if (curr >= max) curr = 0

    return prefix + result
  }
}

//------------------------------------------------------------------------------
function roProperty(object, name, value) {
  Object.defineProperty(object, name, {
    value:       value,
    writable:    false,
    enumerable:  true,
    configurable:false,
  })
}

//------------------------------------------------------------------------------
function roCopy(object) {
  var result = {}

  _.each(object, function(val, key){
    roProperty(result, key, val)
  })

  return result
}


//------------------------------------------------------------------------------
function callOnce(fn) {
  var called = false

  return calledOnceShim

  //-----------------------------------
  function calledOnceShim() {
    if (called) return
    called = true

    fn.apply(this, arguments)
  }
}

//------------------------------------------------------------------------------
function JS(object) { return JSON.stringify(object) }
function JL(object) { return JSON.stringify(object, null, 4) }

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
