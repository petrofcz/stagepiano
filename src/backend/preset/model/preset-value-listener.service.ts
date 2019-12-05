import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {OscService} from '../../osc/osc.service';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {delay, distinctUntilChanged, filter, groupBy, map, mergeMap, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {from, Observable, of} from 'rxjs';
import {PresetSession} from '../../../shared/preset/model/presetSession';
import {BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {Layer} from '../../../shared/manual/model/layer';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {OscMessage} from '../../osc/osc.message';
import {
	PatchPresetForLayerAction,
	SetIgnoreParamsForSessionAction,
	SetPresetParameterValueForLayerAction
} from '../../../shared/preset/state/presetSession.actions';

@Injectable({
	providedIn: 'root'
})
export class PresetValueListenerService {
	constructor(store: Store, osc: OscService) {
		const data1$ = store.select(
			PresetSessionState.getSessionsByLayerId
		).pipe(distinctUntilChanged()).pipe(
			mergeMap((sessionsByLayerId): Observable<{layerId: string, vstId: string, layer: Layer, isDisabled: boolean}> => {
				const arr = [];
				//console.log('[PVL] Sessions', sessionsByLayerId);
				for (const layerId of  Object.keys(sessionsByLayerId)) {
					const session = sessionsByLayerId[layerId];
					arr.push({
						'layerId': layerId,
						'vstId': session.preset && session.preset.vstId ? session.preset.vstId : null,
						'isDisabled': session.isInitSnapshotLearning || session.isInitVstPresetLearning || session.ignoreParams,
						'layer': store.selectSnapshot(ManualState.getLayerById)(layerId)
					});
				}
				//console.log('[PVL] Sessions array', arr);
				return from(arr);
			})
		);
		//data1$.subscribe((val) => console.log('[PVL] Data 1', val));
		const groupedData1$ = data1$.pipe(groupBy(
			data => data.layerId
		));

		// OSC observe
		const data$ = groupedData1$.pipe(mergeMap(
			group2 => group2
				.pipe(distinctUntilChanged())
				.pipe(switchMap(
					(group): Observable<{ oscMessage: OscMessage, layerId: string}> =>
						group.isDisabled ? of() : osc.observeAny(BiduleOscHelper.getLocalVstPrefix(group.layer) + group.vstId + '/*')
					.pipe(map((oscMessage): { oscMessage: OscMessage, layerId: string} => {
						return { oscMessage: oscMessage, layerId: group.layerId };
					}))
				))
		));
		data$.subscribe(item => {
			const endpoint = item.oscMessage.path.split('/').pop();
			if (BiduleOscHelper.isNativeBiduleEndpoint(endpoint, true)) {
				return;
			}
			store.dispatch(
				new SetPresetParameterValueForLayerAction(item.layerId, endpoint, item.oscMessage.args)
			);
		});

		// Auto-return ignore params flag
		store.select(
			PresetSessionState.getSessionsByLayerId
		).pipe(
			mergeMap((sessionsByLayerId): Observable<{layerId: string, ignoreParams: boolean}> => {
				const arr = [];
				for (const layerId of  Object.keys(sessionsByLayerId)) {
					const session = sessionsByLayerId[layerId];
					arr.push({
						'layerId': layerId,
						'ignoreParams': session.ignoreParams,
					});
				}
				//console.log('[PVL2] Sessions array', arr);
				return from(arr);
			})
		)
		.pipe(groupBy(
			data => data.layerId
		)).pipe(
			mergeMap(
			group2 => group2
				.pipe(filter(g => g.ignoreParams === true))
				.pipe(switchMap((gg): Observable<string> => of(gg.layerId).pipe(delay(BiduleOscHelper.TIMEOUT_IGNORE_PARAMS_AFTER_PRESET_INIT))))
			)
		).subscribe(layerIdToCancelIgnore => {
			//console.log('[PVL2] Layer to ignore', layerIdToCancelIgnore);
			store.dispatch(
				new SetIgnoreParamsForSessionAction(layerIdToCancelIgnore, false)
			);
		});

	}
}