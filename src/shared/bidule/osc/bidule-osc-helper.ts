import {Layer} from '../../manual/model/layer';

export class BiduleOscHelper {

	public static readonly TIMEOUT_OSC_PARAM_UPDATE = 300;
	public static readonly TIMEOUT_OPEN_UI = 500;
	public static readonly TIMEOUT_OSC_VALUE_LEARN = 30;
	public static readonly TIMEOUT_YIELD_PARAMS_LEARN = 500;

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
			'Mode',
			'Send_Notes_Off_On_Processing_Changes',
			'Use_fades',
			'Sync_Source',
			'Num_Columns',
			'Preset_Number_str',
			'Mode_str',
			'monitor',
			'name_set',
			'parameter_min_set',
			'parameter_max_set',
			'parameters_osc_update',
			'presets_save',
			'presets_load',
			'presets_add',
			'presets_slot_add',
		];
		if (considerPresetChange) {
			disabled.push('Preset_Number');
		}
		return disabled.indexOf(endpoint) > -1;
	}

}

export enum BiduleCommonEndpoint {
	MODE = 'Mode',			// value specified in Mode
	PRESET_NUMBER = 'Preset_Number',
	PRESET_NAME = 'Preset_Number_str',
	OPEN_UI = 'Open_UI',	// no value
	YIELD_PARAMETERS = 'parameters_osc_update',	// no value
}

export enum BiduleMode {
	PROCESSING = 0,
	MUTE = 0.5,
	BYPASS = 1
}
