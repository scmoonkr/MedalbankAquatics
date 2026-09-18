const haversine = require('haversine');
const geolib    = require('geolib');
const FitParser = require('fit-file-parser').default;
const gpxParse  = require("gpx-parse");
const csvParse  = require("gpx-parse");
const { buildGPX, GarminBuilder, StravaBuilder } = require('gpx-builder');
const { Point } = StravaBuilder.MODELS;
// const fs			  = require('fs');

const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('./MongoDB');

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

/*******************************************************
 * 
 * Cycle Library
 * 
 *******************************************************/
'use strict';

class GeoLibrary {
  constructor() {
  }
	//-----------------------------
	// getter
	//-----------------------------
  //-----------------------------

  //-----------------------------
  // table options
  //		page					: 1 ~
  //		itemsPerPage	: 20
  //		sortBy				: '_id'
  //		sortDesc			: 'asc|desc'
  //		projection		: { _id:0, }
  //-----------------------------
  calculateAverage(arr, max) {
    let avgArr = [];
    if (arr == undefined || arr.length <= max) return avgArr;
    let tot = 0;
    for (let no=0; no < max; no++) {
      tot += arr[no];
    }
    let avg = tot / max;
    avgArr.push(avg);

    for (let no=0; no<(arr.length-max); no++) {
      tot = tot - arr[no] + arr[max+no];
      avgArr.push(tot / max);
    }
    return avgArr;
  }

  //-----------------------------------------------
  /*
    elevation{}
      gained	Elevation Gained	획득고도
      lowest	Lowest	최저고도
      highest	Highest	최고고도

			sensors = {
				a: altitude,
				c: cadence,
				s: speed,
				p: power,
				h: heart_rate,
			}
  */
  calculateElevation(sensors) {
    const elevate = {
      gained  : 0,
      lowest  : 999,
      highest : -999,
    }
    let total = 0;
    if (sensors == undefined || sensors.length == 0) return elevate;

    for (let no = 1; no < sensors.length; no++) {
      if (sensors[no-1].a < sensors[no].a) {
        elevate.gained += sensors[no].a - sensors[no-1].a;
      }
      if (sensors[no].a > elevate.highest) elevate.highest = sensors[no].a;
      if (sensors[no].a < elevate.lowest ) elevate.lowest  = sensors[no].a;
    }

    return elevate;
  }

  //-----------------------------------------------
  /*
  duration{}
    total	Duration	소요시간
    pz1	Duration in Power Zones	파워존
    pz2	Duration in Power Zones	파워존
    pz3	Duration in Power Zones	파워존
    pz4	Duration in Power Zones	파워존
    pz5	Duration in Power Zones	파워존
    pz6	Duration in Power Zones	파워존
    pz7	Duration in Power Zones	파워존
    hrz1	Duration in Heart Rate Zones	심박존
    hrz2	Duration in Heart Rate Zones	심박존
    hrz3	Duration in Heart Rate Zones	심박존
    hrz4	Duration in Heart Rate Zones	심박존
    hrz5	Duration in Heart Rate Zones	심박존
    hrz6	Duration in Heart Rate Zones	심박존
    hrz7	Duration in Heart Rate Zones	심박존
  */
  calculateDuration(sensors) {
    const value = {
      total : 0,
      pz1   : 0,
      pz2   : 0,
      pz3   : 0,
      pz4   : 0,
      pz5   : 0,
      pz6   : 0,
      pz7   : 0,
      hrz1  : 0,
      hrz2  : 0,
      hrz3  : 0,
      hrz4  : 0,
      hrz5  : 0,
      hrz6  : 0,
      hrz7  : 0,
    }

    return value;
  }

  //-----------------------------------------------
  /*
    grade	
      avg	Grade Average	평균 경사도
      max	Grade Max	최대 경사도
  */
  calculateGrade(sensors) {
    const value = {
      avg : 0,
      max  : 0,
    }

		let no = 0;
		for (const sensor of sensors) {
			if (sensor.d == 0) continue;
			const grade = sensor.a * 100 / sensor.d;
			value.avg += grade;
			if (value.max < grade) value.max = grade;
			// console.log("sensors=", sensor, grade, value.max);
		}
		value.avg = value.avg / sensors.length;

    return value;
  }

  //-----------------------------------------------
  /*
    power
      avg	Power Average	평균파워
      avgEstimated	Power Average	평균파워
      max	Power Max	최대파워
      maxSeconds{}	Power Max	최대파워
      np	NP	NP
      tss	TSS	TSS
      if	IF	IF
  */
  calculatePower(sensors) {
    const value = {
      avg : 0,
      avgEstimated : 0,
      max : 0,
      maxSeconds : 0,
      np : 0,
      tss : 0,
      if : 0,
    }
    if (sensors.length < 2) return value;

    let power = 0;
    let sec = 0;
    let totalEstimated = 0;
    let secEestimated = 0;
    sensors[0].p = sensors[0].p || 0;
		value.max = sensors[0].p;
		//----->
    for (let no = 1; no < sensors.length; no++) {
      sensors[no].p = sensors[no].p || 0;
      if (sensors[no].p > 0 && sensors[no].p != sensors[no-1].p) {
        totalEstimated += sensors[no].p;
        secEestimated++;
      }
      power += sensors[no].p;
			if (sensors[no].p > value.max) {
				value.max = sensors[no].p;
				value.maxSeconds = sec;
			}
      sec++;
    } // end for
    value.power = power;
    value.avg = power / sec;
    value.sec = sec;

    value.avgEstimated = totalEstimated / secEestimated;
    value.secEestimated = secEestimated;

    return value;
  }

  //-----------------------------------------------
  /*
    speed
      avg	Speed Average	평균속도: sum(거리) / seconds
      avgEstimated	Speed Average	평균속도
      max	Speed Max	최대속도
      maxSeconds{}	Speed Max	최대속도
  */
  calculateSpeed(sensors) {
    const value = {
      avg : 0,
      avgEstimated : 0,
      // max : 0,
      // maxEstimated : 0,
      sec: 0,
      secEestimated: 0 ,
      distance: 0,
    }
    if (sensors.length < 2) return value;

    let distance = 0;
    let sec = 0;
    let totalEstimated = 0;
    let secEestimated = 0;
		sensors[0].s = sensors[0].s || 0;
    for (let no = 1; no < sensors.length; no++) { // harversine
			sensors[no].s = sensors[no].s || 0;
      if (sensors[no-1].s != sensors[no].s) {
        totalEstimated += sensors[no].s;
        secEestimated++;
      }
      distance += sensors[no].s;
      sec++;
    // console.log(no, from, to, result);
    }
    value.distance = distance;
    value.avg = distance / sec;
    value.sec = sec;

    value.avgEstimated = totalEstimated / secEestimated;
    value.secEestimated = secEestimated;

    return value;
  }

  calculatePointsSpeed(points) {
    const value = {
      avg : 0,
      avgEstimated : 0,
      // max : 0,
      // maxEstimated : 0,
      sec: 0,
      secEestimated: 0 ,
      distance: 0,
    }
    if (points.length < 2) return value;

    let distance = 0;
    let sec = 0;
    let totalEstimated = 0;
    let secEestimated = 0;
    for (let no = 1; no < points.length; no++) {
      const dist = this.calculateDistance(
        { longitude: points[no-1][0], latitude: points[no-1][1] },
        { longitude: points[no][0],   latitude: points[no][1]   }
      ); // harversine
      if (points[no-1][0] != points[no][0] && points[no-1][1] != points[no][1]) {
        totalEstimated += distance;
        secEestimated++;
      }
      distance += dist;
      sec++;
    // console.log(no, from, to, result);
    }
    value.distance = distance;
    value.avg = distance / sec;
    value.sec = sec;

    value.avgEstimated = totalEstimated / secEestimated;
    value.secEestimated = secEestimated;

    return value;
  }

  //-----------------------------------------------
  /*
    cadence
      avg	Cadence Average	평균케이던스
      avgEstimated	Cadence Average	평균케이던스
      max	Cadence Max	최대케이던스
      maxSeconds{}	Cadence Max	최대케이던스
  */
  calculateCadence(sensors) {
    const value = {
      avg : 0,
      avgEstimated : 0,
      max : 0,
      maxSeconds : 0,
    }

    return value;
  }

  //-----------------------------------------------
  /*
    heartrate
      avg	Heartrate Average	평균심박
      avgEstimated	Heartrate Average	평균심박
      max	Heartrate Max	최대심박
      maxSeconds{}	Heartrate Max	최대심박
      min	Heartrate Min	최저심박
  */
  calculateHeartrate(sensors) {
    const value = {
      avg : 0,
      avgEstimated : 0,
      max : 0,
      maxSeconds : 0,
      min : 0,
    }

    return value;
  }

  //-----------------------------------------------
  /*
    betweens{}
      power5mins[]	Power	시간구간별평균파워
      power5kms[]	Power	거리구간별평균파워
      distance5mins[]	Distance	시간구간별이동거리
      timeKM[]	Time	킬로미터당소요시간
      restsCount[]	Rests	휴식회수
  */
	betweensRest(sensors) {
		// const min3 		= 60 * 3;
		// const min60 	= 60 * 60;
		// const min180 	= 60 * 180;
		// const min300 	= 60 * 300;
		// const min1800	= 60 * 1800;
		const min3 		= 3;
		const min60 	= 6;
		const min180 	= 9;
		const min300 	= 12;
		const min1800	= 15;

		let rest = {
			rest3			: 0,
			rest60		: 0,
			rest180		: 0,
			rest300		: 0,
			rest1800	: 0,
		}
		let count = {
			rest3			: 0,
			rest60		: 0,
			rest180		: 0,
			rest300		: 0,
			rest1800	: 0,
		}
		let flag = {
			rest3			: 0,
			rest60		: 0,
			rest180		: 0,
			rest300		: 0,
			rest1800	: 0,
		}
		//---------------------
		for (let no=0; no<sensors.length; no++) {
			if (sensors[no].s == 0) {
				count.rest3++;
				count.rest60++;
				count.rest180++;
				count.rest300++;
				count.rest1800++;

			} else {
				if (count.rest3 		>= min3		) rest.rest3++;
				if (count.rest60 		>= min60		) rest.rest60++;
				if (count.rest180 	>= min180	) rest.rest180++;
				if (count.rest300 	>= min300	) rest.rest300++;
				if (count.rest1800	>= min1800	) rest.rest1800++;
				
				count = {
					rest3			: 0,
					rest60		: 0,
					rest180		: 0,
					rest300		: 0,
					rest1800	: 0,
				}
				flag = {
					rest3			: 0,
					rest60		: 0,
					rest180		: 0,
					rest300		: 0,
					rest1800	: 0,
				}
			}
		} // end for
		if (count.rest3 		>= min3		) rest.rest3++;
		if (count.rest60 		>= min60		) rest.rest60++;
		if (count.rest180 	>= min180	) rest.rest180++;
		if (count.rest300 	>= min300	) rest.rest300++;
		if (count.rest1800	>= min1800	) rest.rest1800++;
		//---------------------
		console.log("~~~~~~~~~~~", rest);
		return rest;
	}

  calculateBetweens(sensors) {
    const value = {
      power5mins : 0,
      power5kms : 0,
      distance5mins : 0,
      timeKM : 0,
      restsCount : 0,
    }
		let betweens = {};

		betweens = this.betweensRest(sensors);

		//---------------------
		// 시간구간별평균파워
		//---------------------
		const min5 		= 3; // 60 * 5;
		let sum5min = [];
		for (let no=0; no<sensors.length; no+=min5) {
			let sum = 0;
			for (let no1=no; no1<(no+min5) && no1<sensors.length; no1++) {
				sum += sensors[no1].s; // <-----
				// console.log(no, no1, sensors[no1].s, sum, );
			}
			sum5min.push(sum / min5);
		}
		betweens.power5mins = sum5min;

		//---------------------
		// 거리구간별평균파워
		//---------------------
		const km5 		= 4; // 1000 * 5;
		let sum5km = [];
		for (let no=0; no<sensors.length; no+=km5) {
			let sum = 0;
			for (let no1=no; no1<(no+km5) && no1<sensors.length; no1++) {
				sum += sensors[no1].s; // <-----
				// console.log(no, no1, sensors[no1].s, sum, );
			}
			sum5km.push(sum / km5);
		}
		betweens.power5kms = sum5min;

		//---------------------
		// 시간구간별이동거리
		//---------------------
		const distance5min 		= 5; // 1000 * 5;
		let sumdistance5min = [];
		for (let no=0; no<sensors.length; no+=distance5min) {
			let sum = 0;
			for (let no1=no; no1<(no+distance5min) && no1<sensors.length; no1++) {
				sum += sensors[no1].s; // <-----
				// console.log(no, no1, sensors[no1].s, sum, );
			}
			sumdistance5min.push(sum / distance5min);
		}
		betweens.distance5mins = sumdistance5min;

		//---------------------
		// 킬로미터당소요시간
		//---------------------
		const timeKM 		= 6; // 1000 * 5;
		let sumTimeKM = [];
		for (let no=0; no<sensors.length; no+=timeKM) {
			let sum = 0;
			for (let no1=no; no1<(no+timeKM) && no1<sensors.length; no1++) {
				sum += sensors[no1].s; // <-----
				// console.log(no, no1, sensors[no1].s, sum, );
			}
			sumTimeKM.push(sum / timeKM);
		}
		betweens.timeKM = sumTimeKM;

		return betweens;
  }

  //-----------------------------------------------
  calculateActivitySensors(activity, times) {

    for (let no = 0; no < times.length; no++) {
      const sensor = times[no];
      const points  = activity.points.coordinates.slice(sensor.points.start, sensor.points.end);
      const sensors = activity.sensors.slice(sensor.points.start, sensor.points.end);
      // console.log("++++++", points, sensor[0].points.end - sensor[0].points.start);
  
      //----------------------------------------------
      sensor.elevation = this.calculateElevation(sensors);
  
      sensor.duration = this.calculateDuration(sensors);
  
      sensor.grade = this.calculateGrade(sensors);
  
      sensor.power = this.calculatePower(sensors);
  
      sensor.speed = this.calculateSpeed(sensors);
  
      sensor.cadence = this.calculateCadence(sensors);
  
      sensor.heartrate = this.calculateHeartrate(sensors);
  
      sensor.betweens = this.calculateBetweens(sensors);
  
      sensor.datetime = new Date();
  
      console.log("++++++ sensor:", sensor);
      break;
    }
  }

  //-----------------------------------------------
  calculateSensors(sensors) {

		const sensor = {};
     //----------------------------------------------
		 sensor.elevation = this.calculateElevation(sensors);
  
		 sensor.duration = this.calculateDuration(sensors);
 
		 sensor.grade = this.calculateGrade(sensors);
 
		 sensor.power = this.calculatePower(sensors);
 
		 sensor.speed = this.calculateSpeed(sensors);
 
		 sensor.cadence = this.calculateCadence(sensors);
 
		 sensor.heartrate = this.calculateHeartrate(sensors);
 
		 sensor.betweens = this.calculateBetweens(sensors);
 
		 sensor.datetime = new Date();

		 return sensor;
 	}

  //-----------------------------------------------
  elevationTotal(eleArr) {
    let total = 0;
    if (eleArr.length == 0) return total;

    let old = eleArr[0];
    for (const el of eleArr) {
      if (el > old) {
        total += el - old;
      }
      old = el;
    }

    return total;
  }

  //-----------------------------------------------
  elevationOld(eleArr) {
    let total = 0;
    if (eleArr == undefined || eleArr.length == 0) return total;

    let old = eleArr[0];
    for (const el of eleArr) {
      if (el > old) {
        total += el - old;
        old = el;
      }
    }

    return total;
  }

  //-----------------------------------------------
  convertSensor2activity(fitdata) {
    //-----------------------------------
		fitdata.user_profile = fitdata.user_profile || {};
    const activity = {
      activityID  			: 0,
      name        			: fitdata.name || "",
      user_profile			: {
        friendly_name   : fitdata.user_profile.friendly_name || "",
        language        : fitdata.user_profile.language || "",
        elev_setting    : fitdata.user_profile.elev_setting || "",
        weight_setting  : fitdata.user_profile.weight_setting || "",
        speed_setting   : fitdata.user_profile.speed_setting || "",
      },
      activity_timestamp: fitdata.activity.timestamp,
      sessions          : [],
      laps              : [],
      boundary          : [], // { [min_longitude, min_latitude], [max_longitude, max_latitude] }
    };
		const sensors = [];
		const points= { type: "LineString", coordinates: [] }; // MultiLineString
		const boundary = { max_long: -999, max_lat: -999, min_long: 999, min_lat: 999 };
    let lno = 0;
    let sno = 0;
    fitdata.activity.sessions.forEach(session => {
			/*
			timestamp
			start_time
			start_position_lat
			start_position_lat
			total_elapsed_time
			total_timer_time
			total_distance
			total_cycles
			nec_lat
			nec_long
			swc_lat
			swc_long
			total_work
			time_in_hr_zone:[]
			time_in_power_zone:[]

			*/
      const sess = {
        sessionNo             : sno,
        total_distance        : session.total_distance || 0,
        total_cycles          : session.total_cycles || 0,
        nec_lat               : session.nec_lat || 0,
        nec_long              : session.nec_long || 0,
        swc_lat               : session.swc_lat || 0,
        swc_long              : session.swc_long || 0,
        avg_speed             : session.avg_speed || 0,
        max_speed             : session.max_speed || 0,
        avg_power             : session.avg_power || 0,
        max_power             : session.max_power || 0,
        avg_cadence           : session.avg_cadence || 0,
        max_cadence           : session.max_cadence || 0,
        total_ascent          : session.total_ascent || 0,
        total_descent         : session.total_descent || 0,
        normalized_power      : session.normalized_power || 0,
        training_stress_score : session.training_stress_score || 0,
        intensity_factor      : session.intensity_factor || 0,
      }
      activity.sessions.push(sess);

      session.laps.forEach(lap => {
        const lp = {
          lapNo	                    : lno,
          timestamp	                : lap.timestamp,
          start_time	              : lap.start_time,
          start_position_lat	      : lap.start_position_lat,
          start_position_long	      : lap.start_position_long,
          end_position_lat	        : lap.end_position_lat,
          end_position_long	        : lap.end_position_long,
          total_elapsed_time	      : lap.total_elapsed_time,
          total_timer_time	        : lap.total_timer_time,
          total_distance	          : lap.total_distance,
          total_cycles	            : lap.total_cycles,
          total_work	              : lap.total_work,
          time_in_hr_zone	          : lap.time_in_hr_zone,
          time_in_power_zone	      : lap.time_in_power_zone,
          avg_left_power_phase	    : lap.avg_left_power_phase,
          avg_left_power_phase_peak	: lap.avg_left_power_phase_peak,
          avg_right_power_phase	    : lap.avg_right_power_phase,
          avg_right_power_phase_peak: lap.avg_right_power_phase_peak,
          message_index	            : lap.message_index,
          total_calories	          : lap.total_calories,
          total_fat_calories	      : lap.total_fat_calories,
          avg_speed	                : lap.avg_speed,
          max_speed	                : lap.max_speed,
          avg_power	                : lap.avg_power,
          max_power	                : lap.max_power,
          total_ascent	            : lap.total_ascent,
          total_descent	            : lap.total_descent,
          normalized_power	        : lap.normalized_power,
          left_right_balance	      : lap.left_right_balance,
          event	                    : lap.event,
          event_type	              : lap.event_type,
          avg_cadence	              : lap.avg_cadence,
          max_cadence	              : lap.max_cadence,
          intensity	                : lap.intensity,
          lap_trigger	              : lap.lap_trigger,
          sport	                    : lap.sport,
          sub_sport	                : lap.sub_sport,
          avg_fractional_cadence	  : lap.avg_fractional_cadence,
          max_fractional_cadence	  : lap.max_fractional_cadence,
          avg_cadence_position	    : lap.avg_cadence_position,
          max_cadence_position	    : lap.max_cadence_position,
        }

				// lp.records = lap.records;
        activity.laps.push(lp);

				let old_long = 0.0, old_lat = 0.0;
				if (lap.records.length > 0) {
					old_long = lap.records[0].position_long || 0.0;
					old_lat  = lap.records[0].position_lat || 0.0;
				}
        lap.records.forEach(record => {
          const point = [
            record.position_long == undefined ? old_long : record.position_long,
            record.position_lat  == undefined ? old_lat : record.position_lat,
          ];
          points.coordinates.push(point);
          old_long = point[0];
          old_lat  = point[1];

          const sensor = {};
          if (record.altitude)    sensor.a = record.altitude;
          if (record.cadence)     sensor.c = record.cadence;
          if (record.speed)       sensor.s = record.speed;
          if (record.power)       sensor.p = record.power;
          if (record.heart_rate)  sensor.h = record.heart_rate;
          sensors.push(sensor);

          if (record.position_long > boundary.max_long) boundary.max_long = record.position_long;
          if (record.position_lat  > boundary.max_lat)  boundary.max_lat  = record.position_lat;
          if (record.position_long < boundary.min_long) boundary.min_long = record.position_long;
          if (record.position_lat  < boundary.min_lat)  boundary.min_lat  = record.position_lat;
          lno++;
        })
        sno++;
      })
    })

    activity.boundary = [
      [ boundary.min_long, boundary.min_lat ],
      [ boundary.min_long, boundary.max_lat ],
      [ boundary.max_long, boundary.max_lat ],
      [ boundary.max_long, boundary.min_lat ],
      // [ boundary.min_long, boundary.min_lat ],
    ];
    // console.log(activity.boundary);
    activity.boundary = [
      [ boundary.min_long, boundary.min_lat ],
      [ boundary.max_long, boundary.max_lat ],
    ];

    return { activity, sensors, points };
  }

  //-----------------------------------------------
  convertGeo2json(geoArr) {
    const jsonArr = [];
    geoArr.forEach(geo => {
      jsonArr.push({ latitude: geo[1], longitude: geo[0] });
    })
    return jsonArr;
  }

  //-----------------------------------------------
  // segments: [ [long, lat], [], [], ...]
  // activity points: [ [long, lat], [], [], ...]
  checkSegmentInActivities(segment, points, margin=10) {

    //-----> count는 반복 횟수
    if (isNaN(segment.count)) segment.count = 1;

    let checkPoints = [];
    for (let no = 0; no < segment.count; no++) {
      checkPoints = [ ...checkPoints, ...segment.checkPoints ];
    }
    // console.log("checkSegmentInActivities.segment=", segment);
    // console.log("checkSegmentInActivities.checkPoints=", checkPoints);

    let pointsNo = [];
    let cpno = 0;
    //----->
    for (let pno = 0; pno < points.length; pno++) {
      const distance = haversine(
                          { longitude: checkPoints[cpno][0],  latitude: checkPoints[cpno][1] },
                          { longitude: points[pno][0],         latitude: points[pno][1] },
                          { unit: 'meter' }, // 'km', 'mile', 'meter'
                        ); 
      // if (distance > margin) {
      //   console.log("exclude> segmentID=", segment.segmentID, "distance=", distance, "points=", points[pno], "checkPoints=", checkPoints[cpno]);
      //   return { start: -1 };
      // }
      if (distance <= margin) {
        pointsNo.push(pno);  // segment에 해당하는 points의 no 저장
        if (++cpno >= checkPoints.length) {
          return { start: pointsNo[0], end: pointsNo[checkPoints.length - 1]};
        }
      }
    } // end for
    //----->
    return { start: -2 };
  }

  //-----------------------------------------------
  // haversine formular
  /*
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
  */
 // coordinate:  [<longitude>, <latitude>]
  calculateDistance(from, to) 
  {
		if (from.longitude == undefined) {
			from = {
				longitude: from[0],
				latitude: from[1],
			}
		}
		if (to.longitude == undefined) {
			to = {
				longitude: to[0],
				latitude: to[1],
			}
		}

    const _radius = 6371; // km
    const _mathPi = Math.PI / 180;

    const dLat    = (to.latitude - from.latitude) * _mathPi / 2;
    const dLon    = (to.longitude - from.longitude) * _mathPi / 2;
    const fromLat = from.latitude * _mathPi;
    const toLat   = to.latitude * _mathPi;

    var a = Math.sin(dLat) * Math.sin(dLat) +
            Math.sin(dLon) * Math.sin(dLon) * Math.cos(fromLat) * Math.cos(toLat); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = _radius * c; // in meters
    // const distance = haversine(from, to, { unit: 'meter' },); // 'km', 'mile', 'meter'

    // console.log(from, to, "haversine=", haversine(from, to, { unit: 'meter' },), "my=", d * 1000);
    return d * 1000; // meter
  }

  //-----------------------------------------------
  parseFIT (fitData) {
		console.log("parseFIT start...");
    return new Promise((resolve, reject) => {
      //------------------------------- Parse your file
      // Create a FitParser instance (options argument is optional)
      var fitParser = new FitParser({
        force: true,
        speedUnit: 'km/h',
        lengthUnit: 'km',
        temperatureUnit: 'kelvin',
        elapsedRecordField: true,
        mode: 'cascade',
      });

      //------------------------------- Parse your file
			fitParser.parse(fitData, (fiterr, data) => {
// console.log("~~~~", data);		
				// Handle result of parse method
				if (fiterr) {
					console.log("fit parser error.", fiterr);
					console.log("parseFIT reject...");
					reject(null);
				} else {
					if (data.activity.sessions.length == 0) {
						console.log("fitParser.parse+++++++++++++++++++++++, data.activity.sessions.length=0");
						reject(null);
					} else {
						try {
							//------------------------------------
							//	{ activity, sensors, point }
							//------------------------------------
							const activities = this.convertSensor2activity(data);
							console.log("parseFIT resolve...");
							// resolve(activities);
							resolve({ fit: data, ...activities });
						} catch (error) {
							console.log("\n\n\nfit.laps.catch=", error); // , JSON.stringify(data, null, " "));
							console.log("parseFIT reject...");
							reject(null);
						}
					}
				}
			}) // fitParser
      //------------------------------- Parse your file

    }) // promise
  }

  //-----------------------------------------------
  parseGPX (content) {
    return new Promise((resolve, reject) => {
      gpxParse.parseGpxFromFile(filename, (error, data) => {
        if (error) {
          console.log("GPX parser error.", error);
        } else {
          resolve(data);
        }
      })
    }) // promise
  }

  //-----------------------------------------------
  parseCSV (content) {
    return new Promise((resolve, reject) => {
      gpxParse.parseGpxFromFile(filename, (error, data) => {
        if (error) {
          console.log("GPX parser error.", error);
        } else {
          resolve(data);
        }
      })
    }) // promise
  }

  //-----------------------------------------------
  async findSegments (boundary) {
    const segments = [];
  // console.log(boundary);
    /*
      db.getCollection('segments').find({
        checkPoints: { 
          $geoWithin: {
              $geometry : {
                  type : "Polygon",
                  coordinates : [[
                      [126.99318, 37.54913], 
                      [126.98214,  37.54913], 
                      [126.98214,  37.55228],
                      [126.99318, 37.54913]
                  ]]
              }
            }
          }  
      })
    */

    const query = {
      checkPoints: { 
        $geoWithin: {
          $geometry : {
            type : "Polygon",
            coordinates : [ boundary ]
          }
        }
      }
    };
    // const query = {
    //   checkPoints: { 
    //     $geoWithin: {
    //       $boundary : boundary
    //     }
    //   }
    // };
    // console.log(JSON.stringify(query, null, '\t'));

    const context = {
      query       : query,
      projection  : { _id:0, },
      sort        : { segmentID: 1, },
      skip        : 0,
      limit       : 10000,
    }
    console.log("context=", JSON.stringify(context, null, '\t'));

    //--------------------------------------------------------
    const result = await mongodb.find(mongoCFG.Medalbank.segments, context);
    //--------------------------------------------------------
    if (result.message || result.data.length == 0) {
      console.log("segments not found!!", result.message);
      return segments;
    }

    //----->
    result.data.forEach(data => {
      let checkPoints = data.checkPoints.coordinates;
      if(data.checkPoints.coordinates[0].constructor !== Array) {
        checkPoints = [ checkPoints ];
      }
      segments.push({ segmentID: data.segmentID, checkPoints: checkPoints });
      // console.log("segments in boundary.", data.segmentID);
    })
    //----->

    return segments;
  }


  //-----------------------------------------------
  async findActivities (segment) {
    console.log("===============");
    const segments = [];
    /*
      db.getCollection('activities').find({
        points: { 
          $nearSphere: {
              $geometry : {
                type : "Point",
                coordinates: [ 126.797021962702, 37.595870308578 ]
              },
              $maxDistance : 10
            }
          }
      })
    */
    
    let query = {
      points: { 
        $nearSphere: {
          $geometry : {
            type : "Point",
            coordinates : segment.checkPoints.coordinates[0], // [segment.checkPoints.coordinates[0][1], segment.checkPoints.coordinates[0][0]],
          },
          $maxDistance : 10
        }
      }
    }

    const context = {
      query       : query,
      projection  : { _id:0, },
      sort        : { activityID: 1, },
      skip        : 0,
      limit       : 100,
    }

    //--------------------------------------------------------
    const result = await mongodb.find(mongoCFG.Medalbank.activities, context);
    //--------------------------------------------------------
    if (result.message || result.data.length == 0) {
      // console.log("activities not found!!", result.message);
      return result;
    }
    //----->
    // console.log("+++++++", result);

    return result;
  }

  //-----------------------------------------------
  async findActivities1 (segment) {
    const segments = [];
  // console.log(boundary);
    /*
      db.getCollection('activities').find({
        points: { 
          $nearSphere: {
              $geometry : {
                  type : "Point" ,
                  coordinates : [ 126.98214, 
                      37.55228 ]
              },
              $maxDistance : 10
            }
          }  
      })
    */

    const query = {
      points: { 
        $nearSphere: {
          $geometry : {
            type : "Point" ,
            coordinates : [ 126.98214, 37.55228 ]
          },
          $maxDistance : 10
        }
      }  
    };
    // console.log(JSON.stringify(query, null, '\t'));

    const context = {
      query       : query,
      projection  : { _id:0, },
      sort        : { segmentID: 1, },
      skip        : 0,
      limit       : 10000,
    }

    //--------------------------------------------------------
    const result = await mongodb.find(mongoCFG.Medalbank.segments, context);
    //--------------------------------------------------------
    if (result.message || result.data.length == 0) {
      console.log("segments not found!!", result.message);
      return segments;
    }

    //----->
    result.data.forEach(data => {
      let points = data.checkPoints.coordinates;
      if(data.checkPoints.coordinates[0].constructor !== Array) {
        points = [ points ];
      }
      segments.push({ segmentID: data.segmentID, points: points });
      console.log("segments in boundary.", data.segmentID);
    })
    //----->

    return segments;
  }

}

module.exports = GeoLibrary;
