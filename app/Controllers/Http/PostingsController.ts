import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Posting from 'App/Models/Posting';
import { PostingService } from 'App/Services/PostingService';
import { RequestValidationService } from 'App/Util/RequestValidation';
import { rules, schema } from '@ioc:Adonis/Core/Validator';
import { PostingStatus } from 'App/types/PostingStatus';

export default class PostingsController {
  public async createMultiple({ auth, request }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingService = new PostingService();
    let createdPostings: Posting[] = [];
    let duplicatedPostings: Posting[] = [];

    const postingSchema = schema.create({
      postings: schema.array().members(
        schema.object().members({
          accountId: schema.number(),
          postingCategoryId: schema.number.optional([
            rules.exists({
              table: 'posting_categories',
              column: 'id',
              where: { family_id: user.familyId },
            }),
          ]),
          postingGroupId: schema.number.optional([
            rules.exists({
              table: 'posting_groups',
              column: 'id',
              where: { family_id: user.familyId },
            }),
          ]),
          // status: schema.enum(Object.values(PostingStatus)),
          description: schema.string({}, [
            rules.maxLength(255),
            rules.minLength(1),
          ]),
          value: schema.number(),
          dueDate: schema.date(),
          paymentDate: schema.date.optional(),
        })
      ),
      ignoreDuplicated: schema.boolean(),
    });

    const payload = await request.validate({ schema: postingSchema });
    const postings = payload.postings;
    for (const requestData of postings) {
      const posting = new Posting();
      posting.accountId = requestData.accountId;
      posting.postingCategoryId = requestData.postingCategoryId;
      posting.postingGroupId = requestData.postingGroupId;
      // posting.status = requestData.status;
      posting.description = requestData.description;
      posting.value = requestData.value;
      posting.dueDate = requestData.dueDate;
      posting.paymentDate = requestData.paymentDate;
      if (payload.ignoreDuplicated === false) {
        if (await postingService.checkDuplicated(posting)) {
          duplicatedPostings.push(posting);
        } else {
          createdPostings.push(await postingService.create(user, posting));
        }
      } else {
        createdPostings.push(await postingService.create(user, posting));
      }
    }

    return {
      createdPostings: createdPostings,
      duplicatedPostings: duplicatedPostings,
    };
  }

  public async create({ auth, request }: HttpContextContract) {
    const postingService = new PostingService();
    const user = await auth.authenticate();

    let posting = new Posting();

    posting.accountId = await RequestValidationService.validateNumber(
      request,
      'accountId',
      []
    );

    posting.postingCategoryId =
      await RequestValidationService.validateOptionalNumber(
        request,
        'postingCategoryId',
        [
          rules.exists({
            table: 'posting_categories',
            column: 'id',
            where: { family_id: user.familyId },
          }),
        ]
      );

    posting.postingGroupId =
      await RequestValidationService.validateOptionalNumber(
        request,
        'postingGroupId',
        [
          rules.exists({
            table: 'posting_groups',
            column: 'id',
            where: { family_id: user.familyId },
          }),
        ]
      );

    // posting.status = await RequestValidationService.validateEnum(
    //   request,
    //   'status',
    //   Object.values(PostingStatus)
    // );

    posting.description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(255), rules.minLength(1)]
    );

    posting.value = await RequestValidationService.validateNumber(
      request,
      'value',
      []
    );

    posting.dueDate = await RequestValidationService.validateDate(
      request,
      'dueDate',
      []
    );

    posting.paymentDate = await RequestValidationService.validateOptionalDate(
      request,
      'paymentDate',
      []
    );

    posting.installment =
      (await RequestValidationService.validateOptionalNumber(
        request,
        'installment',
        []
      )) ?? 0;

    posting.installments =
      (await RequestValidationService.validateOptionalNumber(
        request,
        'installments',
        []
      )) ?? 0;

    posting.observation =
      (await RequestValidationService.validateOptionalString(
        request,
        'observation',
        []
      )) ?? '';

    return await postingService.create(user, posting);
  }

  public async edit({ auth, request, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingService = new PostingService();

    const id = params.id;

    const accountId = await RequestValidationService.validateNumber(
      request,
      'accountId',
      []
    );

    const postingCategoryId =
      await RequestValidationService.validateOptionalNumber(
        request,
        'postingCategoryId',
        [
          rules.exists({
            table: 'posting_categories',
            column: 'id',
            where: { family_id: user.familyId },
          }),
        ]
      );

    const postingGroupId =
      await RequestValidationService.validateOptionalNumber(
        request,
        'postingGroupId',
        [
          rules.exists({
            table: 'posting_groups',
            column: 'id',
            where: { family_id: user.familyId },
          }),
        ]
      );

    const description = await RequestValidationService.validateString(
      request,
      'description',
      [rules.maxLength(255), rules.minLength(1)]
    );

    const value = await RequestValidationService.validateNumber(
      request,
      'value',
      []
    );

    const dueDate = await RequestValidationService.validateDate(
      request,
      'dueDate',
      []
    );

    const paymentDate = await RequestValidationService.validateOptionalDate(
      request,
      'paymentDate',
      []
    );

    const installment =
      (await RequestValidationService.validateOptionalNumber(
        request,
        'installment',
        []
      )) ?? 0;

    const installments =
      (await RequestValidationService.validateOptionalNumber(
        request,
        'installments',
        []
      )) ?? 0;

    const observation =
      (await RequestValidationService.validateOptionalString(
        request,
        'observation',
        []
      )) ?? '';

    return await postingService.edit(
      user,
      id,
      accountId,
      postingCategoryId,
      postingGroupId,
      description,
      value,
      dueDate,
      paymentDate,
      installment,
      installments,
      observation
    );
  }

  public async getList({ auth, request }: HttpContextContract) {
    const postingService = new PostingService();
    const user = await auth.authenticate();

    let accountIdQuery: number[] = [];
    let statusQuery: string[] = [];
    let postingCategoryQuery: number[] = [];
    let postingGroupQuery: number[] = [];

    const { accountId, status, postingCategoryId, postingGroupId } =
      request.qs();

    //Validate accountId Query String
    if (typeof accountId === 'object') {
      let accountIdValidated =
        await RequestValidationService.validateNumberArray(
          request,
          'accountId',
          []
        );
      accountIdQuery = accountIdValidated;
    } else if (typeof accountId === 'string') {
      let accountIdValidated = await RequestValidationService.validateNumber(
        request,
        'accountId',
        []
      );
      accountIdQuery.push(accountIdValidated);
    }

    //Validate field Status in the Querry String
    if (typeof status === 'object') {
      let statusValidated = await RequestValidationService.validateStringArray(
        request,
        'status',
        []
      );
      statusQuery = statusValidated;
    } else if (typeof status === 'string') {
      let statusValidated = await RequestValidationService.validateString(
        request,
        'status',
        []
      );
      statusQuery.push(statusValidated);
    }

    //Validate field postingCategory in the Query String
    if (typeof postingCategoryId === 'object') {
      let postingCategoryValidated =
        await RequestValidationService.validateNumberArray(
          request,
          'postingCategoryId',
          []
        );
      postingCategoryQuery = postingCategoryValidated;
    } else if (typeof postingCategoryId === 'string') {
      let postingCategoryValidated =
        await RequestValidationService.validateNumber(
          request,
          'postingCategoryId',
          []
        );
      postingCategoryQuery.push(postingCategoryValidated);
    }

    //Validate field postingGroup in the Query String
    if (typeof postingGroupId === 'object') {
      let postingGroupValidated =
        await RequestValidationService.validateNumberArray(
          request,
          'postingGroupId',
          []
        );
      postingGroupQuery = postingGroupValidated;
    } else if (typeof postingGroupId === 'string') {
      let postingGroupValidated = await RequestValidationService.validateNumber(
        request,
        'postingGroupId',
        []
      );
      postingGroupQuery.push(postingGroupValidated);
    }

    //Validate field dateFrom in the Query String
    const dateFrom = await RequestValidationService.validateDate(
      request,
      'dateFrom',
      []
    );

    //Validate field dateTo in the Query String
    const dateTo = await RequestValidationService.validateDate(
      request,
      'dateTo',
      []
    );

    const installmentsOnly = await RequestValidationService.validateBoolean(
      request,
      'installmentsOnly',
      []
    );

    let page = await RequestValidationService.validateOptionalNumber(
      request,
      'page',
      []
    );
    if (!page) {
      page = 1;
    }

    let perPage = await RequestValidationService.validateOptionalNumber(
      request,
      'perPage',
      []
    );
    if (!perPage) {
      perPage = 20;
    }

    return await postingService.getList(
      user,
      accountIdQuery,
      dateFrom,
      dateTo,
      statusQuery,
      postingCategoryQuery,
      postingGroupQuery,
      installmentsOnly,
      page,
      perPage
    );
  }

  public async getFutureInstallments({ auth }: HttpContextContract) {
    const postingService = new PostingService();
    const user = await auth.authenticate();

    return postingService.getFutureInstallments(user);
  }

  public async getSingle({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingService = new PostingService();
    return postingService.get(user, params.id);
  }

  public async delete({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingService = new PostingService();

    return await postingService.delete(user, params.id);
  }

  public async restore({ auth, params }: HttpContextContract) {
    const user = await auth.authenticate();
    const postingService = new PostingService();

    return await postingService.restore(user, params.id);
  }
}
