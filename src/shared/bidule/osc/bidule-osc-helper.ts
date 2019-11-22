import {Layer} from '../../manual/model/layer';

export class BiduleOscHelper {

	public static readonly TIMEOUT_OSC_PARAM_UPDATE = 300;
	public static readonly TIMEOUT_OPEN_UI = 500;

	public static getGlobalEffectPrefix() {
		return '/';
	}

	public static getLocalVstPrefix(layer: Layer) {
		return '/Manual' + (parseInt(layer.manualId, 10) + 1) + '/Layer' + layer.position + '/';
	}

	public static isNativeBiduleEndpoint(endpoint: string, considerPresetChange: boolean) {
		const disabled = [
			'Open_UI',
			'Mutate',
			'Randomize',
			'Mode'
		];
		if (considerPresetChange) {
			disabled.push('Preset_Number');
		}
		return disabled.indexOf(endpoint) > -1;
	}
}