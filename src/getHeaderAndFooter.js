import appendChild from './appendChild'
import getNodeComputedStyles from './getNodeComputedStyles'

export default async (
  $header,
  $footer,
  pageNum,
  isAppend = false,
  useDefaultFoot
) => {
  let headerEl = $header
  let footerEl = $footer

  if ($header instanceof Function) headerEl = $header({ pageNum })
  if ($footer instanceof Function)
    footerEl = $footer({ pageNum, _pageNumToInnerHTML: useDefaultFoot })

  if (isAppend) {
    await appendChild(headerEl)
    await appendChild(footerEl)
  }

  const [$headerHeight] = getNodeComputedStyles(headerEl, ["height"])
  const [$footerHeight] = getNodeComputedStyles(footerEl, ["height"])

  if (isAppend) {
    document.body.removeChild(headerEl)
    document.body.removeChild(footerEl)
  }
  return {
    headerEl,
    footerEl,
    $headerHeight,
    $footerHeight,
  }
}