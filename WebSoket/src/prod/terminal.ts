import { DefaultEventsMap } from "https://deno.land/x/socket_io@0.2.0/packages/event-emitter/mod.ts";
import { Server } from "../deps.ts";
import { ServerEmitEvent, ServerListenerEvent } from "./event.ts";
import { ClientData, ClientManager } from "./client/index.ts";

export async function readInput(
  _server: Server<
    ServerEmitEvent,
    ServerListenerEvent,
    DefaultEventsMap,
    ClientData
  >,
) {
  const decoder = new TextDecoder();

  for await (const chunk of Deno.stdin.readable) {
    const text = decoder.decode(chunk).trim();
    const args = text.split(" ");
    const name = args.shift();

    if (name === "say") {
      const channel = args.shift();
      if (!channel) {
        console.log("You must specify a channel");
        continue;
      }
      ClientManager.broadcastMessageByChannel(
        args.join(" "),
        channel,
      );
    } else if (name === "list") {
      console.log("List of clients:");
      ClientManager.getInstance().getClients().forEach((client) => {
        console.log(client.getName());
      });
    } else if (name === "msg") {
      const client = args.shift();
      if (!client) {
        console.log("You must specify a client");
        continue;
      }
      const message = args.join(" ");
      const clientObj = ClientManager.getInstance().getClient(client);
      if (clientObj == undefined) {
        console.log("Client not found");
        continue;
      }
      await clientObj.sendMessage(message, { "private": "console" });
    }
  }
}
