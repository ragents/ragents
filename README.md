ragents - agent messaging protocol over WebSocket
================================================================================

`ragents` is a messaging protocol run over WebSockets that allows multiple
WebSocket clients to communicate with each other.  A generic `ragents` server
is used to distribute the messages between the clients, so you can have two
or more parties communicating without any of them having to run in a
traditional "server" mode.  Which is nice for server-hostile environments,
like web browsers, mobile devices etc.

A client connects to the `ragents` server to create a *session*, which is
identified by the API key passed in at connection time.  Any clients that
create a session with the same API key will be able to exchange messages.

Messages are exchanged via *agents*.  An *agent* can respond to *request*
messages with a *response* message back to the sender, and can also emit
*event* messages that any client can listen on.



sample
================================================================================


Install the [ragents server](https://www.npmjs.com/package/ragents-server),
and then run it on port 9000; eg, `ragentsd -p 9000`

Then run the two scripts below, in any order you like, as many times as you like.


sample "server"
--------------------------------------------------------------------------------

```js
var ragents = require("ragents")

// server URL and session key
var options = { url: "ws://localhost:9000", key: "sample" }

// connect to a session
ragents.createSession(options, sessionCreated)

// connected to session
function sessionCreated(err, session) {
  if (err) throw err

  // agent information
  var agentInfo = {name: "echoer", title: "an echo agent" }

  // create an agent
  session.createAgent(agentInfo, function(err, agent) {
    agentCreated(session, err, agent)
  })
}

// agent was created
function agentCreated(session, err, agent) {
  if (err) throw err
  console.log("agent", agent.info.id, "created, waiting for echo requests")

  // agent will handle "echo" requests
  agent.receive("echo", function(body, reply) {
    // send message body back to sender
    reply(null, body)

    // emit an "echoed" event, with the message body
    agent.emit("echoed", body)

    console.log("agent responded to echo request")
  })
}
```


sample client
--------------------------------------------------------------------------------

```js
var ragents = require("ragents")

// server URL and session key
var options = { url: "ws://localhost:9000", key: "sample" }

// connect to a session
ragents.createSession(options, sessionCreated)

// connected to a session
function sessionCreated(err, session) {
  if (err) throw err

  // watch for new agents being created
  session.on("ragentCreated", agentAdded)

  // get all the available agents
  session.getRemoteAgents(gotRemoteAgents)

  console.log("waiting for agents")
}

// got the available remote agents
function gotRemoteAgents(err, ragents) {
  if (err) throw err
  ragents.forEach(agentAdded)
}

// for every agent we see ...
function agentAdded(ragent) {
  console.log("agentAdded()")

  // only interested in "echoer" agents
  if (ragent.info.name != "echoer") return

  // when an "echoer" agent emits an "echoed" event ...
  ragent.on("echoed", function(body) {
    console.log("agent", ragent.info.id, "echoed:", body)
  })

  // send an "echo" request to the agent
  var body = {a: 1}
  console.log("agent", ragent.info.id, "send:  ", body)

  ragent.send("echo", body, function(err, body){
    // response received from agent
    console.log("agent", ragent.info.id, "sent:  ", body)
  })
}
```


using ragents
================================================================================

You can program either to the
[WebSocket message protocol](https://github.com/ragents/ragents/blob/master/ragents-ws-protocol.md)
or to the
[JavaScript API](https://github.com/ragents/ragents/blob/master/ragents-js-api.md).

For node.js, the JavaScript API is available via the `ragents` package on npm:
<https://www.npmjs.com/package/ragents>

For the browser, you can either use a node module packager like
[browserify](https://www.npmjs.com/package/browserify)
with the `ragents` package, or you can use the standalone file
`www/ragents-browser.js` which adds an `ragents` global, and otherwise is
the same as the npm package.

The `ragents-server` package provides generic server code for a ragents server,
as well as a standalone executable, `ragentsd`.  See the `ragents-server` package
on npm:
<https://www.npmjs.com/package/ragents-server>



hacking
================================================================================

This project uses [cake](http://coffeescript.org/#cake) as it's
build tool.  To rebuild the project continuously, use the command

    npm run watch

Other `cake` commands are available (assuming you are using npm v2) with
the command

    npm run cake -- <command here>

Run `npm run cake` to see the other commands available in the `Cakefile`.



license
================================================================================

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
