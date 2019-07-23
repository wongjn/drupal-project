module.exports = api => {
  api.cache.never();

  return {
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
    env: {
      legacy: {
        presets: [['@babel/preset-env', { modules: false }]],
      },
      modern: {
        presets: [
          [
            '@babel/preset-env',
            { modules: false, targets: { esmodules: true } },
          ],
        ],
      },
    },
  };
};
