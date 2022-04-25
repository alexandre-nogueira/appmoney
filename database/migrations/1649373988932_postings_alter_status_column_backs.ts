import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PostingsAlterStatusColumnBacks extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status');
    });
    this.schema.alterTable(this.tableName, (table) => {
      table.string('status');
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
