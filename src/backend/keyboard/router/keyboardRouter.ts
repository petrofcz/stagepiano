import {LayerController} from '../controller/global/layerController';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class KeyboardRouter {

	constructor(protected layerController: LayerController) {
		this.layerController.onInit();
	}

}