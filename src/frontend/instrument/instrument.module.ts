import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {InstrumentRoutingModule} from './instrument-routing.module';
import {NgxsModule} from '@ngxs/store';
import { InstrumentListPageComponent } from './instrument-list-page/instrument-list-page.component';
import {VSTState} from '../../shared/vst/state/vst.state';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		InstrumentRoutingModule,
		NgxsModule.forFeature([VSTState])
	],
	declarations: [
		InstrumentListPageComponent
	]
})
export class InstrumentModule {}