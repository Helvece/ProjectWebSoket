import {
  ChannelManager,
  Client,
  ClientData,
  ClientListPacket,
  DefaultEventsMap,
  Packet,
  ServerEmitEvent,
  ServerListenerEvent,
  Socket,
} from "./commun.ts";
export class ClientManager {
  private _clients: Map<string, Client> = new Map<string, Client>();
  private static _instance: ClientManager;

  public registerClient(client: Client): Promise<void> {
    return new Promise((resolve) => {
      this._clients.set(client.getName(), client);
      resolve();
    });
  }

  public async loadClient(
    name: string,
    socket: Socket<
      ServerListenerEvent,
      ServerEmitEvent,
      DefaultEventsMap,
      ClientData
    >,
  ): Promise<void> {
    const client = new Client(name, socket);
    await this.registerClient(client);
  }

  public unregisterClient(client: Client): Promise<void> {
    return (new Promise((resolve) => {
      this._clients.delete(client.getName());
      resolve();
    }));
  }

  public getClient(name: string): Client | undefined {
    return this._clients.get(name);
  }

  public exists(name: string): boolean {
    return this._clients.has(name);
  }

  public getClients(): Map<string, Client> {
    return this._clients;
  }

  public static broadcastPacket(
    packet: Packet,
    target: Array<Client> | undefined = undefined,
  ): Promise<void> {
    return new Promise((resolve) => {
      target = target ??
        Array.from(ClientManager.getInstance().getClients().values());
      for (const client of target) {
        client.sendPacket(packet);
      }
      resolve();
    });
  }

  public static broadcastPackets(
    packets: Packet[],
    target: Array<Client> | undefined = undefined,
  ): Promise<void> {
    return new Promise((resolve) => {
      target = target ??
        Array.from(ClientManager.getInstance().getClients().values());
      for (const packet of packets) {
        for (const client of target) {
          client.sendPacket(packet);
        }
      }
      resolve();
    });
  }

  public static async broadcastMessage(
    message: string,
    target: Array<Client> | undefined = undefined,
  ): Promise<void> {
    target = target ??
      Array.from(ClientManager.getInstance().getClients().values());
    for (const client of target) {
      await client.sendMessage(message);
    }
  }

  public static async broadcastMessageByChannel(
    message: string,
    channelName: string,
    target: Array<Client> | undefined = undefined,
  ): Promise<void> {
    const channel = await ChannelManager.getInstance().getChannel(channelName);
    if (channel == undefined) {
      return;
    }
    target = target ?? Array.from(channel.getClients() ?? []);
    for (const client of target) {
      await client?.sendMessageByChannel(message, channel.getName());
    }
  }

  public static getInstance(): ClientManager {
    if (!ClientManager._instance) {
      ClientManager._instance = new ClientManager();
    }
    return ClientManager._instance;
  }

  public getClientListPacket(client: Client): Promise<ClientListPacket> {
    return new Promise((resolve) => {
      const clients = new Array<string>(
        "console",
        ...Array.from(this.getClients().values()).filter((_client) =>
          _client.getName() !== client.getName()
        ).map((client) => client.getName()),
      );
      resolve(
        ClientListPacket.create(clients),
      );
    });
  }
}
