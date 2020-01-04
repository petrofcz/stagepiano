import {Layer} from '../../manual/model/layer';
import {OscMessage} from '../../../backend/osc/osc.message';
import {OscService} from '../../../backend/osc/osc.service';

export class BiduleOscHelper {

	public static readonly TIMEOUT_OSC_PARAM_UPDATE = 300;
	public static readonly TIMEOUT_OPEN_UI = 500;
	public static readonly TIMEOUT_OSC_VALUE_LEARN = 30;
	public static readonly TIMEOUT_YIELD_PARAMS_LEARN = 500;
	public static readonly TIMEOUT_IGNORE_PARAMS_AFTER_PRESET_INIT = 500;

	public static getGlobalEffectPrefix() {
		return '/';
	}

	public static getManualVstPrefix(manualId: string) {
		return '/Manual' + (parseInt(manualId, 10) + 1) + '/';
	}

	public static getLocalVstPrefix(layer: Layer) {
		return BiduleOscHelper.getManualVstPrefix(layer.manualId) + 'Layer' + layer.position + '/';
	}

	public static buildLayerMidiSwitcherItemMessage(layer: Layer, instrumentId: string) {
		const instrumentIndex = this.getInstrumentIndex(instrumentId, layer);
		if (instrumentIndex === -1) {
			// todo throw/log error
			return null;
		}
		return new OscMessage(this.getLocalVstPrefix(layer) + 'MidiSwitcher/Active_Output', [instrumentIndex / 15]);
	}

	public static buildLayerVstModeMessage(layer: Layer, vstId: string, mode: BiduleMode) {
		return new OscMessage(
			this.getLocalVstPrefix(layer) + vstId + '/' + BiduleCommonEndpoint.MODE,
			[mode]
		);
	}

	public static buildInstrumentMixerMuteMessage(layer: Layer, vstId: string, mute: boolean) {
		const instrumentIndex = this.getInstrumentIndex(vstId, layer);
		if (instrumentIndex === -1) {
			// todo throw/log error
			return null;
		}
		return new OscMessage(
			this.getLocalVstPrefix(layer) + 'InstrumentMixer/Mute_Channel_' + (instrumentIndex + 1),
			[mute ? 1.0 : 0.0]
		);
	}

	public static sendMidiMessage(byte1: number, byte2: number, byte3: number, osc: OscService) {
		[
			new OscMessage('/MidiCreator/Byte0/Value', [byte1 / 255]),
			new OscMessage('/MidiCreator/Byte1/Value', [byte2 / 255]),
			new OscMessage('/MidiCreator/Byte2/Value', [byte3 / 255])
		].forEach(message => osc.send(message));
		setTimeout(() => osc.send(new OscMessage('/MidiCreator/Trigger/Send_Trigger', [1], true)), 10);
	}
	// deprecated - MIDI OSC bidule does not work
	// public static buildSendMidiMessages(byte1: number, byte2: number, byte3: number) {
	// 	return [
	// 		new OscMessage('/OscMidi/MIDI', [byte1, byte2, byte3], true)
	// 	];
	// }

	public static isLocalEffect(path: string) {
		return path.match(/\/Manual\d\/Layer\d\/EI.+/) || path.match(/\/Manual\d\/Layer\d\/EO.+/);
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

	private static getInstrumentIndex(instrumentId: string, layer: Layer) {
		return layer.availableVstIds.filter(vstId => vstId.startsWith('I')).indexOf(instrumentId);
	}

	static getManualMixerVolumeItem(manualPosition: number) {
		return '/ManualMixer/Volume_Channel_' + manualPosition;
	}

	static getLayerMixerVolumeItem(layerPosition: number, manualId: string) {
		return this.getManualVstPrefix(manualId) + 'LayerMixer/Volume_Channel_' + layerPosition;
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
