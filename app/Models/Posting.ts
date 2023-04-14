import { DateTime } from 'luxon';
import { column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import Account from './Account';
import PostingCategory from './PostingCategory';
import PostingGroup from './PostingGroup';
import AppBaseModel from './AppBaseModel';

export default class Posting extends AppBaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public accountId: number;
  @hasOne(() => Account, {
    foreignKey: 'id',
    localKey: 'accountId',
  })
  public account: HasOne<typeof Account>;

  @column()
  public postingGroupId: number;
  @hasOne(() => PostingGroup, {
    foreignKey: 'id',
    localKey: 'postingGroupId',
  })
  public postingGroup: HasOne<typeof PostingGroup>;

  @column()
  public postingCategoryId: number;
  @hasOne(() => PostingCategory, {
    foreignKey: 'id',
    localKey: 'postingCategoryId',
  })
  public postingCategory: HasOne<typeof PostingCategory>;

  @column()
  public description: string;

  @column()
  public value: number;

  @column.date({
    serialize: (value: DateTime) => {
      return value.toFormat('yyyy-MM-dd');
    },
  })
  public dueDate: DateTime;

  @column.date()
  public paymentDate?: DateTime | null;

  @column()
  public tag: string;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
