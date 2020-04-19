let bodyObserver = null

const appendChild = (element, parentNode = document.body) =>
  new Promise((resolve) => {
    bodyObserver = new MutationObserver(() => {
      resolve()
      bodyObserver = null
    })
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
    parentNode.append(element)
  })

  export {
    bodyObserver,
    appendChild,
  }
