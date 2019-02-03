module.exports = {
  includePaths: [__dirname],
  excludePatterns: [
    '**/*.spec.*',
    '**/__mocks__/*',
  ],
  importGroups: ['react', 'react-dom', 'redux', 'react-redux', 'prop-types'],
};
