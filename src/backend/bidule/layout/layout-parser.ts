import {EffectPlacement} from '../../../shared/vst/model/effect';

export class BiduleLayout {
	constructor(
		public manualDefinitions: ManualDefinition[],
		public globalEffectIds: string[],
		public vstDefinitions: VSTDefinition[]
	) {
	}
}

export class ManualDefinition {
	constructor(public id: number, public name: string, public layers: LayerDefinition[]) {
	}
}

export class LayerDefinition {
	constructor(public id: number, public name: string, public vstIds: string[]) {
	}
}

export class VSTDefinition {
	constructor(
		public id: string,     // = bidule name
		public name: string   // = trimmed bidule name (GEDelay -> Delay)
	) {
	}
}

export class InstrumentDefinition extends VSTDefinition {
}

export class EffectDefinition extends VSTDefinition {
	constructor(
		id: string,
		name: string,
		public placement: EffectPlacement
	) {
		super(id, name);
	}
}

export class BiduleLayoutParser {

	public static loadFile(file: string): Promise<BiduleLayout> {
		return new Promise((resolve, reject) => {
			const fs = require('fs'),
				xml2js = require('xml2js');

			const parser = new xml2js.Parser();

			const manuals = {};

			fs.readFile(file, (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				parser.parseString(data, (parseErr, result) => {
					if (parseErr) {
						reject(parseErr);
					}

					const mainGroup = result.BoardLayout.BiduleGroup[0];
					const vstDefinitions = {};

					this.walkThroughGroups(mainGroup, (firstLevelGroup) => {
						const groupName: string = firstLevelGroup.$.displayName;
						if (groupName.startsWith('Manual')) {
							const manualId: number = parseInt(groupName.substr('Manual'.length), null) - 1;
							const layers = {};

							this.walkThroughGroups(firstLevelGroup, (secondLevelGroup) => {
								const groupName2: string = secondLevelGroup.$.displayName;
								if (groupName2.startsWith('Layer')) {
									const layerId: number = parseInt(groupName2.substr('Layer'.length), null) - 1;

									const vstIds: string[] = [];

									this.walkThroughBidules(secondLevelGroup, function (bidule) {
										const biduleName: string = bidule.$.displayName;
										if (biduleName.startsWith('I') && biduleName !== 'InstrumentMixer') {
											vstIds.push(biduleName);
											vstDefinitions[biduleName] = new InstrumentDefinition(
												biduleName,
												biduleName.substr('I'.length),
											);
										}
										if (biduleName.startsWith('EI') || biduleName.startsWith('EO')) {
											vstIds.push(biduleName);
											vstDefinitions[biduleName] = new EffectDefinition(
												biduleName,
												biduleName.substr('EI'.length),
												biduleName.substr(1, 1) === 'I' ? EffectPlacement.Pre : EffectPlacement.Post
											);
										}
									});

									layers[layerId] = new LayerDefinition(
										layerId, groupName2, vstIds
									);
								}
							});
							manuals[manualId] = new ManualDefinition(
								manualId, groupName, Object.values(layers)
							);
						}
					});

					const globalEffectIds: string[] = [];
					this.walkThroughBidules(mainGroup, function (bidule) {
						const biduleName: string = bidule.$.displayName;
						if (biduleName.startsWith('EI') || biduleName.startsWith('EO')) {
							globalEffectIds.push(biduleName);
							vstDefinitions[biduleName] = new EffectDefinition(
								biduleName,
								biduleName.substr('EI'.length),
								biduleName.substr(1, 1) === 'I' ? EffectPlacement.Pre : EffectPlacement.Post
							);
						}
					});

					resolve(new BiduleLayout(
						Object.values(manuals),
						globalEffectIds,
						Object.values(vstDefinitions)
					));
				});
			});
		});
	}

	protected static walkThroughBidules(groupObject, callback) {
		for (let i = 0, len = groupObject.Bidule.length; i < len; i++) {
			callback(groupObject.Bidule[i]);
		}
	}

	protected static walkThroughGroups(groupObject, callback) {
		for (let i = 0, len = groupObject.BiduleGroup.length; i < len; i++) {
			callback(groupObject.BiduleGroup[i]);
		}
	}

}
