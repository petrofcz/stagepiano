import {MortalInterface} from '../model/MortalInterface';
import {ButtonGroup} from '../hw/common/button/buttonGroup';

// todo remove? breaks m-v-c principle
export class ButtonToggle implements MortalInterface {

	private buttonClickSubscription;

	constructor(protected buttonGroup: ButtonGroup) {
		this.buttonClickSubscription = buttonGroup.onButtonClick.subscribe(() => {

		});
	}

	onDestroy(): void {
		if (this.buttonClickSubscription) {
			this.buttonClickSubscription.unsubscribe();
		}
		this.buttonGroup.turnOffAllLeds();
	}

	onInit(): void {
		this.buttonGroup.turnOffAllLeds();
	}
}