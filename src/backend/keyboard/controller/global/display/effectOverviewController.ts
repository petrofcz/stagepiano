import {Injectable} from '@angular/core';
import {MortalInterface} from '../../../model/mortalInterface';
import {EffectSwitchController} from './effect-switch-controller.service';
import {ParamMappingController} from './paramMappingController';

@Injectable({
	providedIn: 'root'
})
export class EffectOverviewController implements MortalInterface {

	constructor(protected effectSwitchController: EffectSwitchController, protected paramMappingController: ParamMappingController) {

	}

	onDestroy(): void {
		this.effectSwitchController.onDestroy();
		this.paramMappingController.onDestroy();
	}

	onInit(): void {
		this.effectSwitchController.onInit();
		this.paramMappingController.onInit();
	}

}