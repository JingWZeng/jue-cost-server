'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  // 注册
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body; // 获取注册需要的参数
    const defaultAvatar = 'https://cdn.jsdelivr.net/gh/JingWZeng/markdownImg/img/202108231635263.jpeg';
    if (!username || !password) {
      ctx.body = {
        code: 500,
        msg: '账号密码不能为空',
        data: null,
      };
      return;
    }

    // 验证数据库内是否已经有该账户名
    const userInfo = await ctx.service.user.getUserByName(username);
    // 判断是否已经存在
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账户名已被注册，请重新输入',
        data: null,
      };
      return;
    }

    const res = await ctx.service.user.register({
      username,
      password,
      signature: '万事胜意',
      ctime: new Date().getTime(),
      avatar: defaultAvatar,
    });
    if (res) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null,
      };

    }
  }
  // 登陆
  async login() {
    // app 为全局属性，相当于所有的插件方法都植入到了 app 对象。
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;
    // 根据用户名，在数据库中查找对应的id操作
    const userInfo = await ctx.service.user.getUserByName(username);
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '用户不存在',
        data: null,
      };
      return;
    }
    if (userInfo && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '账号秘密错误',
        data: null,
      };
      return;
    }
    // 生成 token 加盐
    // app.jwt.sign 方法接受两个参数，第一个为对象，对象内是需要加密的内容；第二个是加密字符串。
    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // token 有效期为 24 小时
    }, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: '登陆成功',
      data: {
        token,
      },
    };
  }
  // 测试token
  async testToken() {
    const { app, ctx } = this;
    const token = ctx.request.header.authorization;// 请求头获取 authorization 属性，值为 token
    // 通过 app.jwt.verify + 加密字符串 解析出 token 的值
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: '获取token成功',
      data: {
        ...decode,
      },
    };
  }
  // 获取用户信息
  async getUserInfo() {
    const defaultAvatar = 'https://cdn.jsdelivr.net/gh/JingWZeng/markdownImg/img/202108231635263.jpeg';
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    // 通过 getUserByName 方法，以用户名 decode.username 为参数，从数据库获取到该用户名下的相关信息
    const userInfo = await ctx.service.user.getUserByName(decode.username);
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id: userInfo.id,
        username: userInfo.username,
        signature: userInfo.signature || '',
        avatar: userInfo.avatar || defaultAvatar,
      },
    };

  }
  // 修改用户信息
  async editUserInfo() {
    const { ctx, app } = this;
    // 通过post请求，在请求体中获取签名字段 signature
    const { signature = '', avatar = '' } = ctx.request.body;
    try {
      const token = ctx.request.header.authorization;
      // 解析token中的用户名称
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      // 通过username查找userInfo完整信息
      const userInfo = await ctx.service.user.getUserByName(decode.username);
      // 通过 service 方法 editUserInfo 修改 signature 信息。
      await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          id: decode.id,
          signature,
          username: userInfo.username,
          avatar,
        },
      };

    } catch (err) {
      console.log(err);
    }
  }
  async modifyPassword() {
    const { ctx, app } = this;
    const { new_pass = '', old_pass = '' } = ctx.request.body;

    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    const userInfo = await ctx.service.user.getUserByName(decode.username);

    if (!userInfo || !userInfo.id) {
      ctx.body = { code: 500, msg: '账号不存在', data: null };
      return;
    }

    console.log(ctx.request.body);
    if (userInfo && old_pass !== userInfo.password) {
      ctx.body = { code: 500, msg: '账号密码错误', data: null };
      return;
    }

    await ctx.service.user.editUserInfo({
      ...userInfo,
      password: new_pass,
    });

    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: null,
    };
  }
}

module.exports = UserController;
