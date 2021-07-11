import classNames from 'classnames'
import * as React from 'react'

import type { Transaction } from 'web3-eth'

export interface MempoolTx {
  hash: string
  time: number
  // undefined = not in block, false = reverted, true = success
  status?: boolean
}

const STRIDE_X_PX = 3
const STRIDE_Y_PX = 3

export function VizMempool({ transactions }: { transactions: MempoolTx[] }) {
  const nowCol = (new Date().getTime() * 1e-3 * 4) | 0
  let lastCol = nowCol
  let ix = 0
  return (
    <div className='viz-mempool'>
      {transactions.map((t) => {
        const txCol = (t.time * 4) | 0
        if (txCol !== lastCol) ix = 0
        else ix++
        lastCol = txCol

        const col = nowCol - txCol
        const right = col * STRIDE_X_PX
        const top = ix * STRIDE_Y_PX

        const cl = classNames({
          'viz-tx': true,
          'viz-tx-succeeded': t.status === true,
          'viz-tx-reverted': t.status === false,
        })
        return <div key={t.hash} className={cl} style={{ right: right + 'px', top: top + 'px' }} />
      })}
    </div>
  )
}
