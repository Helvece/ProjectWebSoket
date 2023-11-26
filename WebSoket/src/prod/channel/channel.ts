import {
  JoinChannelPacket,
  LeaveChannelPacket,
  StatusChannelPacket,
  StatusChannelType,
} from "../packet/channel/index.ts";
import { Client, ClientManager } from "../client/index.ts";
import { TextPacket } from "../packet/text/index.ts";
import { TextPacketType } from "../packet/text/index.ts";
import { Packet } from "../packet/index.ts";
import { ChannelManager } from "./channelManager.ts";

export interface IChannel {
  _name: string;
  _type: string;
  _creator: Client | undefined;
  _clients: Client[];
  _persistent: boolean;
  _whitelist: string[] | undefined;
  addClient(client: Client): Promise<void>;
  removeClient(client: Client): Promise<void>;
  getClients(): Client[];
  getName(): string;
  isPersistent(): boolean;
}

export class Channel implements IChannel {
  _name: string;
  _type: string;
  _creator: Client | undefined;
  _clients: Client[];
  _persistent: boolean;
  _whitelist: string[] | undefined;

  constructor(
    name: string,
    type: string,
    persistent: boolean,
    whitelist: string[] | undefined,
    creator: Client | undefined,
  ) {
    this._name = name;
    this._creator = creator;
    this._type = type;
    this._persistent = persistent;
    this._whitelist = whitelist;
    this._clients = creator instanceof Client ? [creator as Client] : [];
  }

  public setCreator(client: Client): Promise<void> {
    return new Promise((resolve) => {
      this._creator = client;
      resolve();
    });
  }

  public getCreator(): Client | undefined {
    return this._creator;
  }

  public getName(): string {
    return this._name;
  }

  public static async create(
    name: string,
    persistent: boolean,
    whitelist: string[] | undefined,
    type: string,
    create: Client | undefined,
  ): Promise<Channel> {
    if (await ChannelManager.getInstance().exists(name)) {
      throw new Error(`Channel ${name} already exists.`);
    }
    const channel = new Channel(name, type, persistent, whitelist, create);
    await ChannelManager.getInstance().registerChannel(channel);
    return channel;
  }

  public hasWhitelist(): boolean {
    return this._whitelist !== undefined;
  }

  public addWhitelist(name: string): Promise<void> {
    return new Promise((resolve) => {
      this._whitelist?.push(name);
      resolve();
    });
  }

  public removeWhitelist(name: string): Promise<void> {
    return new Promise((resolve) => {
      this._whitelist?.slice(this._whitelist.indexOf(name), 1);
      resolve();
    });
  }

  public getWhitelist(): string[] | undefined {
    return this._whitelist;
  }

  public getWhitelistClients(): Client[] {
    return !this._whitelist
      ? []
      : this._whitelist.filter((name) =>
        !ClientManager.getInstance().exists(name)
      ).map<Client>((name) =>
        ClientManager.getInstance().getClient(name) as Client
      );
  }

  public async delete(): Promise<void> {
    await ChannelManager.getInstance().unregisterChannel(this);
    ClientManager.broadcastPacket(
      LeaveChannelPacket.create(this.getName()),
      this.getClients(),
    );
    for (const client of [...this.getClients()]) {
      if (!client) {
        continue;
      }
      (await ChannelManager.getInstance().getChannel("global"))?.addClient(
        client,
      );
    }
    await ClientManager.broadcastPacket(
      StatusChannelPacket.create(
        this.getName(),
        this._type,
        StatusChannelType.REMOVE,
      ),
    );
    return;
  }

  public async sendPacket(packet: Packet): Promise<void> {
    for (const client of this.getClients()) {
      await client.sendPacket(packet);
    }
  }

  public async addClient(client: Client): Promise<void> {
    if (
      this.hasWhitelist() &&
      !(this.getWhitelist() as string[]).includes(client.getName())
    ) {
      throw new Error(`You are not whitelisted on this channel`);
    }
    this._clients.push(client);
    await client.setChannel(this);
    await client.sendPacket(JoinChannelPacket.create(this.getName()));
    await ClientManager.broadcastPacket(
      TextPacket.create(
        TextPacketType.TYPE_BROADCAST_CHANEL,
        `${client.getName()} joined the channel`,
        { "channel": this.getName() },
      ),
      this.getClients(),
    );
  }

  public async removeClient(
    client: Client,
    silence: boolean = false,
  ): Promise<void> {
    delete this._clients[this._clients.indexOf(client)];
    if (!silence) {
      await client.setChannel(undefined);
    }
    this._clients = this._clients.filter((client) => client !== undefined);
    if (
      (this._clients.length === 0 && !this.isPersistent()) ||
      this._creator === client
    ) {
      this.delete();
      return;
    }
    await ClientManager.broadcastPacket(
      TextPacket.create(
        TextPacketType.TYPE_BROADCAST_CHANEL,
        `${client.getName()} left the channel`,
        { "channel": this.getName() },
      ),
      this.getClients(),
    );
  }

  public getClients(): Client[] {
    return this._clients;
  }

  public isPersistent(): boolean {
    return this._persistent;
  }
}
