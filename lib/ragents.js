// Licensed under the Apache License. See footer for details.

var _     = require("underscore")
var debug = require("debug")

var utils   = require("./utils")
var session = require("./session")

//------------------------------------------------------------------------------
exports.version       = utils.VERSION
exports.createSession = createSession

//------------------------------------------------------------------------------
function createSession(config, cb) {
  checkOpts(config, cb)

  cb = utils.callOnce(cb)

  var url = config.url
  var key = config.key

  config = {
    url: url,
    key: key
  }

  session.createSession(config, cb)
}

//------------------------------------------------------------------------------
function checkOpts(config, cb) {
  // jshint eqnull: true

  var prefix = "ragents.createSession(): "

  if (config == null) throw Error(prefix + "config is null")

  if (config.url == null) throw Error(prefix + "config.url is null")
  if (config.key == null) throw Error(prefix + "config.key is null")

  if (null == cb)        throw Error(prefix + "callback is null")
  if (!_.isFunction(cb)) throw Error(prefix + "callback is not a function")
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
