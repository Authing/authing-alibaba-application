const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const yaml = require('js-yaml')
const app = express();
const fs = require('fs');
const qs = require('querystring')
const path = require('path')
const bodyParser = require('body-parser')
const jose = require('jose')
const { implicitLoginUrlGenerator,
  codeLoginUrlGenerator } = require('./helper')
const yamlConfig = fs.readFileSync(path.resolve('..', 'authing.yml'), 'utf-8');
const config = yaml.safeLoad(yamlConfig)
global.config = config;
console.log(config)
process.on('unhandledRejection', (err) => {
  console.log(err)
})
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.get('/login', async (req, res) => {
  if (config.oidc.flow === 'code') {
    const loginUrl = codeLoginUrlGenerator({
      issuer: config.oidc.issuer,
      clientId: config.oidc.client_id,
      redirectUri: req.query.redirect_uri || config.oidc.redirect_uri,
      needRefreshToken: config.oidc.refresh_token,
      state: req.query.state
    })
    res.redirect(loginUrl)
  } else if (config.oidc.flow === 'implicit') {
    const loginUrl = implicitLoginUrlGenerator({
      issuer: config.oidc.issuer,
      clientId: config.oidc.client_id,
      redirectUri: req.query.redirect_uri || config.oidc.redirect_uri,
      state: req.query.state,
      nonce: req.query.nonce,
    })
    res.redirect(loginUrl)
  } else {
    res.json({ code: 500, message: 'authing.yml 文件配置错误，oidc.flow 可选值为 code 和 implicit' }).status(500)
  }
})
app.get('/logout', async (req, res) => {
  res.redirect(`${config.oidc.issuer.replace('/oidc', '')}/login/profile/logout${req.query.redirect_uri ? '?redirect_uri=' + req.query.redirect_uri : ''}`)
})
app.get('/code2token', async (req, res) => {
  try {
    let ret = {};
    const tokenSetResult = await axios.post(`${config.oidc.issuer}/token`, qs.stringify({
      client_id: config.oidc.client_id,
      client_secret: config.oidc.client_secret,
      redirect_uri: req.query.redirect_uri || config.oidc.redirect_uri,
      grant_type: 'authorization_code',
      code: req.query.code
    }))
    ret.tokenSet = tokenSetResult.data
    const userInfoResult = await axios.post(`${config.oidc.issuer}/me`,
      qs.stringify({
        access_token: tokenSetResult.data.access_token
      }))
    ret.userInfo = userInfoResult.data
    res.json(ret)
  } catch (err) {
    res.json({ code: 500, message: "code 换 token 出错" })
  }
})

app.post('/verify-id-token', async (req, res) => {
  const { idToken } = req.body
  const decoded = jose.JWT.decode(idToken, { complete: true });

  if ((decoded.header).alg === 'RS256') {
    if (!global.jwk) {
      const jwkResult = await axios.get(`${config.issuer}/.well-known/jwks.json`)
      global.jwk = jwkResult.data
    }

    const keyStore = jose.JWKS.asKeyStore(global.jwk);
    try {
      const result = jose.JWT.IdToken.verify(idToken, keyStore, {
        issuer: (decoded.payload).iss,
        audience: (decoded.payload).aud,
      });
      res.json(result)
    } catch (err) {
      res.json({
        code: 400,
        message: 'access_token 不合法',
      });
    }
  } else if ((decoded.header).alg === 'HS256') {
    try {
      const result = jose.JWT.IdToken.verify(idToken, config.oidc.client_secret, {
        issuer: (decoded.payload).iss,
        audience: (decoded.payload).aud,
      });
      res.json(result);
    } catch (err) {
      res.json({
        code: 400,
        message: 'id_token 不合法',
      });
    }
  } else {
    res.json({
      code: 400,
      message: '未受支持的签名算法',
    });
  }
})
app.post('/verify-access-token', async (req, res) => {
  const { accessToken } = req.body
  const decoded = jose.JWT.decode(accessToken, { complete: true });

  if ((decoded.header).alg === 'RS256') {
    if (!global.jwk) {
      const jwkResult = await axios.get(`${config.oidc.issuer}/.well-known/jwks.json`)
      global.jwk = jwkResult.data
    }
    const keyStore = jose.JWKS.asKeyStore(global.jwk);
    try {
      const result = jose.JWT.IdToken.verify(accessToken, keyStore, {
        issuer: (decoded.payload).iss,
        audience: (decoded.payload).aud,
      });
      res.json(result)
    } catch (err) {
      res.json({
        code: 400,
        message: 'access_token 不合法',
      });
    }
  } else if ((decoded.header).alg === 'HS256') {
    try {
      const result = jose.JWT.IdToken.verify(accessToken, config.oidc.client_secret, {
        issuer: (decoded.payload).iss,
        audience: (decoded.payload).aud,
      });
      res.json(result);
    } catch (err) {
      res.json({
        code: 400,
        message: 'access_token 不合法',
      });
    }
  }
})
module.exports = app;

app.listen(9000)