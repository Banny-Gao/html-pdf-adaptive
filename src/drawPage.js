import addBlank from './addBlank'
import addHeader from './addHeader'
import addFooter from './addFooter'
import getHeaderAndFooter from './getHeaderAndFooter'

export default async (
  {
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
  },
  fn
) => {
  const isUseHeaderCache = $header instanceof Function ? false : true
  const isUseFooterCache = $footer instanceof Function ? false : true

  const { headerEl, footerEl } = await getHeaderAndFooter(
    $header,
    $footer,
    pageNum,
    true,
    useDefaultFoot
  )

  await addImage(pdf, baseX, baseY - offsetY, imgHeight)
  await addBlank(pdf, 0, 0, pdfWidth, baseY)
  await addBlank(pdf, 0, pdfHeight - baseY, pdfWidth, baseY)
  await addHeader(
    pdf,
    baseX,
    baseY,
    imgWidth,
    headerEl,
    isUseHeaderCache,
    useCORS
  )
  await addFooter(
    pdf,
    baseX,
    pdfHeight - baseY - 1,
    imgWidth,
    footerEl,
    isUseFooterCache,
    useCORS
  )

  if (fn instanceof Function) await fn(pdf)
  return pdf
}