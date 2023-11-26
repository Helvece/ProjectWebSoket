import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface ILeaveChannelPacket extends IPacket {
  networkId: string;
  channel: string;
}

export class LeaveChannelPacket implements Packet {
  NETWORK_ID = "leave_channel_packet";
  _channel!: string;

  public static create(channel: string): LeaveChannelPacket {
    const packet = new LeaveChannelPacket();
    packet._channel = channel;
    return packet;
  }

  public static fromJson(
    leaveChannelPacket: ILeaveChannelPacket,
  ): LeaveChannelPacket {
    return LeaveChannelPacket.create(leaveChannelPacket.channel);
  }

  public clone(): LeaveChannelPacket {
    return LeaveChannelPacket.fromJson(this.toJson());
  }

  private toJson(): ILeaveChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      channel: this._channel,
    };
  }

  public decode(data: Uint8Array): Promise<LeaveChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<ILeaveChannelPacket>(data).then((json) => {
        resolve(LeaveChannelPacket.fromJson(json));
      }).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(_handler: PacketHandlerInterface): Promise<boolean> {
    return _handler.handleLeaveChannelPacket(this);
  }
}
