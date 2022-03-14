import { Exception } from '@adonisjs/core/build/standalone';
import { AuthContract } from '@ioc:Adonis/Addons/Auth';
import User from 'App/Models/User';
import { TokenTypes } from 'App/types/tokenTypes';
import { UserStatus } from 'App/types/UserStatus';

export class UserService {
  //Create and register a new user.
  public async register(user: User, auth: AuthContract) {
    //Generate confirmation user token.
    const sign = require('jwt-encode');

    user.confirmationCode = sign({ email: user.email }, 'secret');
    user.status = UserStatus.PENDING;

    await this.save(user);

    const newUser = await this.generateToken(user, TokenTypes.GENERATE, auth);
    if (newUser) {
      return { user: newUser, confirmationCode: user.confirmationCode };
    }
  }

  //LOGIN method
  public async login(email: string, password: string, auth: AuthContract) {
    let user: User = new User();
    user.email = email;
    user.password = password;

    const loggedUser = await this.generateToken(user, TokenTypes.LOGIN, auth);

    if (loggedUser?.status !== UserStatus.ACTIVE) {
      throw new Exception(
        'User email not confirmed',
        401,
        'E_USER_NOT_CONFIRMED'
      );
    }
    return loggedUser;
  }

  private async save(user: User) {
    //put some validations here if necessary.

    if (await user.save()) {
      return user;
    }
  }

  private async generateToken(
    user: User,
    tokenType: TokenTypes,
    auth: AuthContract
  ) {
    let token: any;
    if (tokenType === TokenTypes.GENERATE) {
      token = await auth.use('api').generate(user, { expiresIn: '1 days' });
    } else if (tokenType === TokenTypes.LOGIN) {
      token = await auth
        .use('api')
        .attempt(user.email, user.password, { expiresIn: '1 days' });
      console.log(token);
    }
    if (token) {
      return {
        id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        token: token.token,
        status: token.user.status,
      };
    }
  }

  public async sendConfirmationEmail(email: string, confirmationCode: string) {
    console.log({ email: email, confirmationCode: confirmationCode });
  }

  public async confirmUserCode(token: string) {
    const user = await User.query().where('confirmation_code', token).first();
    if (user) {
      user.status = UserStatus.ACTIVE;
      user.confirmationCode = '';
      user.save();
      return true;
    } else {
      throw new Exception(
        'Invalid confirmation code',
        400,
        'E_INVALID_CONFIRMATION_CODE'
      );
    }
  }
}
