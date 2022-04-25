import { Exception } from '@adonisjs/core/build/standalone';
import PostingGroup from 'App/Models/PostingGroup';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class PostingGroupService {
  public async create(postingGroup: PostingGroup) {
    return await postingGroup.save();
  }

  public async edit(user: User, id: number, description: string) {
    let changed = false;
    const crudUtilities = new CrudUtilities();

    const postingGroup = await this.checkOwnership(user, id);

    changed = crudUtilities.compareField(
      description,
      postingGroup,
      'description',
      changed
    );

    if (changed === true) {
      return await postingGroup.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return await this.checkOwnership(user, id);
  }

  public async getList(familyId: number) {
    return await PostingGroup.query().where('familyId', familyId);
  }

  public async delete(user: User, id: number) {
    const postingGroup = await this.checkOwnership(user, id);
    await postingGroup.delete();
    return postingGroup;
  }

  private async checkOwnership(user: User, id: number) {
    const postingGroup = await PostingGroup.query()
      .where('id', id)
      .andWhere('familyId', user.familyId)
      .first();

    if (!postingGroup) {
      throw new Exception(
        'Account category does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return postingGroup;
  }
}
