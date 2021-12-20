import { Directive, OnInit } from '@angular/core';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export class BaseResourceListComponent<TypeOfClass extends BaseResourceModel> implements OnInit {
    public resources: TypeOfClass[] = [];

    constructor(
        private resourceService: BaseResourceService<TypeOfClass>
    ) { }

    ngOnInit(): void {
        this.resourceService
            .getAll()
            .subscribe(
                (resources: any) => (
                    (this.resources = resources.sort((a: any, b: any) => b.id - a.id)),
                    (error: any) => alert('Erro ao carregar a lista')
                )
            );
    }

    deleteResource(resource: TypeOfClass) {
        const mustDelete = confirm('Deseja excluir esse item?');

        if (mustDelete) {
            this.resourceService.delete(Number(resource.id)).subscribe(
                () =>
                    (this.resources = this.resources.filter((element) => element !== resource)),
                () => alert('Erro ao tentar excluir esse registro.')
            );
        }
    }
}
