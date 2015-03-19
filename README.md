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

```js
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
```


using ragents
================================================================================

You can program either to the
[WebSocket message protocol](ragents-ws-protocol.md)
or to the
[JavaScript API](ragents-js-api.md).

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
