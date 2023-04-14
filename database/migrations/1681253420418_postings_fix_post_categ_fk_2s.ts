import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PostingsFixPostCategFk2 extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('posting_category_id').references('posting_categories.id');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
