import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

export class DeepState extends Schema {
  @type("string")
  counter: string;
}
export class GameState extends Schema {
  // Continuously incremented from 0 to 99 looping around.
  @type("uint8")
  counter: number = 0;

  // Same as `counter` but in a string within a nested Schema.
  @type(DeepState)
  deep = new DeepState();

  // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // before removing them in reverse.
  @type(["uint8"])
  numbers = new ArraySchema<number>();

  // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // before removing them in reverse.
  @type({ map: "uint8" })
  map = new MapSchema<number>();
}

export default class Game extends Room<GameState> {
  onCreate(options: any) {
    this.setState(new GameState());

    // When this is true, ArraySchema and MapSchema must create
    // a new element to count in.
    let createElement = this.state.counter % 3 === 0;
    let addingElements = true; // when false, createElement means remove element
    let maxElements = 3;
    let elementCounter = 0; // also the index for ArraySchema
    let currentKey = "key" + elementCounter; // for MapSchema

    setInterval(() => {
      // Now start changing parts of the state apart from this.state.counter.

      this.state.deep.counter = "deeeep: " + this.state.counter;

      // NOTE ArraySchema and MapSchema counters below will not count back
      //  their last element and will wait for a bit longer after deleting
      //  all of their elements before starting to add elements again.

      // Change ArraySchema.
      if (addingElements) {
        if (createElement) {
          this.state.numbers.push(0);
        } else {
          this.state.numbers[elementCounter]++;
        }
      } else {
        if (this.state.numbers.length > 0) {
          if (createElement) {
            this.state.numbers.pop();
          } else {
            this.state.numbers[this.state.numbers.length - 1]--;
          }
        }
      }

      // Change MapSchema.
      if (addingElements) {
        if (createElement) {
          this.state.map[currentKey] = 0;
        } else {
          this.state.map[currentKey]++;
        }
      } else {
        const keys = Object.keys(this.state.map);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          if (createElement) {
            delete this.state.map[lastKey];
          } else {
            this.state.map[lastKey]--;
          }
        }
      }

      // Finally, handle the controlling variables for the next iteration.

      // This counter is the backbone of these tests.
      if (this.state.counter >= 99) {
        this.state.counter = 0;
      } else {
        this.state.counter++;
      }

      // Is it time to create/remove the next element?
      createElement = this.state.counter % 3 === 0;

      // Keep track of how many elements have been created in the next loop.
      if (createElement) {
        elementCounter++;
      }

      // Do not create more than the max number of elements.
      // Start removing elements now and count from 0 again.
      // Once that is done, start creating elements again (toggle).
      if (elementCounter >= maxElements) {
        addingElements = !addingElements; // toggle adding/removing
        elementCounter = 0;
      }

      currentKey = "key" + elementCounter;
    }, 1000);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId + " joined");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId + " " + (consented ? "left" : "disconnected"));
  }
}
