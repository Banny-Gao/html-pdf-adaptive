const path = require("path")
const babel = require("rollup-plugin-babel")
const alias = require("@rollup/plugin-alias")
const cjs = require("@rollup/plugin-commonjs")
const node = require("@rollup/plugin-node-resolve")
const analyze = require('rollup-plugin-analyzer')
const uglify = require('rollup-plugin-uglify').uglify
const serve = require('rollup-plugin-serve')
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
    plugins: [node(), cjs(), serve({
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      contentBase: resolve('dist'),
      port: 8848,
      host: 'localhost',
      open: true,
      verbose: true,
      openPage: '/html-pdf-adaptive-rc.js',
    })],
    cache: true,
    clearScreen: true,
    sourcemap: true,
    external: ['html2canvas', 'jspdf'],
    banner,
  },
  "prod-umd": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.min.js"),
    format: "umd",
    env: "production",
    plugins: [node(), cjs(), uglify()],
    compact: true,
    banner,
  },
  "prod-cjs": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.js"),
    format: "cjs",
    env: "production",
    plugins: [node(), cjs(), uglify()],
    compact: true,
    external: ['html2canvas', 'jspdf'],
    banner,
  },
  "prod-amd": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.amd.js"),
    format: "amd",
    env: "production",
    plugins: [node(), cjs(), uglify()],
    compact: true,
    banner,
  },
  "prod-es": {
    entry: resolve("src/index.js"),
    dest: resolve("dist/html-pdf-adaptive.es.js"),
    format: "cjs",
    env: "production",
    plugins: [node(), cjs(), uglify()],
    compact: true,
    external: ['html2canvas', 'jspdf'],
    banner,
  },
}

function genConfig(name) {
  const opts = builds[name]
  const external = opts.external ? opts.external : []
  const config = {
    input: opts.entry, // 入口文件  Type: string | string [] | { [entryName: string]: string }
    external,  // 外部依赖 Type: string[] | (id: string, parentId: string, isResolved: boolean) => boolean
    plugins: [
      alias(Object.assign({}, aliases, opts.alias)),
      babel({
        runtimeHelpers: true,
      }),
      analyze(),
    ].concat(opts.plugins || []),
    cache: !!opts.cache,
    output: {
      file: opts.dest,
      format: opts.format,  // amd, cjs, es, umd, iife, system
      banner: opts.banner,
      name: opts.moduleName || "html2PDF",  // Necessary for iife/umd bundles, 全局变量
      globals: opts.globals, // globals: { jquery: '$'}
      compact: !!opts.compact, // 预缩代码
      extend: true,  // global.name = global.name || {}
      interop: true, // 在导入外部依赖（external）时，在default和named exports有必要是区分是，设置独立变量
      paths: {
        // lodash: 'https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js'
      }, // 定义依赖加载方式
      sourcemap: !!opts.sourcemap,
    },
    manualChunks: {}, // 共享依赖chunks，necessary for @rollup/plugin-node-resolve 
    watch: {
      clearScreen: !!opts.clearScreen,
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
