import { BaseResourceModel } from 'src/app/shared/models/base-resource.model';

export class Category extends BaseResourceModel {
  constructor(
    public id?: number | undefined,
    public name?: string,
    public description?: string
  ) {
    super();
  }

  static objectFromJson(jsonData: any): Category {
    return Object.assign(new Category(), jsonData);
  }
}
