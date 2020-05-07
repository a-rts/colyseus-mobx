import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

const counterTick = 1000;
const subcounterTicksPerCounter = 5;

export class DeepState extends Schema {
  @type("string")
  counter: string;
}

export class ArrayState extends Schema {
  // Continuously incremented from 0 to 99 looping around.
  @type("uint8")
  counter: number = 0;

  // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // before removing them in reverse.
  @type(["uint8"])
  arrayNumbers = new ArraySchema<number>();

  private interval: NodeJS.Timeout;

  stop() {
    clearInterval(this.interval);
  }

  constructor() {
    super();

    // When createElement is true, a new element must be created during this tick.
    let createElement = this.counter % 3 === 0;
    let addingElements = true; // when false, createElement means remove element
    let maxElements = 3;
    let elementCounter = 0; // also the index for ArraySchema

    // TODO !!! Unset MapState and ArrayState intervals when removing them!

    this.interval = setInterval(() => {
      // Change ArraySchema.
      if (addingElements) {
        if (createElement) {
          this.arrayNumbers.push(0);
        } else {
          this.arrayNumbers[elementCounter]++;
        }
      } else {
        if (this.arrayNumbers.length > 0) {
          if (createElement) {
            this.arrayNumbers.pop();
          } else {
            this.arrayNumbers[this.arrayNumbers.length - 1]--;
          }
        }
      }

      // Finally, handle the controlling variables for the next iteration.

      // This counter is the backbone of these tests.
      if (this.counter >= 99) {
        this.counter = 0;
      } else {
        this.counter++;
      }

      // Is it time to create/remove the next element?
      createElement = this.counter % 3 === 0;

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
    }, counterTick / subcounterTicksPerCounter);
  }
}

export class MapState extends Schema {
  // Continuously incremented from 0 to 99 looping around.
  @type("uint8")
  counter: number = 0;

  // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // before removing them in reverse.
  @type({ map: "uint8" })
  mapNumbers = new MapSchema<number>();

  private interval: NodeJS.Timeout;

  stop() {
    clearInterval(this.interval);
  }

  constructor() {
    super();

    // When createElement is true, a new element must be created during this tick.
    let createElement = this.counter % 3 === 0;
    let addingElements = true; // when false, createElement means remove element
    let maxElements = 3;
    let elementCounter = 0;
    let currentKey = "key" + elementCounter; // for MapSchema

    this.interval = setInterval(() => {
      // Change MapSchema.
      if (addingElements) {
        if (createElement) {
          this.mapNumbers[currentKey] = 0;
        } else {
          this.mapNumbers[currentKey]++;
        }
      } else {
        const keys = Object.keys(this.mapNumbers);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          if (createElement) {
            delete this.mapNumbers[lastKey];
          } else {
            this.mapNumbers[lastKey]--;
          }
        }
      }

      // Finally, handle the controlling variables for the next iteration.

      // This counter is the backbone of these tests.
      if (this.counter >= 99) {
        this.counter = 0;
      } else {
        this.counter++;
      }

      // Is it time to create/remove the next element?
      createElement = this.counter % 3 === 0;

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
    }, counterTick / subcounterTicksPerCounter);
  }
}

export class GameState extends Schema {
  // Continuously incremented from 0 to 99 looping around.
  @type("uint8")
  counter: number = 0;

  // Same as `counter` but in a string within a nested Schema.
  @type(DeepState)
  deep = new DeepState();

  // // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // // before removing them in reverse.
  // @type(["uint8"])
  // arrayNumbers = new ArraySchema<number>();

  // // Adds 3 elements one-by-one, counting from 0 to 2 on each
  // // before removing them in reverse.
  // @type({ map: "uint8" })
  // mapNumbers = new MapSchema<number>();

  @type([MapState])
  arrayMaps = new ArraySchema<MapState>();

  @type({ map: ArrayState })
  mapArrays = new MapSchema<ArrayState>();
}

export default class Game extends Room<GameState> {
  onCreate(options: any) {
    this.setState(new GameState());

    // When createElement is true, ArraySchema and MapSchema
    // must create a new element to count in.
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
          const mapState = new MapState();
          this.state.arrayMaps.push(mapState);
        }
      } else {
        if (this.state.arrayMaps.length > 0) {
          if (createElement) {
            const mapState = this.state.arrayMaps.pop();
            mapState.stop();
          }
        }
      }

      // Change MapSchema.
      if (addingElements) {
        if (createElement) {
          const arrayState = new ArrayState();
          this.state.mapArrays[currentKey] = arrayState;
        }
      } else {
        const keys = Object.keys(this.state.mapArrays);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          if (createElement) {
            this.state.mapArrays[lastKey].stop();
            delete this.state.mapArrays[lastKey];
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
    }, counterTick);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId + " joined");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId + " " + (consented ? "left" : "disconnected"));
  }
}
