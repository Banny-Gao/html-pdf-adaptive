import elementToCanvas from './elementToCanvas'

let headerCache
export default async (
  pdf,
  x,
  y,
  width,
  $header,
  isUseCache = false,
  useCORS = false
) => {
  if (!($header instanceof HTMLElement))
    throw Error("header must be a HTMLElement")

  const header =
    isUseCache && headerCache
      ? headerCache
      : await elementToCanvas($header, width, true, useCORS)

  const { height, data } = header
  if (height) pdf.addImage(data, "JPEG", x, y, width, height)
  headerCache = header
}
