import {
  ListChannelPacket,
  StatusChannelPacket,
  StatusChannelType,
} from "../packet/channel/index.ts";
import { Client, ClientManager } from "../client/index.ts";
import { Channel } from "./channel.ts";

export class ChannelManager {
  _channels: Map<string, Channel>;

  private static _instance: ChannelManager;

  constructor() {
    this._channels = new Map<string, Channel>();
  }

  public async loadDefaultChannel(): Promise<void> {
    await Channel.create("global", true, undefined, "public", undefined);
  }

  public async registerChannel(channel: Channel): Promise<void> {
    this._channels.set(channel.getName(), channel);
    await ClientManager.broadcastPacket(
      StatusChannelPacket.create(
        channel.getName(),
        channel._type,
        StatusChannelType.ADD,
      ),
      channel.hasWhitelist() ? channel.getWhitelistClients() : undefined,
    );
  }

  public async unregisterChannel(channel: Channel): Promise<void> {
    this._channels.delete(channel.getName());
    await ClientManager.broadcastPacket(
      StatusChannelPacket.create(
        channel.getName(),
        channel._type,
        StatusChannelType.REMOVE,
      ),
      channel.hasWhitelist() ? channel.getWhitelistClients() : undefined,
    );
  }

  public async unregisterChannelByCreator(client: Client): Promise<void> {
    for (const channel of this._channels.values()) {
      if (channel.getCreator() === client) {
        await channel.delete();
      }
    }
  }

  public async disconnectClient(client: Client): Promise<void> {
    for (const channel of this._channels.values()) {
      if (channel.getClients().includes(client)) {
        await channel.removeClient(client);
      }
    }
  }

  public getChannel(name: string): Promise<Channel | undefined> {
    return new Promise((resolve) => {
      resolve(this._channels.get(name));
    });
  }

  public exists(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(this._channels.has(name));
    });
  }

  public getChannels(): Map<string, Channel> {
    return this._channels;
  }

  public static getInstance(): ChannelManager {
    if (!ChannelManager._instance) {
      ChannelManager._instance = new ChannelManager();
    }
    return ChannelManager._instance;
  }

  public getChannelsPacket(
    client: Client,
    type: string[],
  ): Promise<ListChannelPacket> {
    return new Promise((resolve) => {
      const channels = Array.from(this.getChannels().values()).filter((
        channel,
      ) =>
        type.includes(channel._type) &&
        (channel.hasWhitelist()
          ? (channel.getWhitelist() as string[]).includes(client.getName())
          : true)
      ).map((channel) => channel.getName());
      resolve(ListChannelPacket.create(channels));
    });
  }
}
