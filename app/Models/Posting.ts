import { DateTime } from 'luxon';
import { BaseModel, column, HasOne, hasOne } from '@ioc:Adonis/Lucid/Orm';
import Account from './Account';
import PostingCategory from './PostingCategory';
import PostingGroup from './PostingGroup';

export default class Posting extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public accountId: number;
  @hasOne(() => Account)
  public account: HasOne<typeof Account>;

  @column()
  public postingGroupId: number;
  @hasOne(() => PostingGroup)
  public postingGroup: HasOne<typeof PostingGroup>;

  @column()
  public postingCategoryId: number;
  @hasOne(() => PostingCategory)
  public postingCategory: HasOne<typeof PostingCategory>;

  @column()
  public description: string;

  @column()
  public value: number;

  @column.date()
  public dueDate: DateTime;

  @column.date()
  public paymentDate?: DateTime;

  @column()
  public tag: string;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
