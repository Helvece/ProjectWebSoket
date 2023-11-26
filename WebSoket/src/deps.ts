import { SplitUndefined } from "https://deno.land/x/msgpack@v1.2/context.ts";
import { EncodeOptions } from "https://deno.land/x/msgpack@v1.2/encode.ts";
export { serve } from "https://deno.land/std@0.166.0/http/server.ts";
export {
  Server,
  type Socket,
} from "https://deno.land/x/socket_io@0.2.0/mod.ts";
export { RemoteSocket } from "https://deno.land/x/socket_io@0.2.0/packages/socket.io/lib/broadcast-operator.ts";

import {
  decode,
  DecodeOptions,
  encode,
} from "https://deno.land/x/msgpack@v1.2/mod.ts";
export function encodeAsync<ContextType>(
  value: unknown,
  options: EncodeOptions<SplitUndefined<ContextType>> = {} as any,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      resolve(encode(value, options));
    } catch (e) {
      reject(e);
    }
  });
}

export function decodeAsync<
  TypeData,
  ContextType extends undefined = undefined,
>(
  bytes: Uint8Array,
  options: DecodeOptions<SplitUndefined<ContextType>> = {} as any,
): Promise<TypeData> {
  return new Promise((resolve, reject) => {
    try {
      resolve(decode(bytes, options) as TypeData);
    } catch (e) {
      reject(e);
    }
  });
}
