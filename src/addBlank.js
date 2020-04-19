export default (pdf, x, y, width, height) => {
  pdf.setFillColor(255, 255, 255)
  pdf.rect(x, y, Math.ceil(width), Math.ceil(height), "F")
}