import { PacketHandler } from "../index.ts";
import { TextPacket, TextPacketType } from "../../text/index.ts";
import { Channel, ChannelManager } from "../../../channel/index.ts";
import {
  CreateChannelPacket,
  ErrorChannelPacket,
  GetListChannelPacket,
  JoinChannelPacket,
  LeaveChannelPacket,
} from "../../channel/index.ts";

import { GetListClientPacket } from "../../list/index.ts";
import { ClientManager } from "../../../client/index.ts";

export class ChatPacketHandler extends PacketHandler {
  public async handleTextPacket(_packet: TextPacket): Promise<boolean> {
    const type = _packet._type;
    const message = _packet._message;
    const parameters = _packet._parameters;
    switch (type) {
      case TextPacketType.TYPE_PRIVATE_CHAT: {
        const target = parameters["target"];
        await this._client.chatPrivate(message, target);
        return true;
      }
      case TextPacketType.TYPE_CHAT: {
        await this._client.chat(message);
        return true;
      }
    }
    return false;
  }

  public async handleJoinChannelPacket(
    _packet: JoinChannelPacket,
  ): Promise<boolean> {
    const channelName = _packet._channel;
    const channel = await ChannelManager.getInstance().getChannel(channelName);
    if (channel) {
      await channel.addClient(this._client);
      return true;
    }
    return false;
  }

  public async handleLeaveChannelPacket(
    _packet: LeaveChannelPacket,
  ): Promise<boolean> {
    const channelName = _packet._channel;
    const channel = await ChannelManager.getInstance().getChannel(channelName);
    if (channel) {
      await channel.removeClient(this._client);
      return true;
    }
    return false;
  }

  public async handleGetListClientPacket(
    _packet: GetListClientPacket,
  ): Promise<boolean> {
    await this._client.sendPacket(
      await ClientManager.getInstance().getClientListPacket(this._client),
    );
    return true;
  }

  public async handleGetListChannelPacket(
    _packet: GetListChannelPacket,
  ): Promise<boolean> {
    await this._client.sendPacket(
      await ChannelManager.getInstance().getChannelsPacket(
        this._client,
        _packet._type,
      ),
    );
    return true;
  }

  public async handleCreateChannelPacket(
    _packet: CreateChannelPacket,
  ): Promise<boolean> {
    const channelName = _packet._name;
    const channelType = _packet._type;
    try {
      const channel = await Channel.create(
        channelName,
        _packet._persistent,
        _packet._whitelist,
        channelType,
        this._client,
      );
      await this._client.setChannel(channel);
      return true;
    } catch (e) {
      this._client.sendPacket(await ErrorChannelPacket.create(name, e));
      console.log(e);
    }

    return false;
  }
}
