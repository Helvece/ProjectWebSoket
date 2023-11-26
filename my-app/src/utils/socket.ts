import {io, Socket} from 'socket.io-client';
import {decode, EncoderOptions, encode} from '@msgpack/msgpack';
import type {DecodeOptions} from "@msgpack/msgpack/dist/decode";
import {SplitUndefined} from "@msgpack/msgpack/dist/context";
export interface ServerListenerEvent {
    packet(buffer: Uint8Array): void;
}

export interface ServerEmitEvent {
    packet(buffer: Uint8Array): void;
}
export let socket: Socket<ServerListenerEvent, ServerEmitEvent>| undefined;
export let listeners: Map<string, Object> = new Map<string, Object>();
import type {IPacket, IJoinChannelPacket} from "../packet/index";
import AsyncStorage from "@react-native-async-storage/async-storage";


export function encodeAsync<ContextType>(
    value: unknown,
    options: EncoderOptions<SplitUndefined<ContextType>> =
        {} as any
): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        try {
            resolve(encode(value, options));
        } catch (e) {
            reject(e);
        }
    });
}

export function decodeAsync<TypeData, ContextType extends undefined = undefined>(
    bytes: Uint8Array,
    options: any = {} as any
): Promise<TypeData> {
    return new Promise((resolve, reject) => {
        try {
            resolve(decode(bytes, options) as TypeData);
        } catch (e) {
            reject(e);
        }
    });
}

export function getSocket(): Socket<ServerListenerEvent, ServerEmitEvent> {
	if (socket === undefined) {
		throw new Error("Socket is not initialized");
	}
	if (socket.hasListeners("packet")) socket.listeners("packet").slice(0)
	return socket;
}
export function initSocket(name: string, navigation: any) {
	if (socket !== undefined) {
		socket.close();
        listeners.clear();
		socket = undefined;
	}
	socket = io("2.tcp.eu.ngrok.io:12657", {
        path: "/",
        auth: {
            "name": name
        },
        transports: ["websocket"],
		secure: false, 
		rejectUnauthorized: true
    });

}