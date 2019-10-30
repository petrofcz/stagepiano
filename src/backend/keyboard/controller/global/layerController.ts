import {MortalInterface} from '../../model/MortalInterface';
import {Store} from '@ngxs/store';
import {NavigationRegionDriver} from '../../hw/navigation/navigationRegionDriver';
import {MultiClickButtonEvent, MultiClickHandler} from '../../hw/common/button/multiClickHandler';
import {Subscription} from 'rxjs';
import {SelectLayerAction} from '../../../../shared/manual/state/manual.actions';
import {ManualState} from '../../../../shared/manual/state/manual.state';
import {Manual} from '../../../../shared/manual/model/manual';
import {InterruptionClock} from '../../model/InterruptionClock';
import {Injectable} from '@angular/core';

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
		this.layerSelectClick = this.navigation.onLeftRowClick.subscribe(([buttonId, event]) => {
			const manualId = (buttonId - 1).toString();
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
		this.store.select(ManualState.getActiveLayerId).subscribe((layerId) => {
			console.log('NEW LAYER' + layerId);
			layerSelect.turnOffAllLeds();
			const getLayerById = this.store.selectSnapshot(ManualState.getLayerById);
			if (this.blinkSubscription) {
				this.blinkSubscription.unsubscribe();
				this.blinkSubscription = null;
			}
			if (!layerId) {
				return;
			}
			const layer = getLayerById((layerId).toString());
			if (!layer) {
				return;
			}
			console.log(layer);
			const ledIndex = parseInt(layer.manualId, 10) + 1;
			this.navigation.setLeftRowLed(ledIndex, true);

			if (layer.position > 0) {
				this.blinkSubscription = this.intClock.getByIndex(layer.position - 1).subscribe((on: boolean) => {
					console.log('INT CLOCK ' + on);
					this.navigation.setLeftRowLed(ledIndex, on);
				});
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