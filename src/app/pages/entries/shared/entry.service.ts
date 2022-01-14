import { Injectable, Injector } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { CategoryService } from '../../categories/shared/category.service';
import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Entry } from './entry.model';
import { Category } from '../../categories/shared/category.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})

export class EntryService extends BaseResourceService<Entry> {
  constructor(
    protected injector: Injector,
    private categoryService: CategoryService,
    protected toastr: ToastrService,
  ) {
    super('api/entries', injector, Entry.objectFromJson, toastr);
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

  public getByMonthAndYear(month: number, year: number): Observable<Entry[]> {
    return this.getAll().pipe(
      map(entries => this.filterByMonthAndYear(entries, month, year))
    );
  }

  public filterByMonthAndYear(entries: Entry[], month: number, year: number) {
    const filteredEntries = entries.filter(
      entry => new Date(String(entry?.date)).getMonth() + 1 == month && new Date(String(entry?.date)).getFullYear() == year
    );

    return filteredEntries;
  }
}
