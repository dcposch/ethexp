# ethereum explorer

experimental.

<img width="1147" alt="image" src="https://user-images.githubusercontent.com/169280/125217912-a4924600-e276-11eb-8ccf-ab37dc7e7012.png">

## quick start

you must be running a Geth full node with the websocket API enabled.

```
geth --ws --ws.api eth,admin,txpool
```

clone the repo, then run the following.

```
cd viz
npm ci
npm start
```
