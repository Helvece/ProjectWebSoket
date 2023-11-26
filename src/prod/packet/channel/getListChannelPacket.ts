import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { Packet } from "../index.ts";

export class GetListChannelPacket implements Packet {
  NETWORK_ID = "get_list_channel_packet";
  _type!: string[];

  public static create(type: string[]): GetListChannelPacket {
    const packet = new GetListChannelPacket();
    packet._type = type;
    return packet;
  }

  public static fromJson(
    data: { networkId: string; type: string[] },
  ): GetListChannelPacket {
    return GetListChannelPacket.create(data.type);
  }

  public clone(): GetListChannelPacket {
    return GetListChannelPacket.fromJson(this.toJson());
  }

  private toJson(): { networkId: string; type: string[] } {
    return {
      networkId: this.NETWORK_ID,
      type: this._type,
    };
  }

  public decode(data: Uint8Array): Promise<GetListChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<{ networkId: string; type: string[] }>(data).then(
        (packet) => {
          resolve(GetListChannelPacket.fromJson(packet));
        },
      ).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(_handler: PacketHandlerInterface): Promise<boolean> {
    return _handler.handleGetListChannelPacket(this);
  }
}
