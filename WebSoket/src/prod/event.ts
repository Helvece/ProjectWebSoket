export interface ServerListenerEvent {
  packet(buffer: Uint8Array): void;
}

export interface ServerEmitEvent {
  packet(buffer: Uint8Array): void;
}
