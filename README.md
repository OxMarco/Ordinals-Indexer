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

## ToDo
- [ ] Pagination
- [ ] Token not found error