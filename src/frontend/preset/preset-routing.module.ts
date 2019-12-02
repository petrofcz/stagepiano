import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PresetListPageComponent} from './preset-list-page/preset-list-page.component';
import {PresetDetailPageComponent} from './preset-detail-page/preset-detail-page.component';

export const routes: Routes = [
	{
		path: '',
		component: PresetListPageComponent,
		data: {
			title: 'Sound presets'
		}
	},
	{
		path: 'detail',
		component: PresetDetailPageComponent,
		data: {
			title: 'Preset detail'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PresetRoutingModule {}