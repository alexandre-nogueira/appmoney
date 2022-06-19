import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import {
  column,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  belongsTo,
  BelongsTo,
} from '@ioc:Adonis/Lucid/Orm';
import { UserStatus } from 'App/types/UserStatus';
import ResetPasswordToken from './ResetPasswordToken';
import Family from './Family';
import AppBaseModel from './AppBaseModel';

export default class User extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public firstName: string;

  @column()
  public lastName: string;

  @column()
  public status: UserStatus;

  @column()
  public confirmationCode: string;

  @column()
  public rememberMeToken: string;

  @column()
  public familyId: number;
  @belongsTo(() => Family)
  public family: BelongsTo<typeof Family>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @hasMany(() => ResetPasswordToken)
  public resetPasswordTokens: HasMany<typeof ResetPasswordToken>;
}
