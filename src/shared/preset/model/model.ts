export interface PresetCategory {
	id: string;
	name: string;
	presetIds: string[];
}

export interface Preset {
	id: string;
	name: string;
	vstId: string|null;
	initStrategy: PresetInitStrategy|null;
	parameterMappingGroupId: string|null;
	paramValues: {[key: string]: string};
}

export interface PresetInitStrategy {
	type;
}

export interface PCPresetInitStrategy extends PresetInitStrategy {
	type: 'pc';
	program: number;
}

export interface VstPresetInitStrategy extends PresetInitStrategy {
	type: 'preset';
	preset: number;
	presetName: string;
}

export interface SnapshotPresetInitStrategy extends PresetInitStrategy {
	type: 'snapshot';
	paramValues: {[key: string]: any[]};
}
