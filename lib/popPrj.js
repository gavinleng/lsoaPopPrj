/*
 * Created by G on 26/07/2016.
 */


"use strict";

var _ = require("lodash");

module.exports = {
	popOneYearAdd: function(dataArray, cb) {
		var i;
		
		var lendataArray = dataArray.length;
		
		var data1YearAddArray = [];
		
		for (i = 0; i < lendataArray; i++) {
			var data1YearAdd = _.cloneDeep(dataArray[i]);
			
			if ((data1YearAdd.age_band != '89') && (data1YearAdd.age_band != '90+')) {
				data1YearAdd.year = (+data1YearAdd.year + 1) + '';
				data1YearAdd.age_band = (+data1YearAdd.age_band + 1) + '';
				
				data1YearAddArray.push(data1YearAdd);
			}
		}

		var areaIds = _.map(dataArray, 'area_id');
		areaIds = _.uniq(areaIds);
		var lenareaIds = areaIds.length;
		
		for (i = 0; i < lenareaIds; i++) {
			var data89 =  _.filter(dataArray, {'area_id':areaIds[i], 'age_band':'89', 'gender':'male', 'year':dataArray[0].year});
			var data90plus = _.filter(dataArray, {'area_id':areaIds[i], 'age_band':'90+', 'gender':'male', 'year':dataArray[0].year});
			
			var data90 =  _.cloneDeep(data90plus[0]);
			data90.year = (+data90.year + 1) + '';
			data90.persons = +data90.persons + (+data89[0].persons);
			
			data1YearAddArray.push(data90);
			
			data89 =  _.filter(dataArray, {'area_id':areaIds[i], 'age_band':'89', 'gender':'female', 'year':dataArray[0].year});
			data90plus = _.filter(dataArray, {'area_id':areaIds[i], 'age_band':'90+', 'gender':'female', 'year':dataArray[0].year});
			
			data90 =  _.cloneDeep(data90plus[0]);
			data90.year = (+data90.year + 1) + '';
			data90.persons = +data90.persons + (+data89[0].persons);
			
			data1YearAddArray.push(data90);
		}
		
		cb(data1YearAddArray);
	},
	
	popAgeZero: function(dataArray, cb) {
		var i, j, k, boy0, girl0, dataAllAges, dataAges, lendataAges, dataAllPerson, dataPerson, dataRate;
		
		var data0Age = [];
		
		var rateBirth= require('../data/rate_birth_2010_2014.js').rateBirth;
		var lenrateBirth = rateBirth.length;
		
		var areaIds = _.map(dataArray, 'area_id');
		areaIds = _.uniq(areaIds);
		var lenareaIds = areaIds.length;
		
		for (i = 0; i < lenareaIds; i++) {
			boy0 = +_.filter(dataArray, {'area_id':areaIds[i], 'age_band':'0', 'gender':'male', 'year':dataArray[0].year})[0].persons;
			girl0 = +_.filter(dataArray, {'area_id':areaIds[i], 'age_band':'0', 'gender':'female', 'year':dataArray[0].year})[0].persons;
			
			dataAllAges =  _.filter(dataArray, {'area_id':areaIds[i], 'gender':'female', 'year':dataArray[0].year});
			
			dataAllPerson = 0;
			
			for (j = 0; j < lenrateBirth; j++) {
				dataAges =  _.filter(dataAllAges, function (item) {
					return ((+item.age_band >= +rateBirth[j].age_band.split('-')[0]) && (+item.age_band <= +rateBirth[j].age_band.split('-')[1]));
				});
				
				dataPerson = 0;
				lendataAges = dataAges.length;
				
				for (k = 0; k < lendataAges; k++) {
					dataPerson += +dataAges[k].persons;
				}
				
				dataAllPerson += +dataPerson * (+rateBirth[j].rate) / 1000;
			}
			
			dataRate =  _.cloneDeep(dataAllAges[0]);
			dataRate.year =(+dataRate.year + 1) + '';
			dataRate.age_band = '0';
			dataRate.gender = 'male';
			dataRate.persons = +(+dataAllPerson * boy0 / (boy0 + girl0)).toFixed(2);
			
			data0Age.push(dataRate);
			
			dataRate =  _.cloneDeep(dataAllAges[0]);
			dataRate.year =(+dataRate.year + 1) + '';
			dataRate.age_band = '0';
			dataRate.gender = 'female';
			dataRate.persons = +(+dataAllPerson * girl0 / (boy0 + girl0)).toFixed(2);
			
			data0Age.push(dataRate);
		}
		
		cb(data0Age);
	},
	
	popDeath: function(dataArray, cb) {
		var i;
		
		var dataDeath = [];
		
		var ratDeath= require('../data/rate_death_2010_2014.js').rateDeath;
		
		var areaIds = _.map(dataArray, 'area_id');
		areaIds = _.uniq(areaIds);
		var lenareaIds = areaIds.length;
		
		var _dataArray =  _.cloneDeep(dataArray);
		
		var genderDeath = function (gender, areaIdsg) {
			var j, k, dataAllAges, ratDeathg, lenratDeath, dataAges, lendataAges;
			var dataDeathg = [];
			
			dataAllAges =  _.filter(_dataArray, {'area_id':areaIdsg, 'gender':gender, 'year':dataArray[0].year});
			
			ratDeathg = _.filter(ratDeath, {'gender': gender});
			lenratDeath = ratDeathg.length;
			
			for (j = 0; j < lenratDeath; j++) {
				if (ratDeathg[j].age_band != '90+') {
					dataAges = _.filter(dataAllAges, function (item) {
						return ((+item.age_band >= +ratDeathg[j].age_band.split('-')[0]) && (+item.age_band <= +ratDeathg[j].age_band.split('-')[1]) && (item.gender == gender));
					});
					
					lendataAges = dataAges.length;
					
					for (k = 0; k < lendataAges; k++) {
						dataAges[k].year = (+dataAges[k].year + 1) + '';
						dataAges[k].persons = +(+dataAges[k].persons * (+ratDeathg[j].rate) / 1000).toFixed(2);
						
						dataDeathg.push(dataAges[k]);
					}
				} else {
					dataAges = _.filter(dataAllAges, {'age_band':'90+'});
					
					dataAges[0].year =(+dataAges[0].year + 1) + '';
					dataAges[0].persons = +(+dataAges[0].persons * (+ratDeathg[j].rate) / 1000).toFixed(2);
					
					dataDeathg.push(dataAges[0]);
				}
			}
			
			return dataDeathg;
		};
		
		for (i = 0; i < lenareaIds; i++) {
			// for female
			dataDeath = dataDeath.concat(genderDeath('female', areaIds[i]));
			
			// for male
			dataDeath = dataDeath.concat(genderDeath('male', areaIds[i]));
		}
		
		cb(dataDeath);
	},
	
	popCombine: function(data1YearAdd, data0Age, dataDeath, cb) {
		var _obj, _ageBandMinus;
		
		var dataAll = data1YearAdd.concat(data0Age);
		var lendataAll = dataAll.length;
		for (var i = 0; i < lendataAll; i++) {
			if (dataAll[i].age_band == '0') {
				continue;
			} else if (dataAll[i].age_band == '90+') {
				_obj = _.filter(dataDeath, {
					'area_id': dataAll[i].area_id,
					'age_band': '90+',
					'gender': dataAll[i].gender,
					'year': dataAll[i].year
				});
				
				dataAll[i].persons -= +_obj[0].persons;
				
				_obj = _.filter(dataDeath, {
					'area_id': dataAll[i].area_id,
					'age_band': '89',
					'gender': dataAll[i].gender,
					'year': dataAll[i].year
				});
				
				dataAll[i].persons -= +_obj[0].persons;
			} else {
				_ageBandMinus = (+dataAll[i].age_band - 1) + '';
				
				_obj = _.filter(dataDeath, {
					'area_id': dataAll[i].area_id,
					'age_band': _ageBandMinus,
					'gender': dataAll[i].gender,
					'year': dataAll[i].year
				});
				
				dataAll[i].persons -= +_obj[0].persons;
			}
		}
		
		var genderAllAges = function (gender, year, areaIdsg) {
			var j, dArray, lendArray, dObj, personTatal;
			
			dArray = _.filter(dataAll, {'area_id':areaIdsg, 'gender': gender, 'year':year});
			
			dObj =  _.cloneDeep(dArray[0]);
			dObj.age_band = 'All Ages';
			
			lendArray = dArray.length;
			personTatal = 0;
			var dataAllg = [];
			for (j = 0; j < lendArray; j++) {
				personTatal += +dArray[j].persons;
			}
			
			dObj.persons = +personTatal.toFixed(2);
			
			dataAllg.push(dObj);
			
			return dataAllg;
		};
		
		var getAllAges = function (dataAll, cb) {
			var i;
			
			var year = dataAll[0].year;
			
			var areaIds = _.map(dataAll, 'area_id');
			areaIds = _.uniq(areaIds);
			var lenareaIds = areaIds.length;
			
			for (i = 0; i <lenareaIds; i++) {
				// for female
				dataAll = dataAll.concat(genderAllAges('female', year, areaIds[i]));

				// for male
				dataAll = dataAll.concat(genderAllAges('male', year, areaIds[i]));
			}
			
			cb(dataAll);
		};
		
		getAllAges(dataAll, function (data) {
			cb(data);
		});
	}
};
