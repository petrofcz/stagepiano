import {MortalInterface} from '../../model/MortalInterface';
import {Store} from '@ngxs/store';
import {NavigationRegionDriver} from '../../hw/navigation/navigationRegionDriver';
import {MultiClickButtonEvent, MultiClickHandler} from '../../hw/common/button/multiClickHandler';
import {Subscription} from 'rxjs';
import {ManualState} from '../../../../shared/manual/state/manual.state';
import {Manual} from '../../../../shared/manual/model/manual';
import {InterruptionClock} from '../../model/InterruptionClock';
import {Injectable} from '@angular/core';
import {SelectLayerAction} from '../../../../shared/session/state/session.actions';
import {SessionState} from '../../../../shared/session/state/session.state';

@Injectable({
	providedIn: 'root'
})
export class LayerController implements MortalInterface {

	private layerSelectClick: Subscription;

	private blinkSubscription = null;

	constructor(protected store: Store, protected navigation: NavigationRegionDriver, protected intClock: InterruptionClock) {

	}

	onInit(): void {
		const layerSelect = this.navigation.leftRow;
		layerSelect.turnOffAllLeds();
		layerSelect.setGlobalClickHandler(new MultiClickHandler(4));
		this.layerSelectClick = this.navigation.leftRow.onButtonClick.subscribe((event: MultiClickButtonEvent) => {
			const manualId = (event.buttonId - 1).toString();
			const getManualById = this.store.selectSnapshot(ManualState.getManualById);
			console.log('MAN ID ' + manualId);
			const manual = getManualById(manualId);
			console.log(manual);
			console.log(event);
			if (manual) {
				this.store.dispatch(
					new SelectLayerAction(
						manual.layerIds[
							Math.min(event.clickCount, manual.layerIds.length) - 1
						]
					)
				);
			}
		});
		this.store.select(ManualState.getCurrentLayer).subscribe((layer) => {
			layerSelect.turnOffAllLeds();
			const getLayerById = this.store.selectSnapshot(ManualState.getLayerById);
			if (this.blinkSubscription) {
				this.blinkSubscription.unsubscribe();
				this.blinkSubscription = null;
			}
			if (!layer) {
				return;
			}
			const ledIndex = parseInt(layer.manualId, 10) + 1;
			this.navigation.leftRow.setLed(ledIndex, true);

			if (layer.position > 1) {
				console.log('BLINKING ' + (layer.position - 2));
				this.blinkSubscription = this.intClock.getByIndex(layer.position - 2).subscribe((on: boolean) => {
					this.navigation.leftRow.setLed(ledIndex, on);
				});
			}
		});
		this.store.select(ManualState.getManuals).subscribe((manuals: Manual[]) => {
			this.navigation.leftRow.disableAllButtons();
			for (let i = 1; i <= manuals.length; i++) {
				this.navigation.leftRow.setButtonEnabled(i, true);
			}
		});
	}

	onDestroy(): void {
		const layerSelect = this.navigation.leftRow;
		this.layerSelectClick.unsubscribe();
		if (this.blinkSubscription) {
			this.blinkSubscription.unsubscribe();
		}
		layerSelect.setGlobalClickHandler(null);
		this.navigation.leftRow.turnOffAllLeds();
	}
}