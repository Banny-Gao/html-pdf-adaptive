import jsPDF from 'jspdf'
import getHeaderAndFooter from './getHeaderAndFooter'
import drawPage from './drawPage'
import addBlank from './addBlank'
import output from './output'
import isElementNode from './isElementNode'
import getNodeComputedStyles from './getNodeComputedStyles'
import getTextComputedStyles from './getTextComputedStyles'
import isTableChild from './isTableChild'
import strSome from './strSome'
import isTextNode from './isTextNode'

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
  const nodesArr = Array.from(element.childNodes).map((node) => {
    node.level = 1
    return node
  })

  let pageNum = 1,
    offsetY = 0
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

  let drawHeight = 0,
    inlineBlockTotalWidth = 0,
    inlineBlockHeightBox = [],
    memoryInlineBlockWidth = 0,
    memoryDrawHeight = 0,
    prevNode = nodesArr[1],
    cacheMarginBottom = 0,
    fatherCacheMaginBottom = 0,
    fatherMarginTop = 0

  const drawLine = (height, node) => {
    const cacheHeight = inlineBlockHeightBox.length
      ? Math.max.apply(inlineBlockHeightBox, inlineBlockHeightBox)
      : 0
    drawHeight += height + cacheHeight
    inlineBlockTotalWidth = 0
    inlineBlockHeightBox = []
    prevNode = node
  }

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

  const onProgressCallback = async (params, blankHeight) => {
    if (onProgress instanceof Function) {
      const cloneDrawPageParams = { ...params }
      cloneDrawPageParams.pdf = new jsPDF(pdfOptions)
      const page = await drawPage(cloneDrawPageParams, async () => {
        if (blankHeight)
          await addBlank(
            cloneDrawPageParams.pdf,
            0,
            reallyContentHeight + baseY - blankHeight,
            pdfWidth,
            blankHeight + 3
          )
      })
      pagesArr.push(page)

      const percent = (
        ((offsetY + memoryDrawHeight * ratio <= imgHeight
          ? offsetY + memoryDrawHeight * ratio
          : imgHeight) /
          imgHeight) *
        100
      ).toFixed(2)
      onProgress(percent, pageNum, output(pagesArr[pageNum - 1], outputType))
    }
  }

  let childIndex = -1,
    childLength = nodesArr.length
  const childLengthBox = [],
    childIndexBox = []

  while (nodesArr.length) {
    memoryDrawHeight = drawHeight

    let index = 0
    const node = nodesArr.shift(),
      children = node.children
    const childNodes = Array.from(node.childNodes).map((childNode) => {
      childNode.level = node.level + 1
      if (isElementNode(childNode)) childNode.index = index++
      return childNode
    })

    if (isElementNode(node)) {
      if (childIndex === childLength - 1) {
        childIndex = childIndexBox.pop()
        childLength = childLengthBox.pop()
      }
      childIndex++

      const [
        display,
        width = 0,
        height = 0,
        position,
        float,
        flexFlow,
        marginTop,
        marginBottom,
      ] = getNodeComputedStyles(node, [
        "display",
        "width",
        "height",
        "position",
        "float",
        "flex-flow",
        "margin-top",
        "margin-bottom",
      ])

      const isInDomStream = ["relative", "static", "initial"].includes(
        position
      )
      if (!isInDomStream) continue

      let reallyHeight = +height,
        reallyWidth = +width
      const reallyMarginTop = +marginTop,
        reallyMarginBottom = +marginBottom

      if (childIndex === childLength - 1 || prevNode.level > node.level) {
        if (node.doBlock === "flex-block") {
          drawLine(fatherCacheMaginBottom, node)
          cacheMarginBottom = fatherCacheMaginBottom = 0
        } else if (node.nodeName === "TR") {
          if (
            isTableChild(node.parentNode) &&
            node.parentNode.index ===
              node.parentNode.parentNode.children.length - 1
          ) {
            cacheMarginBottom = fatherCacheMaginBottom
          } else if (!isTableChild(node.parentNode)) {
            cacheMarginBottom = fatherCacheMaginBottom
          }
        } else {
          cacheMarginBottom =
            cacheMarginBottom > fatherCacheMaginBottom
              ? cacheMarginBottom
              : fatherCacheMaginBottom
        }
      }

      if (
        ["inline-block", "inline"].includes(display) ||
        node.doBlock === "flex-block"
      ) {
        // 处理非同一级遇到block换行
        if (
          prevNode.level !== node.level &&
          inlineBlockHeightBox.length &&
          prevNode.doBlock !== "flex-block" &&
          getNodeComputedStyles(prevNode, ["display"])[0] === "block"
        )
          drawLine(0, node)

        if (fatherMarginTop) {
          const h = Math.max(cacheMarginBottom, fatherMarginTop)
          drawHeight += h
          fatherMarginTop = 0
        }

        const parentNodeHeight = +getNodeComputedStyles(node.parentNode, [
          "height",
        ])[0]
        reallyHeight =
          reallyHeight > parentNodeHeight ? parentNodeHeight : reallyHeight

        // 处理图片默认外边距
        if (
          node.nodeName === "IMG" &&
          float === "none" &&
          +getNodeComputedStyles(node.parentNode, ["font-size"])[0] !== 0
        ) {
          reallyHeight += 3.5
          reallyWidth += 3.5
        }

        if (display === "inline-block" || node.doBlock === "flex-block") {
          reallyHeight += reallyMarginTop + reallyMarginBottom
        }

        inlineBlockTotalWidth += reallyWidth
        inlineBlockHeightBox.push(reallyHeight)
        memoryInlineBlockWidth = reallyWidth
        continue
      } else if (display === "flex") {
        childNodes.forEach((childNode) => {
          childNode.doBlock = "flex-block"
          return childNode
        })
        if (!strSome(flexFlow, "column")) {
          if (
            strSome(flexFlow, "nowrap", "initial", "unset", "wrap-reverse")
          ) {
            reallyHeight += Math.max(+cacheMarginBottom, reallyMarginTop)
            drawLine(reallyHeight, node)
            cacheMarginBottom = reallyMarginBottom
            continue
          }
        } else if (strSome(flexFlow, "column") && node.style.height !== "") {
          // console.log(node)
        }
      }

      // block换行，处理此前 inlineBlockHeightBox
      if (inlineBlockHeightBox.length) drawLine(0, node)

      if (children && children.length && node.nodeName !== "TR") {
        prevNode = node

        childLengthBox.push(childLength)
        childIndexBox.push(childIndex)
        childLength = children.length
        childIndex = -1

        nodesArr.unshift(...childNodes)
        if (!isTableChild(node)) {
          fatherCacheMaginBottom = reallyMarginBottom
          fatherMarginTop = reallyMarginTop
        }
        continue
      }

      // 处理margin-top，margin-bottom
      if (fatherMarginTop && !isTableChild(node)) {
        reallyHeight += Math.max(
          cacheMarginBottom,
          fatherMarginTop,
          reallyMarginTop
        )
        fatherMarginTop = 0
      } else if (fatherMarginTop && isTableChild(node)) {
        reallyHeight += Math.max(cacheMarginBottom, fatherMarginTop)
        fatherMarginTop = 0
        cacheMarginBottom = 0
      } else if (!fatherMarginTop && !isTableChild(node)) {
        reallyHeight += Math.max(cacheMarginBottom, reallyMarginTop)
      }

      drawLine(reallyHeight, node)
      if (!isTableChild(node)) cacheMarginBottom = reallyMarginBottom
    } else if (isTextNode(node)) {
      const [width = 0, height = 0] = await getTextComputedStyles(node, [
        "width",
        "height",
      ])
      if (prevNode.level !== node.level && +width !== 0) drawLine(0, node)

      if (+width) {
        inlineBlockTotalWidth += +width + 3
        inlineBlockHeightBox.push(+height)
      }
    }

    if (inlineBlockTotalWidth >= element.offsetWidth) {
      inlineBlockTotalWidth = memoryInlineBlockWidth
      const lastHeight = inlineBlockHeightBox.pop() || 0
      const height = inlineBlockHeightBox.length
        ? Math.max.apply(inlineBlockHeightBox, inlineBlockHeightBox)
        : 0
      drawHeight += height
      inlineBlockHeightBox = [lastHeight]
    }

    if (drawHeight * ratio > reallyContentHeight) {
      const pageDrawHeight = memoryDrawHeight * ratio
      const blankHeight = reallyContentHeight - pageDrawHeight

      drawPageParams.pageNum = pageNum
      drawPageParams.offsetY = offsetY

      await drawPage(drawPageParams, async () => {
        if (blankHeight)
          await addBlank(
            pdf,
            0,
            reallyContentHeight + baseY - blankHeight,
            pdfWidth,
            blankHeight + 3
          )
      })
      await onProgressCallback(drawPageParams, blankHeight)

      offsetY += pageDrawHeight
      drawHeight -= memoryDrawHeight

      pageNum++
      pdf.addPage()
    }
  }

  drawPageParams.pageNum = pageNum
  drawPageParams.offsetY = offsetY
  await drawPage(drawPageParams)
  await onProgressCallback(drawPageParams)

  return pdf
}