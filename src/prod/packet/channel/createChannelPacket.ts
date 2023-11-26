import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface ICreateChannelPacket extends IPacket {
  networkId: string;
  name: string;
  persistent: boolean;
  whitelist: string[] | undefined;
  type: string;
}

export class CreateChannelPacket implements Packet {
  NETWORK_ID = "create_channel_packet";
  _name!: string;
  _persistent!: boolean;
  _type!: string;
  _whitelist?: string[];

  public static create(
    name: string,
    persistent: boolean,
    whitelist: string[] | undefined,
    type: string = "public",
  ): CreateChannelPacket {
    const packet = new CreateChannelPacket();
    packet._name = name;
    packet._persistent = persistent;
    packet._whitelist = whitelist;
    packet._type = type;
    return packet;
  }

  public static fromJson(
    createChannelPacket: ICreateChannelPacket,
  ): CreateChannelPacket {
    return CreateChannelPacket.create(
      createChannelPacket.name,
      createChannelPacket.persistent,
      createChannelPacket.whitelist,
      createChannelPacket.type,
    );
  }

  public clone(): CreateChannelPacket {
    return CreateChannelPacket.fromJson(this.toJson());
  }

  private toJson(): ICreateChannelPacket {
    return {
      networkId: this.NETWORK_ID,
      name: this._name,
      persistent: this._persistent,
      whitelist: this._whitelist,
      type: this._type,
    };
  }

  public decode(data: Uint8Array): Promise<CreateChannelPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<ICreateChannelPacket>(data).then((json) => {
        resolve(CreateChannelPacket.fromJson(json));
      }).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(_handler: PacketHandlerInterface): Promise<boolean> {
    return _handler.handleCreateChannelPacket(this);
  }
}
