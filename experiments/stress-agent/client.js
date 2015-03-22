// Licensed under the Apache License. See footer for details.

// node ../../../ragents-server/lib/ragentsd -p 9000

var ragents = require("../../lib/ragents")

var options = { url: "ws://localhost:9000", key: "sample" }

var Session   = null
var count     = 0
var agentInfo = {name: "stressor", title: "agent"}


ragents.createSession(options, sessionCreated)

function sessionCreated(err, session) {
  Session = session

  session.createAgent(agentInfo, agentCreated)
}

function agentCreated(err, agent) {
  if (err) return

  count++

  if (count % 1000 == 0) console.log("agents created: " + count)

  agent.destroy()

  Session.createAgent(agentInfo, agentCreated)
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
