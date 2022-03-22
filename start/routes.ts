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
}).prefix('user');

//User - token needded
Route.group(() => {
  Route.get('loggout', 'UsersController.loggout');
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
})
  .prefix('family')
  .middleware('auth:api');

//Account Category
Route.group(() => {
  Route.get('', 'AccountCategoriesController.getList');
  Route.get(':id', 'AccountCategoriesController.getSingle');
  Route.post('create', 'AccountCategoriesController.create');
  Route.patch(':id', 'AccountCategoriesController.edit');
  Route.delete(':id', 'AccountCategoriesController.delete');
})
  .prefix('accountCategory')
  .middleware('auth:api');

//Posting group
Route.group(() => {
  Route.get('', 'PostingGroupController.getList');
  Route.get(':id', 'PostingGroupController.getSingle');
  Route.post('create', 'PostingGroupController.create');
  Route.patch(':id', 'PostingGroupController.edit');
  Route.delete(':id', 'PostingGroupController.delete');
})
  .prefix('postingGroup')
  .middleware('auth:api');
