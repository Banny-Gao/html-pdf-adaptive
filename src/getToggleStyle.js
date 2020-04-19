export default element => {
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