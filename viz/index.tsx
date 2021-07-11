import * as React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import type { Subscription } from 'web3-core-subscriptions'

import { Block, VizBlocks } from './VizBlocks'
import { VizMempool } from './VizMempool'
import type { MempoolTx } from './VizMempool'

interface AppState {
  accounts: string[]
  // recent blocks, newest to oldest
  blocks: Block[]
  // mempool transactions
  mempoolTransactions: MempoolTx[]
}

const MAX_BLOCKS = 10
const FETCH_INT_MS = 4000
const MEMPOOL_MAX_AGE_S = 100
const COL_MS = 250

class App extends React.Component<{}, AppState> {
  fetchTimeout: number
  rerenderInterval?: number
  subPendingTx?: Subscription<string>
  mempool: { [key: string]: number }

  constructor(props: {}) {
    super(props)
    this.fetchTimeout = 0
    this.mempool = {}
    this.state = { accounts: [], blocks: [], mempoolTransactions: [] }
  }

  componentDidMount() {
    this.subscribe()
    this.fetch()
    this.rerenderInterval = window.setInterval(this.rerender, COL_MS)
  }

  componentWillUnmount() {
    this.unsubscribe()
    window.clearTimeout(this.fetchTimeout)
    window.clearInterval(this.rerenderInterval)
  }

  render() {
    const { accounts, blocks, mempoolTransactions } = this.state
    return (
      <div>
        <h2>accounts</h2>
        {accounts.length === 0 && 'no accounts'}
        {accounts.map((a) => (
          <span key={a}>{a}</span>
        ))}
        <h2>blocks</h2>
        <VizBlocks blocks={blocks} />
        <h2>mempool</h2>
        <VizMempool transactions={mempoolTransactions} />
      </div>
    )
  }

  subscribe = async () => {
    this.subPendingTx = await web3.eth.subscribe('pendingTransactions')

    this.subPendingTx.on('data', (hash) => {
      const time = new Date().getTime() * 1e-3
      if (this.mempool[hash]) return
      this.mempool[hash] = time

      // if we're starting a new tick, render the old one
      const { mempoolTransactions } = this.state
      mempoolTransactions.push({ hash, time })
    })
    console.log('subscribed to mempool')
  }

  rerender = () => {
    this.forceUpdate()
  }

  unsubscribe = async () => {
    if (this.subPendingTx) {
      await this.subPendingTx.unsubscribe()
      console.log('unsubscribed from mempool')
    }
  }

  fetch = async () => {
    console.log('fetching accounts')
    const accounts = await web3.eth.getAccounts()

    console.log('fetching recent blocks')
    const txStatus = {} as { [hash: string]: boolean }
    const latestBlock = await web3.eth.getBlock('latest', false)

    const blocks = [] as Block[]
    let nextHashToFetch = latestBlock.hash
    while (blocks.length < MAX_BLOCKS) {
      let block = this.findBlock(nextHashToFetch)
      if (!block) {
        const txBlock = await web3.eth.getBlock(nextHashToFetch, true)
        const promises = txBlock.transactions.map((t) => web3.eth.getTransactionReceipt(t.hash))
        const receiptList = await Promise.all(promises)
        const receipts = {}
        receiptList.forEach((r) => (receipts[r.transactionHash] = r))
        block = Object.assign({ receipts }, txBlock)
      }
      block.transactions.forEach((t) => (txStatus[t.hash] = block.receipts[t.hash].status))
      blocks.push(block)
      nextHashToFetch = block.parentHash
    }

    let { mempoolTransactions } = this.state
    const countBefore = mempoolTransactions.length
    const now = new Date().getTime() * 1e-3
    Object.entries(this.mempool).forEach(([hash, time]) => {
      if (now - time > MEMPOOL_MAX_AGE_S) {
        delete this.mempool[hash]
      }
    })
    mempoolTransactions = mempoolTransactions.filter((t) => !!this.mempool[t.hash])
    mempoolTransactions.forEach((tx) => {
      tx.status = txStatus[tx.hash]
    })
    console.log(`updated mempool, before: ${countBefore} after: ${mempoolTransactions.length} tx`)

    console.log('fetch complete')
    this.setState({ accounts, blocks, mempoolTransactions })
    this.fetchTimeout = window.setTimeout(this.fetch, FETCH_INT_MS)
  }

  findBlock(hash: string) {
    return this.state.blocks.find((b) => b.hash === hash)
  }
}

const web3 = new Web3('ws://192.168.1.25:8546')
const root = document.querySelector('#root')
ReactDOM.render(<App />, root)
