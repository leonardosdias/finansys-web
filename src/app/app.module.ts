import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDatabase } from './in-memory-database';
import { ToastrModule } from 'ngx-toastr';
import { EntriesModule } from './pages/entries/entries.module';
import { CategoriesModule } from './pages/categories/categories.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDatabase),
    HttpClientModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    CategoriesModule,
    EntriesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
