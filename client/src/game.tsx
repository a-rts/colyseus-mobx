import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Client, Room } from "colyseus.js";
import { DataChange } from "@colyseus/schema";
import { GameState } from "./schemas/GameState";
import {
  observable,
  action,
  runInAction,
  extendObservable,
  autorun,
  when,
  decorate,
} from "mobx";
import { observer } from "mobx-react";

// Trying to apply the decorator to the GameState class constructor from here.
// NOTE Does not work.
// When wrapped in `@observable`,
// the `number` value turns into `IObservableValue<number>`.
decorate(GameState, {
  counter: observable,
});

const game = observable({
  room: null as null | Room<GameState>,
});

const client = new Client();

async function joinGame() {
  const room: Room<GameState> = await client.joinOrCreate("game");
  game.room = room;
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
      document.getElementById(
        "interval-counter"
      ).innerText = game.room.state.counter.toString();
    }, 1000);

    game.room.state.onChange = (changes: DataChange[]) => {
      for (const change of changes) {
        if (change.field === "counter") {
          // Just increment the counter OUTSIDE the Game component below.
          // If this counter was tracked within the Game component,
          // MobX would re-render the component because of this onChange
          // and it would falsely appear as if MobX is detecting
          // when game.room.state.counter changes.
          document.getElementById("counter").innerText = change.value;
        }
      }
    };
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
      <div>
        <div>game.room is null: {game.room === null ? "yes" : "no"}</div>
        <div>
          game.room.state.counter:{" "}
          {game.room === null ? "not joined" : game.room.state.counter}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("game"));
