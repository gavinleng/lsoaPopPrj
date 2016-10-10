/*
 * Created by G on 05/10/2016.
 */


var fs = require("fs");
var path = require("path");

var mappingId = require("./mappingId.js");

//projection module
var dataPrj = require('./dataPrj.js');

//get dataConfig file
var dataConfig = require('./dataConfig.js');

var year1 = dataConfig.year;

var stringArray = dataConfig.areaId;

//var midYearONSId = "BJlT8w_MR";
//var mappingId = "SkxyHi_MR";

const outPath = path.resolve(dataConfig.outPath);

function databot(input, output, context) {
	output.progress(0);
	
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
					var dd, i;
					var lendata = data.length;
					var d = "";
					
					for (i = 0;  i <lendata; i++) {
						dd = data[i];
						d  += JSON.stringify(dd, null, 0) + "\n";
					}
					
					output.debug("writing file %s", outPath);
					fs.writeFile(outPath, d, function(err) {
						if(err) {
							output.error("Failed to write file - %s", err.message);
							process.exit(1);
						} else {
							output.progress(100);
							process.exit(0);
						}
					});
				});
			}
		});
	});
}

var input = require("nqm-databot-utils").input;
input.pipe(databot);
