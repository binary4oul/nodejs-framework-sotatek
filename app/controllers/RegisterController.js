var BaseController = require('../../core/controller/BaseController');

module.exports = BaseController.extend({
  classname : 'RegisterController',

  initialize : function() {
    logger.info('RegisterController::initialize');
  },

  mainPage: function(req, res) {
    res.render('register', {
      title     : 'Register',
      message   : '',
    });
  },

  register: function(req, res) {
    var userInfo = {
      username  : req.params['email'],
      email     : req.params['email'],
      password  : req.params['password']
    };

    var UserService = req.getService('UserService');
    UserService.register(userInfo, function(err, ret) {
      if (err) {
        res.sendError(err);
        return;
      }

      res.send(ret);
    });
  },

});