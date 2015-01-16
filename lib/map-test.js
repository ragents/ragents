// Licensed under the Apache License. See footer for details.

//------------------------------------------------------------------------------
// simplified es6 map that only supports string keys and non-undefined vals
//------------------------------------------------------------------------------

var Map = require("./map")

test(clear)
test(delete_)
test(entries)
test(forEach)
test(get)
test(has)
test(keys)
test(set)
test(values)
console.log("-------")
console.log("passed!")

//------------------------------------------------------------------------------
function clear() {
  var map = new Map()
  assertEq(0, map.size)

  map.set("a", 1)
  map.set("b", 2)
  assertEq(2, map.size)

  map.clear()
  assertEq(0, map.size)
}

//------------------------------------------------------------------------------
function delete_(key) {
  var map = new Map()

  map.set("a", 1)
  assertEq(1, map.size)

  map.delete("a")
  assertEq(0, map.size)
}

//------------------------------------------------------------------------------
function entries() {
  var map = new Map()

  map.set("a", 1)
  map.set("b", 2)

  var entries = map.entries()

  assertEq("a", entries[0][0])
  assertEq(1,   entries[0][1])
  assertEq("b", entries[1][0])
  assertEq(2,   entries[1][1])
}

//------------------------------------------------------------------------------
function forEach() {
  var map = new Map()

  map.set("a", 1)
  map.set("b", 2)

  var index = 0
  map.forEach(function(val, key, map2) {
    assertEq(map, this)
    assertEq(map, map2)

    if (index == 0) {
      assertEq("a",key)
      assertEq(1,  val)
    }
    else {
      assertEq("b", key)
      assertEq(2,   val)
    }

    index++
  }, map)
}

//------------------------------------------------------------------------------
function get() {
  var map = new Map()

  map.set("a", 1)
  map.set("b", 2)

  assertEq(1,    map.get("a"))
  assertEq(2,    map.get("b"))
  assertEq(null, map.get("c"))
}

//------------------------------------------------------------------------------
function has() {
  var map = new Map()

  map.set("a", 1)
  map.set("b", 2)

  assertEq(true,  map.has("a"))
  assertEq(true,  map.has("b"))
  assertEq(false, map.has("c"))
}

//------------------------------------------------------------------------------
function keys() {
  var map = new Map()
  assertEq(0, map.keys().length)

  map.set("a", 1)
  map.set("b", 2)

  var keys = map.keys()

  assertEq(2, map.keys().length)
  assertEq("a", keys[0])
  assertEq("b", keys[1])
}

//------------------------------------------------------------------------------
function set() {
  // tested via get()
}

//------------------------------------------------------------------------------
function values() {
  var map = new Map()
  assertEq(0, map.keys().length)

  map.set("a", 1)
  map.set("b", 2)

  var vals = map.values()

  assertEq(2, vals.length)
  assertEq(1, vals[0])
  assertEq(2, vals[1])
}

//------------------------------------------------------------------------------
function test(fn) {
  testFn = fn.name
  assertIndex = 0
  console.log("testing " + testFn)
  fn()
}

//------------------------------------------------------------------------------
var assertIndex
var testFn

function assertEq(expected, actual) {
  assertIndex++
  if (expected == actual) return

  var message = testFn + "-" + assertIndex + ":  expected `" + expected + "` == `" + actual + "`"
  throw new Error(message)
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
