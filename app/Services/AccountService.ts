import { Exception } from '@adonisjs/core/build/standalone';
import Account from 'App/Models/Account';
import User from 'App/Models/User';
import {
  AccountAPIReturn,
  AccountCategoryAPIReturn,
} from 'App/types/APIReturnFormats';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class AccountService {
  private stdReturn = [
    'id',
    'userId',
    'description',
    'accountCategoryId',
    'privateAccount',
    'active',
  ];

  private crudUtilities = new CrudUtilities();

  public async create(account: Account) {
    return this.crudUtilities.formatReturn(
      await account.save(),
      AccountAPIReturn,
      ['accountCategory', 'user']
    );
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
    const account = await this.checkOwnership(user, id);

    changed = this.crudUtilities.compareField(
      description,
      account,
      'description',
      changed
    );

    changed = this.crudUtilities.compareField(
      privateAccount,
      account,
      'privateAccount',
      changed
    );

    changed = this.crudUtilities.compareField(
      accountCategoryId,
      account,
      'accountCategoryId',
      changed
    );

    changed = this.crudUtilities.compareField(
      active,
      account,
      'active',
      changed
    );

    if (changed === true) {
      return this.crudUtilities.formatReturn(
        await account.save(),
        AccountAPIReturn,
        ['accountCategory', 'user']
      );
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return this.crudUtilities.formatReturn(
      await this.checkOwnership(user, id),
      AccountAPIReturn,
      ['accountCategory', 'user']
    );
  }

  public async getUserAccounts(user: User, active: boolean[]) {
    return await Account.query()
      .preload('accountCategory', (accountCategoryQuery) => {
        accountCategoryQuery.select(AccountCategoryAPIReturn);
      })
      .preload('user', (userQuery) => {
        userQuery.select('firstName', 'lastName');
      })
      .select(AccountAPIReturn)
      .where('userId', user.id)
      .andWhereIn('active', active);
  }

  public async getFamilyAccounts(user: User, active: boolean[]) {
    return await Account.query()
      .preload('accountCategory', (accountCategoryQuery) => {
        accountCategoryQuery.select(AccountCategoryAPIReturn);
      })
      .preload('user', (userQuery) => {
        userQuery.select('firstName', 'lastName');
      })
      .select(AccountAPIReturn)
      .where((query) => {
        query.where('userId', user.id).andWhereIn('active', active);
      })
      .orWhere((query) => {
        query
          .whereIn('userId', (query) => {
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
    return this.crudUtilities.formatReturn(
      await account.save(),
      AccountAPIReturn,
      ['accountCategory', 'user']
    );
  }

  public async checkOwnership(user: User, id: number) {
    const account = await Account.query()
      .preload('accountCategory', (accountCategoryQuery) => {
        accountCategoryQuery.select(AccountCategoryAPIReturn);
      })
      .preload('user', (userQuery) => {
        userQuery.select('firstName', 'lastName');
      })
      .where('id', id)
      .andWhere('userId', user.id)
      .first();

    if (!account) {
      // console.log(`${id} não existe`);
      throw new Exception(
        'Account does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return account;
  }
}
