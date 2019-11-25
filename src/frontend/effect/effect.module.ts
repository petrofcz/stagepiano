import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {EffectRoutingModule} from './effect-routing.module';
import {NgxsModule} from '@ngxs/store';
import {EffectListPageComponent } from './effect-list-page/effect-list-page.component';
import {VSTState} from '../../shared/vst/state/vst.state';
import {EffectPlacementPipe} from './ui/effect-placement-pipe';
import {AvailabilityComponent} from '../vst/availability/availability.component';
import {VstModule} from '../vst/vst.module';
import {EffectParamMappingPageComponent} from './effect-param-mapping-page/effect-param-mapping-page.component';
import {ParamMappingModule} from '../paramMapping/paramMapping.module';
import {SharedModule} from '../shared/shared.module';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		EffectRoutingModule,
		VstModule,
		ParamMappingModule,
		SharedModule,
		NgxsModule.forFeature([VSTState])
	],
	declarations: [
		EffectListPageComponent,
		EffectParamMappingPageComponent,
		EffectPlacementPipe
	],
	entryComponents: [
		AvailabilityComponent
	]
})
export class EffectModule {}