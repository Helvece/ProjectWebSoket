import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface IClientListPacket extends IPacket {
  networkId: string;
  clients: string[];
}

export class ClientListPacket implements Packet {
  NETWORK_ID = "client_list_packet";
  _clients!: string[];

  public static create(clients: string[]): ClientListPacket {
    const packet = new ClientListPacket();
    packet._clients = clients;
    return packet;
  }

  public static fromJson(
    clientListPacket: IClientListPacket,
  ): ClientListPacket {
    const packet = new ClientListPacket();
    packet._clients = clientListPacket.clients;
    return packet;
  }

  private toJson(): IClientListPacket {
    return {
      networkId: this.NETWORK_ID,
      clients: this._clients,
    };
  }

  public decode(data: Uint8Array): Promise<ClientListPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<IClientListPacket>(data).then((json) => {
        resolve(ClientListPacket.fromJson(json));
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
