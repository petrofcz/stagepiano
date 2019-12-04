import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {OscService} from '../../osc/osc.service';
import {combineLatest, of} from 'rxjs';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {bufferTime, delay, map, startWith, switchMap, take} from 'rxjs/operators';
import {Preset, SnapshotPresetInitStrategy, VstPresetInitStrategy} from '../../../shared/preset/model/model';
import {Layer} from '../../../shared/manual/model/layer';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {OscMessage} from '../../osc/osc.message';
import {PatchCurrentPresetInitStrategyAction, SetInitSnapshotLearningAction} from '../../../shared/preset/state/presetSession.actions';

@Injectable({
	providedIn: 'root'
})
export class SnapshotInitStrategyLearnService {
	constructor(protected store: Store, osc: OscService) {
		const data$ =
			combineLatest(
				this.store.select(PresetSessionState.isCurrentInitSnapshotLearning),
				this.store.select(PresetSessionState.getCurrentPreset),
				this.store.select(ManualState.getCurrentLayer)
			).pipe(map((data): {isLearning: boolean, preset: Preset|null, layer: Layer|null} => { return { isLearning: data[0], preset: data[1], layer: data[2]}; }));

		data$.pipe(switchMap(data => (!data.isLearning || !data.preset || !data.preset.vstId || !data.layer) ? of() :
			osc.observe(BiduleOscHelper.getLocalVstPrefix(data.layer) + data.preset.vstId + '/*')
				.pipe(startWith(null))
				.pipe(bufferTime(BiduleOscHelper.TIMEOUT_YIELD_PARAMS_LEARN))
				.pipe(take(1))
		))
			.subscribe((messages: OscMessage[]) => {
				this.store.dispatch(
					new SetInitSnapshotLearningAction(false)
				);

				if (messages.length === 1) {
					// todo display error about 'Send to osc servers' is not set up correctly
					console.log('Send to osc server missing');
				} else {
					let pathParts = null;
					const paramValueMap = { };
					messages.forEach(message => {
						if (message === null) {
							return;
						}
						pathParts = message.path.split('/');
						const endpoint = pathParts.pop();
						if (!BiduleOscHelper.isNativeBiduleEndpoint(endpoint, true)) {
							paramValueMap[endpoint] = message.args;
						}
					});
					console.log('[LEARN]', paramValueMap);
					if (pathParts !== null) {
						this.store.dispatch(new PatchCurrentPresetInitStrategyAction(<Partial<SnapshotPresetInitStrategy>>{
							paramValues: paramValueMap
						}));
					} else {
						this.store.dispatch(new PatchCurrentPresetInitStrategyAction(<Partial<SnapshotPresetInitStrategy>>{
							paramValues: null
						}));
					}
				}
			});

		data$.pipe(delay(50)).subscribe(data => {
			if (!data.isLearning || !data.preset || !data.preset.vstId || !data.layer) {
				return;
			}
			osc.send(
				new OscMessage(BiduleOscHelper.getLocalVstPrefix(data.layer) + data.preset.vstId + '/' + BiduleCommonEndpoint.YIELD_PARAMETERS, [1])
			);
		});
	}
}