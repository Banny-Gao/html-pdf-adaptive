export default (element, styleAttributes = []) => {
  if (!(element instanceof HTMLElement)) return []
  const styleDeclaration = window.getComputedStyle(element)
  const boundingClientRect = element.getBoundingClientRect()
  return styleAttributes.map((styleAttribute) => {
    let styleValue = styleDeclaration[styleAttribute]
    if (["width", "height", "x", "y"].includes(styleAttribute))
      styleValue = boundingClientRect[styleAttribute]
    return String.prototype.replace.call(styleValue, /px/, "")
  })
}