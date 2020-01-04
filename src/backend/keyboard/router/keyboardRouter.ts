import {LayerController} from '../controller/global/navigation/layerController';
import {Injectable} from '@angular/core';
import {PresetController} from '../controller/stageMode/presetController';
import {MortalInterface} from '../model/mortalInterface';
import {EmptyController} from '../controller/global/display/emptyController';
import {Store} from '@ngxs/store';
import {SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {DisplayModeController} from '../controller/global/navigation/displayModeController';
import {SessionState} from '../../../shared/session/state/session.state';
import {KeyboardRoutes} from './keyboardRoutes';
import {EffectOverviewController} from '../controller/global/display/effectOverviewController';
import {EffectDetailController} from '../controller/global/display/effectDetailController';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, tap} from 'rxjs/operators';
import {InstrumentDetailController} from '../controller/stageMode/instrumentDetailController';
import {MixerController} from '../controller/global/display/mixer-controller.service';
import {StaticKnobsDriver} from '../hw/staticKnobs/StaticKnobsDriver';
import {merge, of} from 'rxjs';
import {LayoutState} from '../../../shared/layout/state/layout.state';

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	protected static readonly MIXER_HIDE_TIMEOUT = 2000;
	protected static readonly MIXER_LOAD_TIMEOUT = 300;

	protected currentDisplayController: MortalInterface|null = null;

	protected isInMixerMode = false;


	// tslint:disable-next-line:max-line-length
	constructor(protected store: Store,
				protected layerController: LayerController, protected displayModeController: DisplayModeController,
				protected presetController: PresetController, protected instrumentDetailController: InstrumentDetailController,
				protected effectOverviewController: EffectOverviewController, protected effectDetailController: EffectDetailController,
				protected emptyController: EmptyController,
				protected mixerController: MixerController, protected staticKnobsDriver: StaticKnobsDriver) {
		this.layerController.onInit();
		this.displayModeController.onInit();

		this.store.select(SessionState.getKeyboardRoute)
			.pipe(map(route => route ? route.path : ''))
			.pipe(distinctUntilChanged())
			.subscribe((path) => {
			this.navigate(path);
		});

		this.setupMixerSwitching();

		this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EMPTY));
	}

	protected setupMixerSwitching() {

		const touchActive$ = merge(
			this.staticKnobsDriver.onKnobTouched.pipe(map(() => true)),
			this.staticKnobsDriver.onKnobReleased.pipe(map(() => false))
		);

		// Mixer display override
		this.store.select(LayoutState.isLayoutLoaded).pipe(
			switchMap(loaded => loaded ? touchActive$ : of())
		)
			.pipe(debounceTime(KeyboardRouter.MIXER_LOAD_TIMEOUT))
			.pipe(filter(val => val === true))
			.pipe(filter(() => this.isInMixerMode === false))
			.subscribe(() => {
				this.isInMixerMode = true;
				if (this.currentDisplayController) {
					this.currentDisplayController.onDestroy();
				}
				this.mixerController.onInit();
			});
		this.store.select(LayoutState.isLayoutLoaded).pipe(
			switchMap(loaded => !loaded ? of() :
				touchActive$
					.pipe(debounceTime(KeyboardRouter.MIXER_HIDE_TIMEOUT))
					.pipe(filter(val => val === false))
			)
		)
			.pipe(filter(() => this.isInMixerMode === true))
			.subscribe(() => {
				this.mixerController.onDestroy();
				this.isInMixerMode = false;
				if (this.currentDisplayController) {
					this.currentDisplayController.onInit();
				}
			});
	}

	protected navigate(route: string) {
		switch (route) {
			case KeyboardRoutes.EFFECT_OVERVIEW:
				this.switchDisplayController(
					this.effectOverviewController
				);
				break;
			case KeyboardRoutes.EFFECT_DETAIL:
				this.switchDisplayController(
					this.effectDetailController
				);
				break;
			case KeyboardRoutes.PRESET:
				this.switchDisplayController(
					this.presetController
				);
				break;
			case KeyboardRoutes.INSTRUMENT_DETAIL:
				this.switchDisplayController(
					this.instrumentDetailController
				);
				break;
			case KeyboardRoutes.EMPTY:
			default:
				route = KeyboardRoutes.EMPTY;
				this.switchDisplayController(this.emptyController);
				break;
		}
	}

	private switchDisplayController(controller: MortalInterface, prepareCallback: () => void = () => {}) {
		if (this.currentDisplayController) {
			this.currentDisplayController.onDestroy();
		}
		prepareCallback();
		this.currentDisplayController = controller;
		if (!this.isInMixerMode) {
			this.currentDisplayController.onInit();
		}
	}
}