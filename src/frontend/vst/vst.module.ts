import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {NgxsModule} from '@ngxs/store';
import {VSTState} from '../../shared/vst/state/vst.state';
import {AvailabilityComponent} from './availability/availability.component';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		NgxsModule.forFeature([VSTState]),
	],
	declarations: [
		AvailabilityComponent
	]
})
export class VstModule {}