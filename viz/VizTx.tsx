import classNames from 'classnames'
import * as React from 'react'

export default function VizTx({
  status,
  top,
  left,
  right,
  highlight,
}: {
  status?: boolean
  top: number
  left?: number
  right?: number
  highlight?: boolean
}) {
  const cl = classNames({
    'viz-tx': true,
    'viz-tx-succeeded': status === true,
    'viz-tx-reverted': status === false,
  })
  return (
    <div
      className={cl}
      style={{
        left: left != null && left + 'px',
        right: right != null && right + 'px',
        top: top + 'px',
        color: highlight && '#f0f',
      }}
    />
  )
}
