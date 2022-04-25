import { Exception } from '@adonisjs/core/build/standalone';
import Database from '@ioc:Adonis/Lucid/Database';
import Account from 'App/Models/Account';
import Posting from 'App/Models/Posting';
import User from 'App/Models/User';
import { PostingStatus } from 'App/types/PostingStatus';
import { CrudUtilities } from 'App/Util/crudUtilities';
import { DateTime } from 'luxon';
import { AccountService } from './AccountService';

export class PostingService {
  public async create(user: User, posting: Posting) {
    const accountService = new AccountService();
    await accountService.checkOwnership(user, posting.accountId);
    return await posting.save();
  }

  public async edit(
    user: User,
    id: number,
    accountId: number,
    postingCategoryId: number,
    postingGroupId: number,
    status: string,
    description: string,
    value: number,
    dueDate: DateTime,
    paymentDate: DateTime | undefined
  ) {
    const posting = await this.checkOwnership(user, id);
    const crudUtilities = new CrudUtilities();
    let changed = false;

    changed = crudUtilities.compareField(
      accountId,
      posting,
      'accountId',
      changed
    );
    changed = crudUtilities.compareField(
      postingCategoryId,
      posting,
      'postingCategoryId',
      changed
    );
    changed = crudUtilities.compareField(
      postingGroupId,
      posting,
      'postingGroupId',
      changed
    );
    crudUtilities.compareField(status, posting, 'status', changed);
    changed = crudUtilities.compareField(
      description,
      posting,
      'description',
      changed
    );
    changed = crudUtilities.compareField(value, posting, 'value', changed);

    if (dueDate.toISODate() !== posting.dueDate.toISODate()) {
      changed = true;
      posting.dueDate = dueDate;
    }
    if (paymentDate?.toISODate() !== posting.paymentDate?.toISODate()) {
      changed = true;
      posting.paymentDate = paymentDate;
    }

    if (changed) {
      return await posting.save();
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return this.checkOwnership(user, id);
  }

  public async getList(
    user: User,
    accountId: number[],
    dateFrom: DateTime,
    dateTo: DateTime,
    status: string[],
    postingCategory: number[],
    postingGroup: number[]
  ) {
    let validatedAccounts: number[] = [];
    if (accountId.length === 0) {
      const userAccounts = await Account.query().where('user_id', user.id);
      userAccounts.forEach((account) => {
        validatedAccounts.push(account.id);
      });
    } else {
      validatedAccounts = await this.checkAccountsOwnership(user, accountId);

      if (validatedAccounts.length === 0) {
        throw new Exception('Invalid Accound Ids', 401, 'E_INVALID_ACCOUND_ID');
      }
    }
    console.log(validatedAccounts);
    const postings = await Posting.query().where((subQuery) => {
      subQuery.whereIn('account_id', validatedAccounts).andWhere((query) => {
        query
          .where('due_date', '>=', dateFrom.toSQLDate())
          .andWhere('due_date', '<=', dateTo.toSQLDate());
      });
      if (status.length > 0) {
        subQuery.andWhereIn('status', status);
      }
      if (postingCategory.length > 0) {
        subQuery.andWhereIn('posting_category_id', postingCategory);
      }
      if (postingGroup.length > 0) {
        subQuery.andWhereIn('posting_group_id', postingGroup);
      }
    });
    // .toQuery();
    return postings;
  }

  public async pay(user: User, id: number, paymentDate: DateTime) {
    const posting = await this.checkOwnership(user, id);
    if (posting.paymentDate !== null) {
      throw new Exception(
        'Posting already paid',
        400,
        'E_POSTING_ALREADY_PAID'
      );
    }
    posting.paymentDate = paymentDate;
    posting.status = PostingStatus.PAID;
    return await posting.save();
  }

  public async reversePayment(user: User, id: number) {
    const posting = await this.checkOwnership(user, id);
    if (posting.paymentDate === null) {
      throw new Exception('Posting not paid', 400, 'E_POSTING_NOT_PAID');
    }
    await Database.rawQuery(
      'update postings set payment_date = null, status = :status where id = :id',
      { status: PostingStatus.REVERSED, id: posting.id }
    );
    return await Posting.query().where('id', posting.id).first();
  }

  public async delete(user: User, id: number) {
    const posting = await this.checkOwnership(user, id);
    posting.status = PostingStatus.DELETED;
    return await posting.save();
  }

  public async checkAccountsOwnership(user: User, accountIds: number[]) {
    const accountService = new AccountService();
    let validatedAccounts: number[] = [];
    for (const id of accountIds) {
      try {
        await accountService.checkOwnership(user, id);
        validatedAccounts.push(id);
      } catch (error) {}
    }
    return validatedAccounts;
  }

  public async checkOwnership(user: User, id: number) {
    const posting = await Posting.query().where('id', id).first();

    if (posting) {
      const account = await Account.query()
        .where('id', posting.accountId)
        .andWhere('userId', user.id)
        .first();

      if (!account) {
        throw new Exception(
          'Account does not exists',
          400,
          'E_ENTITY_DOES_NOT_EXISTS'
        );
      }
    } else {
      throw new Exception(
        'Posting does not exists',
        400,
        'E_ENTITY_DOES_NOT_EXISTS'
      );
    }
    return posting;
  }

  public getPostingStatusListAsStringArray() {
    return Object.values(PostingStatus).map((value) => {
      return value.toString();
    });
  }
}