import {LayerController} from '../controller/global/layerController';
import {Injectable} from '@angular/core';
import {PresetController} from '../controller/stageMode/presetController';
import {MortalInterface} from '../model/mortalInterface';

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	protected currentDisplayController = null;

	constructor(protected layerController: LayerController, protected presetController: PresetController) {
		this.layerController.onInit();
		this.switchDisplayController(this.presetController);
	}


	private switchDisplayController(controller: MortalInterface) {
		if (this.currentDisplayController) {
			this.currentDisplayController.onDestroy();
		}
		this.currentDisplayController = controller;
		this.currentDisplayController.onInit();
	}
}