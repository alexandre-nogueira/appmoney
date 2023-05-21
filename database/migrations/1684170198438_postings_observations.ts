import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class PostingsObservations extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('observation', 1000);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
