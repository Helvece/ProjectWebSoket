import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export class GetListClientPacket implements Packet {
  NETWORK_ID = "get_list_client_packet";

  public static create(): GetListClientPacket {
    const packet = new GetListClientPacket();
    return packet;
  }

  public static fromJson(): GetListClientPacket {
    const packet = new GetListClientPacket();
    return packet;
  }

  private toJson(): IPacket {
    return {
      networkId: this.NETWORK_ID,
    };
  }

  public decode(data: Uint8Array): Promise<GetListClientPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IPacket>(data).then(() => {
        resolve(GetListClientPacket.fromJson());
      }).catch(reject);
    });
  }
  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(handler: PacketHandlerInterface): Promise<boolean> {
    return handler.handleGetListClientPacket(this);
  }
}
