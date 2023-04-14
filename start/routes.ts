/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

Route.get('/', async () => {
  return { hello: 'world' };
});

//User - no token
Route.group(() => {
  Route.post('register', 'UsersController.register');
  Route.post('login', 'UsersController.login');
  Route.get('confirm/:token', 'UsersController.confirmToken');
  Route.post('forgotPassword', 'UsersController.forgotPassword');
  Route.post('resetPassword/:resetCode', 'UsersController.resetPassword');
  Route.post('recover', 'UsersController.recoverUser');
  Route.post(
    'confirmRecoverToken/:token',
    'UsersController.confirmRecoverToken'
  );
  Route.post('getUserFromRPT', 'UsersController.getUserFromRPT');
}).prefix('user');

//User - token needded
Route.group(() => {
  Route.get('logout', 'UsersController.loggout');
  Route.get('myData', 'UsersController.getMyData');
  Route.post('updatePassword', 'UsersController.updatePassword');
  Route.delete('', 'UsersController.delete');
  Route.patch('', 'UsersController.edit');
})
  .prefix('user')
  .middleware('auth:api');

//Family
Route.group(() => {
  Route.patch('', 'FamiliesController.edit');
  Route.post('inviteMember', 'FamiliesController.inviteMember');
  Route.get(
    'getPendingInvitations',
    'FamiliesController.getPendingInvitations'
  );
  Route.get('members', 'FamiliesController.getMembers');
  Route.get('pendingInvitations', 'FamiliesController.getPendingInvitations');
  Route.post('cancelInvitation', 'FamiliesController.cancelInvitation');
})
  .prefix('family')
  .middleware('auth:api');

Route.group(() => {
  Route.get(
    'getMemberInvitation/:token',
    'FamiliesController.getMemberInvitation'
  );
}).prefix('family');

//Account Category
Route.group(() => {
  Route.get('', 'AccountCategoriesController.getList');
  Route.get(':id', 'AccountCategoriesController.getSingle');
  Route.post('', 'AccountCategoriesController.create');
  Route.patch(':id', 'AccountCategoriesController.edit');
  Route.delete(':id', 'AccountCategoriesController.delete');
})
  .prefix('accountCategory')
  .middleware('auth:api');

//Posting group
Route.group(() => {
  Route.get('', 'PostingGroupsController.getList');
  Route.get(':id', 'PostingGroupsController.getSingle');
  Route.post('', 'PostingGroupsController.create');
  Route.patch(':id', 'PostingGroupsController.edit');
  Route.delete(':id', 'PostingGroupsController.delete');
})
  .prefix('postingGroup')
  .middleware('auth:api');

//Posting Category
Route.group(() => {
  Route.get('', 'PostingCategoriesController.getList');
  Route.get(':id', 'PostingCategoriesController.getSingle');
  Route.post('', 'PostingCategoriesController.create');
  Route.patch(':id', 'PostingCategoriesController.edit');
  Route.delete(':id', 'PostingCategoriesController.delete');
})
  .prefix('postingCategory')
  .middleware('auth:api');

//Account
Route.group(() => {
  Route.get('userAccounts', 'AccountsController.getUserAccounts');
  Route.get('familyAccounts', 'AccountsController.getFamilyAccounts');
  Route.get(':id', 'AccountsController.getSingle');
  Route.post('', 'AccountsController.create');
  Route.patch(':id', 'AccountsController.edit');
  Route.delete(':id', 'AccountsController.delete');
})
  .prefix('account')
  .middleware('auth:api');

//Posting
Route.group(() => {
  Route.get('', 'PostingsController.getList');
  Route.get(':id', 'PostingsController.getSingle');
  Route.post('create', 'PostingsController.create');
  Route.post('createMultiple', 'PostingsController.createMultiple');
  // Route.patch(':id/pay', 'PostingsController.pay');
  // Route.patch(':id/reversePayment', 'PostingsController.reversePayment');
  Route.get(':id/restore', 'PostingsController.restore');
  Route.patch(':id', 'PostingsController.edit');
  Route.delete(':id', 'PostingsController.delete');
}).prefix('posting');
