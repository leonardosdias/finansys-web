import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

import { Entry } from '../../entries/shared/entry.model';
import { EntryService } from '../../entries/shared/entry.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})

export class ReportsComponent implements OnInit {
  public expenseTotal: any = 0;
  public revenueTotal: any = 0;
  public balance: any = 0;

  public expenseChartData: any;
  public revenueChartData: any;

  chartOptions = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  };

  categories: Category[] = [];
  entries: Entry[] = [];

  @ViewChild('month') month: ElementRef;
  @ViewChild('year') year: ElementRef;

  constructor(
    private categoryService: CategoryService,
    private entryService: EntryService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(categories => this.categories = categories);
  }

  generateReports() {
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;

    if (!month || !year) {
      this.toastr.warning('Você precisa selecionar o Mês e o Ano para gerar os relatórios.');
    } else {
      this.entryService.getByMonthAndYear(month, year).subscribe(entry => {
        if (!entry.length) {
          this.toastr.warning('Sem registros para esse período.');
          return;
        }
        this.setValues(entry);
      });
    }
  }

  private setValues(entries: Entry[]) {
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance() {
    this.entries.map(entry => {
      if (entry.type === 'revenue') {
        this.revenueTotal += Number(entry.amount);
      } else {
        this.expenseTotal += Number(entry.amount);
      }

      this.balance = this.revenueTotal - this.expenseTotal;
    })
  }

  private setChartData() {
    this.revenueChartData = this.getCharData('revenue', 'Gráfico de Receitas', '#9CCC65');
    this.expenseChartData = this.getCharData('expense', 'Gráfico de Despesas', '#e03131');
  }

  private getCharData(entryType: string, title: string, color: string) {
    let chartData: any = [];

    this.categories.map(category => {
      const filteredEntries = this.entries.filter(
        entry => entry.categoryId === category.id && entry.type === entryType
      );

      if (filteredEntries.length) {
        const totalAmount = filteredEntries.reduce(
          (total, entry) => total + Number(entry.amount), 0
        );

        chartData.push({
          categoryName: category.name,
          totalAmount,
        });
      }
    });

    return {
      labels: chartData.map((item: any) => item.categoryName),
      datasets: [{
        label: title,
        backgroundColor: color,
        data: chartData.map((item: any) => item.totalAmount)
      }]
    };
  }

}
