import {MortalInterface} from '../../model/mortalInterface';
import {Subscription} from 'rxjs';
import {Injectable} from '@angular/core';
import {ParamMappingController} from '../global/display/paramMappingController';
import {LastPresetsController} from './lastPresetsController';
import {Store} from '@ngxs/store';
import {SessionState} from '../../../../shared/session/state/session.state';

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
		this.paramMappingController.onInit();
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
	}

}