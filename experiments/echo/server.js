// Licensed under the Apache License. See footer for details.

// node ../../../ragents-server/lib/ragentsd -p 9000

var ragents = require("../../lib/ragents")

var Agent = null

// server and key
var options = { url: "ws://localhost:9000", key: "sample" }

console.log("creating session")
ragents.createSession(options, sessionCreated)

//---------------------------------------------------------
// session was created (or error)
function sessionCreated(err, session) {
  if (err) throw err

  console.log("session created, creating agent")

  var agentInfo = {name: "echoer", title: "an echo agent" }

  // create the agent, calling `agentCreated` when done
  session.createAgent(agentInfo, function(err, agent) {
    agentCreated(session, err, agent)
  })
}

//---------------------------------------------------------
// agent was created (or error)
function agentCreated(session, err, agent) {
  if (err) throw err

  // save our agent as a global (for `emit()` below)
  Agent = agent

  console.log("agent created: " + JS(agent.info))

  console.log("waiting for echo requests")
  agent.receive("echo", echoRequest)
}

//---------------------------------------------------------
// handle an echo request
function echoRequest(body, reply) {
  console.log("agent receive: echo,   " + JS(body))
  console.log("agent reply:   echo,   " + JS(body))
  reply(null, body)

  console.log("agent emit:    echoed, " + JS(body))
  Agent.emit("echoed", body)
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
