import {
  DefaultEventsMap,
  Packet,
  PacketManager,
  ServerEmitEvent,
  ServerListenerEvent,
  Socket,
} from "./commun.ts";
import { LegacyFormaterChat } from "../chat/index.ts";
import { TextPacket, TextPacketType } from "../packet/text/index.ts";
import { Channel, ChannelManager } from "../channel/index.ts";
import { ClientManager } from "./clientManager.ts";
import { StatusClientPacket, StatusClientType } from "../packet/list/index.ts";
import { PacketHandlerInterface } from "../packet/handler/index.ts";
import { ChatPacketHandler } from "../packet/handler/chat/index.ts";
export interface ClientData {
  name: string;
  client: Client;
}
export class Client {
  _name: string;
  _socket: Socket<
    ServerListenerEvent,
    ServerEmitEvent,
    DefaultEventsMap,
    ClientData
  >;
  _channel: Channel | undefined;
  _handler: PacketHandlerInterface | undefined;
  _game: { [key: string]: boolean } = {};
  constructor(
    name: string,
    socket: Socket<
      ServerListenerEvent,
      ServerEmitEvent,
      DefaultEventsMap,
      ClientData
    >,
  ) {
    this._name = name;
    this._socket = socket;
    this._socket.data.client = this;
    this._channel = undefined;
    this._handler = undefined;
  }

  public getSocket(): Socket<
    ServerListenerEvent,
    ServerEmitEvent,
    DefaultEventsMap,
    ClientData
  > {
    return this._socket;
  }

  public getName(): string {
    return this._name;
  }

  public getChannel(): Promise<Channel | undefined> {
    return new Promise((resolve) => {
      resolve(this._channel);
    });
  }

  public async setChannel(channel: Channel | undefined): Promise<void> {
    if (this._channel !== undefined) {
      await this._channel.removeClient(this, true);
    }
    this._channel = channel;
  }

  public async join(): Promise<void> {
    this.setHandler(new ChatPacketHandler(this));
    (await ChannelManager.getInstance().getChannel("global"))?.addClient(this);
    ClientManager.broadcastPacket(
      StatusClientPacket.create(this.getName(), StatusClientType.ADD),
      (await Array.fromAsync(ClientManager.getInstance().getClients().values()))
        .filter((client) => client.getName() !== this.getName()),
    );
  }

  public async sendMessage(
    message: string,
    parameters: { [key: string]: string } = {},
  ): Promise<void> {
    await this.sendPacket(
      TextPacket.create(TextPacketType.TYPE_PRIVATE_CHAT, message, parameters),
    );
  }

  public async sendBroadcastPrivateMessage(
    message: string,
    parameters: { [key: string]: string } = {},
  ): Promise<void> {
    await this.sendPacket(
      await TextPacket.create(
        TextPacketType.TYPE_BROADCAST_PRIVATE,
        message,
        parameters,
      ),
    );
  }

  public async sendMessageByChannel(
    message: string,
    channel: string,
  ): Promise<void> {
    await this.sendPacket(
      TextPacket.create(TextPacketType.TYPE_CHAT, message, {
        "channel": channel,
      }),
    );
  }

  public async chatPrivate(chat: string, form: string): Promise<void> {
    const cloneChat = chat;
    const messageFormat = new LegacyFormaterChat();
    const formClient = await ClientManager.getInstance().getClient(form);
    if (formClient !== undefined) {
      if (cloneChat.startsWith("/")) {
        const args = cloneChat.slice(1).trim().split(/ +/g);
        const command = args.shift()?.toLowerCase();
        if (command === "oui&non") {
          await this.setGame(form, true);
          await formClient.setGame(this._name, true);
          await this.sendBroadcastPrivateMessage("La partie commence", {
            "private": form,
          });
          await formClient.sendBroadcastPrivateMessage("La partie commence", {
            "private": this._name,
          });
        }
        return;
      }
      const pp = await messageFormat.format({
        "message": cloneChat,
        "name": this._name,
        "time": (new Date()).toLocaleTimeString(),
      });
      await this.sendMessage(pp, { "private": form });
      await formClient.sendMessage(pp, { "private": this._name });
      if (await this.isGame(form) === true) {
        //
        if (
          cloneChat.toLowerCase().includes("oui") ||
          cloneChat.toLowerCase().includes("non")
        ) {
          await this.sendBroadcastPrivateMessage("Vous avez perdu", {
            "private": form,
          });
          await formClient.sendBroadcastPrivateMessage("Vous avez gagné", {
            "private": this._name,
          });
          await this.setGame(form, false);
          await formClient.setGame(this._name, false);
        }
      }
      console.log(pp);
    }
  }

  public async chat(message: string): Promise<void> {
    const cloneChat = message;
    const messageFormat = new LegacyFormaterChat();
    const channel = await this.getChannel();
    if (channel != undefined) {
      const pp = await messageFormat.format({
        "message": cloneChat,
        "name": this._name,
        "time": (new Date()).toLocaleTimeString(),
      });
      await ClientManager.broadcastPacket(
        await TextPacket.create(TextPacketType.TYPE_CHAT, pp, {
          "channel": channel.getName(),
        }),
        channel.getClients(),
      );
      console.log(pp);
    }
  }

  public async chatPrivateGame(chat: string, form: string): Promise<void> {
    const cloneChat = chat;
    const messageFormat = new LegacyFormaterChat();
    const formClient = await ClientManager.getInstance().getClient(form);
    if (formClient !== undefined) {
      const pp = await messageFormat.format({
        "message": cloneChat,
        "name": this._name,
        "time": (new Date()).toLocaleTimeString(),
      });
      await this.sendMessage(pp, { "private": form });
      await formClient.sendMessage(pp, { "private": this._name });
      console.log(pp);
    }
  }

  public async sendPacket(packet: Packet): Promise<void> {
    this._socket.emit("packet", await packet.encode());
  }

  private isGame(from: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(this._game[from] ?? false);
    });
  }

  private setGame(from: string, game: boolean): Promise<void> {
    return new Promise((resolve) => {
      this._game[from] = game;
      resolve();
    });
  }

  public getHandler(): Promise<PacketHandlerInterface | undefined> {
    return new Promise((resolve) => {
      resolve(this._handler);
    });
  }

  public setHandler(
    handler: PacketHandlerInterface | undefined,
  ): Promise<void> {
    return new Promise((resolve) => {
      this._handler = handler;
      resolve();
    });
  }

  public handlePacket = async (buffer: Uint8Array): Promise<void> => {
    const packet = await PacketManager.getInstance().decode(buffer);
    const handler = await this.getHandler();
    try {
      if (handler == undefined || !(await packet.handle(handler))) {
        console.log("Packet not handled");
      }
    } catch (e) {
      console.log(e);
    }
  };
  public disconnect = async (): Promise<void> => {
    await ChannelManager.getInstance().disconnectClient(this);
    ClientManager.broadcastPacket(
      StatusClientPacket.create(this.getName(), StatusClientType.REMOVE),
      (await Array.fromAsync(ClientManager.getInstance().getClients().values()))
        .filter((client) => client.getName() !== this.getName()),
    );
    ClientManager.getInstance().unregisterClient(this);
  };
}
