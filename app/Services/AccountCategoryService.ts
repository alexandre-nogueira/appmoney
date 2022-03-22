import { Exception } from '@adonisjs/core/build/standalone';
import AccountCategory from 'App/Models/AccountCategory';
import User from 'App/Models/User';

export class AccountCategoryService {
  public async create(accountCategory: AccountCategory) {
    return await accountCategory.save();
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;

    const accountCategory = await this.checkOwnership(user, id);

    if (accountCategory.description !== description) {
      changed = true;
      accountCategory.description = description;
    }
    if (changed === true) {
      return await accountCategory.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return this.checkOwnership(user, id);
  }

  public async getList(familyId: number) {
    return await AccountCategory.query().where('familyId', familyId);
  }

  public async delete(user: User, id: number) {
    const accountCategory = await this.checkOwnership(user, id);
    await accountCategory.delete();
    return accountCategory;
  }

  private async checkOwnership(user: User, id: number) {
    const accountCategory = await AccountCategory.query()
      .where('id', id)
      .andWhere('familyId', user.familyId)
      .first();

    if (!accountCategory) {
      throw new Exception(
        'Account category does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return accountCategory;
  }
}
