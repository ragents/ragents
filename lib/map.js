// Licensed under the Apache License. See footer for details.

//------------------------------------------------------------------------------
// simplified es6 map that only supports string keys and non-undefined vals
//------------------------------------------------------------------------------

var _ = require("underscore")

//------------------------------------------------------------------------------
module.exports = Map

var PROP_PREFIX     = "-"
var PROP_PREFIX_LEN = PROP_PREFIX.length

//------------------------------------------------------------------------------
function Map() {
  this.clear()

  var map = this

  Object.defineProperty(this, "size", {
    get: function() { return _.size(map._entries) }
  })
}

Map.prototype.clear   = clear
Map.prototype.delete  = delete_
Map.prototype.entries = entries
Map.prototype.forEach = forEach
Map.prototype.get     = get
Map.prototype.has     = has
Map.prototype.keys    = keys
Map.prototype.set     = set
Map.prototype.values  = values

//------------------------------------------------------------------------------
function asProp(key) {
  return PROP_PREFIX + key
}

//------------------------------------------------------------------------------
function asKey(prop) {
  return prop.slice(PROP_PREFIX_LEN)
}

//------------------------------------------------------------------------------
function clear() {
  this._entries = {}
}

//------------------------------------------------------------------------------
function delete_(key) {
  delete this._entries[asProp(key)]
}

//------------------------------------------------------------------------------
function entries() {
  var result = []

  this.forEach(function(val, key) {
    result.push( [ key, val ] )
  })

  return result
}

//------------------------------------------------------------------------------
function forEach(cb, that) {
  // cb(val, key, map)

  if (!that) that = undefined

  var map = this

  _.each(this._entries, function(val, key) {
    cb.call(that, val, asKey(key), map)
  })
}

//------------------------------------------------------------------------------
function get(key) {
  return this._entries[asProp(key)]
}

//------------------------------------------------------------------------------
function has(key) {
  return this.get(key) != undefined
}

//------------------------------------------------------------------------------
function keys() {
  var result = []

  this.forEach(function(val, key) {
    result.push( key )
  })

  return result
}

//------------------------------------------------------------------------------
function set(key, value) {
  return this._entries[asProp(key)] = value
}

//------------------------------------------------------------------------------
function values() {
  var result = []

  this.forEach(function(val, key) {
    result.push( val )
  })

  return result
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
