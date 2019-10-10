import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LayoutListPageComponent} from './layout-list-page/layout-list-page.component';
import {EditLayoutPageComponent} from './edit-layout-page/edit-layout-page.component';

export const routes: Routes = [
	{
		path: 'edit/:id',
		component: EditLayoutPageComponent,
		data: {
			title: 'Edit layout'
		}
	},
	{
		path: 'edit',
		component: EditLayoutPageComponent,
		data: {
			title: 'Add new layout'
		}
	},
	{
		path: '',
		component: LayoutListPageComponent,
		data: {
			title: 'Layout manager'
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class LayoutRoutingModule {}