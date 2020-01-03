import {MortalInterface} from '../../model/mortalInterface';
import {combineLatest, Subscription} from 'rxjs';
import {Injectable} from '@angular/core';
import {ParamMappingController} from '../global/display/paramMappingController';
import {LastPresetsController} from './lastPresetsController';
import {Store} from '@ngxs/store';
import {SessionState} from '../../../../shared/session/state/session.state';
import {PresetSessionState} from '../../../../shared/preset/state/presetSession.state';
import {
	LoadParamMappingPageFromInstrumentAction,
	ResetParamMappingPageAction
} from '../../../../shared/paramMapping/state/paramMappingPage.actions';
import {distinctUntilChanged, map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class InstrumentDetailController implements MortalInterface {

	private subscriptions: Subscription[] = [];
	private lastPresetLive = false;

	constructor(protected paramMappingController: ParamMappingController, protected lastPresetsController: LastPresetsController, protected store: Store) { }

	onDestroy(): void {
		this.subscriptions.forEach(sub => sub.unsubscribe());
		this.subscriptions = [];
		this.paramMappingController.onDestroy();
		if (this.lastPresetLive) {
			this.lastPresetsController.onDestroy();
			this.lastPresetLive = false;
		}
	}

	onInit(): void {
		this.subscriptions.push(
		combineLatest(
			this.store.select(SessionState.getActiveLayerId),
			this.store.select(PresetSessionState.getCurrentPreset)
				.pipe(map(preset => { return !preset ? null : {vstId: preset.vstId, mappingGroupId: preset.parameterMappingGroupId}; }))
		)
			.pipe(distinctUntilChanged())
			.subscribe(([activeLayerId, currentPresetData]) => {
				if (!activeLayerId || !currentPresetData) {
					console.log('[PMLS] Resetting state...');
					this.store.dispatch(new ResetParamMappingPageAction());
				} else {
					this.store.dispatch(new LoadParamMappingPageFromInstrumentAction(
						currentPresetData.vstId, currentPresetData.mappingGroupId
					));
				}
			})
		);

		this.subscriptions.push(this.store.select(SessionState.isEditing).subscribe(isEditing => {
			if (isEditing && this.lastPresetLive) {
				this.lastPresetsController.onDestroy();
				this.lastPresetLive = false;
			}
			if (!isEditing && !this.lastPresetLive) {
				this.lastPresetsController.onInit();
				this.lastPresetLive = true;
			}
		}));
		if (!this.lastPresetLive) {
			this.lastPresetsController.onInit();
			this.lastPresetLive = true;
		}
		this.paramMappingController.onInit();
	}

}