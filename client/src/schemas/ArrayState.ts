// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.39
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";


export class ArrayState extends Schema {
    @type("uint8") public counter: number;
    @type([ "uint8" ]) public arrayNumbers: ArraySchema<number> = new ArraySchema<number>();
}
