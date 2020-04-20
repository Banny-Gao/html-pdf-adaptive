# HTML TO PDF ![](https://img.shields.io/badge/html-pdf--adaptive-orange?logo=npm&style=pdf-adaptive)

## Install

```javascript
npm i html-pdf-adaptive --save
```

or

```html
<script src="https://unpkg.com/html-pdf-adaptive@1.0.1/src/html2pdf.min.js"></script>
```

## Usage

```javascript
import html2PDF from "html-pdf-adaptive"

const el = document.querySelector(".container")
document.querySelector("#renderPdf").addEventListener("click", () => {
  html2PDF(el)
})
```

or

```html
<script src="https://unpkg.com/html-pdf-adaptive@1.0.1/src/html2pdf.js"></script>
<script>
window.onload = function () {
    const el = document.querySelector('.container')
    document.querySelector('#renderPdf').addEventListener('click', () => {
        window.html2PDF(el, {
            mode: 'adaptive',
            pagesplit: true,
            offset: {
                x: 20,
                y: 20
            },
            outputType: 'save',
            isToggleStyle: true,
            useCORS: true,
            useDefaultFoot: true,
            onProgress: (percent, pageNum, bloburl) => {
                console.log(`${percent}%, 第${pageNum}页, ${bloburl}`)
            },
            onComplete: (bloburl) => {
                console.log(bloburl)
            }
        })
    })
}

</script>
```

## API

| params | type | default | description |
|--------|------|---------|-------------|
| pagesplit | Boolean | false | Is splite PDF to multiple pages |
| orientation | String | p | Orientation of PDF, **p** for portrait, **l** for landscape  |
| unit | String | pt | Unit for PDF |
| format | String | a4 | Format for PDF |
| offset | Object | { x: 0, y: 0 } | Reserved offset for PDF, x & y |
| outputType | String | save | Output type when during rendering. save, bloburl, file and others from [jsPDF.API](http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#output) |
| mode | String | adaptive | Mode for adaptive or fixed |
| filename | String | demo | Output filename |
| useCORS | Boolean | false | [Whether to attempt to load images from a server using CORS](https://html2canvas.hertzen.com/configuration) |
| isToggleStyle | Boolean | false | Fix element style to get complete PDF  |
| header | Function/DOM | loop | PDF's header  |
| footer | Function/DOM | `<p>${pageNum}</p>` | PDF's footer  |
| useDefaultFoot | Boolean | true | Is use default footer  |
| onProgress | Function | null | callback of rendered one page |
| onComplete | Function | null | callback of rendered all page |

## Suggestions

* **mode** 'adaptive' or 'fixed' will work by **pagesplit** is true
* header & footer disabled in a single page PDF
* header & footer DOM will use cache to improve performance
* mode **adaptive** not yet processing the node style sets the height of the column
* useCORS maybe need server client
* no processing too long Image node or too long Text node

## Callback

```javasctipt
onProgress(percent, pageNum, output, outputType) {}
onProgress(output) {}
```

## Return

> Promise {\<resolved>: undefined}
