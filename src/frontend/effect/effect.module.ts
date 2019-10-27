import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from '../material';
import {EffectRoutingModule} from './effect-routing.module';
import {NgxsModule} from '@ngxs/store';
import {EffectListPageComponent } from './effect-list-page/effect-list-page.component';
import {VSTState} from '../../shared/vst/state/vst.state';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		EffectRoutingModule,
		NgxsModule.forFeature([VSTState])
	],
	declarations: [
		EffectListPageComponent
	]
})
export class EffectModule {}