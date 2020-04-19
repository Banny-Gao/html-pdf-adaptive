const path = require("path")
const babel = require("rollup-plugin-babel")
const alias = require("@rollup/plugin-alias")
const cjs = require("@rollup/plugin-commonjs")
const node = require("@rollup/plugin-node-resolve")
const analyze = require('rollup-plugin-analyzer')
const uglify = require('rollup-plugin-uglify').uglify
const version = process.env.VERSION || require("../package.json").version

const banner =
  "/*!\n" +
  ` * html-pdf-adaptive.js v${version}\n` +
  ` * (c) 2019-${new Date().getFullYear()} Banny Gao\n` +
  " */"

const aliases = require("./alias")
const resolve = (p) => {
  const base = p.split("/")[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, "../", p)
  }
}

const builds = {
  "dev-cjs": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive-rc.js"),
    format: "cjs",
    env: "development",
    plugins: [node(), cjs()],
    banner,
  },
  "prod-umd": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.min.js"),
    format: "umd",
    env: "production",
    plugins: [node(), cjs(), uglify()],
    banner,
  },
  "prod-cjs": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.js"),
    format: "cjs",
    env: "production",
    plugins: [node(), cjs()],
    banner,
  },
}

function genConfig(name) {
  const opts = builds[name]
  const external = opts.external ? opts.external : []
  const config = {
    input: opts.entry,
    external: [...external, 'html2canvas', 'jspdf'],
    plugins: [
      alias(Object.assign({}, aliases, opts.alias)),
      babel({
        runtimeHelpers: true,
      }),
      analyze(),
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || "html2PDF",
    },
  }

  Object.defineProperty(config, "_name", {
    enumerable: false,
    value: name,
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
