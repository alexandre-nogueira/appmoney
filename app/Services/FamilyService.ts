import { Exception } from '@adonisjs/core/build/standalone';
import Family from 'App/Models/Family';
import User from 'App/Models/User';

export class FamilyService {
  //Create new family
  public async create(family: Family) {
    return await family.save();
  }

  //Return a family by id;
  public async get(id: number) {
    return await Family.findOrFail(id);
  }

  public async edit(family: Family) {
    return family.save();
  }

  public async validateOwnership(familyId: number, user: User) {
    const family = await this.get(familyId);
    if (family.id !== user.familyId) {
      throw new Exception(
        'User does not bellong to this family',
        400,
        'E_USER_VS_FAMILY'
      );
    }
    return family;
  }
}
