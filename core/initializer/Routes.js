var logger              = log4js.getLogger('Init.Routes');
var AuthController      = require('../controller/AuthController');

module.exports = function(app, ControllerFactory, config) {

  // Routes from config
  var routes = config.routes,
      hasCustomizedLogin = false,
      hasCustomizedLogout = false;

  for (let requestMethod in routes) {
    let routesHash = routes[requestMethod];
    for (let route in routesHash) {
      let handlerDef = routesHash[route];
      let finalHandler = getHandler(handlerDef);
      app[requestMethod.toLowerCase()](route, finalHandler);

      if (requestMethod.toLowerCase() === 'post') {

        if (route === '/login') {
          hasCustomizedLogin = true;
        }

        if (route === '/logout') {
          hasCustomizedLogin = true;
        }
      }
    }
  }

  // Auto-generated routes from models
  var models = ModelFactory.getAll();
  for (var i in models) {
    var classname = models[i];
    var model = ModelFactory.get(classname);
    var apiName = model.getPluralTableName();

    // Find/select list
    route = '/' + apiName;
    handlerDef = BaseController.createDefaultFind(model);
    app.get(route, handlerDef);

    // Find/select one
    route = '/' + apiName + '/:id';
    handlerDef = BaseController.createDefaultFindOne(model);
    app.get(route, handlerDef);

    // Don't expose the create/update/delete APIs to the public

    // Insert/add
    // route = '/' + apiName;
    // handlerDef = BaseController.createDefaultAdd(model);
    // app.post(route, handlerDef);

    // Update
    // route = '/' + apiName + '/:id';
    // handlerDef = BaseController.createDefaultUpdate(model);
    // app.put(route, handlerDef);

    // Remove/Delete
    // route = '/' + apiName + '/:id';
    // handlerDef = BaseController.createDefaultDelete(model);
    // app.remove(route, handlerDef);
  }

  // If there's no user-defined login function, use built-int default login
  if (!hasCustomizedLogin) {
    app.post('/login', AuthController.handleBy('login'));
  }

  // If there's no user-defined logout function, use built-int default login
  if (!hasCustomizedLogout) {
    app.post('/logout', AuthController.handleBy('logout'));
  }

  logger.trace('Routes: finished initializing.');

};

function getHandler(handlerDef) {
  if (!_.isArray(handlerDef)) {
    if (typeof handlerDef === 'string') {
      handlerDef = [handlerDef];
    } else {
      handlerDef = [handlerDef.controller, handlerDef.before, handlerDef.after];
    }
  }

  if (!_.isArray(handlerDef)) {
    throw new Error('Invalid routes config: ' + handlerDef);
  }

  let controllerName = handlerDef[0];
  if (!controllerName || typeof controllerName !== 'string') {
    throw new Error('Invalid controller name for route ' + route + ' config: ' + handlerDef);
  }

  let [classname, methodName] = controllerName.split('.');
  if (!classname || !methodName) {
    throw new Error('Invalid controller name for route config: ' + handlerDef);
  }

  ControllerClass = ControllerFactory.get(classname);
  if (!ControllerClass) {
    throw new Error('Unregistered controller for route config: ' + handlerDef);
  }

  if (!ControllerClass.prototype[methodName]) {
    throw new Error('Invalid handler method for route config: ' + handlerDef);
  }

  let beforePolicies = handlerDef[1];

  if (!beforePolicies) {
    beforePolicies = [];
  }

  if (typeof beforePolicies === 'string') {
    beforePolicies = beforePolicies.split(',');
  }

  if (!_.isArray(beforePolicies)) {
    throw new Error('Invalid beforePolicies for route config: ' + handlerDef);
  }

  let afterPolicies = handlerDef[2];

  if (!afterPolicies) {
    afterPolicies = [];
  }

  if (typeof afterPolicies === 'string') {
    afterPolicies = afterPolicies.split(',');
  }

  if (!_.isArray(afterPolicies)) {
    throw new Error('Invalid afterPolicies for route config: ' + handlerDef);
  }

  // logger.debug(util.format('Route controller=%s, beforePolicies=%s, afterPolicies=%s',
  //   controllerName, beforePolicies, afterPolicies));

  return ControllerClass.handleBy(methodName, beforePolicies, afterPolicies);
}
