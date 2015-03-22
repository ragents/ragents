// Licensed under the Apache License. See footer for details.

// node ../../../ragents-server/lib/ragentsd -p 9000

/*
../../node_modules/.bin/browserify --outfile ping-browser.js --entry ping.js --standalone ping --ignore v8
../../node_modules/.bin/browserify --outfile pong-browser.js --entry pong.js --standalone pong --ignore v8
*/

var ragents = require("../../lib/ragents")
var stats   = require("./stats")

var options = { url: "ws://localhost:9000", key: "sample" }

var RAgent = null
var ping   = null
var pong   = null

exports.run = run

setInterval(function() {stats.dump()}, 5000)

//------------------------------------------------------------------------------
function dumpStats() {
  stats.dump()
}

//------------------------------------------------------------------------------
function run(how) {
  if (!how || (how != "ping" && how != "pong")) {
    console.log("must enter `ping` or `pong` as parameter")
    process.exit(1)
  }

  ping = how
  pong = (ping == "ping") ? "pong" : "ping"
  ragents.createSession(options, sessionCreated)
}

//------------------------------------------------------------------------------
function sessionCreated(err, session) {
  var agentInfo = {name: ping + "er", title: "a " + ping + "er" }

  session.createAgent(agentInfo, function(err, agent) {
    console.log(ping + " agent created")

    agent.receive(ping, function(body, reply) {
      reply(null, body)
      bong()
    })
  })

  session.on("ragentCreated", function(ragent) {
    ragentCreated(ragent, "created")
  })

  session.getRemoteAgents(function(err, ragents){
    ragents.forEach(function(ragent) {
      ragentCreated(ragent, "existed")
    })
  })
}

//------------------------------------------------------------------------------
function ragentCreated(ragent, how) {
  console.log(ping + " ragent " + how + " " + ragent.info.name)
  if (ragent.info.name != pong + "er") return

  RAgent = ragent
  bong()
}

//------------------------------------------------------------------------------
var Counter = 0

function bong() {
  if (RAgent == null) return

  Counter++
  var thisCounter = Counter
  var returned    = false

  stats.incr(ping)

  RAgent.send(pong, thisCounter, function(err, data) {
    returned = true

    if (err) {
      console.log(thisCounter + ": error on send: " + err)
      return
    }

    if (data != thisCounter) {
      console.log(thisCounter + ": unexpectedly got " + data)
    }
  })

  // setTimeout(checkIfReturned, 1000)

  function checkIfReturned() {
    if (!returned) console.log(thisCounter + ": did not return")
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
