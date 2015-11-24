 // generates an interface file given an eni file
 // you can generate an eni file using the aws-cli
 // example:
 // aws ec2 describe-network-interfaces --network-interface-ids eni-2492676c > eni-7290653a.json
var ENI_FILE = "json/eni-651e2c2c.json";
// the interface you want to configure
var INTERFACE = "eth1";
// port you want squid proxy to start at; doesn't matter if you're not using squid
var PORT = 3188;
// get the gateway ip by running `route -n`
var GATEWAYIP = "172.31.16.1";
// number to start with in RT TABLES
var RT_TABLES = 2;
fs = require('fs');

fs.readFile(ENI_FILE, function (err, data) {
	if (!err) {
		var eni = JSON.parse(data).NetworkInterfaces[0];
		var netConfig = "auto " + INTERFACE + "\niface " + INTERFACE + " inet dhcp\n\n";
		var squidConfig = "";
		var rtTables = "";
		for (var i = 0; i < eni.PrivateIpAddresses.length; i++) {
			var addressObject = eni.PrivateIpAddresses[i];
			// construct string

			// current subinterface
			var subinterface = INTERFACE + ":" + i;

			netConfig += "auto " + subinterface + "\n";
			netConfig += "iface "+ subinterface + " inet static\n";
			netConfig += "address " + addressObject.PrivateIpAddress + "\n";
			// this IP is the gateway IP
			netConfig += "up ip route add default via " + GATEWAYIP + " dev " + subinterface + " table " + subinterface + "\n"
			netConfig += "up ip rule add from " + addressObject.PrivateIpAddress + " lookup " + subinterface + "\n\n";

			squidConfig += "http_port localhost:" + PORT + " name="+ PORT + "\nacl a" + PORT + " myportname " + PORT + " src localhost\nhttp_access allow a" + PORT + "\ntcp_outgoing_address " + addressObject.PrivateIpAddress + " a" + PORT + "\n\n";
			rtTables += RT_TABLES + " " + subinterface + "\n";

			PORT++;
			RT_TABLES++;
		};
		
		// trim newlines
		netConfig = netConfig.replace(/^\s+|\s+$/g, '');
		squidConfig = squidConfig.replace(/^\s+|\s+$/g, '');
		rtTables = rtTables.replace(/^\s+|\s+$/g, '');

		fs.writeFile("./cfg/" + INTERFACE + ".cfg", netConfig, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		    	console.log("Generated networking config and saved it to " + INTERFACE + ".cfg.");
		    }
		});

		fs.writeFile("./cfg/" + INTERFACE + "-squid.cfg", squidConfig, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		    	console.log("Generated squid config and saved it to " + INTERFACE + ".cfg.");
		    }
		});

		fs.writeFile("./cfg/" + INTERFACE + "-rt_tables.cfg", rtTables, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		    	console.log("Generated rt_tables and saved it to " + INTERFACE + ".cfg.");
		    }
		});

	}
	if (err) {
		console.log("Error! Make sure you're running this in the config-utils directory and that the JSON file + the cfg directory are both there.");
	}
});