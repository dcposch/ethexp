import * as React from 'react'
import { useState } from 'react'

import type { BlockTransactionObject, TransactionReceipt } from 'web3-eth'
import VizTx from './VizTx'

const PX_PER_SQRT_S = 50

export interface Block extends BlockTransactionObject {
  receipts: { [hash: string]: TransactionReceipt }
}

interface VizBlocksProps {
  blocks: Block[]
}

export const VizBlocks = React.memo(
  function VizBlocks({ blocks }: VizBlocksProps) {
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

    let nConfirmedTx = 0
    for (let i = 0; i < blocks.length - 1; i++) {
      nConfirmedTx += blocks[i].transactions.length
    }
    const elapsedTimeS =
      (blocks[0].timestamp as number) - (blocks[blocks.length - 1].timestamp as number)
    const tps = nConfirmedTx / elapsedTimeS

    return (
      <>
        <h2>
          blocks{' '}
          <small>
            last 10 blocks average <strong>{tps.toFixed(0)} TPS</strong>
          </small>
        </h2>
        <div className='viz-blocks'>
          <hr></hr>
          {blocksPlusOffscreenBlock.map((b, i) => {
            if (i > 0) rightPx += blockGapPx(nextBlockTime, b.timestamp as number)
            nextBlockTime = b.timestamp as number
            return <Block key={b.number} block={b} rightPx={rightPx} />
          })}
        </div>
      </>
    )
  },
  function (oldProps: VizBlocksProps, newProps: VizBlocksProps) {
    return (
      oldProps.blocks.length &&
      newProps.blocks.length &&
      oldProps.blocks[0].hash === newProps.blocks[0].hash
    )
  }
)

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
            const toAddr = t.to?.toLowerCase()
            const hl = toAddr === '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'
            if (Math.random() < 0.001) console.log(toAddr)
            return <VizTx key={t.hash} status={status} top={top} left={left} highlight={hl} />
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
