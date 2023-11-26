import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { decode, encode } from "https://deno.land/x/msgpack@v1.2/mod.ts";
import { decodeAsync } from "../deps.ts";

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
for (let i = 0; i < 10000; i++) {
  list.push(oject);
}
const smallEncodePro: Uint8Array = encode(oject);
const bigEncodePro: Uint8Array = encode(list);
Deno.test(function addSmallDecodePro() {
  assertEquals(decode(smallEncodePro), oject);
});
Deno.test(function addBigDecodePro() {
  assertEquals(decode(bigEncodePro), list);
});

Deno.test(async function addSmallDecodeAsync() {
  assertEquals(await decodeAsync(smallEncodePro), oject);
});

Deno.test(async function addBigDecodeAsync() {
  assertEquals(await decodeAsync(bigEncodePro), list);
});
