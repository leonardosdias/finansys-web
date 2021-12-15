import { OnInit, AfterContentChecked, Injector, Directive, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

@Directive()
export abstract class BaseResourceFormComponent<TypeOfClass extends BaseResourceModel> implements OnInit, AfterContentChecked {
  public currentAction: string = '';
  public resourceForm: FormGroup;
  public pageTitle: string = '';
  public serverErrorMessages: string[] = [];
  public submittingForm: boolean = false;

  protected router: Router;
  protected route: ActivatedRoute;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: TypeOfClass,
    protected resourceService: BaseResourceService<TypeOfClass>,
    protected jsonDataToResourceFn: (jsonData: any) => TypeOfClass,
    protected toastr: ToastrService,
  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  protected loadResource() {
    if (this.currentAction === 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) =>
            this.resourceService.getById(Number(params.get('id')))
          )
        )
        .subscribe(
          (resource) => {
            this.resource = resource;
            this.resourceForm?.patchValue(resource);
          },
          (error) => this.toastr.error('Erro na requisição.')
        );
    }
  }

  protected setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = this.creationPageTitle();
    } else {
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return 'Novo';
  }

  protected editionPageTitle(): string {
    return 'Edição';
  }

  protected createResource() {
    const resource: TypeOfClass = this.jsonDataToResourceFn(
      this.resourceForm.value
    );

    this.resourceService.create(resource).subscribe(
      (resource) => this.actionsForSuccess(resource),
      (error) => this.actionsForErrors(error)
    );
  }

  protected updateResource() {
    const resource: TypeOfClass = this.jsonDataToResourceFn(
      this.resourceForm.value
    );

    this.resourceService.update(resource).subscribe(
      (resource) => this.actionsForSuccess(resource),
      (error) => this.actionsForErrors(error)
    );
  }

  protected actionsForSuccess(resource: TypeOfClass) {
    if (this.currentAction === 'new') {
      this.toastr.success('Registro criado com sucesso.');
    }
    if (this.currentAction === 'edit') {
      this.toastr.info('Registro editado com sucesso.');
    }

    const baseComponentPath: string | undefined =
      this.route.snapshot.parent?.url[0].path;

    this.router
      .navigateByUrl(baseComponentPath ? baseComponentPath : '', {
        skipLocationChange: true,
      })
      .then(() =>
        this.router.navigate([
          baseComponentPath ? baseComponentPath : '',
          resource.id,
          'edit',
        ])
      );
  }

  protected actionsForErrors(error: any) {
    this.toastr.error('Ocorreu um erro, tente novamente.');

    this.submittingForm = false;

    if (error.status === 422) {
      this.serverErrorMessages = JSON.parse(error._body).errors;
    } else {
      this.serverErrorMessages = [
        'Falha na comunicação com o servidor, por favor, tente mais tarde.',
      ];
    }
  }

  protected abstract buildResourceForm(): void;
}
