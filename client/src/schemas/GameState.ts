// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.39
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { DeepState } from "./DeepState"

export class GameState extends Schema {
    @type("uint8") public counter: number;
    @type(DeepState) public deep: DeepState = new DeepState();
    @type([ "uint8" ]) public numbers: ArraySchema<number> = new ArraySchema<number>();
    @type({ map: "uint8" }) public map: MapSchema<number> = new MapSchema<number>();
}
