ragents - agent messaging protocol over WebSocket
================================================================================

`ragents` is a messaging protocol used by *agents* to communicate with each
other.  The messages run over WebSockets to a central *server* which acts as a
switchboard.

An *agent* connects to a *server* identifying a particular *session* they want
to join.  All *agents* connected to a particular *session* can communicate with
each other.

A *session* is identified with an API key, which is an arbitrary string that
you probably want to make sure is unique and shared only between friends.

An *agent* is uniquely identified within a *session* by an *agentID*. An
*agent* also specifies a particular *protocol* that it speaks, and optionally
an arbitrary (but short-ish) *name*.

There are three types of messages that can be sent between *agents*.  An
*agent* can sent a *request* message to a specific *agent*, which will in turn
send a *response* message back to the originating *agent*.  An *agent* can also
send an *event* message, which will be forwarded to all *agents* that are
*listening* for *event* messages.



using ragents
================================================================================

You can program either to the
[WebSocket message protocol](ragents-ws-protocol.md)
or to the
[JavaScript API](ragents-js-api.md).
The server is also available as an API, described in the *JavaScript API*
document.

For node.js, the JavaScript API is available via the `ragents` package on npm:
<https://www.npmjs.com/package/ragents>

For the browser, you can either use
[browserify](https://www.npmjs.com/package/browserify)
with the npm package, or you can use the standalone file `ragents-browser.js`
which adds an `ragents` global, and otherwise is the same as the npm package.

A stand-alone server is available as the npm-installed command `ragentsd`,
or you can use it programmatically via the *JavaScript API*.  The stand-alone
server takes no arguments, but will use the `PORT` environment variable, if set,
as the port to bind the server to; otherwise an port will be chosen and
displayed when the server starts.



hacking
================================================================================

This project uses [jbuild](https://www.npmjs.com/package/jbuild) as it's
build tool.  To rebuild the project continuously, use the command

    npm run watch

Other `jbuild` commands are available (assuming you are using npm v2) with
the command

    npm run jbuild -- <command here>

Run `npm run jbuild` to see the other commands available in the `jbuild.coffee`
file.



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
