let bodyObserver = null

export default (element, parentNode = document.body) =>
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
