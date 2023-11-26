import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export class StatusClientPacket implements Packet {
  NETWORK_ID = "status_client_packet";
  _client!: string;
  _status!: string;

  public static create(client: string, status: string): StatusClientPacket {
    const packet = new StatusClientPacket();
    packet._client = client;
    packet._status = status;
    return packet;
  }

  public static fromJson(
    statusClientPacket: IStatusClientPacket,
  ): StatusClientPacket {
    const packet = new StatusClientPacket();
    packet._client = statusClientPacket.client;
    packet._status = statusClientPacket.status;
    return packet;
  }

  private toJson(): IStatusClientPacket {
    return {
      networkId: this.NETWORK_ID,
      client: this._client,
      status: this._status,
    };
  }

  public decode(data: Uint8Array): Promise<StatusClientPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IStatusClientPacket>(data).then((json) => {
        resolve(StatusClientPacket.fromJson(json));
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

export interface IStatusClientPacket extends IPacket {
  networkId: string;
  client: string;
  status: string;
}

export class StatusClientType {
  public static readonly ADD = "add";
  public static readonly REMOVE = "remove";
  public static readonly UPDATE = "update";
}
