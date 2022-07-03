import { TokenStatus } from './../types/TokenStatus';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { DateTime } from 'luxon';
import { TokenService } from './TokenService';
import { Exception } from '@adonisjs/core/build/standalone';
import Family from 'App/Models/Family';
import FamilyInvitation from 'App/Models/FamilyInvitation';
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

  public async generateMemberInvitation(
    user: User,
    invitedEmail: string,
    message: string
  ) {
    const tokenService = new TokenService();
    const familyInvitation = new FamilyInvitation();

    familyInvitation.familyId = user.familyId;
    familyInvitation.hostEmail = user.email;
    familyInvitation.invitedEmail = invitedEmail;
    familyInvitation.message = message;
    familyInvitation.token = await tokenService.generateJWT({
      email: invitedEmail,
      timeStamp: DateTime.now(),
    });
    familyInvitation.expiresAt = DateTime.now().plus({ month: 1 });
    familyInvitation.status = TokenStatus.NEW;
    await familyInvitation.save();
    return familyInvitation.token;
  }

  public async getMemberInvitation(token: string) {
    const familyInvitation = await FamilyInvitation.query()
      .preload('family')
      .where('token', token)
      .andWhere('expires_at', '>', DateTime.now().toISO())
      .andWhere('status', TokenStatus.NEW)
      .first();
    if (!familyInvitation) {
      throw new Exception(
        'Invalid Invitation',
        400,
        'E_INVALID_FAMILY_INVITATION'
      );
    }
    return {
      id: familyInvitation.id,
      familyId: familyInvitation.familyId,
      familyName: familyInvitation.family.description,
      invitedEmail: familyInvitation.invitedEmail,
      hostEmail: familyInvitation.hostEmail,
      message: familyInvitation.message,
    };
  }

  public async destroyInvitationToken(token: string) {
    const familyInvitation = await FamilyInvitation.query()
      .preload('family')
      .where('token', token)
      .andWhere('expires_at', '>', DateTime.now().toISO())
      .andWhere('status', TokenStatus.NEW)
      .first();
    if (!familyInvitation) {
      throw new Exception(
        'Invalid Invitation',
        400,
        'E_INVALID_FAMILY_INVITATION'
      );
    }
    familyInvitation.status = TokenStatus.USED;
    return await familyInvitation.save();
  }

  public async getMembers(familyId: number) {
    return await User.query().where('familyId', familyId);
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
