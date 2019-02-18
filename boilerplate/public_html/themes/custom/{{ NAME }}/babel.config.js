module.exports = api => {
  api.cache.never();

  return {
    presets: [['@babel/preset-env', { modules: false }]],
    plugins: [
      'lodash',
      '@babel/plugin-syntax-dynamic-import',
      [
        '@babel/plugin-transform-runtime',
        {
          useESModules: true,
        },
      ],
    ],
  };
};
