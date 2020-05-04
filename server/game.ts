import { Room, Client } from "colyseus";
import { Schema, type } from "@colyseus/schema";

export class GameState extends Schema {
  @type("uint8")
  counter: number;
}

/**
 * Upon creation, this room will always continuously increment
 * the counter from 1 to 100 every second.
 * When it reaches 100, it starts over from 1.
 */
export default class Game extends Room<GameState> {
  onCreate(options: any) {
    this.setState(new GameState());
    this.state.counter = 1;

    // Start counting.
    setInterval(() => {
      if (this.state.counter >= 100) {
        this.state.counter = 1;
      } else {
        this.state.counter++;
      }
    }, 1000);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId + " joined");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId + " " + (consented ? "left" : "disconnected"));
  }
}
