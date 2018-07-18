#!/usr/bin/env nodejs

'use strict';

const assert = require('assert');
const path = require('path');
const process = require('process');
const minimist = require('minimist')

const OPTS = [
  ['t', 'auth-time' ],
  ['d', 'ssl-dir' ]
];

const DEFAULT_AUTH_TIMEOUT = 300;
const DEFAULT_SSL_DIR = '.';

function usage(prg) {
  const opts = OPTS.map(function(opt) {
    const value = opt[1].replace('-', '_').toUpperCase();
    return `[ -${opt[0]}|--${opt[1]} ${value} ]`
  });
}

function getOptions(argv) {
  const opts0 = OPTS.reduce((a, b) => a.concat(b), []);
  const opts = minimist(argv.slice(2));
  if (opts._.length !== 2) usage(argv[1]);
  for (let k of Object.keys(opts)) {
    if (k === '_') continue;
  }
  return {
    port: opts._[0],
    ws_url: opts._[1],
    authTimeout: opts.t || opts['auth-time'] || DEFAULT_AUTH_TIMEOUT,
    sslDir: opts.d || opts['ssl-dir'] || DEFAULT_SSL_DIR
  };
}

module.exports = {
  options: getOptions(process.argv)
};
