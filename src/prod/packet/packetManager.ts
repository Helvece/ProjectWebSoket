import { decodeAsync } from "../../deps.ts";
import {
  CreateChannelPacket,
  ErrorChannelPacket,
  GetListChannelPacket,
  JoinChannelPacket,
  LeaveChannelPacket,
  ListChannelPacket,
  StatusChannelPacket,
} from "./channel/index.ts";
import { IPacket, Packet } from "./index.ts";
import {
  ClientListPacket,
  GetListClientPacket,
  StatusClientPacket,
} from "./list/index.ts";
import { TextPacket } from "./text/index.ts";

export class PacketManager {
  private _packets: Map<string, Packet> = new Map<string, Packet>();
  private static _instance: PacketManager;

  constructor() {
    this.loadPackets();
  }

  public registerPacket(packet: Packet): void {
    this._packets.set(packet.NETWORK_ID, packet);
  }

  public getPacket(networkId: string): Packet | undefined {
    return this._packets.get(networkId);
  }

  public static getInstance(): PacketManager {
    if (!PacketManager._instance) {
      PacketManager._instance = new PacketManager();
    }
    return PacketManager._instance;
  }

  private loadPackets(): void {
    this.registerPacket(new TextPacket());
    this.registerPacket(new JoinChannelPacket());
    this.registerPacket(new CreateChannelPacket());
    this.registerPacket(new ErrorChannelPacket());
    this.registerPacket(new LeaveChannelPacket());
    this.registerPacket(new ListChannelPacket());
    this.registerPacket(new StatusChannelPacket());
    this.registerPacket(new StatusClientPacket());
    this.registerPacket(new ListChannelPacket());
    this.registerPacket(new ClientListPacket());
    this.registerPacket(new GetListClientPacket());
    this.registerPacket(new GetListChannelPacket());
  }

  public decode(data: Uint8Array): Promise<Packet> {
    return new Promise((resolve, reject) => {
      decodeAsync<IPacket>(data).then((Packet) => {
        const packet = this.getPacket(Packet.networkId);
        if (packet) {
          packet.decode(data).then(resolve).catch(reject);
        } else {
          reject("Packet not found");
        }
      }).catch(reject);
    });
  }

  public encode(packet: Packet): Promise<Uint8Array> {
    return packet.encode();
  }
}
