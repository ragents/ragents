//------------------------------------------------------------------------------
export function createChannel(url: string): Channel { return null }

//------------------------------------------------------------------------------
interface Channel extends events.EventEmitter {

  // connect the channel
  connect(cb: (err: Error)=>void)

  // send a request
  sendMessage(message: any, cb: (err: Error) => void)

  // close the channel
  close()
}

interface Channel_event_close    { (status: any) }
interface Channel_event_message  { (message: any) }

//------------------------------------------------------------------------------
// traditional events.Eventemitter
//------------------------------------------------------------------------------
module events { export interface EventEmitter { } }
