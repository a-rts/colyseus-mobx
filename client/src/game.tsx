import { Schema, ArraySchema, MapSchema } from "@colyseus/schema";
import { Client, Room } from "colyseus.js";
import { decorate, observable, runInAction, when } from "mobx";
import { observer } from "mobx-react";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { GameState } from "./schemas/GameState";

// Trying to apply the decorator to the GameState class constructor from here.
// NOTE Does not work.
// When wrapped in `@observable`,
// the `number` value turns into `IObservableValue<number>`.
decorate(GameState, {
  counter: observable,
});

const game = observable({
  room: null as null | Room<GameState>,
  state: {} as GameState,
});

const client = new Client();

async function joinGame() {
  const room: Room<GameState> = await client.joinOrCreate("game");
  game.room = room;
}

function setValue<T, K extends keyof T>(getValue: ()=> T[K], shadowState: T, field: K) {
  const value = getValue();
  if (value instanceof Schema) {
    // TODO make more robust guard
    if (!shadowState[field]) {
      runInAction(() => {
        shadowState[field] = { ...value};
      });
      wireSchemaChanges(getValue as any, shadowState[field]);
    }
  } else if (value instanceof ArraySchema) {
    // TODO The onAdd and onRemove functions are the same as for MapSchema
    //  but shadowState[field] must be [].
    // TODO Test having Schema/ArraySchema/MapSchema within ArraySchema.
  } else if (value instanceof MapSchema) {
    if (!shadowState[field]) {
      runInAction(() => {
        shadowState[field] = { ...value }; 
      });
      wireMapChanges(getValue as any, shadowState[field]);
    }
    value.triggerAll(); // Do not miss the first element. 
    // TODO Test having Schema/ArraySchema/MapSchema within MapSchema.
  } else { //primitive value
    runInAction(() => {
      shadowState[field] = value;
    });
  }
}

function wireMapChanges<T>(getColyseusState: () => (MapSchema & T), shadowState: T) {
  const colyseusState = getColyseusState();
  colyseusState.onAdd = (_, k) => {
    const key = k as keyof T;
    setValue(() => getColyseusState()[key], shadowState, key);
  };
  colyseusState.onChange = (_, k) => {
    // maybe not an actual change in direct value? need to test with Schema value
    const key = k as keyof T;
    setValue(() => getColyseusState()[key], shadowState, key);
  };
  colyseusState.onRemove = (_, k) => {
    const key = k as keyof T;
    delete shadowState[key];
  };
}

function wireSchemaChanges<T>(getColyseusState:  () => (Schema & T), shadowState: T) {
  const colyseusState = getColyseusState();
  colyseusState.onChange = (changes) => {
    for (const change of changes) {
      const field = change.field as keyof T;
      if (getColyseusState()[field] === undefined){
        delete shadowState[field];
      } else {
        setValue(() => getColyseusState()[field], shadowState, field);
      }
    }
  };
}
joinGame();

// Use MobX to start watching for server state changes
// when the client has connected to the room.
when(
  // Run the second function when this becomes true.
  () => game.room !== null,
  // Runs once when triggered to set the onChange event only once.
  () => {
    // This proves that `game.room.state.counter` is synced and there might
    // be a possibility to also make it observable for MobX.
    setInterval(() => {
      document.getElementById("interval-state").innerText = JSON.stringify(
        game.room.state.numbers,
        null,
        2
      );
      document.getElementById("interval-state").innerText += JSON.stringify(
        game.room.state.map,
        null,
        2
      );
    }, 1000);

    // game.room.state.onChange = (changes: DataChange[]) => {
    //   for (const change of changes) {
    //     if (change.field === "counter") {
    //       // Just increment the counter OUTSIDE the Game component below.
    //       // If this counter was tracked within the Game component,
    //       // MobX would re-render the component because of this onChange
    //       // and it would falsely appear as if MobX is detecting
    //       // when game.room.state.counter changes.
    //       document.getElementById("counter").innerText = change.value;
    //     }
    //   }
    // };
    wireSchemaChanges(() => game.room.state, game.state);
  }
);

// When the room is set, try manipulating the `counter` property
// of the instantiated room state.
when(
  () => game.room !== null,
  () => {
    // Trying to make the `counter` property observable
    // on the instantiated GameState object.
    // NOTE Does not work. Stays at 0 but doesn't break the onChange above.
    // extendObservable(game.room.state, { counter: 0 }); // 0 is default value
    // -----
    // NOTE Does not work. Error: Type 'IObservableValue<number>' is not assignable to type 'number'.
    // game.room.state.counter = observable.box(game.room.state.counter);
  }
);

/**
 * The `@observer` decorator will make this component re-render
 * to update any variables/properties used within the render() function
 * that have been wrapped with `observable()` or decorated with `@observable`.
 */
@observer
class Game extends Component {
  render() {
    return (
      <pre>
        <div>game.room is null: {game.room === null ? "yes" : "no"}</div>
        <div>game.state: {JSON.stringify(game.state, null, 2)}</div>
      </pre>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("game"));
