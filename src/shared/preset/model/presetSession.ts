import {Preset} from './model';

export interface PresetSession {
	preset: Preset|null;
	lastPresets: Preset[];
	ignoreParams: boolean;
	isInitVstPresetLearning: boolean;
	isInitSnapshotLearning: boolean;
}