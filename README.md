# Indexer
Indexing Pipe protocol tokens and related actions like transfers, deployments, mintings, etc.

## Description
### App
Contains the main application bootstrapping logic, to init the queue, the scheduler and the database connections.

### Indexer
Contains the indexer peripheral logic:
* *controller*: in charge of replying to user requests to the REST endpoint;
* *service*: connecting the rest of the app to the indexer;
* *scheduler*: running a periodic task to index the next block;
* *bot*: a discord bot to allow users to query token data and receive technical support from discord servers;

## Functions
* index blocks and extract relevant data (mint, transfer and deploy);
* store data in a database and retrieve it from a REST API;
* configurable caching on REST responses to reduce load;
* job queue to detach CPU-intensive tasks from the main thread;
* provide a discord bot to query data and receive technical support;
* provide a websocket connection to receive real-time updates on the indexed data;
* uploads files to ipfs

## Tech Stack
- NestJS
- MongoDB with Mongoose
- Redis queue
- Socket.io
- Necord with discord.js
- OpenAI lib

## API Endpoints
**General**
- `[GET] /`
  returns a standard response to check server status
- `[POST] /upload`
  returns the cid of the uploaded file to IPFS

**Indexer**
- `[GET] /indexer/block`
  return latest block indexed
- `[GET] /indexer/tokens`
  returns a list of all tokens
- `[GET] /indexer/get-token/:ticker`
  returns all tokens with the given ticker
- `[GET] /indexer/get-token/:ticker/:id`
  returns the specific token data
- `[GET] /indexer/balance/:ticker/:id/:address`
  returns the balance of the given address for the given token
- `[GET] /indexer/:address`
  returns all the tokens held by the given address
- `[GET] /indexer/token-metadata/:ticker/:id`
  returns the metadata (image, html page or audio) of the given token

## ToDo
- [ ] Remove comments from caching
- [ ] Test pagination
