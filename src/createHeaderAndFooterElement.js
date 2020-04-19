import formatHiddenElementStyle from './formatHiddenElementStyle'

export default ({
  tagName = "div",
  style = {},
  classNames = [],
  innerHTML = "",
  pageNum,
  _pageNumToInnerHTML = false,
} = {}) => {
  const el = document.createElement(tagName)
  formatHiddenElementStyle(el, style)

  Object.entries({
    width: "100%",
    textAlign: "center",
    lineHeight: "36px",
  }).forEach(([key, value]) => (el.style[key] = value))

  classNames.forEach((className) => el.classList.add(className))

  if (!innerHTML && pageNum && _pageNumToInnerHTML)
    innerHTML = `<p>- ${pageNum}</p>`

  el.innerHTML = innerHTML
  return el
}
