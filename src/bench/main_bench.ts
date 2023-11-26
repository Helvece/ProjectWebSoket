import { decodeAsync, encodeAsync } from "../deps.ts";
import { decode, encode } from "https://deno.land/x/msgpack@v1.2/mod.ts";

const oject = {
  name: "test",
  age: 12,
  address: "test",
  phone: "0123456789",
  email: "te@yopmail.com",
  date: new Date(),
  float: 12.3,
  bool: true,
  array: [1, 2, 3],
  object: [
    {
      name: "test",
      age: 12,
      familyRole: "test",
    },
    {
      name: "test",
      age: 12,
      familyRole: "test",
    },
  ],
};
const list: Array<unknown> = [];
for (let i = 0; i < 100; i++) {
  list.push(oject);
}
const smallEncodePro: Uint8Array = encode(oject);
const bigEncodePro: Uint8Array = encode(list);
Deno.bench(async function smallEncodeAsync(): Promise<void> {
  for (let i = 0; i < 10000; i++) {
    await encodeAsync(oject);
  }
});
Deno.bench(function smallEncode(): void {
  for (let i = 0; i < 10000; i++) {
    encode(oject);
  }
});

Deno.bench(async function bigEncodeAsync(): Promise<void> {
  for (let i = 0; i < 10000; i++) {
    await encodeAsync(list);
  }
});

Deno.bench(function bigEncode() {
  for (let i = 0; i < 10000; i++) {
    encode(list);
  }
});

Deno.bench(async function smallDecodeAsync(): Promise<void> {
  for (let i = 0; i < 10000; i++) {
    await decodeAsync(smallEncodePro);
  }
});

Deno.bench(function smallDecode(): void {
  for (let i = 0; i < 10000; i++) {
    decode(smallEncodePro);
  }
});
Deno.bench(async function bigDecodeAsync(): Promise<void> {
  for (let i = 0; i < 10000; i++) {
    await decodeAsync(bigEncodePro);
  }
});
Deno.bench(function bigDecode() {
  for (let i = 0; i < 10000; i++) {
    decode(bigEncodePro);
  }
});
