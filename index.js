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
  },
  included() {
    this.import('node_modules/abortcontroller-polyfill/dist/abortcontroller-polyfill-only.js', { prepend: true });
    this._super.included.apply(this, arguments);
  }
};
