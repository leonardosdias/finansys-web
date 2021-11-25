import { BaseResourceModel } from '../models/base-resource.model';

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Injector } from '@angular/core';

export abstract class BaseResourceService<
  TypeOfClass extends BaseResourceModel
> {
  protected http: HttpClient;

  constructor(protected apiPath: string, protected injector: Injector) {
    this.http = injector.get(HttpClient);
  }

  public getAll(): Observable<TypeOfClass[]> {
    return this.http
      .get(this.apiPath)
      .pipe(catchError(this.handleError), map(this.jsonDataToResources));
  }

  public getById(id: number): Observable<TypeOfClass> {
    const url = `${this.apiPath}/${id}`;

    return this.http
      .get(url)
      .pipe(catchError(this.handleError), map(this.jsonDataToResource));
  }

  public create(resource: TypeOfClass): Observable<TypeOfClass> {
    return this.http
      .post(this.apiPath, resource)
      .pipe(catchError(this.handleError), map(this.jsonDataToResource));
  }

  public update(resource: TypeOfClass): Observable<TypeOfClass> {
    const url = `${this.apiPath}/${resource.id}`;

    return this.http.put(url, resource).pipe(
      catchError(this.handleError),
      map(() => resource)
    );
  }

  public delete(id: number): Observable<any> {
    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  protected jsonDataToResources(jsonData: any[]): TypeOfClass[] {
    const resources: TypeOfClass[] = [];
    jsonData.forEach((element) => resources.push(element as TypeOfClass));
    return resources;
  }

  protected jsonDataToResource(jsonData: any): TypeOfClass {
    return jsonData as TypeOfClass;
  }

  protected handleError(error: any): Observable<any> {
    console.log('Erro na requisição =>', error);
    return throwError(error);
  }
}
