import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PostingsFixPostCategFks extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('posting_category_id');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
