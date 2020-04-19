import jsPDF from 'jspdf'
import getHeaderAndFooter from './getHeaderAndFooter'
import drawPage from './drawPage'
import output from './output'

export default async ({
  pdf,
  addImage,
  baseX,
  baseY,
  imgWidth,
  imgHeight,
  contentHeight,
  $header,
  $footer,
  pdfWidth,
  pdfHeight,
  outputType,
  onProgress,
  pdfOptions,
  element,
  useDefaultFoot,
  useCORS,
}) => {
  const ratio = imgWidth / element.offsetWidth

  let pageNum = 1
  let offsetY = 0
  const pagesArr = []

  const { $headerHeight, $footerHeight } = await getHeaderAndFooter(
    $header,
    $footer,
    pageNum,
    true,
    useDefaultFoot
  )
  let reallyContentHeight = contentHeight
  reallyContentHeight -= ($headerHeight + $footerHeight) * ratio

  const drawPageParams = {
    pdf,
    $header,
    $footer,
    pageNum,
    baseX,
    baseY,
    offsetY,
    imgWidth,
    imgHeight,
    pdfWidth,
    pdfHeight,
    addImage,
    useDefaultFoot,
    useCORS,
  }

  const onProgressCallback = async () => {
    if (onProgress instanceof Function) {
      const cloneDrawPageParams = {
        ...drawPageParams,
      }
      cloneDrawPageParams.pdf = new jsPDF(pdfOptions)
      const page = await drawPage(cloneDrawPageParams)
      pagesArr.push(page)

      const percent = (
        ((offsetY + reallyContentHeight <= imgHeight
          ? offsetY + reallyContentHeight
          : imgHeight) /
          imgHeight) *
        100
      ).toFixed(2)
      onProgress(percent, pageNum, output(pagesArr[pageNum - 1], outputType))
    }
  }

  while (offsetY < imgHeight) {
    drawPageParams.pageNum = pageNum
    drawPageParams.offsetY = offsetY
    await drawPage(drawPageParams)
    await onProgressCallback()

    offsetY += reallyContentHeight

    if (offsetY < imgHeight) {
      pageNum++
      pdf.addPage()
    }
  }
  return pdf
}