
var Backend = (function() {

	var getRandomData = function(amount) {

		var promise = new Promise(function(resolve, reject) {       

			var request = new XMLHttpRequest();

			request.open("GET", "http://www.filltext.com?rows="+amount+"&id={randomString}&fname={firstName}&lname={lastName}&company={business}&city={city}&address={streetAddress}&email={email}&ip={ip}", true);

			request.onreadystatechange = function () {

				request.onload = function() {
					if (request.status == 200) {
						resolve(JSON.parse(request.response)); // we got data here, so resolve the Promise
					} else {
						reject(Error(request.statusText)); // status is not 200 OK, so reject
					}
				};

				request.onerror = function() {
					reject(Error('Error fetching data.')); // error occurred, reject the  Promise
				};
			};

			request.send();

		});  

		return promise;		
	}

	return {
		getRandomData: getRandomData
	}

}());

module.exports = Backend;