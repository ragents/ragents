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
  close(code: number, reason: string)

  createAgent(
    agentInfo: AgentInfo,
    cb:        (err: Error, agent: Agent) => void
  )

  getAgents(): Agent[]

  getRemoteAgents(
    cb: (err: Error, ragents: RAgent[]) => void
  )
}

// events
interface Session_event_close              { (code: number, reason: string) }
interface Session_event_error              { (err: Error) }
interface Session_event_ragentCreated      { (ragent: RAgent) }
interface Session_event_ragentDestroyed    { (ragent: RAgent) }

// system level messages published
// - agentConnected
// - agentDisonnected

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

  publish(
    message: Message
  )

  receive(
    cb: (message: AMessage, reply: Reply) => void
  )
}

//------------------------------------------------------------------------------
interface RAgent {
  info: AgentInfo

  send(
    message: Message,
    cb:      (err: Error, response: AMessage) => void
  )

  subscribe(
    cb: (message: AMessage, subID: string) => void
  )

  unsubscribe(subID: string)

  subscriptions(): Subscription[]
}

//------------------------------------------------------------------------------
interface Subscription {
  ragent: RAgent
  subID:  string
}

//------------------------------------------------------------------------------
interface CloseStatus {
  code:   number
  reason: string
}

//------------------------------------------------------------------------------
interface Message {
  name: string
  body: any
}

//------------------------------------------------------------------------------
interface AMessage extends Message {
  agent: RAgent
}

//------------------------------------------------------------------------------
interface Reply {
  reply(message: Message)
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
