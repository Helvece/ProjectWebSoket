import { DefaultEventsMap } from "https://deno.land/x/socket_io@0.2.0/packages/event-emitter/mod.ts";
import { serve, Server, Socket } from "../deps.ts";
import { ServerEmitEvent, ServerListenerEvent } from "./event.ts";
import { ClientData, ClientManager } from "./client/index.ts";
import { ChannelManager } from "./channel/index.ts";
import { Client } from "./client/client.ts";
import { readInput } from "./terminal.ts";

export const io = new Server<
  ServerListenerEvent,
  ServerEmitEvent,
  DefaultEventsMap,
  ClientData
>({
  cors: {
    origin: "*",
  },
  path: "/",
});

io.use(
  async (
    socket: Socket<
      ServerListenerEvent,
      ServerEmitEvent,
      DefaultEventsMap,
      ClientData
    >,
  ) => {
    const name: string | undefined = socket.handshake.auth.name as
      | string
      | undefined;
    if (name) {
      if (ClientManager.getInstance().getClient(name)) {
        console.log(`name ${name} already taken`);
        throw new Error("name already taken");
      }
      await ClientManager.getInstance().loadClient(name, socket);
      return;
    } else {
      socket.disconnect();
      throw new Error("invalid name");
    }
  },
);
io.on(
  "connection",
  async (
    socket: Socket<
      ServerListenerEvent,
      ServerEmitEvent,
      DefaultEventsMap,
      ClientData
    >,
  ) => {
    const client = socket.data.client as Client;

    console.log("New connection!");
    socket.join("global");
    await client.join();
    socket.on("packet", client.handlePacket);
    socket.on("disconnect", client.disconnect);
  },
);

await Promise.all([
  ChannelManager.getInstance().loadDefaultChannel(),
  readInput(io),
  serve(io.handler(), { port: 3000 }),
]);
