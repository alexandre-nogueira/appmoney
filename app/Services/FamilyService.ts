import { Exception } from '@adonisjs/core/build/standalone';
import Family from 'App/Models/Family';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';

export class FamilyService {
  //Create new family
  public async create(family: Family) {
    return await family.save();
  }

  //Return a family by id;
  public async get(id: number) {
    return await Family.findOrFail(id);
  }

  public async edit(user: User, description: string) {
    let changed = false;
    const crudUtilities = new CrudUtilities();

    const family = await this.get(user.familyId);

    changed = crudUtilities.compareField(
      description,
      family,
      'description',
      changed
    );

    if (changed === true) {
      return family.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
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
