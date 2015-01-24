// Licensed under the Apache License. See footer for details.

var _ = require("underscore")

var utils   = require("./utils")
var session = require("./session")

//------------------------------------------------------------------------------
exports.version       = utils.VERSION
exports.createSession = createSession

//------------------------------------------------------------------------------
function createSession(opts, cb) {
  checkOpts(opts, cb)

  cb = utils.callOnce(cb)

  var url = opts.url
  var key = opts.key

  opts = {
    url: url,
    key: key
  }

  session.createSession(opts, cb)
}

//------------------------------------------------------------------------------
function checkOpts(opts, cb) {
  // jshint eqnull: true

  var prefix = "ragents.createSession(): "

  if (opts == null) throw Error(prefix + "opts is null")

  if (opts.url == null) throw Error(prefix + "opts.url is null")
  if (opts.key == null) throw Error(prefix + "opts.key is null")

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
