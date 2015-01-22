A transport module handles message transportation across some communication
channel.

Each transport object is instantiated differently, but exports the same
interface, defined in `transport.ts`.

Each transport package should expose the function `createTransport()` to
create the transport object.  The function should be passed the relevant
arguments for that transport.

The `connect` method will only be called once, and should called after an
event listeners are added, so no messages are missed.
