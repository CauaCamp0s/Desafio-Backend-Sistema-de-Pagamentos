const noop = () => {};

global.console = {
  ...console,
  error: noop,
  log: noop,
  warn: noop,
  info: noop,
  debug: noop,
};

