import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {NgxsModule} from '@ngxs/store';
import {ParamMappingPageState} from '../../shared/paramMapping/state/paramMappingPage.state';
import {ParamMappingPageComponent} from './paramMappingPage/paramMappingPage.component';
import {NamedEntityDialogComponent} from '../shared/dialogs/named/named-entity-dialog.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		SharedModule,
		NgxsModule.forFeature([ParamMappingPageState]),
	],
	exports: [
		ParamMappingPageComponent
	],
	declarations: [
		ParamMappingPageComponent
	],
	entryComponents: [
		NamedEntityDialogComponent
	]
})
export class ParamMappingModule {}