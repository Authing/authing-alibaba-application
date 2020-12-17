function codeLoginUrlGenerator({
  issuer,
  clientId,
  redirectUri,
  needRefreshToken,
  state,
}) {
  return `${issuer}/auth?client_id=${clientId
    }&redirect_uri=${redirectUri
    }&response_type=code&scope=openid profile email phone address ${needRefreshToken ? "offline_access" : ""
    }&state=${state ? state : Math.random().toString().slice(2)}${needRefreshToken ? '&prompt=consent' : ''}`;
}
function implicitLoginUrlGenerator({
  issuer,
  clientId,
  redirectUri,
  state,
  nonce
}) {
  return `${issuer}/auth?client_id=${clientId
    }&redirect_uri=${redirectUri
    }&response_type=id_token token&scope=openid profile email phone address&state=${state ? state : Math.random().toString().slice(2)}&nonce=${nonce ? nonce : Math.random().toString().slice(2)}`;
}

module.exports = {
  implicitLoginUrlGenerator,
  codeLoginUrlGenerator
}