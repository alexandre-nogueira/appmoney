import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Accounts extends BaseSchema {
  protected tableName = 'accounts';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('user_id').unsigned().references('users.id').notNullable();
      table.string('description', 120);
      table
        .integer('account_category_id')
        .unsigned()
        .references('account_categories.id');
      table.boolean('privateAccount');
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
