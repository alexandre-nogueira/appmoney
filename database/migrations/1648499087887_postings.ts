import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Postings extends BaseSchema {
  protected tableName = 'postings';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table
        .integer('account_id')
        .unsigned()
        .references('accounts.id')
        .notNullable();
      table
        .integer('posting_group_id')
        .unsigned()
        .references('posting_groups.id')
        .nullable();
      table
        .integer('posting_category_id')
        .unsigned()
        .references('account_categories.id')
        .notNullable();
      table.string('description');
      table.double('value');
      table.dateTime('due_date');
      table.dateTime('payment_date');
      table.string('tag', 80);
      table.string('status', 25);
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true });
      table.timestamp('updated_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
