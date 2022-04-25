import { Exception } from '@adonisjs/core/build/standalone';
import AccountCategory from 'App/Models/AccountCategory';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class AccountCategoryService {
  public async create(accountCategory: AccountCategory) {
    return await accountCategory.save();
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;
    const crudUtilities = new CrudUtilities();

    const accountCategory = await this.checkOwnership(user, id);

    changed = crudUtilities.compareField(
      description,
      accountCategory,
      'description',
      changed
    );

    if (changed === true) {
      return await accountCategory.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return await this.checkOwnership(user, id);
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
