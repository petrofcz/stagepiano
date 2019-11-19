import {LayerController} from '../controller/global/navigation/layerController';
import {Injectable} from '@angular/core';
import {PresetController} from '../controller/stageMode/presetController';
import {MortalInterface} from '../model/mortalInterface';
import {EffectOverviewController} from '../controller/global/display/effectOverviewController';
import {EmptyController} from '../controller/global/display/emptyController';
import {Store} from '@ngxs/store';
import {SetKeyboardRouteAction} from '../../../shared/session/state/session.actions';
import {DisplayModeController} from '../controller/global/navigation/displayModeController';
import {SessionState} from '../../../shared/session/state/session.state';
import {KeyboardRoute} from './keyboardRoute';

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	protected currentDisplayController = null;

	// tslint:disable-next-line:max-line-length
	constructor(protected store: Store,
				protected layerController: LayerController, protected displayModeController: DisplayModeController,
				protected presetController: PresetController, protected effectOverviewController: EffectOverviewController,
				protected emptyController: EmptyController) {
		this.layerController.onInit();
		this.displayModeController.onInit();

		this.store.select(SessionState.getKeyboardRoute).subscribe((route) => {
			this.navigate(route);
		});

		this.store.dispatch(new SetKeyboardRouteAction(KeyboardRoute.EMPTY));
	}

	protected navigate(route: string, setupControllerCallback = null) {
		switch (route) {
			case KeyboardRoute.EFFECT_OVERVIEW:
				this.switchDisplayController(
					this.effectOverviewController, setupControllerCallback
				);
				break;
			case KeyboardRoute.PRESET:
				this.switchDisplayController(
					this.presetController
				);
				break;
			case KeyboardRoute.EMPTY:
			default:
				route = KeyboardRoute.EMPTY;
				this.switchDisplayController(this.emptyController);
				break;
		}
	}

	private switchDisplayController(controller: MortalInterface, setupControllerCallback = null) {
		if (this.currentDisplayController) {
			this.currentDisplayController.onDestroy();
		}
		if(setupControllerCallback) {
			setupControllerCallback(controller);
		}
		this.currentDisplayController = controller;
		this.currentDisplayController.onInit();
	}
}