ragents protocol
================================================================================

The `ragents` protocol is currently run over WebSockets, as a set of JSON
encoded text packets sent between a `ragents` client and server.

There are three types of packets sent:

* request
* response
* event



request packets
================================================================================

An object with the following properties:

* `type` - always the string "request"
* `name` - a String identifying the request (eg, function name)
* `to`   - id of the agent to send the request
* `id`   - unique id of this request, to correlate the response packet
* `body` - JSONable object to send as the body of the request

A client is responsible for using unique ids for the `id` property, so that
each request and response packet can be correlated.  The `id` property will
need to be unique to a particular session you are connecting to.

Upon receipt of a request packet, the reader should respond with a response
packet.



response packets
================================================================================

An object with the following properties:

* `type`  - always the string "response"
* `name`  - a String identifying the request (eg, function name)
* `from`  - same value as the associated request packet `to`
* `id`    - same value as the associated request packet `id`
* `body`  - JSONable object to send as the body of the response
* `error` - String indicating error occurred

Before sending the response, an agent must copy
the `name` property from the request into the `name` property of the response,
the `to`   property from the request into the `from` property of the response, and
the `id`   property from the request into the `id`   property of the response.
This is to ensure the response can be correlated with the associated request

If the `error` property exists and is non-null, this indicates an error
occurred during the processing of the request.  The body may still have a value,
and the value of the `error` property is the error message.



event packets
================================================================================

An object with the following properties:

* `type` - always the string "response"
* `name` - a String identifying the request (eg, event name)
* `from` - id of the agent that emitted the event
* `body` - JSONable object to send as the body of the event



message flow
================================================================================

When a client connects to a server, it must send a request with:

* `name` set to `"connect"`
* `to` set to `"server"`
* `body` set to an object with a property of `"key"`, whose value is the
  session key to connect with

The `key` sent in the `body` is the session key; all clients that connect
to the same server with the same `key` will be connected to the same
session.

Upon successly connecting to the server, the client will receive a 
response with no `error` property.  The client may then send any other
further packets.

The general flow will for agents to be created with the `createAgent`
request below, or retrieved with the `getRemoteAgents` request and the
`agentCreated` event below.

Agents are expected to send a single response packet upon receiving a request
packet.

All events emitted by all agents are broadcast to all connected clients.  In
the future this may change, to have the subscriptions managed on the server
(to prevent unneeded messages from being sent).

When clients become disconnected from the server, all other connected clients
will be sent `agentDestroyed` messages for any agents created on that client.

When the server dies, all manner of bad things will likely happen.

In general, packets which are not-well-formed are ignored.



special "server" agent
================================================================================

As seen in the connection request, there is a special agent with `id` of
`"server"`.  This agent responds to a number of requests, and emits some events


request `createAgent`
--------------------------------------------------------------------------------

Requests creation of a new agent.

The request `body` should be an object with the following properties:

* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent

The response `body` object will have those same properties, plus:

* `id` - unique id of the agent within the session


request `destroyAgent`
--------------------------------------------------------------------------------

Requests destruction of an agent.

The request `body` should be an object with the following properties:

* `id` - unique id of the agent within the session

The response `body` object will have those same properties, plus:

* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent


request `getRemoteAgents`
--------------------------------------------------------------------------------

Requests a list of all known agents.

The request `body` is ignored.

The response `body` will be an array of objects with these properties:

* `id` - unique id of the agent within the session
* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent


event `agentCreated`
--------------------------------------------------------------------------------

Emitted when an agent is created.  The event `body` will be an object with
the following properties:

* `id` - unique id of the agent within the session
* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent


event `agentDestroyed`
--------------------------------------------------------------------------------

Emitted when an agent is destroyed.  The event `body` will be an object with
the following properties:

* `id` - unique id of the agent within the session
* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent
