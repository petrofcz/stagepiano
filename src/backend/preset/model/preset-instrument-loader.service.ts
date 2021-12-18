import {Store} from '@ngxs/store';
import {OscService} from '../../osc/osc.service';
import {PresetSessionState} from '../../../shared/preset/state/presetSession.state';
import {debounceTime, delay, distinctUntilChanged, filter, groupBy, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {from, merge, Observable, of} from 'rxjs';
import {Preset} from '../../../shared/preset/model/model';
import {BiduleMode, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {ManualState} from '../../../shared/manual/state/manual.state';
import {Injectable} from '@angular/core';
import {VSTState} from '../../../shared/vst/state/vst.state';
import {LayoutState} from '../../../shared/layout/state/layout.state';
import {PresetInitStrategyHandlerService} from './preset-init-strategy-handler.service';
import {SetIgnoreParamsForSessionAction} from '../../../shared/preset/state/presetSession.actions';
import {OscMessage} from '../../osc/osc.message';

@Injectable({
	providedIn: 'root'
})
export class PresetInstrumentLoaderService {

	private muteModeTimeout = 3000;

	private processingModeTimeout = 200;

	private applyInitStrategyTimeout = 20;

	constructor(private store: Store, private osc: OscService, protected initStrategyHandler: PresetInitStrategyHandlerService) {
		this.init();
	}

	protected init() {
		// mute all instruments
		this.store.select(LayoutState.isLayoutLoaded)
			.pipe(debounceTime(100))
			.pipe(distinctUntilChanged())
			.subscribe(layoutLoaded => {
				if (layoutLoaded) {
					const layers = this.store.selectSnapshot(ManualState.getLayers);
					const instruments = this.store.selectSnapshot(VSTState.getInstruments);
					for (const layer of layers) {
						for (const instrument of instruments) {
							this.osc.send(
								BiduleOscHelper.buildLayerVstModeMessage(layer, instrument.id, BiduleMode.MUTE)
							);
						}
					}
				}
			});

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
								map(sessions => {
									return layerGroup.key in sessions ? sessions[layerGroup.key] : null;
									// return {
									// 	initStrategy: sessions[layerGroup.key].preset.initStrategy,
									// 	presetChangeTimestamp: sessions[layerGroup.key].presetChangeTimestamp,
									// 	paramValues:
									// };
								}),
								filter(arg => arg !== null && arg.preset !== null && arg.preset.vstId === instrumentGroup.key && arg.preset.vstId !== null),
								distinctUntilChanged((a, b) =>
									JSON.stringify(a.preset.initStrategy) === JSON.stringify(b.preset.initStrategy)
									&& a.presetChangeTimestamp === b.presetChangeTimestamp
								),
								tap((args) => {

									console.log('[PILS] PROCESS & MUTE Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
									const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
									this.osc.send(
										BiduleOscHelper.buildInstrumentMixerMuteMessage(
											layer,
											instrumentGroup.key,
											true
										)
									);
									this.osc.send(
										BiduleOscHelper.buildLayerVstModeMessage(
											layer,
											instrumentGroup.key,
											BiduleMode.PROCESSING   // BiduleMode.BYPASS
										)
									);
									this.store.dispatch(new SetIgnoreParamsForSessionAction(layer.id, true));
								}),
								delay(this.applyInitStrategyTimeout),
								tap((args) => {
									console.log('[PILS] INIT STRATEGY ' + instrumentGroup.key + ' for layer ' + layerGroup.key);

									console.log(args.preset.initStrategy);

									// apply init strategy
									const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
									this.initStrategyHandler.handle(args.preset.initStrategy, layer, instrumentGroup.key);

									// set effect params
									const effects = this.store.selectSnapshot(VSTState.getEffects);
									const layerPathPrefix = BiduleOscHelper.getLocalVstPrefix(layer);

									for (const effect of effects) {
										const values = {
											...(effect.snapshot || {}),
											...(Object.keys(args.preset.effectParamValues).indexOf(effect.id) > -1 ? args.preset.effectParamValues[effect.id] : {})
										};
										// send extra instrument params
										for (const endpoint of Object.keys(values)) {
											this.osc.send(new OscMessage(
												layerPathPrefix + effect.id + '/' + endpoint,
												values[endpoint]
											));
										}
									}
								}),
								delay(this.processingModeTimeout - this.applyInitStrategyTimeout),
								tap(args => {
									console.log('[PILS] UNMUTE Instrument ' + instrumentGroup.key + ' for layer ' + layerGroup.key)
									const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerGroup.key);
									const layerPathPrefix = BiduleOscHelper.getLocalVstPrefix(layer);

									// send extra instrument params
									for (const endpoint of Object.keys(args.preset.paramValues)) {
										this.osc.send(new OscMessage(
											layerPathPrefix + instrumentGroup.key + '/' + endpoint,
											args.preset.paramValues[endpoint]
										));
									}

									this.osc.send(
										BiduleOscHelper.buildInstrumentMixerMuteMessage(
											layer,
											instrumentGroup.key,
											false
										)
									);
								})
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
				debounceTime(20), // hackish
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