import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ListLogsComponent} from './list-logs/list-logs.component';
import {HomeComponent} from './home/home.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'logs', component: ListLogsComponent},
  {path: '**', redirectTo: ''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
