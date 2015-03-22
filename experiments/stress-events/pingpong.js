// Licensed under the Apache License. See footer for details.

// node ../../../ragents-server/lib/ragentsd -p 9000

var ragents = require("../../lib/ragents")
var stats   = require("./stats")

var options = { url: "ws://localhost:9000", key: "sample" }

var Agent = null
var ping  = null
var pong  = null

exports.run = run

setInterval(function() {stats.dump()}, 1000)

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
    Agent = agent
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

  bong(0)
  ragent.on(pong, bong)
}

//------------------------------------------------------------------------------
function bong(counter) {
  stats.incr(ping)

  if (Agent == null) return

  // console.log(ping, counter)
  Agent.emit(ping, ++counter)
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
