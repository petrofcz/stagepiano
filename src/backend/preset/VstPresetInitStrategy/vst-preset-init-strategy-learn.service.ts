import {Store} from '@ngxs/store';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {Preset, VstPresetInitStrategy} from '../../../shared/preset/model/model';
import {Layer} from '../../../shared/manual/model/layer';
import {combineLatest, of} from 'rxjs';
import {OscService} from '../../osc/osc.service';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {PatchCurrentPresetInitStrategyAction} from '../../../shared/preset/state/presetSession.actions';
import {OscMessage} from '../../osc/osc.message';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class VstPresetInitStrategyLearnService {
	constructor(protected store: Store, osc: OscService) {
		const data$ =
			combineLatest(
				this.store.select(PresetSessionState.isCurrentInitVstPresetLearning),
				this.store.select(PresetSessionState.getCurrentPreset),
				this.store.select(ManualState.getCurrentLayer)
			).pipe(map((data): {isLearning: boolean, preset: Preset|null, layer: Layer|null} => { return { isLearning: data[0], preset: data[1], layer: data[2]}; }));

			data$.pipe(switchMap(data => (!data.isLearning || !data.preset || !data.preset.vstId || !data.layer) ? of() :
				osc.observe(BiduleOscHelper.getLocalVstPrefix(data.layer) + data.preset.vstId + '/' + BiduleCommonEndpoint.PRESET_NUMBER)
			)).subscribe((oscMessage: OscMessage) => {
				this.store.dispatch(new PatchCurrentPresetInitStrategyAction(<Partial<VstPresetInitStrategy>>{
					preset: oscMessage.args[0]
				}));
			});

			data$.pipe(switchMap(data => (!data.isLearning || !data.preset || !data.preset.vstId || !data.layer) ? of() :
				osc.observe(BiduleOscHelper.getLocalVstPrefix(data.layer) + data.preset.vstId + '/' + BiduleCommonEndpoint.PRESET_NAME)
			)).subscribe((oscMessage: OscMessage) => {
				this.store.dispatch(new PatchCurrentPresetInitStrategyAction(<Partial<VstPresetInitStrategy>>{
					presetName: oscMessage.args[0]
				}));
			});
	}
}