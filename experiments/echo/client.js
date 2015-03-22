// Licensed under the Apache License. See footer for details.

// node ../../../ragents-server/lib/ragentsd -p 9000

var ragents = require("../../lib/ragents")

// server and key
var options = { url: "ws://localhost:9000", key: "sample" }

console.log("creating session")
ragents.createSession(options, sessionCreated)

//---------------------------------------------------------
// session was created (or error)
function sessionCreated(err, session) {
  if (err) throw err

  console.log("session created, getting remote agents")

  // add an event handler when a new agent is created in the session
  // event handler will perform an "echo" request
  session.on("ragentCreated", agentCreated)

  // get all of the current agents known
  session.getRemoteAgents(gotRemoteAgents)
}

//---------------------------------------------------------
// all of the current agents returned here (or error)
function gotRemoteAgents(err, ragents) {
  if (err) throw err

  // for each agent, perform an echo request
  ragents.forEach(agentCreated)
}

//---------------------------------------------------------
// called when an agent is created
function agentCreated(ragent) {
  // only going to call certain agents
  if (ragent.info.name != "echoer") return

  console.log("remote agent created: " + JS(ragent.info))

  // add a listener for the agent's `echoed` event
  ragent.on("echoed", function(body) {
    console.log("agent", ragent.info.id, "event:    echoed, " + JS(body))
  })

  // send an `echo` request
  var body = {a:1}
  console.log("agent", ragent.info.id, "request:  echo,   " + JS(body))
  ragent.send("echo", body, function(err, body){
    // handle the response of the request
    if (err) throw err
    console.log("agent", ragent.info.id, "response: echo,   " + JS(body))
  })
}

//---------------------------------------------------------
function JS(obj) { return JSON.stringify(obj) }

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
