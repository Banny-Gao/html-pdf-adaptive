window.onload = function () {
    const el = document.querySelector('.container')
    document.querySelector('#renderPdf').addEventListener('click', () => {
        console.time()
        window.html2PDF(el, {
            mode: 'adaptive',
            pagesplit: true,
            position: {
                x: 20,
                y: 20
            },
            outputType: 'save',
            isToggleStyle: true,
            useCORS: false,
            useDefaultFoot: false,
            // onProgress: (percent, pageNum, bloburl) => {
            //     console.log(`${percent}%, 第${pageNum}页, ${bloburl}`)
            // },
            // onComplete: (bloburl) => {
            //     console.log(bloburl)
            //     console.timeEnd()
            // }
        })
    })
    document.querySelector('#printPdf').addEventListener('click', () => {
        const styleContent = `
            @page {
                size: auto;  /* auto is the initial value */
                margin: 0mm; /* this affects the margin in the printer settings */
            }
            a {
                color: red;
            }
            body > :not(.container) {
                display: none;
            }
        `
        const style = document.createElement('style')
        style.media = 'print'
        style.innerHTML = styleContent
        document.head.appendChild(style)
        window.print()
    })
}
