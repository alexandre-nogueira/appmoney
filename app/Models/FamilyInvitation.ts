import { DateTime } from 'luxon';
import { belongsTo, column, BelongsTo } from '@ioc:Adonis/Lucid/Orm';
import Family from './Family';
import AppBaseModel from './AppBaseModel';
import { TokenStatus } from 'App/types/TokenStatus';

export default class FamilyInvitation extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public familyId: number;
  @belongsTo(() => Family)
  public family: BelongsTo<typeof Family>;

  @column()
  public invitedEmail: string;

  @column()
  public hostEmail: string;

  @column()
  public message: string;

  @column.dateTime()
  public expiresAt: DateTime;

  @column()
  public token: string;

  @column()
  public status: TokenStatus;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
