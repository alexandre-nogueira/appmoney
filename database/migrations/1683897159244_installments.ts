import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Installments extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('installment').nullable;
      table.integer('installments').nullable;
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
