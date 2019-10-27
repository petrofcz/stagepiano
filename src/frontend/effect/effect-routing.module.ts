import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {EffectListPageComponent} from './effect-list-page/effect-list-page.component';

export const routes: Routes = [
	{
		path: '',
		component: EffectListPageComponent,
		data: {
			title: 'Effect manager'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EffectRoutingModule {}