export default (element, style = {}) => {
  style = Object.assign(
    {
      position: "fixed",
      zIndex: "-1",
    },
    style
  )
  Object.entries(style).forEach(([key, value]) => {
    element.style[key] = value
  })
}