import { string } from '@ioc:Adonis/Core/Helpers';
import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PostingCategoryNatures extends BaseSchema {
  protected tableName = 'posting_categories';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('nature', 15);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
