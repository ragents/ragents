ragents JavaScript API
================================================================================

OUT OF DATE

OUT OF DATE

OUT OF DATE

OUT OF DATE

OUT OF DATE


Description of a JavaScript API over the ragents protocol.

When using the stand-alone JavaScript file for the browser, a global `ragents`
is installed, with the same value as the `ragents` module exports.



module `ragents`
================================================================================

The `ragents` module exports the following functions:

* `createLocalSession(cb)`
* `createWebSocketSession(wsURL, key, cb)`


function `createLocalSession(cb)`
--------------------------------------------------------------------------------

Creates a new local `Session` object, passed via the callback.  Returns nothing.

The `cb` parameter is a function of the form `cb(err, session)`, where:

* `err`   - on error, the error object
* `session` - on success, a `Session` object


function `createWebSocketSession(wsURL, key, cb)`
--------------------------------------------------------------------------------

Creates a new remote `Session` object, passed via the callback.  Returns nothing.

The `wsURL` parameter is a URL to a WebSocket server.

The `key` parameter is a unique key that identifies this session amongst others
on the server.  Presumably secret.

The `cb` parameter is a function of the form `cb(err, session)`, where:

* `err`   - on error, the error object
* `session` - on success, a `Session` object



`Session` objects
================================================================================

A `Session` object is an event emitter with the following methods:

* `close()`
* `connectAgent(info, fn(err, agent))`

A `Session` object will emit the following events:

* `close` - when the WebSocket is closed or the session is otherwise closed


method `close()`
--------------------------------------------------------------------------------


method `connectAgent(info, fn(err, agent))`
--------------------------------------------------------------------------------



`Agent` objects
================================================================================

An `Agent` object is an event emitter with the following methods:

* `sendEvent(eventMessage)`

A `Agent` object will emit the following events:

* `close`
* `error`
* `request`
* `ragentConnected`
* `ragentDisconnected`


method `sendRequest(address, memo)`
--------------------------------------------------------------------------------

Posts a memo to specified address.

The `address` parameter is a string indicating an address to send the memo to.

The `memo` is a JSON-able object representing the memo.


event `close`
--------------------------------------------------------------------------------


event `error`
--------------------------------------------------------------------------------


event `request`
--------------------------------------------------------------------------------

This event is emitted when a request message is sent to this agent.

The event listener is a function of the form `cb(request, sendResponse)`, where:


* `body` - the JSON-able body of the event sent from the target


event `targetConnected`
--------------------------------------------------------------------------------

This event is emitted when an target connects.

The event listener is a function of the form `cb(targetID)`, where:

* `targetID` - the id of the connected target


event `targetDisconnected`
--------------------------------------------------------------------------------

This event is emitted when an target disconnects.

The event listener is a function of the form `cb(targetID)`, where:

* `targetID` - the id of the disconnected target



`Target` objects
================================================================================

A `Target` object is an event emitter with the following method:

* `sendEvent(body)`

A `Client` object will emit the following events:

* `close`
* `error`
* `appRequest`
* `clientsAttached`
* `clientsDetached`


method `sendEvent(body)`
--------------------------------------------------------------------------------

Send an appEvent to attached clients.

The `body` parameter is a JSON-able JavaScript object which serves as the
body of the event.


event `close`
--------------------------------------------------------------------------------

This event is emitted when the WebSocket is closed.  

The event listener is a function of the form `cb(reason)`, where:

* `reason` - the reason the WebSocket was closed


event `error`
--------------------------------------------------------------------------------

This event is emitted when the WebSocket has an error.  

The event listener is a function of the form `cb(err)`, where:

* `err` - the error object


event `appRequest`
--------------------------------------------------------------------------------

This event is emitted when a client sends a request.

The event listener is a function of the form `cb(request)`, where:

* `request` - a `Request` object


event `clientsAttached`
--------------------------------------------------------------------------------

This event is emitted when the first client attaches to the target.

The event listener is a function of the form `cb()`


event `clientsDetached`
--------------------------------------------------------------------------------

This event is emitted when the last client deattaches from the target.

The event listener is a function of the form `cb()`



`Request` objects
================================================================================

A `Request` object has the following property:

* `body`

A `Request` object has the following methods:

* `sendResponse(body)`
* `sendError(error)`


property `body`
--------------------------------------------------------------------------------

Contains the JSON-able body of the request sent from a client.


method `sendResponse(body)`
--------------------------------------------------------------------------------

Send a successful response to the client.

The `body` parameter is a JSON-able JavaScript object which serves as the
body of the response.


method `sendError(error)`
--------------------------------------------------------------------------------

Send an error response to the client.

The `error` parameter is an Error object or String describing the error.
