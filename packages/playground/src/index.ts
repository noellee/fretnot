import { Fretboard } from '@fretnot/fretboard'

function component (): HTMLElement {
  const element = document.createElement('div')

  const fretboard = new Fretboard('2xx232')
  const dataUrl = fretboard
    .beginDrawing()
    .withTitle('D/F#')
    .toDataUrl()
  element.innerHTML = `<img src="${dataUrl}"/>`

  return element
}

document.body.appendChild(component())
