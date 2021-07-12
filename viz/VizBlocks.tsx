import * as React from 'react'
import { useState } from 'react'

import type { BlockTransactionObject, TransactionReceipt } from 'web3-eth'

const PX_PER_SQRT_S = 50

export interface Block extends BlockTransactionObject {
  receipts: { [hash: string]: TransactionReceipt }
}

export function VizBlocks({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return null
  }

  let nextBlockTime = new Date().getTime() * 1e-3
  // calculate where the next block would be (offscreen)
  // so that one it arrives, the animation is seamless
  let rightPx = -blockGapPx(nextBlockTime, blocks[0].timestamp as number)
  const blocksPlusOffscreenBlock = (
    [
      {
        difficulty: 0,
        extraData: '',
        gasLimit: 0,
        gasUsed: 0,
        hash: '',
        logsBloom: '',
        miner: '',
        nonce: '',
        number: blocks[0].number + 1,
        parentHash: '',
        receiptRoot: '',
        receipts: {},
        sha3Uncles: '',
        size: 0,
        stateRoot: '',
        timestamp: nextBlockTime,
        totalDifficulty: 0,
        transactionRoot: '',
        transactions: [],
        uncles: [],
      },
    ] as Block[]
  ).concat(blocks)

  return (
    <div className='viz-blocks'>
      <hr></hr>
      {blocksPlusOffscreenBlock.map((b, i) => {
        if (i > 0) rightPx += blockGapPx(nextBlockTime, b.timestamp as number)
        nextBlockTime = b.timestamp as number
        return <Block key={b.number} block={b} rightPx={rightPx} />
      })}
    </div>
  )
}

function blockGapPx(timestampNew: number, timestampParent: number) {
  const gapPx = Math.sqrt(Math.max(0, timestampNew - timestampParent)) * PX_PER_SQRT_S
  return Math.max(gapPx, 85)
}

const STRIDE_PX = 3
const TX_PER_ROW = 25

function Block({ block, rightPx }: { block?: Block; rightPx: number }) {
  const isLatest = rightPx === 0
  let contents = null
  if (block) {
    contents = (
      <>
        <div className='viz-block-box'>
          <div className='viz-block-num'>
            {isLatest ? <strong>#{block.number}</strong> : block.number}
          </div>
          <div className='viz-block-gas'>{printGas(block.gasUsed)} gas</div>
        </div>
        <div className='viz-block-txs'>
          {block.transactions.map((t, i) => {
            const left = (i % TX_PER_ROW) * STRIDE_PX
            const top = ((i / TX_PER_ROW) | 0) * STRIDE_PX
            const status = block.receipts[t.hash].status
            return (
              <div
                key={t.hash}
                className={`viz-tx viz-tx-${status ? 'succeeded' : 'reverted'}`}
                style={{ left: left + 'px', top: top + 'px' }}
              />
            )
          })}
        </div>
      </>
    )
  }
  return (
    <div className='viz-block' style={{ right: `${rightPx}px` }}>
      {contents}
    </div>
  )
}

function printGas(gas: number) {
  if (gas === 0) return '0'
  return (gas * 1e-6).toFixed(1) + 'm'
}
