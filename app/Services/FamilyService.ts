import { TokenStatus } from './../types/TokenStatus';
import { DateTime } from 'luxon';
import { TokenService } from './TokenService';
import { Exception } from '@adonisjs/core/build/standalone';
import Family from 'App/Models/Family';
import FamilyInvitation from 'App/Models/FamilyInvitation';
import User from 'App/Models/User';
import { CrudUtilities } from 'App/Util/crudUtilities';
import { NotificationService } from './notificationService';

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

  public async renewMemberInvitation(
    familyInvitation: FamilyInvitation,
    message: string
  ) {
    await this.destroyInvitationToken(familyInvitation.token, false);
    return await this.generateMemberInvitation(
      familyInvitation.familyId,
      familyInvitation.hostEmail,
      familyInvitation.invitedEmail,
      message
    );
  }

  public async generateMemberInvitation(
    familyId: number,
    hostEmail: string,
    invitedEmail: string,
    message: string
  ) {
    const tokenService = new TokenService();
    const familyInvitation = new FamilyInvitation();

    familyInvitation.familyId = familyId;
    familyInvitation.hostEmail = hostEmail;
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
      expiresAt: familyInvitation.expiresAt,
    };
  }

  public async getPendingInvitation(familyId: number, invitedEmail: string) {
    return await FamilyInvitation.query()
      .preload('family')
      .where('familyId', familyId)
      .andWhere('invitedEmail', invitedEmail)
      .andWhere('expires_at', '>', DateTime.now().toISO())
      .andWhere('status', TokenStatus.NEW)
      .first();
    // if (!pendingInvitation) {
    //   throw new Exception(
    //     'No Pending Invitations',
    //     400,
    //     'E_NO_PENDING_INVITATIONS'
    //   );
    // }
    // return pendingInvitation;
  }

  public async getPendingInvitations(familyId: number) {
    const pendingInvitations = await FamilyInvitation.query()
      .select(
        'id',
        'family_id',
        'invited_email',
        'host_email',
        'message',
        'expires_at'
      )
      .where('familyId', familyId)
      .andWhere('status', TokenStatus.NEW)
      .andWhere('expires_at', '>', DateTime.now().toISO());
    if (!pendingInvitations) {
      throw new Exception(
        'No Pending Invitations',
        400,
        'E_NO_PENDING_INVITATIONS'
      );
    }
    return pendingInvitations;
  }

  public async destroyInvitationToken(token: string, isUsed = true) {
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
    if (isUsed) {
      familyInvitation.status = TokenStatus.USED;
    } else {
      familyInvitation.status = TokenStatus.CANCELED;
    }
    familyInvitation.expiresAt = DateTime.now();
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

  public async sendFamilyInvitationEmail(
    email: string,
    token: string,
    appLinkAdress: string
  ) {
    const notificationService = new NotificationService();
    notificationService.sendFakeMail(
      'Invite to App Money',
      email,
      `<h2>Você foi convidado para utilizar o app money
      <a href=${appLinkAdress}/${token}>
      clicando aqui</a></h2>`
    );
  }
}
