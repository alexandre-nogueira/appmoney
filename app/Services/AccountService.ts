import { Exception } from '@adonisjs/core/build/standalone';
import Account from 'App/Models/Account';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class AccountService {
  public async create(account: Account) {
    return await account.save();
  }

  public async edit(
    user: User,
    id: number,
    description: string,
    privateAccount: boolean,
    accountCategoryId: number,
    active: boolean
  ) {
    let changed = false;
    const crudUtilities = new CrudUtilities();

    const account = await this.checkOwnership(user, id);

    changed = crudUtilities.compareField(
      description,
      account,
      'description',
      changed
    );

    changed = crudUtilities.compareField(
      privateAccount,
      account,
      'privateAccount',
      changed
    );

    changed = crudUtilities.compareField(
      accountCategoryId,
      account,
      'accountCategoryId',
      changed
    );

    changed = crudUtilities.compareField(active, account, 'active', changed);

    if (changed === true) {
      return await account.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return await this.checkOwnership(user, id);
  }

  public async getUserAccounts(user: User, active: boolean[]) {
    return await Account.query()
      .where('userId', user.id)
      .andWhereIn('active', active);
  }

  public async getFamilyAccounts(user: User, active: boolean[]) {
    return await Account.query()
      .where((query) => {
        query.where('user_id', user.id).andWhereIn('active', active);
      })
      .orWhere((query) => {
        query
          .whereIn('user_id', (query) => {
            query
              .select('id')
              .from('users')
              .where('family_id', user.familyId)
              .andWhere('id', '<>', user.id);
          })
          .andWhere('privateAccount', false)
          .andWhereIn('active', active);
      });
  }

  public async delete(user: User, id: number) {
    const account = await this.checkOwnership(user, id);

    account.active = false;
    account.save();
    return account;
  }

  public async checkOwnership(user: User, id: number) {
    const account = await Account.query()
      .where('id', id)
      .andWhere('userId', user.id)
      .first();

    // console.log(id, user.id);

    if (!account) {
      // console.log(`${id} não existe`);
      throw new Exception(
        'Account does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    // console.log(`${id} existe`);
    return account;
  }
}
