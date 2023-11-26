import { PacketHandlerInterface } from "./handler/index.ts";
export { PacketManager } from "./packetManager.ts";

export interface Packet {
  NETWORK_ID: string;
  decode(data: Uint8Array): Promise<Packet>;
  encode(): Promise<Uint8Array>;
  handle(handler: PacketHandlerInterface): Promise<boolean>;
}
export interface ServerBounding {
  NETWORK_ID: string;
}
export interface ClientBounding {
  NETWORK_ID: string;
}
export interface IPacket {
  networkId: string;
}
