import html2canvas from 'html2canvas'
import appendChild from './appendChild'

export default async (element, width, isAppend = false, useCORS = false) => {
  isAppend && (await appendChild(element))

  const {
    width: elementWidth,
    height: elementHeight,
  } = element.getBoundingClientRect()

  const canvasEl = document.createElement("canvas")
  canvasEl.width = elementWidth * 2
  canvasEl.height = elementHeight * 2

  const context = canvasEl.getContext("2d")
  context.scale(2, 2)
  Array(
    "mozImageSmoothingEnabled",
    "webkitImageSmoothingEnabled",
    "msImageSmoothingEnabled",
    "imageSmoothingEnabled"
  ).forEach((key) => (context[key] = true))

  const canvas = await html2canvas(element, {
    useCORS,
    allowTaint: useCORS,
    canvas: canvasEl,
  })
  const canvasData = canvas.toDataURL("image/jpeg", 1.0)
  const height = Math.floor((width / elementWidth) * elementHeight)

  isAppend && document.body.removeChild(element)
  return {
    width,
    height,
    data: canvasData,
  }
}
