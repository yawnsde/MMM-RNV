# MMM-RNV

This an extension for the [MagicMirror](https://github.com/MichMich/MagicMirror).

It monitors a given station in the RNV traffic network and shows the 10 upcoming departures with destination, type and delay. It also shows additional information if provided by the vendor. A valid API key is required, the key can be requested for free here: https://opendata.rnv-online.de/startinfo-api

## Installation
Open a terminal session, navigate to your MagicMirror's `modules` folder and execute `git clone https://github.com/yawnsde/MMM-RNV.git`, a new folder called MMM-RNV will be created.

Activate the module by adding it to the config.js file as shown below. Of course the position is up to you and the header is optional/customizable.

## Using the module
````javascript
modules: [
		{
			module:	'MMM-RNV',
			header: 'RNV Haltestellenmonitor',
			position:	'top_left',
			config: {
				apiKey: 'ENTER YOUR KEY HERE',
				stationID: 'ENTER YOUR STATION ID HERE',
			}
		},
	]
````

## Configuration options

The following properties can be configured:

| Option | Type | Description | Format |
| --- | --- | --- | --- |
| `apiKey` | String | Your personal API Key | 'abcdefghi123456' |
| `stationID` | String | The ID of your station. To find the ID of your station take a look here: https://opendata.rnv-online.de/sites/default/files/Haltestellen_16.xml | '1234' |
| `poleIDs` | String | The platform your transport leaves from. This can influence the direction shown. Get the different poles by executing `curl -H "RNV_API_TOKEN:<apiKey>" http://rnv.the-agent-factory.de:8080/easygo2/api/regions/rnv/modules/stations/detail?stationId=<stationID>`. To get the connections leaving from this pole, fire `curl -H "RNV_API_TOKEN:<apiKey>" http://rnv.the-agent-factory.de:8080/easygo2/api/regions/rnv/modules/stationmonitor/element?hafasID=<stationID>&time=null&poles=<poleIDs>`| '1', for multiple poles: '1;5;6' |
| `walkingTimeOffset` | int | Time it takes you to reach your station in minutes. | 0 |
| `numberOfShownDepartures` | int | Number of shown departures. Has to be between 1 and 10. | 10 |
