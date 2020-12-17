# preparation stage

## Install Node.js

- Install [Node](https://nodejs.org/zh-cn/download/) according to your system environment.
- After the installation is complete, use the node -v command to view the installed Node.js version information [version 8.x and above]:

```bash
$ node -v
vx.x.x
```

## Install Serverless Devs

- Run the command in the command line:

```bash
$ npm install @serverless-devs/s -g
```

> View more [detailed information](https://github.com/Serverless-Devs/Serverless-Devs/blob/master/readme_zh.md#%E5%BF%AB%E5%85%A5%E5%AE% 89%E8%A3%85%E5%92%8C%E4%BD%BF%E7%94%A8)

- After the installation is completed, you can check the Serverless Devs version through s -v.

```bash
$ s -v

Serverless Tool Version: *.*.*
```

## Authing

1. Register or log in [Authing](https://console.authing.cn/login)
2. Follow the prompts to create a user pool, an application, enter the application and view the application configuration
3. Obtain in the application configuration: App ID, App Secret and authentication address
4. Create a new user under this application

# Create application

## Initialize the application

- Execute commands on the command line
  > $ s init authing && cd authing

## Change setting

- Edit template.yaml

  > View more [Configuration Information](https://github.com/Serverless-Devs-Awesome/fc-alibaba-component/blob/master/readme_zh.md#%E5%8F%82%E6%95%B0% E8%AF%A6%E6%83%85)

- Copy authing.yml.template as **authing.yml**, then edit **authing.yml**

```
oidc:
  issuer: issuer address
  client_id: application ID
  client_secret: application secret
  flow: optional value is code or implicit
  redirect_uri: default callback address
  refresh_token: true or false
```

Configuration explanation

| Parameters | Type | Description |
| - | - | - |
| issuer | string | The issuer address of the Authing application. |
| client_id | string | Authing application ID. |
| client_secret | string | Authing application secret key. |
| flow | string | Login method, [Authorization code mode](https://docs.authing.cn/authentication/oidc/oidc-authorization.html#%E4%BD%BF%E7%94%A8%E6%8E %88%E6%9D%83%E7%A0%81%E6%A8%A1%E5%BC%8F-authorization-code-flow) or [implicit mode](https://docs.authing.cn/ authentication/oidc/oidc-authorization.html#%E4%BD%BF%E7%94%A8%E9%9A%90%E5%BC%8F%E6%A8%A1%E5%BC%8F-implicit-flow ), the optional value is `code` or `implicit`. The authorization code mode returns code, which can be exchanged for id_token, access_token and refresh_token. The implicit mode directly returns id_token and access_token, and refresh_token cannot be obtained. |
| redirect_uri | string | Default callback address, the content can be any one of the callback addresses configured in the Authing console. If you do not specify the callback address when you initiate login, the callback will be called back to this address by default. |
| refresh_token | boolean | Whether to return refresh_token. Only valid when flow is `code`, refresh_token is never returned when `implicit`. After enabling this option, the user needs to confirm the right after logging in each time. |

## Deployment function

- Execute commands on the command line

```
$ s deploy

# Output information
Start ...
It is detected that your project has the following project/projects <AuthingDemo> to be execute
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
Packing...
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
    -Name: TriggerNameHttp
      Type: HTTP
      Domains:
        -37679582-********.test.functioncompute.com
```

# Interface document

## log in

When you need to log in the user, let him click this link or redirect him to this address: http://37679582-**\*\*\*\***.test.functioncompute.com/login

- Interface description: initiate login.
- Interface address: GET /login

| Parameters | Type | Required | Description |
| ------------ | ------ | ---- | ----------- |
| redirect_uri | string | No | The callback address after successful login, it is recommended to pass parameters, if not, the default authing.yml will be used. |


## Use code to exchange token and user information

After the user logs in, Authentication will return an authorization code code to the configured callback address. You need to call http://37679582-**\*\*\*\***.test.functioncompute.com/code2token this interface, Complete the code exchange token, token exchange user information operation.

- Interface description: Use the authorization code code returned by Authing to exchange token and user information.
- Interface address: GET /code2token

| Parameters | Type | Required | Description |
| ------------ | ------ | ---- | ----------- |
| code | string | Yes | Authorization code code, in the form of a random string. |
| redirect_uri | string | No | Callback address, it is recommended to pass parameters, if not, the default authing.yml is used. If the redirect_uri parameter is passed when calling the login interface, it must be passed here, and it needs to be the same as the one passed during login. |

## Verify IdToken

When a user accesses your protected business API, it is recommended to call this interface to verify the legitimacy of the user's identity.

- Interface description: verify the legality of IdToken.
- Interface address: POST /verify-id-token

| Parameters | Type | Required | Description |
| ------- | ------ | ---- | ------------ |
| idToken | string | Yes | idToken content |

## Verify AccessToken

- Interface description: verify the legitimacy of AccessToken.
- Interface address: POST /verify-access-token

| Parameters | Type | Required | Description |
| ------- | ------ | ---- | ------------ |
| accessToken | string | yes | accessToken content |

## Refresh Token

- Interface description: verify the legitimacy of AccessToken.
- Interface address: POST /refresh-token

| Parameters | Type | Required | Description |
| ------- | ------ | ---- | ------------ |
| refreshToken | string | Yes | refresh_token content, returned by the `/code2token` interface. |
| redirectUri | string | No | The callback address, it is recommended to pass parameters, if not, the default authing.yml is used. If the redirect_uri parameter is passed when calling the login interface, it must be passed here, and it needs to be the same as the one passed during login. |

#### Sign out

- Interface description: log out.
- Interface address: GET /logout

| Parameters | Type | Required | Description |
| ------- | ------ | ---- | ------------ |
| redirect_uri | string | No | The redirection address after logout, you can fill in at will. |