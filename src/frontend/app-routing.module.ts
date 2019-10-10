import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PageNotFoundComponent} from './shared/components';
import {NoLayoutGuard} from './layout/guards/no-layout.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	},
	{
		path: 'layouts',
		loadChildren: './layout/layout.module#LayoutModule',
		canActivate: [NoLayoutGuard],
	},
	{
		path: '**',
		component: PageNotFoundComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {useHash: true})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
