import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { ClientBounding, IPacket, Packet } from "../index.ts";
export interface IErrorChannelPacket extends IPacket {
  networkId: string;
  channel: string;
  error: string;
}
export class ErrorChannelPacket implements Packet, ClientBounding {
  NETWORK_ID = "error_channel_room_packet";
  _channel!: string;
  _error!: string;

  public static create(channel: string, error: string): ErrorChannelPacket {
    const packet = new ErrorChannelPacket();
    packet._channel = channel;
    packet._error = error;
    return packet;
  }

  public static fromJson(
    errorChannelRoomPacket: IErrorChannelPacket,
  ): ErrorChannelPacket {
    return ErrorChannelPacket.create(
      errorChannelRoomPacket.channel,
      errorChannelRoomPacket.error,
    );
  }

  public clone(): ErrorChannelPacket {
    return ErrorChannelPacket.fromJson(this.toJson());
  }

  private toJson(): IErrorChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      channel: this._channel,
      error: this._error,
    };
  }

  public decode(data: Uint8Array): Promise<ErrorChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IErrorChannelPacket>(data).then((json) => {
        resolve(ErrorChannelPacket.fromJson(json));
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
