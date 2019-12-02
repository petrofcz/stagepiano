import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {InstrumentRoutingModule} from './instrument-routing.module';
import {NgxsModule} from '@ngxs/store';
import { InstrumentListPageComponent } from './instrument-list-page/instrument-list-page.component';
import {VSTState} from '../../shared/vst/state/vst.state';
import {VstModule} from '../vst/vst.module';
import {AvailabilityComponent} from '../vst/availability/availability.component';
import {SharedModule} from '../shared/shared.module';
import {InstrumentParamMappingPageComponent} from './instrument-param-mapping-page/instrument-param-mapping-page.component';
import {ParamMappingModule} from '../paramMapping/paramMapping.module';
import {NamedEntityDialogComponent} from '../shared/dialogs/named/named-entity-dialog.component';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		InstrumentRoutingModule,
		VstModule,
		SharedModule,
		ParamMappingModule,
		NgxsModule.forFeature([VSTState])
	],
	declarations: [
		InstrumentListPageComponent,
		InstrumentParamMappingPageComponent
	],
	entryComponents: [
		AvailabilityComponent,
		NamedEntityDialogComponent
	]
})
export class InstrumentModule {}