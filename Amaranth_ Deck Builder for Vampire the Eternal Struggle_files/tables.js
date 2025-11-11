function calctables(players) {
	if(players <= 6) {
		return [players]
	}
	
	var tables = []

	// Check for perfect seating
	if(players % 5 == 0){
		for(var i = 0; i < players / 5; i++){
			tables.push(5)
		} 
		return tables 
	}

	else if(players % 4 == 0){
		for(var i = 0; i < players / 4; i++){
			tables.push(4)
		} 
		return tables 
	}

	switch(players) {
		case 7:
			return [4, 3]
		case 11:
			return [4, 4, 3]
	}


	var perfectTables = Math.floor(players / 5.0)
	var remainder = players - (perfectTables * 5)

	for(var i = 0; i < perfectTables; i++){
		tables.push(5)
	}

	if(remainder < 4) {
		for(var i = tables.length - 1; remainder++ < 4; i--) {
			tables[i % tables.length]--
		}
		remainder--
	}

	tables.push(remainder)

	return tables

}

function calcPlayerCSS(player, players){
	if(player == undefined) return ''

	// Dial
	var dialLength = 30
	var dialAngle  = 360 * ((player + 1) / players)
	var x1 = 50
	var y1 = 50
	var x0 = dialLength * Math.cos((dialAngle + 90) * Math.PI / 180) + x1;
	var y0 = dialLength * Math.sin((dialAngle + 90) * Math.PI / 180) + y1;

	return 'top: ' + y0 + '%; left: ' + x0 + '%;'

}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

if(0) for(var i = 1; i <  50; i++) {
	var t = calctables(i)
	console.log(
		i + ' players', t
	)	
}


