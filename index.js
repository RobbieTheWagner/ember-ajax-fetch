'use strict';

module.exports = {
  name: require('./package').name,
  options: {
    autoImport: {
      webpack: {
        node: {
          global: true
        }
      }
    }
  }
};
