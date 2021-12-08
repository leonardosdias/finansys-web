import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

interface ITypeOptions {
  text: string;
  value: string;
}

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css'],
})
export class EntryFormComponent implements OnInit, AfterContentChecked {
  public currentAction: string = '';
  public entryForm: FormGroup;
  public pageTitle: string = '';
  public serverErrorMessages: string[] = [];
  public submittingForm: boolean = false;
  public entry: Entry = new Entry();
  public typeOptions: ITypeOptions[] = [];
  public categories: Category[] = [];

  public imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ',',
  };

  public ptBR = {
    firstDayOfWeek: 0,
    dayNames: [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    monthNamesShort: [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ],
    today: 'Hoje',
    clear: 'Limpar',
  };

  constructor(
    private toastr: ToastrService,
    private entryService: EntryService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.getTypeOptions();
    this.loadCategories();
  }

  ngAfterContentChecked() {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction === 'new') {
      this.createEntry();
    } else {
      this.updateEntry();
    }
  }

  getTypeOptions(): Array<ITypeOptions> {
    return (this.typeOptions = Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text,
          value,
        };
      }
    ));
  }

  private setCurrentAction() {
    if (this.route.snapshot.url[0].path === 'new') {
      this.currentAction = 'new';
    } else {
      this.currentAction = 'edit';
    }
  }

  buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null, Validators.required],
      type: ['expense', Validators.required],
      amount: [null, Validators.required],
      date: [null, Validators.required],
      paid: [true, Validators.required],
      categoryId: [null, Validators.required],
    });
  }

  private loadCategories() {
    this.categoryService
      .getAll()
      .subscribe((categories) => (this.categories = categories));
  }

  private loadEntry() {
    if (this.currentAction === 'edit') {
      this.route.paramMap
        .pipe(
          switchMap((params) =>
            this.entryService.getById(Number(params.get('id')))
          )
        )
        .subscribe(
          (entry) => {
            this.entry = entry;
            this.entryForm.patchValue(entry);
          },
          (error) => alert('Erro na requisição.')
        );
    }
  }

  private setPageTitle() {
    if (this.currentAction === 'new') {
      this.pageTitle = 'Cadastro de novo lançamento';
    } else {
      const entryName = this.entry.name || '';
      this.pageTitle = `Editando lançamento: ${entryName}`;
    }
  }

  private createEntry() {
    const entry: Entry = Entry.objectFromJson(this.entryForm.value);

    this.entryService.create(entry).subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForErrors(error)
    );
  }

  private updateEntry() {
    const entry: Entry = Entry.objectFromJson(this.entryForm.value);

    this.entryService.update(entry).subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForErrors(error)
    );
  }

  private actionsForSuccess(entry: Entry) {
    this.toastr.success('Solicitação processada com sucesso.');

    this.router
      .navigateByUrl('entries', { skipLocationChange: true })
      .then(() => this.router.navigate(['entries', entry.id, 'edit']));
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
