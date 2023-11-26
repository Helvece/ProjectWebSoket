import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface IStatusChannelPacket extends IPacket {
  networkId: string;
  channel: string;
  type: string;
  status: string;
}

export class StatusChannelType {
  public static readonly ADD = "add";
  public static readonly REMOVE = "remove";
  public static readonly UPDATE = "update";
}

export class ChannelType {
  public static readonly PUBLIC = "public";
  public static readonly PRIVATE = "private";
  public static readonly WHITELISTED = "whitelisted";
}

export class StatusChannelPacket implements Packet {
  NETWORK_ID = "status_channel_packet";
  _channel!: string;
  _type!: string;
  _status!: string;

  public static create(
    channel: string,
    type: string,
    status: string,
  ): StatusChannelPacket {
    const packet = new StatusChannelPacket();
    packet._channel = channel;
    packet._status = status;
    packet._type = type;
    return packet;
  }

  public static fromJson(
    statusChannelPacket: IStatusChannelPacket,
  ): StatusChannelPacket {
    return StatusChannelPacket.create(
      statusChannelPacket.channel,
      statusChannelPacket.type,
      statusChannelPacket.status,
    );
  }

  public clone(): StatusChannelPacket {
    return StatusChannelPacket.fromJson(this.toJson());
  }

  private toJson(): IStatusChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      channel: this._channel,
      type: this._type,
      status: this._status,
    };
  }

  public decode(data: Uint8Array): Promise<StatusChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IStatusChannelPacket>(data).then((json) => {
        resolve(StatusChannelPacket.fromJson(json));
      }).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(_handler: PacketHandlerInterface): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
