import babel from 'rollup-plugin-babel'

export default {
  input: 'forceify.es.js',
  output: {
    format: 'umd',
    name: 'Forceify',
    file: 'forceify.umd.js'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
		  })
  ],
  context: 'this'
}
