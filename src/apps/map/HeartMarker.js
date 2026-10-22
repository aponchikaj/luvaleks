import L from 'leaflet'
import { symbolSvg } from '@/components/icons/symbols'

/** Teardrop pin with a white symbol; avoids Leaflet's default PNG marker (broken under bundlers). */
export function heartIcon(symbol = 'heart', active = false) {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
    html: `<div style="display:grid;place-items:center;width:32px;height:32px;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,${active ? '#3d9bff' : '#3d8bff'},#1d6ee5);box-shadow:0 2px 6px rgb(0 0 0/.35)"><span style="transform:rotate(45deg);display:grid">${symbolSvg(symbol, { size: 14 })}</span></div>`,
  })
}
