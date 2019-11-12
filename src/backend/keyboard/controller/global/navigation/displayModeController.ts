import {Injectable} from '@angular/core';
import {MortalInterface} from '../../../model/mortalInterface';
import {Subscription} from 'rxjs';
import {Store} from '@ngxs/store';
import {NavigationRegionDriver} from '../../../hw/navigation/navigationRegionDriver';
import {InterruptionClock} from '../../../model/interruptionClock';
import {MultiClickButtonEvent, MultiClickHandler} from '../../../hw/common/button/multiClickHandler';
import {KeyboardRouter} from '../../../router/keyboardRouter';
import {EffectPlacement, EffectScope} from '../../../../../shared/vst/model/effect';
import {SessionState} from '../../../../../shared/session/state/session.state';
import {SetEffectDispositionAction, SetKeyboardRouteAction} from '../../../../../shared/session/state/session.actions';
import {EffectDisposition} from '../../../../../shared/session/model/effectDisposition';

@Injectable({
	providedIn: 'root'
})
export class DisplayModeController implements MortalInterface {

	private modeSelectClickSubscription: Subscription;

	private blinkSubscription: Subscription = null;
	private effectDispositionSubscription: Subscription = null;

	constructor(protected store: Store, protected navigation: NavigationRegionDriver, protected intClock: InterruptionClock) {

	}

	onInit(): void {
		const pageButtons = this.navigation.pageNavigation;
		pageButtons.turnOffAllLeds();
		pageButtons.enableAllButtons();
		pageButtons.setGlobalClickHandler(new MultiClickHandler(3));
		this.modeSelectClickSubscription = pageButtons.onButtonClick
			.subscribe((event: MultiClickButtonEvent) => {
				switch (event.clickCount) {
					case 1:
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRouter.ROUTE_INSTRUMENT));
						break;
					case 2:
						this.store.dispatch(
							new SetEffectDispositionAction(
								new EffectDisposition(event.buttonId === 1 ? EffectPlacement.Pre : EffectPlacement.Post, EffectScope.Local)
							)
						);
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRouter.ROUTE_EFFECT_OVERVIEW));
						break;
					case 3:
						this.store.dispatch(
							new SetEffectDispositionAction(
								new EffectDisposition(event.buttonId === 1 ? EffectPlacement.Pre : EffectPlacement.Post, EffectScope.Global)
							)
						);
						this.store.dispatch(new SetKeyboardRouteAction(KeyboardRouter.ROUTE_EFFECT_OVERVIEW));
						break;
				}
			});

		this.store.select(SessionState.getKeyboardRoute).subscribe((route) => {
			this.clearBlinkSubscription();
			this.clearEffectDispositionSubscription();
			pageButtons.turnOffAllLeds();

			switch (route) {
				case KeyboardRouter.ROUTE_EFFECT_OVERVIEW:
					this.effectDispositionSubscription = this.store.select(SessionState.getEffectDisposition).subscribe((effectDisposition) => {
						this.clearBlinkSubscription();
						pageButtons.turnOffAllLeds();
						const ledIndex = effectDisposition.placement === EffectPlacement.Pre ? 1 : 2;
						pageButtons.setLed(ledIndex, true);
						this.blinkSubscription = this.intClock.getByIndex(effectDisposition.scope === EffectScope.Local ? 0 : 3).subscribe((on: boolean) => {
							pageButtons.setLed(ledIndex, on);
						});
					});
					break;
				case KeyboardRouter.ROUTE_INSTRUMENT:
					pageButtons.setLed(1, true);
					pageButtons.setLed(2, true);
					break;
			}
		});
	}

	private clearBlinkSubscription() {
		if (this.blinkSubscription) {
			this.blinkSubscription.unsubscribe();
			this.blinkSubscription = null;
		}
	}

	private clearEffectDispositionSubscription() {
		if (this.effectDispositionSubscription) {
			this.effectDispositionSubscription.unsubscribe();
			this.effectDispositionSubscription = null;
		}
	}

	onDestroy(): void {
		const layerSelect = this.navigation.leftRow;
		this.modeSelectClickSubscription.unsubscribe();
		this.clearBlinkSubscription();
		this.clearEffectDispositionSubscription();
		layerSelect.setGlobalClickHandler(null);
		this.navigation.leftRow.turnOffAllLeds();
	}
}