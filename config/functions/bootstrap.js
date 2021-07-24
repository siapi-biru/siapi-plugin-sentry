'use strict';

module.exports = async () => {
  // Initialize the Sentry service exposed by this plugin
  const { sentry } = siapi.plugins.sentry.services;
  sentry.init();
};
