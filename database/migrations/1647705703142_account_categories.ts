import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AccountCategories extends BaseSchema {
  protected tableName = 'account_categories';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id');
      table.integer('family_id').unsigned().references('families.id');
      table.string('description', 120);
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
