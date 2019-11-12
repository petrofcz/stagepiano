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

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	public static readonly ROUTE_EFFECT_OVERVIEW = 'effectOverview';
	public static readonly ROUTE_EFFECT = 'effect';
	public static readonly ROUTE_PRESET = 'preset';
	public static readonly ROUTE_INSTRUMENT = 'instrument';
	public static readonly ROUTE_EMPTY = 'empty';

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

		this.store.dispatch(new SetKeyboardRouteAction(KeyboardRouter.ROUTE_EMPTY));
	}

	protected navigate(route: string, setupControllerCallback = null) {
		switch (route) {
			case KeyboardRouter.ROUTE_EFFECT_OVERVIEW:
				this.switchDisplayController(
					this.effectOverviewController, setupControllerCallback
				);
				break;
			case KeyboardRouter.ROUTE_PRESET:
				this.switchDisplayController(
					this.presetController
				);
				break;
			case KeyboardRouter.ROUTE_EMPTY:
			default:
				route = KeyboardRouter.ROUTE_EMPTY;
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