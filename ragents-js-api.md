ragents JavaScript API
================================================================================

Description of a JavaScript API over the ragents protocol.

When using the stand-alone JavaScript file for the browser, a global `ragents`
is installed, with the same value as the `ragents` module exports.

Unless otherwise noted, none of the functions or methods documented here
return a value.

Objects passed with requests, responses, and events will be serialized
and deserialized with `JSON.stringify()` and `JSON.parse()`.


module `ragents`
================================================================================

The `ragents` module exports the following function:

* `createSession(config, cb)`


function `createSession(config, cb)`
--------------------------------------------------------------------------------

Creates a new local `Session` object, passed via the callback.

You can create multiple session objects, pointing to the same or different
servers, with the same or different keys.  All clients that connect to the
same server with the same key are connected to the same session.

The `config` parameter should be an object with two properties:

* `url` - the URL to the ragents server
* `key` - the API key indicating the session to join

The `cb` parameter is a function of the form `cb(err, session)`, where:

* `err`     - on error, the error object
* `session` - on success, a `Session` object



`Session` objects
================================================================================

A `Session` object is the connection between your local program, and
all the other clients connected to the same server with the same API key.

You can create and destroy agents with the `createAgent()` and `destroyAgent()`
methods, and listen for remote agents being created and destroyed with the
`ragentCreated` and `ragentDestroyed` events.  You can also get a list of the
current agents in the session with the `getRemoteAgents()` method.

These objects are event emitters that have the following methods:

* `close()`
* `createAgent(agentInfo, cb)`
* `destroyAgent(agentInfo, cb)`
* `getRemoteAgents(cb)`

These objects will emit the following events:

* `close{}`
* `error{err}`
* `ragentCreated{ragent}`
* `ragentDestroyed{ragent}`


method `close()`
--------------------------------------------------------------------------------

Closes the session, and destroys all local agents created in this session.


method `createAgent(agentInfo, cb)`
--------------------------------------------------------------------------------

Creates a new local agent.

The `agentInfo` parameter should be in the shape of an `AgentInfo` object.

The `cb` parameter is a function of the form `cb(err, agent)`, where:

* `err`   - on error, the error object
* `agent` - on success, an `Agent` object


method `destroyAgent(agentInfo, cb)`
--------------------------------------------------------------------------------

Destroys a local agent.

The `agentInfo` parameter should be in the shape of an `AgentInfo` object.

The `cb` parameter is a function of the form `cb(err, session)`, where:

* `err`     - on error, the error object
* `session` - on success, a `Session` object


method `getRemoteAgents(cb)`
--------------------------------------------------------------------------------

Returns all agents available in this session.

The `cb` parameter is a function of the form `cb(err, ragents)`, where:

* `err`     - on error, the error object
* `ragents` - on success, an array of `RAgent` objects


event `close{}`
--------------------------------------------------------------------------------

This event is emitted when the session is closed.


event `error{err}`
--------------------------------------------------------------------------------

This event is emitted when an error occurs on the transport.  An `Error`
object will be passed with the event.


event `ragentCreated{ragent}`
--------------------------------------------------------------------------------

This event is emitted when a new agent is created in the session.  A `RAgent`
object will be passed with the event.


event `ragentDestroyed{ragent}`
--------------------------------------------------------------------------------

This event is emitted when an agent is destroyed in the session.  A `RAgent`
object will be passed with the event.



`AgentInfo` objects
================================================================================

An `AgentInfo` object provides descriptive information about an agent.

An `AgentInfo` object has the following properties:

* `id` - unique id of the agent within the session
* `name` - a short, unique name of the agent
* `title` - a descriptive name of the agent

Note that when an `AgentInfo` object is passed into `session.createAgent()`,
the `id` property will be ignored, as it will be reset to it's unique value
in that function's callback.


`Agent` objects
================================================================================

An `Agent` object is the local version of an *agent*, which can receive
requests and send responses, and broadcast events.

These objects have the following property:

* `info` - an `AgentInfo` object

These objects have the following methods:

* `destroy()`
* `emit(name, object)`
* `receive(name, cb)`


method `destroy()`
--------------------------------------------------------------------------------

Destroys the agent.


method `emit(name, object)`
--------------------------------------------------------------------------------

Broadcast an event.  

Associated `RAgent` objects will receive these events
via their built-in event emitter, and so can listen for the events with
`on()`, `addListener()`, etc.

The `name` parameter is the name of the event.

The `object` parameter is the object to send with the event.


method `receive(name, cb)`
--------------------------------------------------------------------------------

Set up a callback to be invoked when the agent is sent a request.

The `name` parameter is the name of the request.

The `cb` parameter is a function of the form `cb(object, reply)`, where:

* `object` - is the object passed with the request
* `reply`  - is a function that should be called to send the response

The `reply` parameter is a function of the form `reply(err, object)`, where:

* `err`    - is an Error object sent with the response on failure
* `object` - is the object passed with the response on success



`RAgent` objects
================================================================================

An `RAgent` object is the remote version of an *agent*, which can be sent
requests and receive responses, and emit events.

These objects have the following property:

* `info` - an `AgentInfo` object

These objects are event emitters that have the following method:

* `send()`

These objects will emit events which are broadcast from a corresponding
`Agent` object.


method `send(name, object, cb)`
--------------------------------------------------------------------------------

Send a request to an agent.

The `name` parameter is the name of the request.

The `object` parameter is the object passed with the request.

The `cb` parameter is a function of the form `cb(err, object)`, where:

* `err`    - on error, the error object
* `object` - on success, the object passed in the response
