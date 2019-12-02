import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {InstrumentListPageComponent} from './instrument-list-page/instrument-list-page.component';
import {InstrumentParamMappingPageComponent} from './instrument-param-mapping-page/instrument-param-mapping-page.component';

export const routes: Routes = [
	{
		path: '',
		component: InstrumentListPageComponent,
		data: {
			title: 'Instrument manager'
		}
	},
	{
		path: 'param-mapping/:instrumentId',
		component: InstrumentParamMappingPageComponent,
		data: {
			title: 'Instrument parameter mapping'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class InstrumentRoutingModule {}