import {ButtonMatrix} from '../common/button/buttonMatrix';

export class Buttons extends ButtonMatrix {

	protected getFirstButtonCC() {
		return 24;
	}

	protected getNumColumns() {
		return 8;
	}

	protected getNumRows() {
		return 2;
	}

}