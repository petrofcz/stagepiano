import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {InstrumentListPageComponent} from './instrument-list-page/instrument-list-page.component';

export const routes: Routes = [
	{
		path: '',
		component: InstrumentListPageComponent,
		data: {
			title: 'Instrument manager'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class InstrumentRoutingModule {}