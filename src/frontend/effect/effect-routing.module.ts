import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EffectListPageComponent} from './effect-list-page/effect-list-page.component';
import {EffectParamMappingPageComponent} from './effect-param-mapping-page/effect-param-mapping-page.component';

export const routes: Routes = [
	{
		path: '',
		component: EffectListPageComponent,
		data: {
			title: 'Effect manager'
		}
	},
	{
		path: 'param-mapping/:effectId',
		component: EffectParamMappingPageComponent,
		data: {
			title: 'Effect parameter mapping'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EffectRoutingModule {}