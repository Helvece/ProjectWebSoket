import { TextPacket } from "../text/index.ts";
import {
  CreateChannelPacket,
  ErrorChannelPacket,
  GetListChannelPacket,
  JoinChannelPacket,
  LeaveChannelPacket,
} from "../channel/index.ts";
import { GetListClientPacket } from "../list/index.ts";
import { Client } from "../../client/index.ts";
export abstract class PacketHandlerInterface {
  public _client: Client;
  constructor(client: Client) {
    this._client = client;
  }
  public abstract handleTextPacket(_packet: TextPacket): Promise<boolean>;
  public abstract handleCreateChannelPacket(
    _packet: CreateChannelPacket,
  ): Promise<boolean>;
  public abstract handleErrorChannelPacket(
    _packet: ErrorChannelPacket,
  ): Promise<boolean>;
  public abstract handleGetListChannelPacket(
    _packet: GetListChannelPacket,
  ): Promise<boolean>;
  public abstract handleJoinChannelPacket(
    _packet: JoinChannelPacket,
  ): Promise<boolean>;
  public abstract handleLeaveChannelPacket(
    _packet: LeaveChannelPacket,
  ): Promise<boolean>;
  public abstract handleGetListClientPacket(
    _packet: GetListClientPacket,
  ): Promise<boolean>;
}

export class PacketHandler extends PacketHandlerInterface {
  public handleTextPacket(_packet: TextPacket): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleCreateChannelPacket(
    _packet: CreateChannelPacket,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleErrorChannelPacket(
    _packet: ErrorChannelPacket,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleGetListChannelPacket(
    _packet: GetListChannelPacket,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleJoinChannelPacket(_packet: JoinChannelPacket): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleLeaveChannelPacket(
    _packet: LeaveChannelPacket,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
  public handleGetListClientPacket(
    _packet: GetListClientPacket,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(false);
    });
  }
}
