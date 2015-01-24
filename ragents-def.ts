// Licensed under the Apache License. See footer for details.

//------------------------------------------------------------------------------
// this file exists for documentation purposes only
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
export function createSession(
  opts:  CreateSessionOpts,
  cb:    (err: Error, session: Session) => void
) {}

//------------------------------------------------------------------------------
interface CreateSessionOpts {
  url: string
  key: string
}

//------------------------------------------------------------------------------
interface Session extends events.EventEmitter {
  close()

  createAgent(
    agentInfo: AgentInfo,
    cb:        (err: Error, agent: Agent) => void
  )

  getRemoteAgents(
    cb: (err: Error, ragents: RAgent[]) => void
  )
}

// events
interface Session_event_close              { () }
interface Session_event_error              { () }
interface Session_event_ragentCreated      { (ragent: RAgent) }
interface Session_event_ragentDestroyed    { (ragent: RAgent) }

//------------------------------------------------------------------------------
interface AgentInfo {
  id:    string
  name:  string
  title: string
}

//------------------------------------------------------------------------------
interface Agent {
  info: AgentInfo

  destroy()

  emit(
    name:    string,
    message: any
  )

  receive(
    name: string,
    cb:   (message: any, reply: Reply) => void
  )
}

//------------------------------------------------------------------------------
interface Reply {
  reply(
    err:     Error,
    message: any
  )
}

//------------------------------------------------------------------------------
interface RAgent extends events.EventEmitter {
  info: AgentInfo

  send(
    name:    string,
    message: any,
    cb:      (err: Error, response: any) => void
  )

}

//------------------------------------------------------------------------------
// traditional events.Eventemitter
//------------------------------------------------------------------------------
module events { export interface EventEmitter { } }

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
