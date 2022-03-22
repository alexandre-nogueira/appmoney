//This service pourpose is to init some default data when a new family is created
//  - Some account default categories
//    - Bank account
//    - Credit card
//    - Savings
//    - Investments
//  - Some account posting categories
//    - Not classified
//    - groceries
//    - transportation
//    - etc...

import { Exception } from '@adonisjs/core/build/standalone';

export class InitalizationService {
  public async init(familyId: number) {
    throw new Exception('Not implemented', 500, 'E_NOT_IMPLEMENTED');
  }
}
