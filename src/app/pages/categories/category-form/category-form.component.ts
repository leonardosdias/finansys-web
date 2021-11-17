import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {
  public currentAction: string = '';
  public categoryForm: any;
  public pageTitle: string = '';
  public serverErrorMessages: string[] = [];
  public submittingForm: boolean = false;
  public category: Category = new Category();

  constructor(
    private toastr: ToastrService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      console.log(this.categoryForm);
      this.createCategory();
    } else {
      console.log(this.categoryForm);
      this.updateCategory();
    }
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null, Validators.required],
    });
  }

  private loadCategory() {
    if (this.currentAction === 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) =>
            this.categoryService.getById(Number(params.get('id')))
          )
        )
        .subscribe(
          (category) => {
            this.category = category;
            this.categoryForm?.patchValue(category);
          },
          (error) => alert('Erro na requisição.')
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de nova categoria';
    } else {
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando categoria: ${categoryName}`;
    }
  }

  private createCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.create(category).subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForErrors(error)
    );
  }

  private updateCategory() {
    const category: Category = Object.assign(
      new Category(),
      this.categoryForm.value
    );

    this.categoryService.update(category).subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForErrors(error)
    );
  }

  private actionsForSuccess(category: Category) {
    this.toastr.success('Solicitação processada com sucesso.');

    this.router
      .navigateByUrl('categories', { skipLocationChange: true })
      .then(() => this.router.navigate(['categories', category.id, 'edit']));
  }

  private actionsForErrors(error: any) {
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
}
