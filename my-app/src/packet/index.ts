export interface IPacket {
  networkId: string;
}

export interface ITextPacket extends IPacket {
  type: number;
  message: string;
  parameters: { [key: string]: string } | undefined;
}

export class TextPacketType {
  public static readonly TYPE_CHAT = 0;
  public static readonly TYPE_PRIVATE_CHAT = 1;
  public static readonly TYPE_BROADCAST_CHANEL = 2;
  public static readonly TYPE_BROADCAST_ADMIN = 3;
}

export interface IClientListPacket extends IPacket {
  clients: string[];
}

export interface IStatusClientPacket extends IPacket {
  client: string;
  status: string;
}

export class StatusClientType {
  public static readonly ADD = "add";
  public static readonly REMOVE = "remove";
  public static readonly UPDATE = "update";
}

export interface IListChannelPacket extends IPacket {
  channels: string[];
}

export class StatusChannelType {
  public static readonly ADD = "add";
  public static readonly REMOVE = "remove";
  public static readonly UPDATE = "update";
}

export class ChannelType {
  public static readonly PUBLIC = "public";
  public static readonly PRIVATE = "private";
  public static readonly WHITELISTED = "whitelisted";
}

export interface IStatusChannelPacket extends IPacket {
  channel: string;
  type: string;
  status: string;
}

export interface ILeaveChannelPacket extends IPacket {
  channel: string;
}

export interface IJoinChannelPacket extends IPacket {
  channel: string;
}

export interface IErrorChannelPacket extends IPacket {
  channel: string;
  error: string;
}

export interface ICreateChannelPacket extends IPacket {
  name: string;
  persistent: boolean;
  whitelist: string[] | undefined;
  type: string;
}
