var usb = require('usb')

console.log(usb.getDeviceList());
//return;

var device = usb.findByIds(4661, 11);

console.log('ted');
console.log(device);

var interfaces = null;
var automapInterface = null;

if(device) {
	device.open();
	
	interfaces = device.interfaces;
	automapInterface = null;

	console.log(interfaces);
	
	for(i in interfaces) {
		if(interfaces[i].descriptor.bInterfaceClass == 255) {
			automapInterface = interfaces[i];
		}
	}
}

if(automapInterface) {
	console.log('Automap interface found!');
	
	automapInterface.claim();
	
	inEndpoint = automapInterface.endpoints[0];
	inEndpoint.startPoll(32, 4);
	inEndpoint.on('data', function(d) {
		console.log(d);
	});
	
	inEndpoint.on('end', function() {
		automapInterface.release();
		device.close();
	});

} else {
	console.log('Automap interface not found!');
	if(device) {
		device.close();
	}
}