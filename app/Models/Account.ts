import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import User from './User';
import AccountCategory from './AccountCategory';

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public userId: number;
  @hasOne(() => User)
  public user: HasOne<typeof User>;

  @column()
  public description: string;

  @column()
  public accountCagegoryId: number;
  @hasOne(() => AccountCategory)
  public accountCategory: HasOne<typeof AccountCategory>;

  @column()
  public privateAccount: boolean;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
