import {Preset} from './model';

export interface PresetSession {
	preset: Preset|null;
	lastPresets: Preset[];
	ignoreParams: boolean;
}