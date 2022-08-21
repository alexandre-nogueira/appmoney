import { Exception } from '@adonisjs/core/build/standalone';
import PostingCategory from 'App/Models/PostingCategory';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class PostingCategoryService {
  private stdReturn = ['id', 'familyId', 'description'];

  public async create(postingCategory: PostingCategory) {
    const crudUtilities = new CrudUtilities();
    return crudUtilities.formatReturn(
      await postingCategory.save(),
      this.stdReturn
    );
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;
    const crudUtilities = new CrudUtilities();
    const postingCategory = await this.checkOwnership(user, id);

    changed = crudUtilities.compareField(
      description,
      postingCategory,
      'description',
      changed
    );
    if (changed === true) {
      return crudUtilities.formatReturn(
        await postingCategory.save(),
        this.stdReturn
      );
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    const crudUtilities = new CrudUtilities();
    return crudUtilities.formatReturn(
      await this.checkOwnership(user, id),
      this.stdReturn
    );
  }

  public async getList(familyId: number) {
    return await PostingCategory.query()
      .select(this.stdReturn)
      .where('familyId', familyId);
  }

  public async delete(user: User, id: number) {
    const crudUtilities = new CrudUtilities();
    const postingCategory = await this.checkOwnership(user, id);
    await postingCategory.delete();
    return crudUtilities.formatReturn(postingCategory, this.stdReturn);
  }

  private async checkOwnership(user: User, id: number) {
    const postingCategory = await PostingCategory.query()
      .where('id', id)
      .andWhere('familyId', user.familyId)
      .first();

    if (!postingCategory) {
      throw new Exception(
        'Account category does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return postingCategory;
  }
}
