import WebSocket from "ws"
import { AppContext } from "./app.types"

/**
 * Type used for functions passed to websocket event controllers
 */
type eventControllerWithAppContext = (ws: WebSocket, appContext: AppContext, ...args: any[]) => void

export {
    eventControllerWithAppContext
}

