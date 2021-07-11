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

  const countries = new Set(peers.map((p) => p.geo.country))

  peers.sort((a: PeerGeo, b: PeerGeo) => {
    let cmp = a.geo.country.localeCompare(b.geo.country)
    if (cmp != 0) return cmp
    const ab = ip.parse(a.ip).toByteArray()
    const bb = ip.parse(b.ip).toByteArray()
    for (let i = 0; i < 4; i++) {
      cmp = bb[i] - ab[i]
      if (cmp != 0) return cmp
    }
    return cmp
  })

  return (
    <div className='viz-peers'>
      {peers.map((a) => (
        <div className='viz-peer' key={a.id}>
          <div className='viz-peer-inner'>
            <div>
              <strong>{a.geo.country}</strong> {a.ip}
            </div>
            <div>{a.name.split('-')[0]}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
