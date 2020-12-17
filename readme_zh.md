# 准备阶段

## 安装 Node.js

- 根据您的系统环境安装 [Node](https://nodejs.org/zh-cn/download/)。
- 安装完毕后，通过 node -v 命令，查看安装好的 Node.js 版本信息【8.x 以上的版本】：

```bash
$ node -v
vx.x.x
```

## 安装 Serverless Devs

- 在命令行中运行命令：

```bash
$ npm install @serverless-devs/s -g
```

> 查看更多[详细信息](https://github.com/Serverless-Devs/Serverless-Devs/blob/master/readme_zh.md#%E5%BF%AB%E5%85%A5%E5%AE%89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8)

- 安装执行完毕，可以通过 s -v 查看 Serverless Devs 版本。

```bash
$ s -v

Serverless Tool Version: *.*.*
```

## Authing

1. 注册或者登陆 [Authing](https://console.authing.cn/login)
2. 根据提示依次创建用户池、应用，进入应用并查看应用配置
3. 在应用配置中获取：App ID、App Secret 和认证地址
4. 在此应用下新建一个用户

# 创建应用

## 初始化应用

- 在命令行执行命令
  > $ s init authing && cd authing

## 修改配置

- 编辑 template.yaml

  > 查看更多[配置信息](https://github.com/Serverless-Devs-Awesome/fc-alibaba-component/blob/master/readme_zh.md#%E5%8F%82%E6%95%B0%E8%AF%A6%E6%83%85)

- 将 authing.yml.template 复制为 **authing.yml**，然后编辑 **authing.yml**

```
oidc:
  issuer: issuer 地址
  client_id: 应用 ID
  client_secret: 应用密钥
  flow: 可选值为 code 或 implicit
  redirect_uri: 默认回调地址
  refresh_token: true 或 false
```

配置解释

| 参数 | 类型 | 描述 |
| -- | -- | -- |
| issuer | string | Authing 应用的 issuer 地址。 |
| client_id | string | Authing 应用 ID。 |
| client_secret | string | Authing 应用密钥。 |
| flow | string | 登录方式，[授权码模式](https://docs.authing.cn/authentication/oidc/oidc-authorization.html#%E4%BD%BF%E7%94%A8%E6%8E%88%E6%9D%83%E7%A0%81%E6%A8%A1%E5%BC%8F-authorization-code-flow)或[隐式模式](https://docs.authing.cn/authentication/oidc/oidc-authorization.html#%E4%BD%BF%E7%94%A8%E9%9A%90%E5%BC%8F%E6%A8%A1%E5%BC%8F-implicit-flow)，可选值为 `code` 或 `implicit`。授权码模式返回 code，用 code 可以换取 id_token、access_token 和 refresh_token。隐式模式直接返回 id_token 和 access_token，不能获取 refresh_token。 |
| redirect_uri | string | 默认回调地址，填写内容可以为 Authing 控制台中配置的回调地址中的任意一个，发起登录时如果不指定回调地址，默认会回调到此地址。|
| refresh_token | boolean | 是否返回 refresh_token。仅在 flow 为 `code` 时有效，`implicit` 时永远不会返回 refresh_token。开启此选项后，每次用户登录后需要确权。 |

## 部署函数

- 在命令行执行命令

```
$ s deploy

# 输出信息
Start ...
It is detected that your project has the following project/projects < AuthingDemo > to be execute
Start executing project AuthingDemo


  You can configure the specified key in yaml. For example:

  AuthingDemo
    Component: fc
    Provider: alibaba
    Access: Fill in the specified key here

Start the pre-hook
[Hook / Plugin] npm install --production
Executing ...
Execute:
npm WARN authing@0.0.1 No repository field.
npm WARN authing@0.0.1 No license field.


End the pre-hook
Waiting for service Authing to be deployed...
Service Authing deploy success

Waiting for function Authing to be deployed...
Packing ...
file .s is ignored.
Package complete.
Function: Authing@Authing updating ...
Deploy function Authing successfully
function Authing deploy success

Trigger: Authing@AuthingTriggerNameHttp deploying ...
This domain name is a temporary domain name. It is only used as a learning test and cannot be used in production environment.
        TriggerName: TriggerNameHttp
        Methods: GET,POST,PUT
        Url: 37679582-********.test.functioncompute.com
        EndPoint: https://********.cn-shenzhen.fc.aliyuncs.com/2016-08-15/proxy/Authing/Authing/
Trigger: Authing@Authing-TriggerNameHttp deploy successfully
Start deploying domains ...
This domain name is a temporary domain name. It is only used as a learning test and cannot be used in production environment.
Project AuthingDemo successfully to execute

AuthingDemo:
  Service: Authing
  Function: Authing
  Triggers:
    - Name: TriggerNameHttp
      Type: HTTP
      Domains:
        - 37679582-********.test.functioncompute.com
```

# 接口文档

## 登录

当你需要让用户登录时，让他点击这个链接或者将他重定向到这个地址：http://37679582-**\*\*\*\***.test.functioncompute.com/login

- 接口说明：发起登录。
- 接口地址：GET /login

| 参数         | 类型   | 必填 | 描述 |
| ------------ | ------ | ---- | ----------- |
| redirect_uri | string | 否   | 登录成功后的回调地址，建议传参，不传则默认使用 authing.yml 中的。 |


## 使用 code 换 token 和用户信息

用户完成登录后，Authing 会返回一个授权码 code 到配置的回调地址，你需要调用 http://37679582-**\*\*\*\***.test.functioncompute.com/code2token 这个接口，完成 code 换 token，token 换用户信息的操作。

- 接口说明：使用 Authing 返回的授权码 code 换取 token 和用户信息。
- 接口地址：GET /code2token

| 参数         | 类型   | 必填 | 描述 |
| ------------ | ------ | ---- | ----------- |
| code         | string | 是   | 授权码 code，形式是一串随机字符串。 |
| redirect_uri | string | 否   | 回调地址，建议传参，不传则默认使用 authing.yml 中的。如果调用登录接口时传过 redirect_uri 参数，则此处必传，且需要和登录时传的一样。 |

## 验证 IdToken

当用户访问你的受保护的业务 API 时，建议先调用本接口验证用户身份的合法性。

- 接口说明：检验 IdToken 的合法性。
- 接口地址：POST /verify-id-token

| 参数    | 类型   | 必填 | 描述         |
| ------- | ------ | ---- | ------------ |
| idToken | string | 是   | idToken 内容 |

## 验证 AccessToken

- 接口说明：检验 AccessToken 的合法性。
- 接口地址：POST /verify-access-token

| 参数    | 类型   | 必填 | 描述         |
| ------- | ------ | ---- | ------------ |
| accessToken | string | 是   | accessToken 内容 |

## 刷新 Token

- 接口说明：检验 AccessToken 的合法性。
- 接口地址：POST /refresh-token

| 参数    | 类型   | 必填 | 描述         |
| ------- | ------ | ---- | ------------ |
| refreshToken | string | 是   | refresh_token 内容，`/code2token` 接口返回的。 |
| redirectUri | string | 否   | 回调地址，建议传参，不传则默认使用 authing.yml 中的。如果调用登录接口时传过 redirect_uri 参数，则此处必传，且需要和登录时传的一样。 |

#### 登出

- 接口说明：登出。
- 接口地址：GET /logout

| 参数    | 类型   | 必填 | 描述         |
| ------- | ------ | ---- | ------------ |
| redirect_uri | string | 否  | 登出后的跳转地址，可随意填写。 |