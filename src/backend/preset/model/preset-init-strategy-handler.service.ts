import {Injectable} from '@angular/core';
import {Layer} from '../../../shared/manual/model/layer';
import {
	PCPresetInitStrategy,
	PresetInitStrategy,
	SnapshotPresetInitStrategy,
	VstPresetInitStrategy
} from '../../../shared/preset/model/model';
import {PcInitStrategyHandlerService} from '../ProgramChangeStrategy/pc-init-strategy-handler.service';
import {SnapshotInitStrategyHandlerService} from '../SnapshotInitStrategy/snapshot-init-strategy-handler.service';
import {VstPresetInitStrategyHandlerService} from '../VstPresetInitStrategy/vst-preset-init-strategy-handler.service';

@Injectable({
	providedIn: 'root'
})
export class PresetInitStrategyHandlerService {

	constructor(protected pcHandler: PcInitStrategyHandlerService, protected snapshotHandler: SnapshotInitStrategyHandlerService, protected vstPresetHandler: VstPresetInitStrategyHandlerService) {

	}

	public handle(strategy: PresetInitStrategy, layer: Layer, instrumentId: string) {
		if (!strategy || !strategy.type) {
			return;
		}
		switch (strategy.type) {
			case 'pc':
				this.pcHandler.handle(<PCPresetInitStrategy> strategy, layer);
				break;
			case 'snapshot':
				this.snapshotHandler.handle(<SnapshotPresetInitStrategy> strategy, layer, instrumentId);
				break;
			case 'preset':
				this.vstPresetHandler.handle(<VstPresetInitStrategy> strategy, layer, instrumentId);
				break;
			default:
				console.log('UNKNOWN STRATEGY ' + strategy.type);
		}
	}
}