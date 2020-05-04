# colyseus-mobx

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
