var BaseError = require('./BaseError');

module.exports = BaseError.extend({
  classname: 'ForbiddenError',

  initialize: function($super, msg, code) {
    this._httpStatus  = 403;
    this._code        = code || -1;
    this._msg         = msg || 'Forbidden.';
  },

});