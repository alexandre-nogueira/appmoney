import { DateTime } from 'luxon';
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm';
import User from './User';
import { ResetTokenStatus } from 'App/types/ResetTokenStatus';

export default class ResetPasswordToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>;

  @column()
  public token: string;

  @column.dateTime()
  public expiresAt: DateTime;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column()
  public status: ResetTokenStatus;
}
