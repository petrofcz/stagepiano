import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {PresetListPageComponent} from './preset-list-page/preset-list-page.component';

export const routes: Routes = [
	{
		path: '',
		component: PresetListPageComponent,
		data: {
			title: 'Sound presets'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class PresetRoutingModule {}