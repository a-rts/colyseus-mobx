// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.39
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";


export class MapState extends Schema {
    @type("uint8") public counter: number;
    @type({ map: "uint8" }) public mapNumbers: MapSchema<number> = new MapSchema<number>();
}
