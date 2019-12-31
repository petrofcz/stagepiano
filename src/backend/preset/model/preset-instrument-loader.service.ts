import {Store} from '@ngxs/store';
import {OscService} from '../../osc/osc.service';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {debounceTime, delay, distinctUntilChanged, filter, groupBy, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {from, merge, Observable, of} from 'rxjs';
import {Preset} from '../../../shared/preset/model/model';
import {BiduleCommonEndpoint, BiduleMode, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {OscMessage} from '../../osc/osc.message';
import {Injectable} from '@angular/core';
import {VSTState} from '../../../shared/vst/state/vst.state';

@Injectable({
	providedIn: 'root'
})
export class PresetInstrumentLoaderService {

	private muteModeTimeout = 3000;

	private processingModeTimeout = 200;

	private applyInitStrategyTimeout = 20;

	constructor(private store: Store, private osc: OscService) {
		this.init();
	}

	protected init() {
		// todo set mode for all instruments to mute

		const preparedData$: Observable<{layerId: string, activePreset: Preset|null, activeInstrumentId: string|null}> = this.store.select(PresetSessionState.getSessionsByLayerId).pipe(switchMap(sessionsByLayerId => {
			const output = [];
			for (const layerId in sessionsByLayerId) {
				output.push({
					layerId: layerId,
					activePreset: sessionsByLayerId[layerId].preset,
					activeInstrumentId: sessionsByLayerId[layerId].preset ? sessionsByLayerId[layerId].preset.vstId : null
				});
			}
			return from(output);
		}));

		preparedData$.pipe(tap(d => console.log('[PILS] Prepared data', d)));

		// Instrument mode handling && init strategy processing
		preparedData$.pipe(
			groupBy(data => data.layerId),
			mergeMap(layerGroup => layerGroup.pipe(
				map(data => data.activeInstrumentId),
				distinctUntilChanged(),
				tap(d => console.log('[PILS] Active instrument ' + d + ' for layer ' + layerGroup.key)),
				groupBy(data => data),
				mergeMap(instrumentGroup =>
					merge(
						instrumentGroup.pipe(
							map(() => true)
						),
						layerGroup.pipe(
							map(data => data.activeInstrumentId === instrumentGroup.key),
							debounceTime(this.muteModeTimeout)
						)
					)
					.pipe(
						distinctUntilChanged(),
						tap(d => console.log('[PILS] Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key + ' is ' + (d ? 'ON' : 'OFF'))),
						switchMap(active => !active ? of(1).pipe(tap(() => {
								console.log('[PILS] MUTE Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
								// instrument is not active any more
								const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
								this.osc.send(
									BiduleOscHelper.buildLayerVstModeMessage(
										layer,
										instrumentGroup.key,
										BiduleMode.MUTE
									)
								);
							})) : this.store.select(PresetSessionState.getSessionsByLayerId).pipe(
								map(sessions => sessions[layerGroup.key].preset.initStrategy),
								distinctUntilChanged(),
								switchMap(
									initStrategy => of(1).pipe(
										filter(() => {
											const preset = this.store.selectSnapshot(PresetSessionState.getSessionsByLayerId)[layerGroup.key].preset;
											return preset && preset.vstId === instrumentGroup.key;
										}),
										tap(() => {
											console.log('[PILS] BYPASS Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
											const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
											this.osc.send(
												BiduleOscHelper.buildLayerVstModeMessage(
													layer,
													instrumentGroup.key,
													BiduleMode.BYPASS
												)
											);
										}),
										delay(this.applyInitStrategyTimeout),
										tap(() => {
											console.log('[PILS] INIT STRATEGY ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
										}),
										delay(this.processingModeTimeout - this.applyInitStrategyTimeout),
										tap(() => {
											console.log('[PILS] PROCESSING Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
											const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
											this.osc.send(
												BiduleOscHelper.buildLayerVstModeMessage(
													layer,
													instrumentGroup.key,
													BiduleMode.PROCESSING
												)
											);
										})
									)
								)
							)
						)
					)
				)
			))
		).subscribe(() => {});

		// MidiMatrix handling
		preparedData$.pipe(
			groupBy(data => data.layerId),
			mergeMap(layerGroup => layerGroup.pipe(
				map(data => data.activeInstrumentId),
				distinctUntilChanged(),
				tap(activeInstrumentId => {
					console.log('[PILS] For layer ' + layerGroup.key + ' and instrument ' + activeInstrumentId + ' set midi output');
					if (!activeInstrumentId) {
						return;
					}
					const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
					const message = BiduleOscHelper.buildLayerMidiSwitcherItemMessage(layer, activeInstrumentId);
					console.log('THE MESSAGE', message);
					if (message) {
						this.osc.send(message);
					}
				})
			))
		).subscribe(() => {});
	}

}