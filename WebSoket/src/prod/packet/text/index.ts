import { decodeAsync, encodeAsync } from "../../../deps.ts";
import { PacketHandlerInterface } from "../handler/index.ts";
import { IPacket, Packet } from "../index.ts";

export interface ITextPacket extends IPacket {
  networkId: string;
  type: number;
  message: string;
  parameters: { [key: string]: string } | undefined;
}

export class TextPacket implements Packet {
  NETWORK_ID = "text_packet";
  static NETWORK_ID = "text_packet";
  _type!: number;
  _message!: string;
  _parameters: { [key: string]: string } = {};

  public static create(
    type: number,
    message: string,
    parameters: { [key: string]: string },
  ): TextPacket {
    const packet = new TextPacket();

    packet._type = type;
    packet._message = message;
    packet._parameters = parameters;
    return packet;
  }

  public static fromJson(textPacket: ITextPacket): TextPacket {
    return TextPacket.create(
      textPacket.type,
      textPacket.message,
      textPacket.parameters ?? {},
    );
  }

  public clone(): TextPacket {
    return TextPacket.fromJson(this.toJson());
  }

  private toJson(): ITextPacket {
    return {
      networkId: this.NETWORK_ID,
      type: this._type,
      message: this._message,
      parameters: { ...this._parameters },
    };
  }

  public decode(data: Uint8Array): Promise<TextPacket> {
    return new Promise((resolve, reject) => {
      decodeAsync<ITextPacket>(data).then((json) => {
        const packet = TextPacket.fromJson(json);
        resolve(packet);
      }).catch(reject);
    });
  }

  public encode(): Promise<Uint8Array> {
    return encodeAsync(this.toJson());
  }

  public handle(handler: PacketHandlerInterface): Promise<boolean> {
    return handler.handleTextPacket(this);
  }
}

export class TextPacketType {
  public static readonly TYPE_CHAT = 0;
  public static readonly TYPE_PRIVATE_CHAT = 1;
  public static readonly TYPE_BROADCAST_CHANEL = 2;
  public static readonly TYPE_BROADCAST_ADMIN = 3;
  public static readonly TYPE_BROADCAST_PRIVATE = 4;
}
