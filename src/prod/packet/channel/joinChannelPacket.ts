import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { ClientBounding, IPacket, Packet, ServerBounding } from "../index.ts";

export interface IJoinChannelPacket extends IPacket {
  networkId: string;
  channel: string;
}

export class JoinChannelPacket
  implements Packet, ClientBounding, ServerBounding {
  NETWORK_ID = "join_channel_packet";
  _channel!: string;

  public static create(channel: string): JoinChannelPacket {
    const packet = new JoinChannelPacket();
    packet._channel = channel;
    return packet;
  }

  public static fromJson(
    joinRoomPacket: IJoinChannelPacket,
  ): JoinChannelPacket {
    const packet = new JoinChannelPacket();
    packet._channel = joinRoomPacket.channel;
    return packet;
  }

  private toJson(): IJoinChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      channel: this._channel,
    };
  }

  public decode(data: Uint8Array): Promise<JoinChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IJoinChannelPacket>(data).then((json) => {
        resolve(JoinChannelPacket.fromJson(json));
      }).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(_handler: PacketHandlerInterface): Promise<boolean> {
    return _handler.handleJoinChannelPacket(this);
  }
}
