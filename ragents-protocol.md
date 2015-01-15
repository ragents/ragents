ragents protocol
================================================================================

Description of the message packets flowing over the WebSockets used by ragents.

The ragents protocol allows peer-to-peer communication between programming
components via pub/sub events, and request/response pairs.  

general packet structure
================================================================================

All messages are serialized JSON objects.

    type:      "request", "response", or "event"
    name:      agent-specific identifier
    from:      the id of the agent that is to be sent a message
    to:        the id of the agent that is to be sent a message
               (not used in events)
    requestID: agent-provided unique identifier for requests
               (not used in events)
    data:      JSON-able data specific to the request, response, or event
    error:     error message on a response, when an error occurred processing
               the request

Every `request` packet must have a unique (per agent) `requestId`,
which will be resent with the associated `response` packet sent back.  Every
`request` packet sent will have exactly one `response` packet sent in return.

Since the ragents server sends events and can handle some requests, it handles
these messages with the same structure.  The server id, used in the `from` and
`to` properties, is always `"sys"`.

If the `error` property is set, the `data` property will be null, and vice
versa.  Some messages have no `data` property and also no `error` property,
and are considered non-error messages.

When publishing an event, the publisher should create an event message, set
the `from` property, and leave the `to` property undefined.  When subscribers
receive an event message, the `to` property will be set to their agentID.

Example:

event published

    type:      "event"
    name:      "foo"
    from:      <agentID of publisher>
    data:      <any>

event received from subscriber

    type:      "event"
    name:      "foo"
    from:      <agentID of publisher>
    to:        <agentID of subscriber>
    data:      <any>

When sending a request, the requester should set the `to` and `from` properties
to the appropriate agentIDs.  The receiver of the request will have the properties
set to the same values, and should flip the values when sending the response.
The receiver of the response will also see the same values as those sent by
the sender of the response.

Example:

request sent by requester

    type:      "request"
    name:      "foo"
    from:      <agentID of requester>
    to:        <agentID of requestee>
    requestID: <requestID>
    data:      <any>

request received by requestee

    same as above

response sent by requestee

    type:      "response"
    name:      "foo"
    from:      <agentID of requestee>
    to:        <agentID of requester>
    requestID: <requestID>
    data:      <any>

response received by requester

    same as above


messages provided by the server
================================================================================

The server implements it's own events and request/reponse messages.  The
agent id of the server is `"sys"`, and should be used as the value of the `to`
property when sending requests.  The `from` property on responses and events
from the server will have the value `"sys"`.

These messages are not sent/received in the context of an agent, so the
relevant `to` and `from` properties will be absent.


request `connect`
--------------------------------------------------------------------------------

The agent sends this as it's first message, as a sort of authenticated login,
using the `<api key>`.  If an error is returned, no further messages will
be successful.

request

    type:      "request"
    name:      "connect"
    to:        "sys"
    requestID: <requestID>
    data:
      key:     <api key>

response

    type:      "response"
    name:      "connect"
    from:      "sys"
    requestID: <requestID>


request `createAgent`
--------------------------------------------------------------------------------

request

    type:      "request"
    name:      "createAgent"
    to:        "sys"
    requestID: <requestID>
    data:      AgentInfo object

response

    type:      "response"
    name:      "createAgent"
    from:      "sys"
    requestID: <requestID>
    data:      AgentInfo object


request `destroyAgent`
--------------------------------------------------------------------------------

request

    type:      "request"
    name:      "destroyAgent"
    to:        "sys"
    requestID: <requestID>
    data:
      agentID: <agentID>

response

    type:      "response"
    name:      "destroyAgent"
    from:      "sys"
    requestID: <requestID>
    data:
      agentID: <agentID>


request `subscribe`
--------------------------------------------------------------------------------

request

    type:      "request"
    name:      "subscribe"
    to:        "sys"
    requestID: <requestID>
    data:
      agentID: <agentID of agent publishing events>

response

    type:      "response"
    name:      "subscribe"
    from:      "sys"
    requestID: <requestID>
    data:
      agentID: <agentID of agent publishing events>
      subID:   <subID>


request `unsubscribe`
--------------------------------------------------------------------------------

request

    type:      "request"
    name:      "unsubscribe"
    to:        "sys"
    requestID: <requestID>
    data:
      subID:   <subID>

response

    type:      "response"
    name:      "unsubscribe"
    from:      "sys"
    requestID: <requestID>
    data:
      agentID: <agentID of agent publishing events>
      subID:   <subID>


request `getAgents`
--------------------------------------------------------------------------------

request

    type:      "request"
    name:      "getAgents"
    to:        "sys"
    requestID: <requestID>
    data:

response

    type:      "response"
    name:      "getAgents"
    from:      "sys"
    requestID: <requestID>
    data:
      agents:  <array of AgentInfo>


event `agentCreated`
--------------------------------------------------------------------------------

The server sends this event when an agent connects to the session.

event

    type:      "event"
    name:      "agentCreated"
    from:      "sys"
    data:
      agent:   <AgentInfo>


event `agentDestroyed`
--------------------------------------------------------------------------------

The server sends this event when an agent connects to the session.

event

    type:      "event"
    name:      "agentDestroyed"
    from:      "sys"
    data:
      agent:   <AgentInfo>
