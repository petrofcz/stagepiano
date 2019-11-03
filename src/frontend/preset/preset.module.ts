import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {NgxsModule} from '@ngxs/store';
import {PresetCategoryState} from '../../shared/preset/state/preset-category.state';
import {PresetRoutingModule} from './preset-routing.module';
import {PresetListPageComponent} from './preset-list-page/preset-list-page.component';
import {NamedEntityDialogComponent} from '../shared/dialogs/named/named-entity-dialog.component';
import {SharedModule} from '../shared/shared.module';
import {SessionState} from '../../shared/session/state/session.state';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		NgxsModule.forFeature([PresetCategoryState, SessionState]),
		PresetRoutingModule,
		SharedModule
	],
	declarations: [
		PresetListPageComponent
	],
	entryComponents: [
		NamedEntityDialogComponent
	]
})
export class PresetModule {}