/*
 * Created by G on 25/07/2016.
 */


"use strict";

var popPrj = require('./lib/popPrj.js');

module.exports = exports =  function(dataArray, cb) {
	popPrj.popOneYearAdd(dataArray, function (data1YearAdd) {
		popPrj.popAgeZero(data1YearAdd, function (data0Age) {
			popPrj.popDeath(data1YearAdd, data0Age, function (dataDeath) {
				popPrj.popCombine(data1YearAdd, data0Age, dataDeath, function (data) {
					cb(data);
				});
			});
		});
	});
};
