import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class UsersAddResetPassTokens extends BaseSchema {
  protected tableName = 'reset_password_tokens';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('CASCADE');
      table.string('token').nullable().unique();
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('expires_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
