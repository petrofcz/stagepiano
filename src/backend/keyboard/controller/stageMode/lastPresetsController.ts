import {MortalInterface} from '../../model/mortalInterface';
import {Subscription} from 'rxjs';
import {ParamMappingController} from '../global/display/paramMappingController';
import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {SessionState} from '../../../../shared/session/state/session.state';
import {switchMap} from 'rxjs/operators';
import {PresetSessionState} from '../../../../shared/preset/state/presetSession.state';
import {DisplayRegionDriver} from '../../hw/display/display-region-driver';
import {ButtonMatrixEvent} from '../../hw/common/button/buttonMatrix';
import {Preset} from '../../../../shared/preset/model/model';
import {SelectPresetAction} from '../../../../shared/preset/state/presetSession.actions';

@Injectable({
	providedIn: 'root'
})
export class LastPresetsController implements MortalInterface {

	private subscriptions: Subscription[] = [];

	// row that will be used for display / control (1 or 2)
	private _row = 2; // 1-indexed

	private _maxItems = 6;

	protected _history: Preset[]|null = null;

	constructor(protected paramMappingController: ParamMappingController, protected store: Store, protected display: DisplayRegionDriver) { }

	onDestroy(): void {
		this.display.display.clearRow(this._row);
		const buttonIds = this.display.buttonMatrix.getIdsForRow(this._row).forEach(
			buttonId => {
				this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
				this.display.buttonMatrix.buttons.setLed(buttonId, false);
			}
		);

		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
	}

	onInit(): void {
		const buttonIds = this.display.buttonMatrix.getIdsForRow(this._row);

		this.display.display.clearRow(this._row);
		this.subscriptions.push(
			this.store.select(PresetSessionState.getCurrentHistory).subscribe(history => {
				history = history.slice(0, this._maxItems);
				this._history = history;
				for (let i = 0; i < this._maxItems; i++) {
					this.display.display.setCellContent(this._row, i + 1, null);
				}
				buttonIds.forEach(buttonId => {
					this.display.buttonMatrix.buttons.setLed(buttonId, false);
					this.display.buttonMatrix.buttons.setButtonEnabled(buttonId, false);
				});
				history.forEach((preset, index) => {
					this.display.display.setCellContent(
						this._row, index + 1, preset.name
					);
					this.display.buttonMatrix.buttons.setButtonEnabled(buttonIds[index], true);
				});
			})
		);
		this.subscriptions.push(
			this.display.buttonMatrix.onButtonClick.subscribe((buttonEvent: ButtonMatrixEvent) => {
				if (!this._history) {
					return;
				}
				if (buttonEvent.row !== this._row) {
					return;
				}
				this.store.dispatch(
					new SelectPresetAction(this._history[buttonEvent.col - 1].id, this._history[buttonEvent.col - 1])
				);
			})
		);
		this.subscriptions.push(
			this.store.select(PresetSessionState.getCurrentPreset).subscribe(currentPreset => {
				this.display.display.setCellContent(this._row, 8, currentPreset ? currentPreset.name : null);
			})
		);
	}

	set row(value: number) {
		this._row = value;
	}

	set maxItems(value: number) {
		this._maxItems = value;
	}
}