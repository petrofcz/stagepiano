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
import {distinctUntilChanged, map} from 'rxjs/operators';
import {InstrumentDetailController} from '../controller/stageMode/instrumentDetailController';

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	protected currentDisplayController = null;

	// tslint:disable-next-line:max-line-length
	constructor(protected store: Store,
				protected layerController: LayerController, protected displayModeController: DisplayModeController,
				protected presetController: PresetController, protected instrumentDetailController: InstrumentDetailController,
				protected effectOverviewController: EffectOverviewController, protected effectDetailController: EffectDetailController,
				protected emptyController: EmptyController) {
		this.layerController.onInit();
		this.displayModeController.onInit();

		this.store.select(SessionState.getKeyboardRoute)
			.pipe(map(route => route ? route.path : ''))
			.pipe(distinctUntilChanged())
			.subscribe((path) => {
			this.navigate(path);
		});

		this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoutes.EMPTY));
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

	private switchDisplayController(controller: MortalInterface) {
		if (this.currentDisplayController) {
			this.currentDisplayController.onDestroy();
		}
		this.currentDisplayController = controller;
		this.currentDisplayController.onInit();
	}
}