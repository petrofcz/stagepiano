import {Preset} from './model';

export interface PresetSession {
	preset: Preset|null;
	presetChangeTimestamp: number;
	lastPresets: Preset[];
	ignoreParams: boolean;
	isInitVstPresetLearning: boolean;
	isInitSnapshotLearning: boolean;
}