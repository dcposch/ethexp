import * as React from 'react'
import ip from 'ipaddr.js'

export interface Peer {
  id: string
  caps: string[]
  name: string
  network: {
    localAddress: string
    remoteAddress: string
  }
}

export interface PeerGeo extends Peer {
  ip: string
  geo: { country: string }
}

export function VizPeers({ peers }: { peers: PeerGeo[] }) {
  if (peers.length === 0) return <div>zero peers. offline?</div>

  peers.sort((a: PeerGeo, b: PeerGeo) => {
    let cmp = a.geo.country.localeCompare(b.geo.country)
    if (cmp != 0) return cmp
    const ab = ip.parse(a.ip).toByteArray()
    const bb = ip.parse(b.ip).toByteArray()
    for (let i = 0; i < 4; i++) {
      cmp = ab[i] - bb[i]
      if (cmp != 0) return cmp
    }
    return cmp
  })

  const nRows = Math.max(5, Math.ceil(peers.length / 5))
  const gridRows = `repeat(${nRows}, 1fr)`

  let lastCountry = ''
  return (
    <>
      <h2>
        peers<small>{peers.length} peers connected</small>
      </h2>
      <div className='viz-peers' style={{ gridTemplateRows: gridRows }}>
        {peers.map((p) => {
          const dispCountry = lastCountry === p.geo.country ? '' : p.geo.country
          lastCountry = p.geo.country
          return (
            <div className='viz-peer' key={p.id}>
              <span className='viz-peer-country'>{dispCountry}</span>
              <span className='viz-peer-ip'>{p.ip}</span>
              <span className='viz-peer-client'>{p.name.split('-')[0]}</span>
            </div>
          )
        })}
      </div>
    </>
  )
}
