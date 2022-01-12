import { Directive, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export class BaseResourceListComponent<TypeOfClass extends BaseResourceModel> implements OnInit {
    public resources: TypeOfClass[] = [];

    constructor(
        protected resourceService: BaseResourceService<TypeOfClass>,
        protected toastr: ToastrService,
    ) { }

    ngOnInit(): void {
        this.resourceService
            .getAll()
            .subscribe(
                (resources: any) => (
                    (this.resources = resources.sort((a: any, b: any) => b.id - a.id)),
                    (error: any) => {
                        this.toastr.error('Erro ao carregar a lista')
                    }
                )
            );
    }

    deleteResource(resource: TypeOfClass) {
        const mustDelete = confirm('Deseja excluir esse item?');

        if (mustDelete) {
            this.resourceService.delete(Number(resource.id)).subscribe(
                () =>
                    (this.resources = this.resources.filter((element) => element !== resource)),
                () => this.toastr.error('Erro ao tentar excluir esse registro.')
            );
        }
    }
}
