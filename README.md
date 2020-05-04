# colyseus-mobx

This repository holds experiments for trying make MobX observe Colyseus synchronised state on the client.

## About the Server

The entry point `index.ts` sets up just one Colyseus room with synchronised state `GameState` that contains only one property - `counter`.

When the room is created by a client, the server starts counting from 1 to 100 every second in the state and when it reaches 100 it starts over from 1.

The room, state and counter are all built in `server/game.ts`.

## Experiments

The Colyseus-generated schema that gets synchronised is located at `client/src/schemas/GameState.ts`.

All of the experiments using The Colyseus client library colyseus.js and MobX are built at `client/src/game.tsx`.

This uses a single React component decorated with MobX `@observer` to show the experiments.

There are some direct HTML-manipulation functions outside the React component to double-check that the state from the server is being synchronised.

All of the experiments in this file are commented to describe what they are trying to do. However, most of them are commented out, so you'll have to put some into comments and uncomment some to test them.

You don't have to restart the server to test changes made to the client code.
If you change the server code, that needs a server restart.

## Setup

After cloning, you have to install both the server and the client:

```
npm i && cd client && npm i && cd ..
```

## Usage

**Run these commands only in the project root directory.**

To generate Colyseus schemas for the client and start the development server:

```
npm run dev
```

To start the development server without regenerating schemas (if you want to edit files in `client/src/schemas`):

```
npm run server:dev
```

## Notes

Webpack provides Hot Module Replacement during development.
https://webpack.js.org/api/hot-module-replacement/
