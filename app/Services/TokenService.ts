import Env from '@ioc:Adonis/Core/Env';

export class TokenService {
  public async generateJWT(tokenData: any) {
    //Generate confirmation user token.
    const sign = require('jwt-encode');

    return sign(tokenData, Env.get('APP_KEY'));
  }
}
