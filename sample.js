// Licensed under the Apache License. See footer for details.

// node ../ragents-server/lib/ragentsd -p 9000

var ragents = require("./lib/ragents")

var options = { url: "ws://localhost:9000", key: new Date() }

ragents.createSession(options, sessionCreated)

function sessionCreated(err, session) {
  var agentInfo = {name: "echoer", title: "an echo agent" }

  session.createAgent(agentInfo, function(err, agent) {
    agentCreated(session, err, agent)
  })
}

function agentCreated(session, err, agent) {
  agent.receive("echo", function(body, reply) {
    reply(null, body)
    agent.emit("echoed", body)
  })

  session.getRemoteAgents(gotRemoteAgents)
}

function gotRemoteAgents(err, ragents) {
  var ragent = ragents[0]
  ragent.on("echoed", function(body) {
    console.log("agent echoed:", body)
  })
  ragent.send("echo", {a:1}, function(err, body){
    console.log("agent sent:  ", body)
  })
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
