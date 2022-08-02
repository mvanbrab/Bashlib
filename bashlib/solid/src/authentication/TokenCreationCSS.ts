
export type IClientCredentialsTokenGenerationOptions = {
  name: string,
  email: string,
  password: string,
  idp: string,
  clientCredentialsTokenStorageLocation?: string // Storage location of the output client credentials token.
}

export type CSSToken = {
  id: string,
  secret: string,
  controls: any,
  name: string,
  idp: string,
  email: string,
}

const nodefetch = require('node-fetch')

export async function generateCSSToken(options: IClientCredentialsTokenGenerationOptions) {
  
  if (!options.idp.endsWith('/')) options.idp += '/';

  // This assumes your server is started under http://localhost:3000/.
  // This URL can also be found by checking the controls in JSON responses when interacting with the IDP API,
  // as described in the Identity Provider section.
  let url = `${options.idp}idp/credentials/`
  const response = await nodefetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // The email/password fields are those of your account.
    // The name field will be used when generating the ID of your token.
    body: JSON.stringify({ email: options.email, password: options.password, name: options.name }),
  });
  if (!response.ok) throw new Error(`HTTP Error Response requesting ${url}: ${response.status} ${response.statusText}`);

  // These are the identifier and secret of your token.
  // Store the secret somewhere safe as there is no way to request it again from the server!

  const token = await response.json();
  if (token.errorCode) {
    throw new Error(`Error retrieving token from server: ${token.name}`)
  }
  token.name = options.name;
  token.email = options.email;
  token.idp = options.idp;

  return token as CSSToken;
}