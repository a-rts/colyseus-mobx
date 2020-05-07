// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 0.5.39
// 

import { Schema, type, ArraySchema, MapSchema, DataChange } from "@colyseus/schema";
import { DeepState } from "./DeepState"
import { MapState } from "./MapState"
import { ArrayState } from "./ArrayState"

export class GameState extends Schema {
    @type("uint8") public counter: number;
    @type(DeepState) public deep: DeepState = new DeepState();
    @type([ MapState ]) public arrayMaps: ArraySchema<MapState> = new ArraySchema<MapState>();
    @type({ map: ArrayState }) public mapArrays: MapSchema<ArrayState> = new MapSchema<ArrayState>();
}
