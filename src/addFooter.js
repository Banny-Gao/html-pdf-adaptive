import elementToCanvas from './elementToCanvas'

let footerCache
export default async (
  pdf,
  x,
  y,
  width,
  $footer,
  isUseCache = false,
  useCORS = false
) => {
  if (!($footer instanceof HTMLElement))
    throw Error("footer must be a HTMLElement")

  const footer =
    isUseCache && footerCache
      ? footerCache
      : await elementToCanvas($footer, width, true, useCORS)

  const { height, data } = footer
  if (height) {
    // 处理绘制计算经度不可避免产生的误差
    pdf.addImage(data, "JPEG", x, y - height - 1, width, height + 2)
  }
  footerCache = footer
}