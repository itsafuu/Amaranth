
/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
var UUID = (function() {
  var self = {};
  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
  self.generate = function() {
	var d0 = Math.random()*0xffffffff|0;
	var d1 = Math.random()*0xffffffff|0;
	var d2 = Math.random()*0xffffffff|0;
	var d3 = Math.random()*0xffffffff|0;
	return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
	  lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
	  lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
	  lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  }
  return self;
})();

var app = function(){}

app.title = 'Amaranth: Deck Builder for Vampire the Eternal Struggle'
app.root               = ''
app.whatsnew           = 26
app.default_deckorder  = 'modified'
app.default_cryptorder = 'oldest'
app.cache_version      = 0.15

// app.allowpublic = 1

app.url  = function(url){
	return app.root + url 
}

app.callapi = function(url,a,b,c) {
	url = app.url(url)

	var extra = {} || {
		'view-id':    app.id,
		'user-id':    app.user.id,
		'device-id':  app.device.id,
		'session-id': app.session.id,
		'key':        app.session.key
	} 

	$.ajaxSetup({headers:extra});
	
	if(a && typeof a == 'function' || !a){
		var af = a
		a = function(x1,x2,x3){
			if(!x1.success && x1.error){
				console.warn(x1.error.message,x1.error.stack)

				// User is not logged server side
				if(x1.error.message == 'Please login' || x1.error.message == 'Access not permitted') {
					return app.login(function(){ app.callapi(url,a,b,c) }, true)
				}
			}
			if(af) {
				af(x1,x2,x3)				
			}
		}
	} else if(b && typeof b == 'function' || !b){
		var bf = b
		b = function(x1,x2,x3){
			if(!x1.success && x1.error){
				console.warn(x1.error.message,x1.error.stack)

				// User is not logged server side
				if(x1.error.message == 'Please login' || x1.error.message == 'Access not permitted') {
					return  app.login(function(){ app.callapi(url,a,b,c) }, true)
				}
			}

			if(bf) bf(x1,x2,x3)
		}
	}

	return $.post(url,a,b,c)
}

app.bind = function(){
	$('.mdl-navigation__link').not('.init').addClass('init').bind('click', function(e){
		e.preventDefault()
		e.stopPropagation()
		app.hidedrawer()
		
		riot.route($(this).attr('href'))
	})

	$('span.whatsnew').on('click', function(){
		riot.route('/whatsnew')
	})

	riot.mount('login-status')

}


app.hidedrawer = function(){
	$('.mdl-layout__drawer').removeClass('is-visible')
	$('.mdl-layout__obfuscator').removeClass('is-visible')	
}

app.load = function(){
	app.decks = store.get('decks') || []
	app.cardinfo = store.get('cardinfo') || {}
}

///////////////////////////////////////////////////////////
//
//	Ready
//
///////////////////////////////////////////////////////////


app.ready = function() {

	app.ready = function(){}

	console.log('app.ready')

	app.user = {}
	app.session = {}
	app.iscordova = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;


	// Ensure we have a session to work with
	var session = store.get('session') || {}
	app.session = session

	// Ensure we have a session to work with
	var user = store.get('user') || {}
	app.user = user

	// Ensure we have a device id to work with
	var device = store.get('device')
	if(!device){
		device = {
			id: app.deviceID()
		}
		store.set('device',device)
	}
	app.device = device

	// Reset Deck Route
	if(window.location.hash.indexOf('#deck/') == 0) {
		var hash = '#deck/' + window.location.hash.split('/')[1]
		if(window.location.hash != hash) {
			window.location = hash
		}
	}

	// Start the router
	riot.route.start(true)

	app.offset = store.get('offset') || 0

	// Include offline data
  	if(app.iscordova){
		$('body').append(
			'<script src="./cordova.js"></script>' +
			'<script src="./js/app.cordova.js"></script>' + 
			'<script src="./js/detail.pack.js"></script>'
		)
  	}

  	else {
  		// Check if we should reload the cach
		if(store.get('cache_version') != app.cache_version) {
			store.set('cache_version', app.cache_version)
			app.cardinfo = {}
			store.remove('cardinfo')
		}
  	}

  	// pt mode
	app.pt()  	

  	// Load the twda
	var s     = document.createElement('script')
	s.onload  = function(e){ console.log('loaded twda'); (new twda).ratecards()}
	s.onerror = function(e){ console.warn('unable to load twda', e) }
	s.src     = './js/twda.pack.js'
	document.querySelector('header').appendChild(s)
	
  	// Dedupe decks
  	var existing = []

  	if(app.decks) {
  		app.decks.forEach(function(deck){
  			if(~existing.indexOf(deck.uuid)) {
				var i = app.decks.indexOf(deck)
				if(i != -1) app.decks.splice(i, 1)  				
  			}
  			existing.push(deck.uuid)
		})	  	
	}

  	// Update deck list
	app.syncdecks()

	// Load the search index
	$('body').append(
		'<script src="Amaranth_%20Deck%20Builder%20for%20Vampire%20the%20Eternal%20Struggle_files/keywords.pack.js"></script>'
	)		

	// Load rulings
	$('body').append(
		'<script src="Amaranth_%20Deck%20Builder%20for%20Vampire%20the%20Eternal%20Struggle_files/rulings.pack.js"></script>'
	)		

	$(document).keydown(function (e) {
		if (e.keyCode == 16) {
			app.shift = true
		}
	})
	
	$(document).keyup(function (e) {
		if (e.keyCode == 16) {
			app.shift = false
		}
	})	

	app.on('decks', function(){
		riot.vdom.forEach(function(tag){
			if(tag.opts.dataIs == 'deck') tag.update() 
		})
	})
}

// Now redundant
app.pt = function(){
	//$('body').append(
	//	'<script src="./js/pt.cards.pack.js?2024"></script>' + 
	//	'<script src="./js/pt.detail.pack.js?2024"></script>' + 
	//	'<script src="./js/pt.keywords.pack.js?2024"></script>'
	//)
	app.pt = function(){}
}

app.iscordova = document.URL.indexOf('http://')  === -1 && document.URL.indexOf('https://') === -1;

app.deviceID = function(){
	return UUID.generate()
}

app.save = function(){
	store.set('user', app.user)
	store.set('decks', app.decks)
}

app.mount = function(tag, opts){	
	// Unmound existing tags
	app.unmount()

	// Mount new
	var dom = document.createElement(tag)
	riot.mount(dom, tag, opts)

	// Set dom content
	var contentEl = $('#content')
	contentEl.html(dom)
	if(contentEl[0]) {
		contentEl[0].scrollTop = 0
	}

	// Handle MDL
	componentHandler.upgradeDom()
}

app.append = function(tag, opts){	

	// Mount new
	var dom = document.createElement(tag)
	riot.mount(dom, tag, opts)

	// Set dom content
	$('body').append(dom)

	// Handle MDL
	componentHandler.upgradeDom()

}

app.unmount = function(){
	riot.vdom.forEach(function(mnt){
		if(mnt.root.tagName != 'LOGIN-STATUS' && !$(mnt.root).parent().hasClass('modal')) {
			mnt.unmount()
		}
	})
}

app.newdeck = function(){

	var author = ((app.user.firstname || '') + ' ' +  (app.user.lastname || '')).trim()

	var deck = {
		uuid: UUID.generate(),
		title: 'New Deck',
		description: '',
		author: author,
		cards: {}
	}

	app.decks.push(
		deck
	)

	app.deck = deck

	app.save()

	return deck
}

app.highlight = function(text){

	if (!text) {
		return text
	}
	
	var regexp 
	var allowed = [
		{domain: 'vekn.net', 			name: 'VEKN'},
		{domain: 'vtesone.',  			name: 'VTES One'},
		{domain: 'secretlibrary',  		name: 'Secret Library'},
		{domain: 'www.vekn.fr',  		name: 'TWA'},
		{domain: 'amaranth.vtes.co.nz',  name: 'Amaranth'}
	]

	// Deal with hyperlinks
	regexp = /(?:https?|ftp|file):\/\/([-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	
	text = text.replace(regexp, function(href,url){
		var OK = 0
		allowed.forEach(function(match){
			if(url.indexOf(match.domain) != -1) {
				url = match.name
				OK = 1
			}
		})

		if(!OK) return ''
	    return '<a href="' + href + '" target="_system" class="mdl-button mdl-js-button mdl-color-text--primary"><i class="material-icons">&#xE89E;</i> ' + url + '</a>'
	})

	// Deal with www. links
	regexp = /[\/>]?www\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/ig;
	text = text.replace(regexp, function(m){
		var OK = 0
		var url = m 

		allowed.forEach(function(match){
			if(url.indexOf(match.domain) != -1) {
				url = match.name
				OK = 1
			}
		})

		if(!OK) return ''
	  	return m.indexOf('www.') === 0 ? '<a href="http://' + m + '" target="_system"  class="mdl-button mdl-js-button mdl-color-text--primary"><i class="material-icons">&#xE89E;</i> ' + url + '</a>' : m
	})

	return text 
}

app.getcardinfo = function(id, callback) {
	var card = app.cardinfo[id]

	if(card) {
		callback(card)
	} 

	else {
		// Try to get from local cardindex first (for offline use)
		if(window.cardindex && window.cardindex[id]) {
			var sourceCard = window.cardindex[id]
			// Create a clean copy without circular references
			var card = {
				id: sourceCard.id,
				name: sourceCard.name,
				type: sourceCard.type,
				disc: sourceCard.disc,
				capacity: sourceCard.capacity,
				group: sourceCard.group,
				clan: sourceCard.clan,
				sect: sourceCard.sect,
				title: sourceCard.title,
				text: sourceCard.text,
				icons: sourceCard.icons,
				iscrypt: sourceCard.iscrypt,
				islibrary: sourceCard.islibrary,
				isminion: sourceCard.isminion,
				pool: sourceCard.pool,
				blood: sourceCard.blood,
				burn: sourceCard.burn,
				strength: sourceCard.strength,
				bleed: sourceCard.bleed,
				stealth: sourceCard.stealth,
				intercept: sourceCard.intercept,
				flight: sourceCard.flight,
				black_hand: sourceCard.black_hand,
				red_list: sourceCard.red_list,
				infernal: sourceCard.infernal,
				scarce: sourceCard.scarce,
				banned: sourceCard.banned,
				sets: sourceCard.sets,
				adv: sourceCard.adv,
				imagefile: sourceCard.imagefile || sourceCard.name.toLowerCase().replace(/[^a-z0-9]/g, '')
			}
			app.cardinfo[card.id] = card
			callback(card)
		}
		else {
			app.callapi('/api/card/' + id, function(response){
				if(response.success) {
					var card = response.result 
					app.cardinfo[card.id] = card 
					store.set('cardinfo', app.cardinfo)
					callback(card)
				}
			})
		}
	}

}

app.login = function(onsuccess, warn){

	if(warn && app.user.id) {
		swal({
			type: 'warning',
			title: 'Session Expired',
			text: 'Please login again...',
			timer: 1500
		}).done()
	}

	setTimeout(function(){		
		var dom = document.createElement('login')
		riot.mount(dom, 'login', {
			onsuccess: function(){
				app.syncdecks(true)
				app.trigger('loginstatus')		
				onsuccess()
			}
		})
		app.setmodal(dom, function(modal){
			modal.css({
				'max-width': '380px',
	    		'margin-left': '-190px'
			})
		})
	}, warn && app.user.id ? 2000 : 1)

}

app.cryptcards = function(filter){
	return  window.cards.filter(function(card){ 
				if(
					( card.type == 'Vampire' || card.type == 'Imbued'  ) && (!filter || filter(card) )
				) {
					//setnextprev(card)
					return true 
				}
			})
}

app.sortcrypt = function(crypt, order, deck) {
	if(order && order != 'name') {
		crypt.sort(function(a, b){
			switch(order) {
				case 'quantity':
					if(deck) {					
						return deck.cards[a.id] < deck.cards[b.id] ? 1 : -1  
						break
					}
				case 'capacity':
					return a.capacity < b.capacity ? 1 : -1  // Big to small
					break

				case 'oldest':
					return a.capacity < b.capacity ? 1 : -1  // Big to small
					break
				case 'youngest':
					return a.capacity > b.capacity ? 1 : -1  // Big to small
					break
				case 'group':
					return a.group > b.group ? 1 : -1 
					break
				case 'rank':
					if(!a.rank && !b.rank) return 0 
					return (a.rank || 99999) < (b.rank || 99999) ? 1 : -1 
					break
				case 'rating':
					if(!a.rating && !b.rating) return 0
					return (a.rating || 0) < (b.rating || 0) ? 1 : -1 
					break
				case 'clan':
					return a.clan > b.clan ? 1 : -1 
					break
				default:
					return a.name > b.name ? 1 : -1 
			}
		}) 
	}
}

app.sortlibrary = function(crypt, order, deck) {
	if(order && order != 'name') {
		crypt.sort(function(a, b){
			switch(order) {
				case 'quantity':
					if(deck) {					
						return deck.cards[a.id] < deck.cards[b.id] ? 1 : -1  
						break
					}
				case 'discipline':
					return a.disc > b.disc || !a.disc ? 1 : -1  
					break
				case 'type':
					return a.type > b.type ? 1 : -1 
					break
				case 'rank':
					if(!a.rank && !b.rank) return 0 
					return (a.rank || 99999) < (b.rank || 99999) ? 1 : -1 
					break
				case 'rating':
					if(!a.rating && !b.rating) return 0
					return (a.rating || 0) < (b.rating || 0) ? 1 : -1 
					break
				case 'clan':
					return a.clan > b.clan || !a.clan? 1 : -1 
					break
				default:
					return a.name > b.name ? 1 : -1 
			}
		}) 
	}
}

app.sortdecks = function(decks, order) {
	if(order) {
		decks.sort(function(a, b){
			switch(order) {
				case 'name':
					var A = a.title.toLowerCase()
					var B = b.title.toLowerCase()
					if (A < B) return -1
					if (A > B) return 1;
					return 0
					break;
				case 'modified':

					if(a.modified || b.modified) {
						return (a.modified || '0') < (b.modified || '0') ? 1 : -1 // New to old
					}

					return a.id < b.id ? 1 : -1 // New to old
				case 'newest':
					return a.id < b.id ? 1 : -1 // New to old
					break
				case 'oldest':
					return a.id > b.id ? 1 : -1 
					break
			}
		}) 
	}
}


app.get_user_setting = function(setting) {
	try {
		if(setting == 'use_old_cards') {
			return '1'
			// Unreachable code removed - console.log was after return
		}
		// Add safety check for undefined app.user or app.user.settings
		if(!app.user || !app.user.settings) {
			if(setting == 'use_old_cards') {
				return '1'
			}
			return undefined
		}
		return app.user.settings[setting]
	} catch(e){
		if(setting == 'use_old_cards') {
			return '1'
		}

		console.warn(e)
	}
}



app.set_user_setting = function(setting, value, skip) {

	// Store locally
	if(!app.user.settings) {
		app.user.settings = {}
	}
	app.user.settings[setting] = value 

	// Settings buffer
	if(!app.user_settings_to_write) {
		app.user_settings_to_write = {}
	}

	app.user_settings_to_write[setting] = value

	clearInterval(app.user_settings_write_int)
	clearInterval(app.user_settings_remote_int)
	
	app.user_settings_write_int = setTimeout(function(){	
		app.save()
	}, 3 * 1000)

	app.user_settings_remote_int = setTimeout(function(){	
		if(!skip && app.user.id) {	
			app.callapi('/api/writesettings', app.user_settings_to_write, function(response){
				user_settings_to_write = {}
			})
		}
	}, 30 * 1000)

}



app.librarycards = function(filter){
	return  window.cards.filter(function(card){ 
				if(
					( card.type != 'Vampire' && card.type != 'Imbued'  ) && (!filter || filter(card) )
				) {
				//	setnextprev(card)
					return true 
				}
			})
}

app.quickstart = function(){
	riot.route('/quickstart', 'Quick Start Decks')
}

app.showstories = function(){
	riot.route('/storylines', 'Story lines')
}

app.showtwda = function(){
	riot.route('/twda', 'Tournament Winning Decks')
}

app.showinsights = function(){
	riot.route('/insights', 'Insights')
}

app.about = function(){
	riot.route('/about')
}

app.privacy = function(){
	riot.route('/privacy')
}

app.vekn = function(){
	window.open('http://www.vekn.net','_blank')
}


app.download = function(url, filename, type) {


	if(app.iscordova && FileTransfer) {
		// Download via App (32mb limit)
		console.log('Download via App')

		var fileTransfer = new FileTransfer();
		var uri          = encodeURI(url);
		var fileURL      = (cordova.platformId == 'android' ? cordova.file.externalApplicationStorageDirectory : cordova.file.dataDirectory) + filename

		console.log('fileURL', fileURL)
		console.log('type', type)

		fileTransfer.download(
		    uri,
		    fileURL,
		    function(entry) {


		        console.log("download complete: " + entry.toURL());

				cordova.plugins.fileOpener2.open(
				    entry.toURL(), 
				    type, 
				    {
				        error : function(e) { 
				            console.log('Error status: ' + e.status + ' - Error message: ' + e.message);
				        },
				        success : function () {
				            console.log('file opened successfully'); 				
				        }
				    } 
				);

		    },
		    function(error) {
		    	swal({
		    		type:'error',
		    		title: 'Error',
		    		text: 'There was an error downloading the file'
		    	})

		        console.log("download error source " + error.source);
		        console.log("download error target " + error.target);
		        console.log("upload error code" + error.code);
		    },
		    false,
		    {
		        headers: {
		            "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
		        }
		    }
		);		
	}

	else {	
		// Clear old iframes
		$('iframe.download').remove()

		// Create a new one
		var iframe = $('<iframe style="display:none;" class="download"></iframe>')
		iframe.attr('src', url)
		$('body').append(iframe)
	}

}

app.downloadpdf = function(pdf, filename) {
	filename = filename.split(' ').join('_').match(/\w+/ig).join('')
	return app.download(app.root + '/api/download?pdf=' + pdf + '&filename=' + (filename || ''), filename + '.pdf', 'application/pdf')
}

app.downloadtxt= function(url, filename) {
	filename = filename.split(' ').join('_').match(/\w+/ig).join('')
	return app.download(app.root + '/api/download?file=' + url + '&filename=' + (filename || ''), filename + '.txt', 'text/plain')
}

app.unpack = function(){

	var rows = app.rows 

	// Unpack rows 
	var cards = []
	var index = {}
	var cols  = rows.shift()
	var rl    = rows.length 
	var cl    = cols.length
	var row 
	var val 
	var col 

	for(var r = 0; r < rl; r++) {
		row = {}
		row.disc = ''
		for(var c = 0; c < cl; c++){
			col = cols[c]
			val = rows[r][c]

			switch(col) {
				case 'sect':
					val = app.sect_index[String(val)]
					break; 				
				case 'path':
					val = app.path_index[String(val)]
					break; 
				case 'clan':
					val = app.clan_index[String(val)]
					break; 
				case 'title':
					val = app.title_index[String(val)]
					break; 
				case 'storyline':
					val = app.story_index[String(val)] ||  (val ? 'N/A' : null)
					break; 
				case 'cardtype':
					val = app.cardtype_index[String(val)]
					col = 'type'
					break; 
			}

			if(col == 'disc') {
				val = val.split('/').join(' / ')
				row.icons = (row.icons || '') + '<icon class="' + val.split(' ').reverse().join('"></icon><icon class="') + '"></icon>'
			}

			// if(col == 'path' && val) {
			// 	row.icons = (row.icons || '') + '<icon class="' + val.split(' ').join('_') + '"></icon>'
			// }

			if(val) row[col] = val 
		}

		switch(row.type) {
			case 'Vampire':
			case 'Imbued':
				row.iscrypt = 1
				break
			case 'Master':
				row.islibrary = 1
				break
			default:
				row.islibrary = 1
				row.isminion = 1
				break

		}

		cards.push(row)
		index[row.id] = row
	}

	window.cards = cards 
	window.cardindex = index	
	app.ready()



}

app.unpackwords = function(){
  var keywords = app.keywords 
  
  for(var i = 0; i < keywords.length; i++){
    var row   = keywords[i].split('||')
    var id    = parseInt(row[0])
    var card  = cardindex[id]
    
    if( card ) {
    	card.keywords = row[1]
    }  
  }

  delete app.keywords 
}

app.unpackrulings = function(){

	if(app.rulings) {
		app.rulings.forEach(function(ruling){

			if(ruling.ruling.indexOf('[') == 0) {
				var tmp = ruling.ruling.split('. [')
				ruling.text       = tmp.shift().split('{').join('').split('}').join('')+'.'
			}
			else {
				var tmp = ruling.ruling.split('[')
				ruling.text       = tmp.shift().split('{').join('').split('}').join('')
			}
			var cards = []

			ruling.references = '[' + tmp.join('[')
			ruling.who        = '[' + tmp.pop()

			var card_names = []

			delete ruling.ruling

			ruling.cards.forEach(function(id){
				var card = cardindex[id]
				if(card) {
					if(!card.rulings){
						card.rulings = []
					}
					card.rulings.push(ruling)
					cards.push(card)
					card_names.push(card.name)
				}
			})

			ruling.card_names = card_names.join(', ')
			ruling.cards = cards

		})
	}
	// delete app.rulings

}

app.load()

riot.tag('raw', '', function(opts) {
    this.root.innerHTML = opts.html;
})

riot.tag('rawupdate', '', function(opts) {
	this.on('update', function(){
	    this.root.innerHTML = opts.html;
	})
    this.root.innerHTML = opts.html;
})


///////////////////////////////////////////////////////////
//
//	Global methods
//
///////////////////////////////////////////////////////////


app.syncdecks = function(force){
	var now           = (new Date).getTime()
	var offset        = app.offset || 0
	var decks_by_id   = {}
	var decks_by_uuid = {}

	// Only sync if online and logged in
	if(!app.user || !app.user.id) {
		return 
	}

	// Android 4.4 can't check if online
	else if(app.iscordova && cordova.platformId == 'android') {
		// Do nothing and assume online
	} 

	else if(!navigator.onLine ) {
		// Offline
		return
	}

	// Only sync every 2 minutes or so...	
	if(!force && app.lastsync && (now - app.lastsync) < 2 * 60 * 1000) {
		return 
	}

	console.log('Syncing decks...', offset)

	// index current decks
	app.decks.forEach(function(deck){
		if(deck.id) {
			decks_by_id[deck.id] = deck 
		}
		decks_by_uuid[deck.uuid] = deck 
	})

	// Grab any new decks
	app.callapi('/api/sync-decks',{
		offset: offset
	}, function(response){
		if(response.success) {

			// Set the last sync
			app.lastsync = now 

			// Process each new deck
			response.result.forEach(function(deck){

				var existing = decks_by_id[deck.id] || decks_by_uuid[deck.uuid]

				// Remove delete if deleted
				if(deck.deleted) {
					console.log('Deleting.')
					var i = app.decks.indexOf(deck)
					if(i != -1) app.decks.splice(i, 1)
				}

				// Update existing
				else if(existing) {
					
					if(!existing.modified || deck.modified > existing.modified) {
						console.log('Updating.')

						// Update deck	
						for(var key in deck) {
							existing[key] = deck[key]
						}
					}

					else {
						console.log('Skipped.', 'existing', existing.modified, 'deck', deck.modified)
					}


				}
				// Add new deck
				else {
					console.log('Adding.')
					app.decks.push(deck)
				}

				// Clear duplicates
				app.decks.forEach(function(existing){
					if(deck.uuid == existing.uuid && deck.id != existing.id) {
						var i = app.decks.indexOf(deck)
						if(i != -1) app.decks.splice(i, 1)
					}
				})				

			})

			// Save new offset
			store.set('offset', response.offset)
			app.offset = response.offset

			// Tell the world
			app.trigger('decks')

			app.save()
		}
	})

	var i = 0

	// Now save anything local
	app.decks.filter(function(deck){

		if(!deck.id) {

			// Don't DOS server...
			setTimeout(function(){

				// Post the new deck to the server
				app.callapi('/api/deck/save', {
					deck: JSON.stringify(deck)
				}, function(response){

					// Set id + uuids 
					if(response.success) {
						deck.id   = response.result.id 
						deck.uuid = response.result.uuid 
						app.save()
					}

				})	

			}, 0 * 500)
		}
	})
}

app.copydeck = function(deck) {
	var copy = app.newdeck()
	for(key in deck.cards) {
		copy.cards[key] = parseInt(deck.cards[key])
	}
	copy.title                  = String(deck.title || 'Untitled').split('(')[0].trim() + ' (copy)'
	copy.description            = deck.description || ''
	copy.author                 = deck.author || ''
	copy.readonly               = 0
	copy.copied_uuid            = deck.uuid 
	copy.isquickstart_submitted = (deck.isquickstart || 0) // don't allow re-submission of copied quick start decks,
	
	return copy 
}

app.happyfamilies = function(crypt, library, length, masters, maxdis, maxnone) {

	// Based on http://legbiter.tripod.com/hf/theory.htm
	var masters = parseFloat(masters) || 0
	var t =  Math.min(Math.max(length, 60),90)
	var a = t * ((100 - masters) / 100)
	var m = Math.round(t * (masters / 100))
	var d = parseInt(maxdis) || 0

	var maxnone = ((parseInt(maxnone)) / 100) * 2

	// Number of vampires in
	var p = 0

	// Number of cards to consider 
	var perc = 0

	var libCount  = {}
	var discCount  = {}
	var discSorted = []
	var counts = []
 
	crypt.forEach(function(card){
		p += card.qty 

		// Tally disciplines 
		String(card.disc).split(' ').forEach(function(disc){
			var weight
			if(disc === disc.toUpperCase()) {
				weight = 1.01
			}
			else {
				weight = 1
			}

			disc = (disc == 'Vis' ? 'Vis' : disc.toLowerCase())

			if(disc != '-none-') {
				discCount[disc] = ((discCount[disc] || 0) + card.qty) * weight
			}
		})

		if( card.keywords.indexOf('flight') != -1 ) {
			discCount['flight'] = (discCount['flight'] || 0) + card.qty 	
		}


		// No discipline
		discCount['No discipline'] = maxnone ? ((discCount['No discipline'] || 0) + card.qty) * maxnone : 0 
	//	perc += (card.qty)* maxnone
	})

	library.forEach(function(card){

		// Tally current in library 
		String(card.disc).toLowerCase().split(' ').forEach(function(disc){
			if(card.type == 'Master') {
				disc = 'Master'
			}

			else {
				disc = (disc != 'undefined' ? disc.substring(0, disc == 'thanatosis' ? 4: 3) : 'No discipline')
			}


			libCount[disc] = (libCount[disc] || 0) + card.qty 
		})
	})

	// Sort by count
	for(var disc in discCount) {
	    discSorted.push({
	    	name: disc, 
	    	count: discCount[disc]
	    });
	}	

	discSorted.sort(function(a, b){
		if(a.name == 'No discipline') return b.count - 1000 
		if(b.name == 'No discipline') return 1000 - a.count
		return b.count - a.count
	})

	var i = 0

	// Calculate base 
	discSorted.forEach(function(disc){
		if(disc.name == 'No discipline' || i++ < d ) {
			perc = perc + disc.count
		}
	})

	counts.push({
		name: 'Masters',
		total: m,
		indeck: libCount['Master']
	})

	var i = 0

	// Calculate base 
	discSorted.forEach(function(disc){
		var total = Math.round(disc.count / perc * a)

		// only show 4x disc max
		if(  disc.name == 'No discipline' || i++ < d) {
			counts.push({
				name:   disc.name,
				total:  total,
				indeck: libCount[disc.name]
			})
		}
	})

	return counts

}

app.updatewhatsnew = function(){
	var el = $('.whatsnew')
	var whatsnew = parseInt(app.get_user_setting('whatsnew')) || 0
	if(app.whatsnew - whatsnew > 0){
		el.attr('data-badge',app.whatsnew - whatsnew)
	} else {
		el.removeAttr('data-badge')
	}
}

///////////////////////////////////////////////////////////
//
//	Routes
//
///////////////////////////////////////////////////////////

riot.route('/', function(){
	app.mount('home')
})

riot.route('/library', function(){
	console.log('mount lib')

	app.hidemodal()

	var mount = true 

	// Check if already mounted
	riot.vdom.forEach(function(mnt){
		if(mnt.root.tagName == 'LIBRARY-CARDS') {
			mount = false  
		}
	})

	if(mount) app.mount('library-cards')
	
})
riot.route('/crypt', function(){
	console.log('mount crypt')

	app.hidemodal()

	var mount = true 

	// Check if already mounted
	riot.vdom.forEach(function(mnt){
		if(mnt.root.tagName == 'CRYPT-CARDS') {
			mount = false  
		}
	})

	if(mount) app.mount('crypt-cards')

})


riot.route('/about', function(){
	console.log('mount about')
	app.mount('about')
})

riot.route('/privacy', function(){
	console.log('mount privacy')
	app.mount('privacy')
})

riot.route('/help', function(){
	console.log('mount help')
	app.mount('help')
})
riot.route('/seating', function(){
	console.log('mount seating')
	app.mount('seating')
})

riot.route('/whatsnew', function(){
	console.log('mount whatsnew')
	app.mount('whatsnew')
})

riot.route('/quickstart', function(){
	console.log('mount quickstart')

	if(app.quickstartdecks) {
		app.mount('quickstart', { decks: app.quickstartdecks })
	} 

	else {
		// For offline/static use, provide hardcoded quickstart decks
		// These can be replaced with actual deck data or loaded from local storage
		app.quickstartdecks = [
			{
				uuid: 'quickstart-brujah-bruise',
				title: 'Brujah Bruise & Bleed',
				description: 'An aggressive Brujah combat deck focused on rushing and bleeding. Uses Potence for combat superiority and Presence for vote control.',
				author: 'Sample Deck',
				cards: {}
			},
			{
				uuid: 'quickstart-toreador-bleed',
				title: 'Toreador Bleed',
				description: 'A classic bleed deck using Toreador vampires with Auspex and Celerity. Focuses on stealth bleeds and bounce defense.',
				author: 'Sample Deck',
				cards: {}
			},
			{
				uuid: 'quickstart-tremere-toolbox',
				title: 'Tremere Toolbox',
				description: 'A versatile Tremere deck using Thaumaturgy and Auspex. Provides multiple strategies including bleeds, votes, and combat options.',
				author: 'Sample Deck',
				cards: {}
			},
			{
				uuid: 'quickstart-malkavian-stealth',
				title: 'Malkavian Stealth Bleed',
				description: 'Malkavian deck emphasizing stealth bleeds with Obfuscate and Dominate. Includes mental tricks and superior bleed modifiers.',
				author: 'Sample Deck',
				cards: {}
			},
			{
				uuid: 'quickstart-ventrue-princes',
				title: 'Ventrue Princes',
				description: 'A political deck featuring Ventrue princes. Uses Dominate for bleeds and Fortitude for survival, with strong voting power.',
				author: 'Sample Deck',
				cards: {}
			},
			{
				uuid: 'quickstart-gangrel-rush',
				title: 'Gangrel Rush',
				description: 'An aggressive Gangrel rush deck with Protean and Fortitude. Focuses on entering combat and dealing damage quickly.',
				author: 'Sample Deck',
				cards: {}
			}
		]
		app.mount('quickstart', { decks: app.quickstartdecks })
	}

})

riot.route('/storylines', function(){

	if(app.storylines) {
		app.mount('storylines', { storylines: app.storylines })
	} else {
		// For offline use, provide storylines data
		app.storylines = [
			{
				key: 'antipodean-awakening',
				title: 'Antipodean Awakening',
				intro: 'A storyline exploring events in Australia and the Pacific region.'
			},
			{
				key: 'millennium-cultist',
				title: 'Millennium Cultist',
				intro: 'Special event cards and rules from the Millennium edition.'
			},
			{
				key: 'return-of-nergal',
				title: 'The Return of Nergal',
				intro: 'A storyline featuring the ancient Baali methuselah Nergal.'
			}
		]
		app.mount('storylines', { storylines: app.storylines })
	}

})


riot.route('/decks', function(){
	console.log('/decks')
	app.mount('decks')
})

riot.route('/rulings', function(){
	app.mount('rulings')
})



// Deal with back buttons
riot.route('/deck/*/*', function(id, mode){
	console.log('/deck/*/*')

	if(mode != 'card') {		
		// Close a card if open
		$('.modal.card').each(function(i, el){
			app.hidemodal($(el), null, true)
		})
	}
})

riot.route('/twda', function(){
	app.mount('twda')
})

// Deal with back buttons
riot.route('/twda/*', function(key){
	// Convert twda to deck.
	var deck = app.twda.filter(function(deck){ return deck.twda_key == key}) [0]

	if(!deck) {
		return riot.route('/twda')
	}

	app.hidemodal()

	deck.id            = -1
	deck.uuid          = deck.twda_key
	deck.readonly      = 1 
	deck.winningdeck   = 1 
	//deck.description = 'TWDA description will go here'

	var dom = document.createElement('deck')
	riot.mount(dom, 'deck', { deck: deck, compact: 1, twda: 1})

	app.setmodal(dom, function(modal){
		modal.css('overflow-y', 'auto')
	})

})

riot.route('/insights', function(){
	app.mount('insights')
})

// Deal with back buttons
riot.route('/insights/*/*', function(mode, key){
	var opts = {mode: mode}
	switch(mode) {
		case 'clan' : 
			opts.clan = key
			break
		case 'discipline' : 
			opts.discipline = key
			break
		case 'card' : 
			opts.card = cardindex[key]
			break
	}
	app.mount('view-insights', opts)

	// Convert twda to deck.
})


riot.route('/storyline/*', function(key){
	
	var ready = function(){
		var match = false 

		app.hidemodal(null, null, true)

		var mount = true 

		// Check if already mounted
		riot.vdom.forEach(function(mnt){
			if(mnt.isMounted && mnt.storylines) {
				// Already mounted
				mount = false  
			}
		})

		//if(!mount) return 

		app.storylines.forEach(function(storyline,i){
			if(storyline.key == key){
				match = true
				app.mount('storyline', {storyline: app.storylines[i]})
				return
			}
		})
		
	}

	if(app.storylines) {
		ready()
	} else {
		app.callapi('/api/story-lines', function(response){
			if(response.success) {
				app.storylines = response.result
				ready()
			}
		})
	}

})

function load_deck(id){

	console.log('mount deck: ' + id )

	app.hidemodal(null, null, true)

	var match = false 

	var mount = true 

	// Check if already mounted
	riot.vdom.forEach(function(mnt){
		if(mnt.root.tagName == 'DECK' && mnt.deck.uuid == id ) {
			// Already mounted
			mount = false  
		}
	})

	if(!mount) return 

	// Find deck to mount
	app.decks.forEach(function(deck){
		if(deck.id == id || deck.uuid == id) {
			match = true 
			return app.mount('deck', {deck: deck})
		}
	})

	console.log('match', match)

	// Try on server if not UUID
	if(!match) {

		// Grab any new decks
		app.callapi('/api/deck',{
			id: id
		}, function(response){

			if(response.success) {
				app.mount('deck', {deck: response.result})
			}
		})

	}
}

// Main route 
riot.route('/deck/*', function(id){

	id = id.split('/')[0]

	load_deck(id)

})

// Main route 
riot.route('/decks/*', function(id){
	var match = false 

	id = id.split('/')[0]

	load_deck(id)

})

riot.route('/print/*', function(id){
	console.log('print deck: ' + id )

	var match = false 

	// Find deck to mount
	app.decks.forEach(function(deck){
		if(deck.id == id || deck.uuid == id) {
			console.log('found.deck', deck)
			match = true 
			return app.mount('print', {deck: deck})
		}
	})
})

riot.route('/reset/*', function(key){

	app.mount('home')

		
	app.callapi('/api/reset', {
	 	 	key: key
	}, function(response) {

		// Logged in OK
		if(response.success) {
			swal({
				type: 'success',
				text: (response.error ? response.error.message : 'Please enter a new password.')
			}).done()

			app.user    = response.result.user 
			app.session = response.result.session				
			app.offset  = ''
			store.set('user', app.user)
			store.set('session', app.session)
			store.set('offset', '')

			app.append('profile', { user: app.user })

		} else {
			swal({
				type: 'error',
				text: (response.error ? response.error.message : 'Opps, there\'s been an error.'),
				timer: 5 * 1000
			}).done()				
		}
	})


})

riot.route('/card/*', function(id){
	console.log('mount card: ' + id)

	var card = cardindex[id]
	var dom = document.createElement('card')
	app.setmodal(dom, function(modal){
		modal.css('overflow-y', 'auto')
		modal.addClass('card').addClass('large')
	})
	riot.mount(dom, 'card', {card: card, cards: [card], deck: this.deck, mnt: this.mnt })

	
	app.mount('home')

})

//riot.route.base('/')

riot.observable(app)

$(document).ready(function(){
	riot.compile(app.bind)
	app.updatewhatsnew()
})

window.addEventListener('focus', function(e){
	if(e.target == window && app.iscordova) { 
	//	app.syncdecks()
	}
}, true)

