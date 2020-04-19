import jsPDF from 'jspdf'
import getToggleStyle from './getToggleStyle'
import getPageSize from './getPageSize'
import elementToCanvas from './elementToCanvas'
import outputWithAdaptive from './outputWithAdaptive'
import outputWithFixedSize from './outputWithFixedSize'
import createHeaderAndFooterElement from './createHeaderAndFooterElement'
import output from './output'

export default async (
  element,
  {
    pagesplit = false,
    orientation = "p",
    unit = "pt",
    format = "a4",
    offset = {},
    outputType = "save",
    header = createHeaderAndFooterElement,
    footer = createHeaderAndFooterElement,
    mode = "adaptive",
    filename = "demo",
    onProgress,
    onComplete,
    isToggleStyle = false,
    useDefaultFoot = true,
    useCORS = false,
  } = {}
) => {
  let toggleStyle = null
  if (isToggleStyle) toggleStyle = getToggleStyle(element)
  if (toggleStyle instanceof Function) toggleStyle()

  const { width: pdfWidth, height: pdfHeight } = getPageSize(
    orientation,
    unit,
    format
  )
  offset = Object.assign(
    {
      x: 0,
      y: 0,
    },
    offset
  )
  const imgWidth = pdfWidth - offset.x * 2

  const { height: imgHeight, data: pageData } = await elementToCanvas(
    element,
    imgWidth,
    false,
    useCORS
  )

  // 生成一页pdf的内容的高度
  const contentHeight = pdfHeight - offset.y * 2

  const pdf = new jsPDF({
    orientation,
    unit,
    format,
  })

  const imageCompression = "SLOW"
  const alias = Math.random().toString(35)

  const addImage = (pdfObj, _x, _y, height) => {
    pdfObj.addImage(
      pageData,
      "JPEG",
      _x,
      _y,
      imgWidth,
      Math.floor(height),
      alias,
      imageCompression
    )
  }

  if (pagesplit && imgHeight > contentHeight) {
    const args = {
      pdf,
      addImage,
      baseX: offset.x,
      baseY: offset.y,
      imgWidth,
      imgHeight,
      contentHeight,
      $header: header,
      $footer: footer,
      pdfWidth,
      pdfHeight,
      outputType,
      onProgress,
      pdfOptions: {
        orientation,
        unit,
        format,
      },
      element,
      useDefaultFoot,
    }
    switch (mode) {
      case "adaptive":
        await outputWithAdaptive.call(null, args)
        break
      case "fixed":
        await outputWithFixedSize.call(null, args)
        break
      default:
        outputWithAdaptive.call(null, args)
    }
  } else {
    addImage(
      pdf,
      offset.x,
      offset.y,
      imgHeight < contentHeight ? imgHeight : contentHeight
    )
  }

  if (toggleStyle instanceof Function) toggleStyle()

  const result = output(pdf, outputType, filename)
  if (onComplete instanceof Function) onComplete(result)
  return result
}