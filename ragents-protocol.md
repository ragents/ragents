ragents protocol
================================================================================

OUT OF DATE

OUT OF DATE

OUT OF DATE

OUT OF DATE

OUT OF DATE

Description of the message packets flowing over the WebSockets used by ragents.

There are three types of programs communicating when using ragents:

* targets
* clients
* servers

A *target* is the program which is being interacted with; eg, the program
you are debugging.

A *client* is a program running that a user interacts with, to control the
*target*; eg, the debugger user interface.  It acts as an HTTP client to the
*server*.

A *server* is an HTTP server that *targets* and *clients* connect to, in order
to interact with each other. It acts as an HTTP server for *targets* and
*clients*.


general packet structure
================================================================================

All messages are serialized JSON objects.

    packet:    "request", "response", or "event"`
    type:      agent-specific identifier
    requestID: client- or agent-provided unique identifier for requests
    data:      JSON-able data specific to the request, response, or event
    error:     error message on a response, when an error occurred processing
               the request

Every `request` packet must have a unique (per agent/client) `requestId`,
which will be resent with the associated `response` packet sent back.  Every
`request` packet sent will have exactly one `response` packet received.

`agentID` and `clientID` are values provided by the ragents server when the
target agent and clients send packets of type `connect`.



from target to server
================================================================================


request `connect`
--------------------------------------------------------------------------------

The agent sends this as it's first message, as a sort of authenticated login,
using the `<api key>`.  If an error is returned, no further messages will
be successful.

request

    packet:    "request"
    type:      "connect"
    requestID: <requestID>
    data:
      key:     <api key>

response

    packet:    "response"
    type:      "connect"
    requestID: <requestID>
    error:                      // only on error responses
    data:



request `connect`
--------------------------------------------------------------------------------

The agent sends this when a connection to a target is made.  A `targetID`
is returned, to be used with future messages.

request

    packet:    "request"
    type:      "target-connect"
    requestID: <requestID>
    data:

response

    packet:    "response"
    type:      "target-connect"
    requestID: <requestID>
    data:
      id:      targetID
    error:                      // only on error responses


event `target-event`
--------------------------------------------------------------------------------

The agent sends this event when a target sends an event for a client.

    packet:    "event"
    type:      "target-event"
    data:
      id:      targetID
      event:   <target-specific JSON-able object>



from server to target
================================================================================

request `target-request`
--------------------------------------------------------------------------------

The server sends this request to have a request sent to a
target.

request

    packet:    "request"
    type:      "target-request"
    requestID: <requestID>
    data:
      id:      targetID
      request: <JSONable object>

response

    packet:    "response"
    type:      "target-request"
    requestID: <requestID>
    data:
      response: <JSONable object>
    error:                      // only on error responses


event `client-attached`
--------------------------------------------------------------------------------

The server sends this event when a client attaches to a target, where previously
no clients had been attached.  When a client attaches to a target which
already has at least one client attached, this event is not sent.

    packet:    "event"
    type:      "client-attached"
    data:
      id:      targetID



event `client-detached`
--------------------------------------------------------------------------------

The server sends this event when the last client detaches from a target.

    packet:    "event"
    type:      "client-detached"
    data:
      id:      targetID



from client to server
================================================================================


request `client-connect`
--------------------------------------------------------------------------------

The client sends this as it's first message, as a sort of authenticated login,
using the `<api key>`.  If an error is returned, no further messages will
be successful.

request

    packet:    "request"
    type:      "client-connect"
    requestID: <requestID>
    data:
      key:     <api key>

response

    packet:    "response"
    type:      "client-connect"
    requestID: <requestID>
    data:
    error:                      // only on error responses


request `target-list`
--------------------------------------------------------------------------------

The client sends this request to obtain the list of available targets that can
be attached to.

request

    packet:    "request"
    type:      "target-list"
    requestID: <requestID>

response

    packet:    "response"
    type:      "target-list"
    requestID: <requestID>
    data:      [ array of <targetId>]
    error:                      // only on error responses


request `target-attach`
--------------------------------------------------------------------------------

The client sends this request to attach to a target.

request

    packet:    "request"
    type:      "target-attach"
    requestID: <requestID>
    data:
      id:      targetID

response

    packet:    "response"
    type:      "target-attach"
    requestID: <requestID>
    error:                      // only on error responses


request `target-detach`
--------------------------------------------------------------------------------

The client sends this request to detach from a target.

request

    packet:    "request"
    type:      "target-detach"
    requestID: <requestID>
    data:
      id:      targetID

response

    packet:    "response"
    type:      "target-detach"
    requestID: <requestID>
    error:                      // only on error responses


request `target-request`
--------------------------------------------------------------------------------

The client sends this request to have a request sent to a
target.

request

    packet:    "request"
    type:      "target-request"
    requestID: <requestID>
    data:
      id:      targetID
      request: <JSONable object>

response

    packet:    "response"
    type:      "target-request"
    requestID: <requestID>
    data:
      response: <JSONable object>
    error:                      // only on error responses



from server to client
================================================================================

The server sends this event when a new target connects.

event `target-connected`
--------------------------------------------------------------------------------

    packet:    "event"
    type:      "target-connected"
    data:
      id:      targetID


event `target-disconnected`
--------------------------------------------------------------------------------

The server sends this event when a target disconnects.

    packet:    "event"
    type:      "target-disconnected"
    data:
      id:      targetID


event `target-event`
--------------------------------------------------------------------------------

The server sends this event when a target sends an event.

    packet:    "event"
    type:      "target-event"
    data:
      id:      targetID
      event:   <JSONable object>
