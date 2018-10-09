module.exports = api => {
  api.cache.never();

  return {
    presets: [['@babel/preset-env', { loose: true, modules: false }]],
    plugins: ['lodash', '@babel/plugin-syntax-dynamic-import'],
  };
};
