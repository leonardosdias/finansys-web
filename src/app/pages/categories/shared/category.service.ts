import { Injectable, Injector } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';

import { Category } from './category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseResourceService<Category> {
  constructor(
    protected injector: Injector,
    protected toastr: ToastrService,
    ) {
    super('api/categories', injector, Category.objectFromJson, toastr);
  }
}
