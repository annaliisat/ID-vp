
const dateFormattedET = function(useFolk){
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	//kuunimed
	const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
	const folkMonthNames = ["südakuu", "radokuu", "urbekuu", "jürikuu", "lehekuu", "jaanipäevakuu", "heinakuu", "lõikuskuu", "mihklikuu", "viinakuu", "talvekuu", "jõulukuu"
	]
	
	let monthName;
	if(useFolk === 1){
		monthName = folkMonthNames[monthNow];
	} else {
		monthName = monthNamesET[monthNow];
	}
	return dateNow + `.`+ monthNamesET[monthNow] + " " + yearNow 
}

const addLeadZero = function(numValue){
	if(numValue < 10){
		numValue = '0' + numValue;
		//numValue = numValue.padStart(2, '0');
	}
	return numValue;
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	let timeFormatted = hourNow + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
	return timeFormatted;
}

const weekdayET = function(){
	let timeNow = new Date();
	
	const weekDays = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
	
	return weekDays[timeNow.getDay()];
}

//ekspordin kõik vajalikud funktsioonid koos mugavamate nimedega
module.exports = {time: timeFormattedET, date: dateFormattedET, weekday: weekdayET};