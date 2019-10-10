import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {LayoutRoutingModule} from './layout-routing.module';
import {NgxsModule} from '@ngxs/store';
import {LayoutState} from '../../shared/layout/state/layout.state';
import { LayoutListPageComponent } from './layout-list-page/layout-list-page.component';
import { EditLayoutPageComponent } from './edit-layout-page/edit-layout-page.component';
import {LayoutGuard} from './guards/layout.guard';
import {NoLayoutGuard} from './guards/no-layout.guard';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		LayoutRoutingModule,
		NgxsModule.forFeature([LayoutState]),
		ReactiveFormsModule
	],
	declarations: [
		LayoutListPageComponent,
		EditLayoutPageComponent
	],
	providers: [
		LayoutGuard, NoLayoutGuard
	]
})
export class LayoutModule {}