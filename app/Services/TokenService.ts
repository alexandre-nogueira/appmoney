import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';

export class TokenService {
  public async generateJWT(tokenData: any) {
    const sign = require('jwt-encode');

    return sign(tokenData, Env.get('APP_KEY'));
  }

  //Generate API token and return user data
  public async generateAPIToken(user: User, auth: AuthContract) {
    let token: any;

    return (token = await auth
      .use('api')
      .generate(user, { expiresIn: '1 days' }));
  }
}
