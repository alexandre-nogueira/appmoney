export const AccountCategoryAPIReturn = ['id', 'familyId', 'description'];

export const PostingCategoryAPIReturn = ['id', 'familyId', 'description'];

export const PostingGroupAPIReturn = ['id', 'familyId', 'description'];

export const AccountAPIReturn = [
  'id',
  'userId',
  'description',
  'accountCategoryId',
  'privateAccount',
  'active',
];

export const PostingAPIReturn = [
  'id',
  'accountId',
  'postingGroupId',
  'postingCategoryId',
  'description',
  'value',
  'dueDate',
  'paymentDate',
  'status',
];
