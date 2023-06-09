import {
  PostingAPIReturn,
  AccountAPIReturn,
  PostingCategoryAPIReturn,
  PostingGroupAPIReturn,
} from './../types/APIReturnFormats';
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
  private crudUtilities = new CrudUtilities();

  public async create(user: User, posting: Posting) {
    const accountService = new AccountService();
    await accountService.checkOwnership(user, posting.accountId);
    if (posting.paymentDate !== undefined) {
      posting.status = PostingStatus.PAID;
    } else {
      posting.status = PostingStatus.PENDING;
    }
    return this.crudUtilities.formatReturn(
      await posting.save(),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup']
    );
  }

  public async edit(
    user: User,
    id: number,
    accountId: number,
    postingCategoryId: number | undefined,
    postingGroupId: number | undefined,
    description: string,
    value: number,
    dueDate: DateTime,
    paymentDate: DateTime | undefined,
    installment: number = 0,
    installments: number = 0,
    observation: string | undefined
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
    changed = crudUtilities.compareField(
      description,
      posting,
      'description',
      changed
    );
    changed = crudUtilities.compareField(
      installment,
      posting,
      'installment',
      changed
    );
    changed = crudUtilities.compareField(
      installments,
      posting,
      'installments',
      changed
    );
    changed = crudUtilities.compareField(
      observation,
      posting,
      'observation',
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
      if (posting.paymentDate === undefined) {
        posting.status = PostingStatus.REVERSED;
        posting.paymentDate = null;
      } else {
        posting.status = PostingStatus.PAID;
      }
    }

    if (changed) {
      if (posting.postingCategoryId === undefined)
        posting.postingCategoryId = null;
      if (posting.postingGroupId === undefined) posting.postingGroupId = null;
      return this.crudUtilities.formatReturn(
        (await posting.save()).serialize(),
        PostingAPIReturn,
        ['account', 'postingCategory', 'postingGroup']
      );
    } else {
      throw new Exception('No data changed', 400, 'E_NO_DATA_CHANGED');
    }
  }

  public async get(user: User, id: number) {
    return this.crudUtilities.formatReturn(
      await this.checkOwnership(user, id),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup']
    );
  }

  public async getList(
    user: User,
    accountId: number[],
    dateFrom: DateTime,
    dateTo: DateTime,
    status: string[],
    postingCategory: number[],
    postingGroup: number[],
    installmentsOnly: boolean,
    page: number,
    perPage: number
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
    const postings = await Posting.query()
      .select(PostingAPIReturn)
      .preload('account', (accountQuery) => {
        accountQuery.select(AccountAPIReturn);
      })
      .preload('postingCategory', (postingCategoryQuery) => {
        postingCategoryQuery.select(PostingCategoryAPIReturn);
      })
      .preload('postingGroup', (postingGroupQuery) => {
        postingGroupQuery.select(PostingGroupAPIReturn);
      })
      .where((subQuery) => {
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
        if (installmentsOnly === true) {
          subQuery
            .andWhereNotNull('installments')
            .andWhere('installments', '!=', 0);
        }
      })
      .paginate(page, perPage);

    return postings;
  }

  public async getFutureInstallments(
    user: User,
    baseMonth: DateTime,
    targetMonth: DateTime
  ) {
    const postingListPaginated = await this.getList(
      user,
      [],
      baseMonth.startOf('month'),
      baseMonth.endOf('month'),
      [],
      [],
      [],
      true,
      1,
      5000
    );

    const dif = Math.round(
      targetMonth.diff(baseMonth, ['months']).toObject().months ?? 0
    );

    const postingList = postingListPaginated.all();

    const currentInstallments = postingList.filter((posting) => {
      return posting.installments > posting.installment;
    });

    let futureInstallments: any[] = [];

    currentInstallments.forEach((posting) => {
      const remainingInstallments = posting.installments - posting.installment;
      if (remainingInstallments >= dif) {
        let futurePosting = posting.toObject();
        futurePosting.installment += dif;

        futurePosting.dueDate = posting.dueDate.plus({ months: dif });
        futureInstallments.push({ ...futurePosting });
      }
    });

    return futureInstallments;
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
    return this.crudUtilities.formatReturn(
      (await posting.save()).serialize(),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup']
    );
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
    return this.crudUtilities.formatReturn(
      await Posting.query().where('id', posting.id).first(),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup']
    );
  }

  public async delete(user: User, id: number) {
    const posting = await this.checkOwnership(user, id);
    posting.status = PostingStatus.DELETED;
    return this.crudUtilities.formatReturn(
      (await posting.save()).serialize(),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup']
    );
  }

  public async restore(user: User, id: number) {
    const posting = await this.checkOwnership(user, id);

    if (posting.status !== PostingStatus.DELETED) {
      throw new Exception(
        'Posting is not deleted',
        400,
        'E_POSTING_NOT_DELETED'
      );
    }

    if (posting.paymentDate !== null) {
      posting.status = PostingStatus.PAID;
    } else {
      posting.status = PostingStatus.PENDING;
    }
    return this.crudUtilities.formatReturn(
      (await posting.save()).serialize(),
      PostingAPIReturn,
      ['account', 'postingCategory', 'postingGroup', 'formattedDueDate']
    );
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
    const posting = await Posting.query()
      .select(PostingAPIReturn)
      .preload('account', (accountQuery) => {
        accountQuery.select(AccountAPIReturn);
      })
      .preload('postingCategory', (postingCategoryQuery) => {
        postingCategoryQuery.select(PostingCategoryAPIReturn);
      })
      .preload('postingGroup', (postingGroupQuery) => {
        postingGroupQuery.select(PostingGroupAPIReturn);
      })
      .where('id', id)
      .first();

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

  public async checkDuplicated(posting: Posting) {
    //User 3 fields to check possible duplicated posting
    // //Due date
    // //Description
    // //Value
    const duplicatedPosting = await Posting.query()
      .where('due_date', posting.dueDate.toSQLDate())
      .andWhere('description', posting.description)
      .andWhere('value', posting.value)
      .andWhere('status', '!=', PostingStatus.DELETED)
      .first();
    if (duplicatedPosting) {
      return true;
    }
    return false;
  }
}
