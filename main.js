/*
 * Created by G on 05/10/2016.
 */


var fs = require("fs");
var path = require("path");

var mappingId = require("./mappingId.js");

//projection module
var dataPrj = require('./dataPrj.js');

//var midYearONSId = "BJlT8w_MR";
//var mappingId = "SkxyHi_MR";
/*var year = "2014";
var areaId = ["E06000045"];
var outPath = "./SotonPrj2015.json";*/

function databot(input, output, context) {
	output.progress(0);
	
	if (!input.year || !input.areaId || !input.outPath || !input.mappingId || !input.midYearONSId) {
		output.error("invalid arguments - please supply year, areaId, outPath, mappingId, midYearONSId");
		process.exit(1);
	}
	
	var year1 = input.year;
	
	var stringArray = input.areaId;
	
	const outPath = path.resolve(input.outPath);
	
	var p2c_config = {"mappingId": input.mappingId, "parent_type": "LAD15CD", "child_type": "LSOA11CD", "dataId": stringArray, "context": context, "output": output};
	
	mappingId.p2cId(p2c_config, function (array) {
		output.debug("fetching data for %s", input.midYearONSId);
		
		const api = context.tdxApi;
		
		var datasetId = input.midYearONSId;
		var filter = {"area_id":{"$in":array},"year": year1,"age_band":{"$ne":"All Ages"}};
		var projection = null;
		var options = {"limit":15390120};
		
		api.getDatasetData(datasetId, filter, projection, options, function(err, response) {
			if(err) {
				output.error("Failed to get data - %s", err.message);
				process.exit(1);
			} else {
				output.debug("got data");
				output.progress(50);
				
				var dataArray = response.data;
				
				dataPrj(dataArray, function(data) {
					var i;
					var lendata = data.length;
										
					output.debug("writing file %s", outPath);
					
					var stream = fs.createWriteStream(outPath);
					for (i = 0;  i <lendata; i++) {
						stream.write(JSON.stringify(data[i]) + "\n");
					}
					stream.end();
				});
			}
		});
	});
}

var input = require("nqm-databot-utils").input;
input.pipe(databot);
