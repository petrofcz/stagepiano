export class OscMessage {
	constructor(public path: string, public args: any[], protected _dontHack: boolean = false) {

	}

	get dontHack(): boolean {
		return this._dontHack;
	}
}