export default (pdf, outputType = "save", filename) => {
  let result = null
  switch (outputType) {
      case "save":
          result = pdf.save(filename)
          break
      case "file":
          result = new File([pdf.output("blob")], filename, {
              type: "application/pdf",
              lastModified: Date.now()
          })
          break
      default:
          result = pdf.output(outputType, {
              filename
          })
  }
  return result
}