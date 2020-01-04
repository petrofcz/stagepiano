import {MortalInterface} from '../../../model/mortalInterface';
import {Injectable} from '@angular/core';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';
import {StaticKnobMoveEvent, StaticKnobsDriver} from '../../../hw/staticKnobs/StaticKnobsDriver';
import {Store} from '@ngxs/store';
import {from, of, Subscription} from 'rxjs';
import {OscService} from '../../../../osc/osc.service';
import {BiduleOscHelper} from '../../../../../shared/bidule/osc/bidule-osc-helper';
import {OscMessage} from '../../../../osc/osc.message';
import {distinctUntilChanged, filter, map, mergeMap, switchMap, tap} from 'rxjs/operators';
import {SessionState} from '../../../../../shared/session/state/session.state';
import {ManualState} from '../../../../../shared/manual/state/manual.state';
import {PresetSessionState} from '../../../../../shared/preset/state/presetSession.state';
import {InterruptionClock} from '../../../model/interruptionClock';
import {SelectPresetAction} from '../../../../../shared/preset/state/presetSession.actions';

@Injectable({
	providedIn: 'root'
})
export class MixerController implements MortalInterface {

	protected static readonly ROW_NAMES = 1;
	protected static readonly ROW_VALUES = 2;

	protected subscriptions: Subscription[] = [];

	public constructor(protected displayRegionDriver: DisplayRegionDriver, protected staticKnobsDriver: StaticKnobsDriver, protected store: Store, protected osc: OscService, protected intClock: InterruptionClock) {

	}

	onDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
		this.displayRegionDriver.display.clearDisplay();
		this.displayRegionDriver.buttonMatrix.buttons.turnOffAllLeds();
		this.displayRegionDriver.buttonMatrix.buttons.disableAllButtons();
	}

	onInit(): void {
		this.displayRegionDriver.display.clearDisplay(false);
		this.displayRegionDriver.buttonMatrix.buttons.turnOffAllLeds();
		this.displayRegionDriver.buttonMatrix.buttons.disableAllButtons();
		for (let i = 1; i <= 8; i++) {
			this.displayRegionDriver.knobs.setKnobValue(i, 0);
		}

		// setup manual elements
		this.getManualKnobPositions().forEach((knobPosition: number) => {
			console.log('[MIX] OBSERVE ', BiduleOscHelper.getManualMixerVolumeItem(knobPosition));
			// listen for OSC values
			// yield parameters already done in layout-opener.service
			this.subscriptions.push(
				this.osc.observeEndpointValue(BiduleOscHelper.getManualMixerVolumeItem(knobPosition))
					.pipe(distinctUntilChanged())
					.subscribe((oscMessage) => {
						console.log('[MIX] OSC', oscMessage);
						this.displayRegionDriver.display.setCellContent(
							MixerController.ROW_VALUES,
							knobPosition,
							Math.round(oscMessage.args[0] * 100).toString()
						);
				})
			);

			// listen for knob movements
			this.subscriptions.push(
				this.staticKnobsDriver.onKnobRotated
					.pipe(filter((knobEvent: StaticKnobMoveEvent) => knobEvent.knobId === knobPosition))
					.pipe(distinctUntilChanged())
					.subscribe((event: StaticKnobMoveEvent) => {
					this.osc.send(
						new OscMessage(
							BiduleOscHelper.getManualMixerVolumeItem(((event.knobId - 1) % 4) + 1),
							[event.value / 127]
						)
					);
				})
			);

			// Set names row
			this.displayRegionDriver.display.setCellContent(
				MixerController.ROW_NAMES,
				knobPosition,
				'Man ' + (this.getManualKnobPositions().indexOf(knobPosition) + 1).toString()
			);
		});

		// setup layer elements
		this.getLayerKnobPositions().forEach((knobPosition: number) => {
			// listen for OSC values
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id;}),
						switchMap(
					manual => this.osc.observeEndpointValue(BiduleOscHelper.getLayerMixerVolumeItem(((knobPosition - 1) % 4) + 1, manual.id))
								.pipe(
									tap(oscMessage => {
										this.displayRegionDriver.display.setCellContent(
											MixerController.ROW_VALUES,
											knobPosition,
											Math.round(oscMessage.args[0] * 100).toString()
										);
									})
								)
						)
					).subscribe(() => {})
			);

			// listen for knob movements
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id;}),
						switchMap(
							manual => this.staticKnobsDriver.onKnobRotated
								.pipe(filter((knobEvent: StaticKnobMoveEvent) => knobEvent.knobId === knobPosition))
								.pipe(distinctUntilChanged())
								.pipe(tap((knobEvent: StaticKnobMoveEvent) => {
									this.osc.send(
										new OscMessage(
											BiduleOscHelper.getLayerMixerVolumeItem(((knobPosition - 1) % 4) + 1, manual.id),
											[knobEvent.value / 127]
										)
									);
								}))
						)
					)
					.subscribe(() => {})
			);

			// yield parameters for layer mixer
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id;}),
						tap(
							manual => {
								this.osc.send(new OscMessage('/Manual' + manual.position + '/LayerMixer/parameters_osc_update', []));
							}
						)
					).subscribe(() => {})
			);

			// display names
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id;}),
						tap(
							manual => {
								this.displayRegionDriver.display.setCellContent(
									MixerController.ROW_NAMES,
									knobPosition,
									'Layer ' + (((knobPosition - 1) % 4) + 1)
								);
							}
						)
				).subscribe(() => {})
			);

			// current manual and layer
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id; }),
						tap(manual => {
							this.getManualKnobPositions().forEach(buttonPosition => {
								this.displayRegionDriver.buttonMatrix.buttons.setLed(
									this.displayRegionDriver.buttonMatrix.getButtonId(
										this.getManualKnobPositions()[buttonPosition - 1],
										MixerController.ROW_VALUES
									),
									false
								);
							});
							this.displayRegionDriver.buttonMatrix.buttons.setLed(
								this.displayRegionDriver.buttonMatrix.getButtonId(
									this.getManualKnobPositions()[manual.position - 1],
									MixerController.ROW_VALUES
								),
							true
							);
						})
					)
					.subscribe(() => {})
			);
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentLayer)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id; }),
						tap(layer => {
							this.getLayerKnobPositions().forEach(buttonPosition => {
								this.displayRegionDriver.buttonMatrix.buttons.setLed(
									this.displayRegionDriver.buttonMatrix.getButtonId(
										this.getLayerKnobPositions()[buttonPosition - 1],
										MixerController.ROW_VALUES
									),
									false
								);
							});
							this.displayRegionDriver.buttonMatrix.buttons.setLed(
								this.displayRegionDriver.buttonMatrix.getButtonId(
									this.getLayerKnobPositions()[layer.position - 1],
									MixerController.ROW_VALUES
								),
								true
							);
						})
					)
					.subscribe(() => {})
			);

			// reset preset
			const knobIndex = this.getLayerKnobPositions().indexOf(knobPosition);
			this.subscriptions.push(
				this.store.select(ManualState.getCurrentManual)
					.pipe(
						distinctUntilChanged((a, b) => { return a.id === b.id; }),
						map(manual => manual.layerIds.length > knobIndex ? manual.layerIds[knobIndex] : null),
						switchMap(
							layerId => !layerId ? of(null) : this.store.select(PresetSessionState.getSessionsByLayerId)
								.pipe(map(sessions => layerId in sessions ? sessions[layerId] : null))
								.pipe(tap(session => {
									const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerId);
									this.displayRegionDriver.buttonMatrix.buttons.setButtonEnabled(
										this.displayRegionDriver.buttonMatrix.getButtonId(
											this.getLayerKnobPositions()[layer.position - 1],
											MixerController.ROW_NAMES
										),
										session && session.preset !== null
									);
								}))
								.pipe(switchMap(session => {
									return (session === null || session.preset === null) ? of(1).pipe(tap(() => {
										const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerId);
										this.displayRegionDriver.buttonMatrix.buttons.setLed(
											this.displayRegionDriver.buttonMatrix.getButtonId(
												this.getLayerKnobPositions()[layer.position - 1],
												MixerController.ROW_NAMES
											),
											false
										);
									})) : this.intClock.fast.pipe(tap(val => {
										const layer = this.store.selectSnapshot(ManualState.getLayerById)(layerId);
										this.displayRegionDriver.buttonMatrix.buttons.setLed(
											this.displayRegionDriver.buttonMatrix.getButtonId(
												this.getLayerKnobPositions()[layer.position - 1],
												MixerController.ROW_NAMES
											),
											val
										);
									}));
								}))
						)
					)
					.subscribe(() => {})
			);

			this.subscriptions.push(
				this.displayRegionDriver.buttonMatrix.onButtonClick
					.pipe(filter(clickEvent => clickEvent.row === MixerController.ROW_NAMES && clickEvent.col === knobPosition))
					.subscribe(() => {
						const currentManual = this.store.selectSnapshot(ManualState.getCurrentManual);
						if (!currentManual) {
							return;
						}
						const layerId = currentManual.layerIds[knobIndex];
						this.store.dispatch(
							new SelectPresetAction(null, null, layerId)
						);
					})
			);

		});
	}

	protected getManualKnobPositions() {
		return [1, 2, 3, 4];
	}

	protected getLayerKnobPositions() {
		return [5, 6, 7, 8];
	}

}