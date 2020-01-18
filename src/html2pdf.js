/*!
 * html2pdf.js v1.0.0
 * author mackkk
 * email 104517120@qq.com
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = global || self, global.html2PDF = factory())
}(this, function () {
    'use strict'
    const creatSrctipt = (url = "") => {
        const tagName = "script"
        const doc = window.document
        const tag = doc.createElement(tagName)
        tag.src = url
        const heads = doc.getElementsByTagName("head")
        if (heads.length) heads[0].appendChild(tag)
        else doc.documentElement.appendChild(tag)
    }
    creatSrctipt("https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.5.3/jspdf.min.js")
    creatSrctipt("https://unpkg.com/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js")

    let headerCache = null,
        footerCache = null,
        bodyObserver = null

    const getPageSize = (orientation = "p", unit = "mm", format = "a4") => {
        const pageFormats = {
            a0: [2383.94, 3370.39],
            a1: [1683.78, 2383.94],
            a2: [1190.55, 1683.78],
            a3: [841.89, 1190.55],
            a4: [595.28, 841.89],
            a5: [419.53, 595.28],
            a6: [297.64, 419.53],
            a7: [209.76, 297.64],
            a8: [147.4, 209.76],
            a9: [104.88, 147.4],
            a10: [73.7, 104.88],
            b0: [2834.65, 4008.19],
            b1: [2004.09, 2834.65],
            b2: [1417.32, 2004.09],
            b3: [1000.63, 1417.32],
            b4: [708.66, 1000.63],
            b5: [498.9, 708.66],
            b6: [354.33, 498.9],
            b7: [249.45, 354.33],
            b8: [175.75, 249.45],
            b9: [124.72, 175.75],
            b10: [87.87, 124.72],
            c0: [2599.37, 3676.54],
            c1: [1836.85, 2599.37],
            c2: [1298.27, 1836.85],
            c3: [918.43, 1298.27],
            c4: [649.13, 918.43],
            c5: [459.21, 649.13],
            c6: [323.15, 459.21],
            c7: [229.61, 323.15],
            c8: [161.57, 229.61],
            c9: [113.39, 161.57],
            c10: [79.37, 113.39],
            dl: [311.81, 623.62],
            letter: [612, 792],
            "government-letter": [576, 756],
            legal: [612, 1008],
            "junior-legal": [576, 360],
            ledger: [1224, 792],
            tabloid: [792, 1224],
            "credit-card": [153, 243]
        }
        let k
        switch (unit) {
            case "pt":
                k = 1
                break
            case "mm":
                k = 72 / 25.4
                break
            case "cm":
                k = 72 / 2.54
                break
            case "in":
                k = 72
                break
            case "px":
                k = 72 / 96
                break
            case "pc":
                k = 12
                break
            case "em":
                k = 12
                break
            case "ex":
                k = 6
                break
            default:
                throw Error(`Invalid unit: ${ unit }`)
        }
        let pageHeight = 0,
            pageWidth = 0
        if (pageFormats.hasOwnProperty(format)) {
            pageHeight = pageFormats[format][1] / k
            pageWidth = pageFormats[format][0] / k
        } else {
            try {
                pageHeight = format[1]
                pageWidth = format[0]
            } catch (err) {
                throw new Error(`Invalid format: ${ format }`)
            }
        }
        let tmp
        if (orientation === "p" || orientation === "portrait") {
            orientation = "p"
            if (pageWidth > pageHeight) {
                tmp = pageWidth
                pageWidth = pageHeight
                pageHeight = tmp
            }
        } else if (orientation === "l" || orientation === "landscape") {
            orientation = "l"
            if (pageHeight > pageWidth) {
                tmp = pageWidth
                pageWidth = pageHeight
                pageHeight = tmp
            }
        } else {
            throw Error(`Invalid orientation: ${ orientation }`)
        }
        return {
            width: pageWidth,
            height: pageHeight,
            unit,
            k,
            orientation
        }
    }

    const getNodeComputedStyles = (element, styleAttributes = []) => {
        if (!(element instanceof HTMLElement)) return []
        const styleDeclaration = window.getComputedStyle(element)
        const boundingClientRect = element.getBoundingClientRect()
        return styleAttributes.map(styleAttribute => {
            let styleValue = styleDeclaration[styleAttribute]
            if (["width", "height", "x", "y"].includes(styleAttribute))
                styleValue = boundingClientRect[styleAttribute]
            return String.prototype.replace.call(styleValue, /px/, "")
        })
    }

    const getToggleStyle = element => {
        const { left, width, height } = element.getBoundingClientRect()
        const memoryStyle = {
            ...element.style
        }
        const windowScrollY = window.scrollY,
            windowScrollX = window.scrollX
        let f = true
        return () => {
            const fixedStyle = {
                width: `${ width }px`,
                height: `${ height }px`,
                boxSizing: "border-box",
                left: `${ left }px`,
                top: 0,
                position: "fixed",
                backgroundColor: "#fff",
                columnFill: "auto",
                zIndex: 100
            }
            if (f) {
                window.scrollTo(0, 0)
                Object.entries(fixedStyle).forEach(([key, value]) => {
                    element.style[key] = value
                })
            } else {
                window.scrollTo(windowScrollX, windowScrollY)
                Object.entries(memoryStyle).forEach(([property, value]) => {
                    element.style.setProperty(property, value)
                })
            }
            f = !f
        }
    }

    const output = (pdf, outputType = "save", filename) => {
        let result = null
        switch (outputType) {
            case "save":
                result = pdf.save(filename)
                break
            case "file":
                result = new File([pdf.output("blob")], filename, {
                    type: "application/pdf",
                    lastModified: Date.now()
                })
                break
            default:
                result = pdf.output(outputType, {
                    filename
                })
        }
        return result
    }

    const addBlank = (pdf, x, y, width, height) => {
        pdf.setFillColor(255, 255, 255)
        pdf.rect(x, y, Math.ceil(width), Math.ceil(height), "F")
    }

    const childAppend = (element, parentNode = document.body) =>
        new Promise(resolve => {
            bodyObserver = new MutationObserver(() => {
                resolve()
                bodyObserver = null
            })
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true
            })
            parentNode.append(element)
        })

    const elementToCanvas = async (
        element,
        width,
        isAppend = false,
        useCORS = false
    ) => {
        isAppend && (await childAppend(element))

        const {
            width: elementWidth,
            height: elementHeight
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
        ).forEach(key => (context[key] = true))

        const canvas = await window.html2canvas(element, {
            useCORS,
            allowTaint: useCORS,
            canvas: canvasEl
        })
        const canvasData = canvas.toDataURL("image/jpeg", 1.0)
        const height = Math.floor((width / elementWidth) * elementHeight)

        isAppend && document.body.removeChild(element)
        return {
            width,
            height,
            data: canvasData
        }
    }

    const addHeader = async (
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

    const addFooter = async (
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

    const formatHiddenElementStyle = (element, style = {}) => {
        style = Object.assign(
            {
                position: "fixed",
                zIndex: "-1"
            },
            style
        )
        Object.entries(style).forEach(([key, value]) => {
            element.style[key] = value
        })
    }

    const createHeaderAndFooterElement = ({
        tagName = "div",
        style = {},
        classNames = [],
        innerHTML = "",
        pageNum,
        _pageNumToInnerHTML = false
    } = {}) => {
        const el = document.createElement(tagName)
        formatHiddenElementStyle(el, style)

        Object.entries({
            width: '100%',
            textAlign: 'center',
            lineHeight: '36px'
        }).forEach(([key, value]) => el.style[key] = value)

        classNames.forEach(className => el.classList.add(className))

        if (!innerHTML && pageNum && _pageNumToInnerHTML)
            innerHTML = `<p>- ${ pageNum }</p>`

        el.innerHTML = innerHTML
        return el
    }

    const getTextComputedStyles = async (textNode, styleAttributes = []) => {
        const textContent = textNode.textContent.replace(/^\s*(.*)\s*$/, "$1")
        if (!textContent.length) return []

        const text = document.createElement("span")
        text.textContent = textContent

        formatHiddenElementStyle(text, {
            position: "initial",
            display: "inline-block",
            border: "0",
            visibility: "hidden"
        })

        await childAppend(text, textNode.parentNode)
        const result = getNodeComputedStyles(text, styleAttributes)
        text.remove()
        return result
    }

    const isElementNode = node => node.nodeType === 1

    const isTextNode = node => node.nodeType === 3

    const isTableChild = node =>
        ["THEAD", "TBODY", "TFOOT", "TR", "TD"].includes(node.nodeName)

    const strSome = (str, ...words) => words.some(word => str.indexOf(word) !== -1)

    const getHeaderAndFooter = async (
        $header,
        $footer,
        pageNum,
        isAppend = false,
        useDefaultFoot
    ) => {
        let headerEl = $header
        let footerEl = $footer

        if ($header instanceof Function) headerEl = $header({ pageNum })
        if ($footer instanceof Function) footerEl = $footer({ pageNum, _pageNumToInnerHTML: useDefaultFoot })

        if (isAppend) {
            await childAppend(headerEl)
            await childAppend(footerEl)
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
            $footerHeight
        }
    }

    const drawPage = async (
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
            useCORS
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

    const outputWithAdaptive = async ({
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
        useCORS
    }) => {
        const ratio = imgWidth / element.offsetWidth
        const nodesArr = Array.from(element.childNodes).map(node => {
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
            useCORS
        }

        const onProgressCallback = async (params, blankHeight) => {
            const JsPDF = window.jsPDF
            if (onProgress instanceof Function) {
                const cloneDrawPageParams = { ...params }
                cloneDrawPageParams.pdf = new JsPDF(pdfOptions)
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
            const childNodes = Array.from(node.childNodes).map(childNode => {
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
                    marginBottom
                ] = getNodeComputedStyles(node, [
                    "display",
                    "width",
                    "height",
                    "position",
                    "float",
                    "flex-flow",
                    "margin-top",
                    "margin-bottom"
                ])

                const isInDomStream = ["relative", "static", "initial"].includes(position)
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
                        "height"
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
                    childNodes.forEach(childNode => {
                        childNode.doBlock = "flex-block"
                        return childNode
                    })
                    if (!strSome(flexFlow, "column")) {
                        if (strSome(flexFlow, "nowrap", "initial", "unset", "wrap-reverse")) {
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
                    "height"
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

    const outputWithFixedSize = async ({
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
        useCORS
    }) => {
        const JsPDF = window.jsPDF
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
            useCORS
        }

        const onProgressCallback = async () => {
            if (onProgress instanceof Function) {
                const cloneDrawPageParams = {
                    ...drawPageParams
                }
                cloneDrawPageParams.pdf = new JsPDF(pdfOptions)
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

    const html2pdf = async (
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
            useCORS = false
        } = {}
    ) => {
        const JsPDF = window.jsPDF
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
                y: 0
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

        const pdf = new JsPDF({
            orientation,
            unit,
            format
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
                    format
                },
                element,
                useDefaultFoot
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
    
    return html2pdf
}))
