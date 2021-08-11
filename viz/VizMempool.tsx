import * as React from 'react'

import VizTx from './VizTx'

export interface MempoolTx {
  hash: string
  time: number
  // undefined = not in block, false = reverted, true = success
  status?: boolean
}

const STRIDE_X_PX = 3
const STRIDE_Y_PX = 3

export function VizMempool({
  gasPrice,
  transactions,
}: {
  gasPrice: number
  transactions: MempoolTx[]
}) {
  if (gasPrice === 0) {
    return null
  }

  const nowCol = (new Date().getTime() * 1e-3 * 4) | 0
  let lastCol = nowCol
  let ix = 0

  const nGasPrice = Math.round(gasPrice)
  let gasBand = 'green'
  if (nGasPrice > 50) gasBand = 'orange'
  if (nGasPrice > 100) gasBand = 'red'

  return (
    <>
      <h2>
        mempool
        <small>
          current gas price <strong className={`viz-color-${gasBand}`}>{nGasPrice} gwei</strong>
        </small>
      </h2>
      <div className='viz-mempool'>
        {transactions.map((t) => {
          const txCol = (t.time * 4) | 0
          if (txCol !== lastCol) ix = 0
          else ix++
          lastCol = txCol

          const col = nowCol - txCol
          const right = col * STRIDE_X_PX
          const top = ix * STRIDE_Y_PX

          return <VizTx key={t.hash} status={t.status} top={top} right={right} />
        })}
      </div>
    </>
  )
}
