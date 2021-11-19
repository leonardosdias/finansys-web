import { Component, OnInit } from '@angular/core';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css'],
})
export class EntryListComponent implements OnInit {
  public entries: Entry[] = [];

  constructor(private entryService: EntryService) {}

  ngOnInit(): void {
    this.entryService.getAll().subscribe(
      (entries) => (this.entries = entries),
      (error) => alert('Erro ao carregar a lista')
    );
  }

  deleteEntry(entry: Entry) {
    const mustDelete = confirm('Deseja excluir esse item?');

    if (mustDelete) {
      this.entryService.delete(Number(entry.id)).subscribe(
        () =>
          (this.entries = this.entries.filter((element) => element !== entry)),
        () => alert('Erro ao tentar excluir.')
      );
    }
  }
}
