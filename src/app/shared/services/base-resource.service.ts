import { BaseResourceModel } from '../models/base-resource.model';

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injector } from '@angular/core';

export abstract class BaseResourceService<
  TypeOfClass extends BaseResourceModel
> {
  protected http: HttpClient;

  constructor(
    protected apiPath: string,
    protected injector: Injector,
    protected jsonDataToResourceFn: (jsonData: any) => TypeOfClass
  ) {
    this.http = injector.get(HttpClient);
  }

  public getAll(): Observable<TypeOfClass[]> {
    return this.http
      .get(this.apiPath)
      .pipe(
        catchError(this.handleError),
        map(this.jsonDataToResources.bind(this))
      );
  }

  public getById(id: number): Observable<TypeOfClass> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url)
      .pipe(
        map(this.jsonDataToResource.bind(this)),
        catchError(this.handleError)
      );
  }

  public create(resource: TypeOfClass): Observable<TypeOfClass> {
    return this.http
      .post(this.apiPath, resource)
      .pipe(
        map(this.jsonDataToResource.bind(this)),
        catchError(this.handleError)
      );
  }

  public update(resource: TypeOfClass): Observable<TypeOfClass> {
    const url = `${this.apiPath}/${resource.id}`;

    return this.http.put(url, resource).pipe(
      map(() => resource),
      catchError(this.handleError)
    );
  }

  public delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      map(() => null),
      catchError(this.handleError)
    );
  }

  protected jsonDataToResources(jsonData: any[]): TypeOfClass[] {
    const resources: TypeOfClass[] = [];
    jsonData.forEach((element) =>
      resources.push(this.jsonDataToResourceFn(element))
    );
    return resources;
  }

  protected jsonDataToResource(jsonData: any): TypeOfClass {
    return this.jsonDataToResourceFn(jsonData);
  }

  protected handleError(error: any): Observable<any> {
    console.log('Erro na requisição =>', error);
    return throwError(error);
  }
}
