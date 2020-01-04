import {VstPresetInitStrategy} from '../../../shared/preset/model/model';
import {Layer} from '../../../shared/manual/model/layer';
import {OscService} from '../../osc/osc.service';
import {BiduleCommonEndpoint, BiduleOscHelper} from '../../../shared/bidule/osc/bidule-osc-helper';
import {OscMessage} from '../../osc/osc.message';
import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class VstPresetInitStrategyHandlerService {
	constructor(protected osc: OscService) { }

	public handle(strategy: VstPresetInitStrategy, layer: Layer, instrumentId: string) {
		if (strategy.preset) {
			this.osc.send(new OscMessage(
				BiduleOscHelper.getLocalVstPrefix(layer) + instrumentId + '/' + BiduleCommonEndpoint.PRESET_NUMBER, [strategy.preset]
			));
		}
	}
}