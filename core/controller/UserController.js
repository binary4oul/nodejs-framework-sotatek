var BaseController  = require('./BaseController');
var passport        = require('passport');
var jwt             = require('jwt-simple');

module.exports = BaseController.extends({
  classname: 'UserController',

  login: function(req, res) {
    var redirectUrl = '/';
    if (req.allParams && req.allParams['redirect_url']) {
      redirectUrl = req.allParams['redirect_url'];
    }

    passport.authenticate('local', {
      successRedirect   : redirectUrl,
      failureRedirect   : '/login',
      failureFlash      : true,
    }, function(err, user, info) {
      logger.trace('login err=' + util.inspect(err));
      logger.trace('login user=' + util.inspect(user));
      logger.trace('login info=' + util.inspect(info));

      if (err) {
        return res.sendError(err);
      }

      if (user === false) {
        if (info && info.message) {
          return res.sendError(info.message);
        }

        res.sendError(info);
      }

      var expires = moment().add(7, 'days').valueOf(),
          secret = process.env.SECRET;

      var token = jwt.encode({
        userId: user.id,
        email: user.email,
        exp: expires
      }, secret);

      res.ok(user.setExtra({
        token: token
      }));

    })(req, res);
  },

  logout: function(req, res) {
    res.ok();
  },

});
