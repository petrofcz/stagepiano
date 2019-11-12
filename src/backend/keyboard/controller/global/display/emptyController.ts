import {MortalInterface} from '../../../model/mortalInterface';
import {Injectable} from '@angular/core';
import {DisplayRegionDriver} from '../../../hw/display/display-region-driver';

@Injectable({
	providedIn: 'root'
})
export class EmptyController implements MortalInterface{

	constructor(protected display: DisplayRegionDriver) { }

	onDestroy(): void {
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.display.clearDisplay();
	}

	onInit(): void {
		this.display.buttonMatrix.buttons.disableAllButtons();
		this.display.buttonMatrix.buttons.turnOffAllLeds();
		this.display.display.clearDisplay();
		this.display.display.writeMessage('.:| Stagepiano running |:.');
	}

}