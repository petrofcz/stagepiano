import {MortalInterface} from '../../../model/mortalInterface';
import {Injectable} from '@angular/core';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';

@Injectable({
	providedIn: 'root'
})
export class EmptyController implements MortalInterface{

	constructor(protected display: DisplayRegionDriver) { }

	onDestroy(): void {
		console.log('[EMPTY-CTRL] Destroy');
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.display.clearDisplay();
	}

	onInit(): void {
		console.log('[EMPTY-CTRL] Init');
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.display.clearDisplay();
		this.display.display.writeMessage('.:| Stagepiano running |:.');
	}

}