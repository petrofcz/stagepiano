import {NgModule} from '@angular/core';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';
import {PageNotFoundComponent} from './shared/components';
import {NoLayoutGuard} from './layout/guards/no-layout.guard';
import {LayoutGuard} from './layout/guards/layout.guard';

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
		path: 'instruments',
		loadChildren: './instrument/instrument.module#InstrumentModule',
		canActivate: [LayoutGuard],
	},	
	{
		path: 'effects',
		loadChildren: './effect/effect.module#EffectModule',
		canActivate: [LayoutGuard],
	},
	{
		path: '**',
		component: PageNotFoundComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {useHash: true, preloadingStrategy: PreloadAllModules})
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
