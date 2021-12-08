import { Injectable, Injector } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CategoryService } from '../../categories/shared/category.service';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Entry } from './entry.model';
import { Category } from '../../categories/shared/category.model';

@Injectable({
  providedIn: 'root',
})
export class EntryService extends BaseResourceService<Entry> {
  constructor(
    protected injector: Injector,
    private categoryService: CategoryService
  ) {
    super('api/entries', injector, Entry.objectFromJson);
  }

  public create(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.create.bind(this));
  }

  public update(entry: Entry): Observable<Entry> {
    return this.setCategoryAndSendToServer(entry, super.update.bind(this));
  }

  private setCategoryAndSendToServer(
    entry: Entry,
    sendFn: any
  ): Observable<any> {
    return this.categoryService.getById(Number(entry.categoryId)).pipe(
      mergeMap((category: Category) => {
        entry.category = category;
        return sendFn(entry);
      }),
      catchError(this.handleError)
    );
  }
}
