'use strict';

module.exports = siapi => ({
  beforeInitialize() {
    siapi.config.middleware.load.after.unshift('sentry');
  },
  initialize() {
    const { sentry } = siapi.plugins.sentry.services;
    sentry.init();

    siapi.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        sentry.sendError(error, (scope, sentryInstance) => {
          scope.addEventProcessor(event => {
            // Parse Koa context to add error metadata
            return sentryInstance.Handlers.parseRequest(event, ctx.request, {
              // Don't parse the transaction name, we'll do it manually
              transaction: false,
            });
          });
          // Manually add transaction name
          scope.setTag('transaction', `${ctx.method} ${ctx.request.url}`);
          // Manually add Siapi version
          scope.setTag('siapi_version', siapi.config.info.siapi);
          scope.setTag('method', ctx.method);
        });
        throw error;
      }
    });
  },
});
