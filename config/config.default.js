/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1652604473072_802';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: 'app/public/upload',
  };
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ], // 配置白名单
  };

  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: '123456',
      database: 'jue-cost',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  config.jwt = {
    secret: 'zengxpang',
  };
  config.multipart = {
    mode: 'file',
  };
  // config.cors = {
  //   origin: '*', // 允许所有跨域访问
  //   credentials: true, // 允许 Cookie 跨域跨域
  //   allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  // };
  config.cors = {
    credentials: true,
    origin: ctx => ctx.get('origin'),
  };


  return {
    ...config,
    ...userConfig,
  };
};
