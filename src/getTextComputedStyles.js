import appendChild from './appendChild'
import getNodeComputedStyles from './getNodeComputedStyles'
import formatHiddenElementStyle from './formatHiddenElementStyle'

export default async (textNode, styleAttributes = []) => {
  const textContent = textNode.textContent.replace(/^\s*(.*)\s*$/, "$1")
  if (!textContent.length) return []

  const text = document.createElement("span")
  text.textContent = textContent

  formatHiddenElementStyle(text, {
    position: "initial",
    display: "inline-block",
    border: "0",
    visibility: "hidden",
  })

  await appendChild(text, textNode.parentNode)
  const result = getNodeComputedStyles(text, styleAttributes)
  text.remove()
  return result
}