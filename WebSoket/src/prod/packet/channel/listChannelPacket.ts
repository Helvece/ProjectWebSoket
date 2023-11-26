import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface IListChannelPacket extends IPacket {
  networkId: string;
  channels: string[];
}

export class ListChannelPacket implements Packet {
  NETWORK_ID = "list_channel_packet";
  _channels!: string[];

  public static create(channels: string[]): ListChannelPacket {
    const packet = new ListChannelPacket();
    packet._channels = channels;
    return packet;
  }

  public static fromJson(
    listChannelPacket: IListChannelPacket,
  ): ListChannelPacket {
    return ListChannelPacket.create(listChannelPacket.channels);
  }

  public clone(): ListChannelPacket {
    return ListChannelPacket.fromJson(this.toJson());
  }

  private toJson(): IListChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      channels: [...this._channels],
    };
  }

  public decode(data: Uint8Array): Promise<ListChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IListChannelPacket>(data).then((json) => {
        resolve(ListChannelPacket.fromJson(json));
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
