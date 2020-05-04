//
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
//
// GENERATED USING @colyseus/schema 0.5.39
//

import {
  Schema,
  type,
  ArraySchema,
  MapSchema,
  DataChange,
} from "@colyseus/schema";
import { observable } from "mobx";

export class GameState extends Schema {
  @observable @type("uint8") public counter: number;
}
