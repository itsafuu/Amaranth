var amaranth_util = function(opts) {
    this.data = opts || {}
}

amaranth_util.prototype = {

	autosize: function(e) {
		e.preventUpdate = true
		var el = e.target
		setTimeout(function(){
			el.style.cssText = 'height:auto; padding:0'
			el.style.cssText = 'height:' + el.scrollHeight + 'px' 
		},0);
	},

	clearsize: function(e){
		 e.target.style.cssText = ''
	},	

	autosize_and_set: function(e) {
		this.autosize(e)
		this.setvalue(e)
	},


	toggle_user_setting: function(e) {
		this[e.target.name] = (e.target.checked ? 1 : 0)
		app.set_user_setting(e.target.name, this[e.target.name], false)
		return true 
	},

	iconify_type: function(types) {
		var out = []

		types.split('/').forEach(function(type){
			out.push(
				amaranth_util.prototype.iconify(
					'[' + type.toUpperCase().replace(/ /g,'_') + '] ' + type
				)
			)

		})
		return out.join('')
	},

	iconify_disc: function(types) {
		var out = []

		types.split(' ').forEach(function(type){
			if(type != '-none-') {
				out.push(
					'<icon class="' + type + '"></icon>'
				)
			}
		})
		return out.join(' ')
	},


	iconify_clan: function(types) {
		var out = []

		types.split('/').forEach(function(type){
			if(type != '-none-') {
				out.push(
					amaranth_util.prototype.iconify(
						type + ' [' + type.toLowerCase().replace(/ /g,'_') + ']'// + type
					)
				)
			}

		})
		return out.join('') // .replace(/class=/g,'style="/*float:right; margin-top:5px;*/" class=') 
	},

	iconify: function(text) {
		text = '<hr/>' + text
		text = text.replace(/\n/g,'<hr/>')
		text = text.replace(/\d CONVICTION/g,'CONVICTION')
		text = text.replace(/\[(\w+)\s+(\w+)\]/g,'<icon class="$1_$2"></icon>')
		text = text.replace(/<hr\/>\[(\w+)\]or\[(\w+)\]/g,'<hr/><icon class="$1 big"></icon> or <icon class="$2 big"></icon>')
		text = text.replace(/<hr\/>\[(\w+)\] or \[(\w+)\]/g,'<hr/><icon class="$1 big"></icon> or <icon class="$2 big"></icon>')
		text = text.replace(/<hr\/>\[(\w+)\]\[(\w+)\]/g,'<hr/><icon class="$1 big"></icon><icon class="$2 big"></icon>')
		text = text.replace(/<hr\/>\[(\w+)\]/g,'<hr/><icon class="$1 big"></icon>')
		text = text.replace(/\[(\w+)\]/g,'<icon class="$1"></icon>')
		text = text.replace(/\(D\)/g,'<icon class="D"></icon>')
		text = text.replace(/\](.*?)[^\[]/g,']<span>$1</span>')
		return text  
	},

	header_colour: function(card_type) {

		if(!card_type){
			return '#EEE'
		}

 		if(~card_type.indexOf("Vampire") || ~card_type.indexOf("Imbued"))
			return 	'#4f3007' // crypt golden
		if(~card_type.indexOf("Master"))
			return 	'#286b53' // d3.green
		if(~card_type.indexOf("Political Action"))
			return '#81561f' // d3.orange
		if(~card_type.indexOf("Action Modifier")) 
			return '#2a6b78' // d3.aqua
		if(~card_type.indexOf("Action"))
			return '#233a52' // .swatchdot.blue-grey
		if(~card_type.indexOf("Conviction"))
			return '#aa590f' // .swatchdot.amber
		if(~card_type.indexOf("Power"))
			return '#aa590f' // .swatchdot.amber
		if(~card_type.indexOf("Combat"))
			return '#600d0a' // d3.red
		if(~card_type.indexOf("Ally"))
			return '#8c564b' // d3.brown
		if(~card_type.indexOf("Retainer"))
			return '#5a5356' // d3.pink
		if(~card_type.indexOf("Equipment"))
			return '#4f3d38' // .swatchdot.grey
		if(~card_type.indexOf("Reaction"))
			return '#562d6e' // d3.purple
		if(~card_type.indexOf("Event"))
			return '#660646' // .swatchdot.pink
		if(~card_type.indexOf("Token"))
			return '#000000' // .swatchdot.black

		return ''
	},

	card_colour: function(card_type) {
 
 		if(!card_type){
			return '#EEE'
		}

		if(~card_type.indexOf("Vampire") || ~card_type.indexOf("Imbued"))
			return 	'#a66f26' // crypt golden
		if(~card_type.indexOf("Master"))
			return 	'#286b53' // d3.green
		if(~card_type.indexOf("Political Action"))
			return '#ff7f0e' // d3.orange
		if(~card_type.indexOf("Action Modifier")) 
			return '#17becf' // d3.aqua
		if(~card_type.indexOf("Action"))
			return '#2196F3' // .swatchdot.blue-grey
		if(~card_type.indexOf("Conviction"))
			return '#FFC107' // .swatchdot.amber
		if(~card_type.indexOf("Power"))
			return '#FFC107' // .swatchdot.amber
		if(~card_type.indexOf("Combat"))
			return '#d62728' // d3.red
		if(~card_type.indexOf("Ally"))
			return '#8c564b' // d3.brown
		if(~card_type.indexOf("Retainer"))
			return '#e377c2' // d3.pink
		if(~card_type.indexOf("Equipment"))
			return '#9E9E9E' // .swatchdot.grey
		if(~card_type.indexOf("Reaction"))
			return '#9467bd' // d3.purple
		if(~card_type.indexOf("Event"))
			return '#E91E63' // .swatchdot.pink
		if(~card_type.indexOf("Token"))
			return '#000000' // .swatchdot.black

	},


	card_category: function(card) {
		var type     = card.type
		var keywords = card.keywords

		switch(type) {
			case 'Combat':

				// exclude anti combat 
				if(~keywords.indexOf('ends') || ~keywords.indexOf('dodge')) {
					return null	
				}

				return 'Combat'

				break;

			case 'Action':

				// enter combat 
				if(~keywords.indexOf('enter') && ~keywords.indexOf('combat')) {
					return 'Combat'
				}

				// bleed
				if(~keywords.indexOf('bleed')) {
					return 'Bleed'
				}

				break;

			case 'Action Modifier':

				// bleed
				if(~keywords.indexOf('bleed')) {
					return 'Bleed'
				}

				break;

			case 'Political Action':

				return 'Vote'
				break;

			case 'Ally':

				return 'Ally'
				break;

			case 'Reaction':

				// intercept
				if(~keywords.indexOf('intercept')) {
					return 'Wall'
				}

				// Deflection
				if(~keywords.indexOf('change') && ~keywords.indexOf('controlle')) {
					return 'Bleed'
				}

				// As though unlocked
				if(~keywords.indexOf('locked') && ~keywords.indexOf('unlocked')) {
					return 'Wall'
				}

				break;

			case 'Equipment':

				// Deflection
				if(~keywords.indexOf('intercept')) {
					return 'Wall'
				}

				// As though unlocked
				if(~keywords.indexOf('weapon')) {
					return 'Combat'
				}

				break;

			case 'Vampire':
			case 'Imbued':

				// enter combat 
				if(~keywords.indexOf('enter') && ~keywords.indexOf('combat')) {
					return 'Combat'
				}

				// titled
				if(card.titled) {
					return 'Vote'
				}
				
				// bleed
				if(~keywords.indexOf('bleed')) {
					return 'Bleed'
				}

				// vote
				if(~keywords.indexOf('vote')) {
					return 'Vote'
				}

				break;

		}

	},

	deck_category: function(cards) {
		var categories = {}
		var total = 0

		for(id in cards) {
			var card = cardindex[id]

			if(card) {			
				if(card.category) {
					var category = card.category 
				}
				else {
					var category = this.card_category(card)
					card.category = category 
				}

				if(category) {
					categories[category] = (categories[category] || 0) + cards[id]
					total += cards[id]
				}
			}
		}

		if(!total) {
			return ''
		}

		var matches = []

		for(category in categories) {
			var perc = categories[category] / total
			if(perc >= 0.3) {
				matches.push(category)
			}
		}

		if(matches.length == 1) {
			return matches[0]
		}
		else {
			return 'Toolbox'
		}


	},

	show_tournment_deck: function(deck, decks) {
		var dom = document.createElement('deck')

		deck.id            = -1
		deck.uuid          = deck.twda_key
		deck.readonly      = 1 
		deck.winningdeck   = 1 

		var el = $('deck:visible:first').parent()

		if(el.length) {
			el.html(dom)
		}

		else {
			app.setmodal(dom, function(modal){
				modal.css('overflow-y', 'auto').addClass('large')
			})
		}

		riot.mount(dom, 'deck', {deck: deck, decks: decks, locked: true})
		componentHandler.upgradeDom();						
	},

	deck_parser: function(cards){

		var crypt = []

		var library = {}
		var librarycards=[]
		var librarytype 
		var lastlib
		var lastcrypt

		var banned = 0
		var min_group = 10
		var max_group = 0

		var storyline_lib   = 0
		var storyline_crypt = 0
		
		crypt.total   = 0
		library.total = 0
		library.pool  = 0
		library.blood = 0

		var sets = []

		for(id in cards) {
			var qty   = parseInt(cards[id])
			var card  = cardindex[id]

			if(card) {
				var pool  = parseInt(card.pcost) || 0
				var blood = parseInt(card.bcost) || 0

				card.qty = qty

				// Note sets
				card.sets.forEach(function(set){
					if(sets.indexOf(set) == -1) {
						sets.push(set)
					}
				})

				if(card.banned && qty > 0) {
					banned++
				}

				if(card.type != 'Vampire' && card.type != 'Imbued') {
					librarytype = library[card.type]

					if(!librarytype){
						library[card.type] = []
						librarytype = library[card.type]
						librarytype.total = 0
					}
					librarytype.push(card)
					librarytype.sort((a,b) => {
						return a.name > b.name ? 1 : -1
					})
					library.total += qty
					librarytype.total += qty
					if(lastlib){
						lastlib.next_id = card.id 
						card.prev_id = lastlib.id
						card.next_id = null
					} 
					else {
						card.prev_id = null
						card.next_id = null
					}

					if(card.storyline){
						storyline_lib = 1
					}

					library.blood += blood * qty
					library.pool += pool * qty

					lastlib = card 
				}

				else {

					if(card.group != 'ANY' && qty > 0) {
						min_group = Math.min(min_group, card.group)
						max_group = Math.max(max_group, card.group)						
					}

					crypt.push(card)
					crypt.total+= qty
					if(lastcrypt){
						lastcrypt.next_id = card.id 
						card.prev_id = lastcrypt.id
						card.next_id = null
					}
					else {
						card.prev_id = null
						card.next_id = null

					}

					if(card.storyline){
						storyline_crypt = 1
					}

					lastcrypt = card
				}

				last = card 					
			}



			
		}

		var cardtypes = []

		for(type in library) {
			if(type != 'total' && type != 'pool' && type != 'blood') 
				cardtypes.push(type)
		}

		var cardorder = this.cardorder || app.cardorder 

		cardtypes.sort(function(a, b){
			return cardorder[a] > cardorder[b] ? 1 : -1
		})

		var librarycards = []

		cardtypes.forEach(function(cardtype){				
			library[cardtype].forEach(function(card){
				librarycards.push(
					card
				)
			})
		})

		this.sets = []

		app.sets.forEach(function(set){
			if( sets.indexOf(set.value) != -1) {
				this.sets.push(set.name)
			}
		}.bind(this))		

		// Validate 
		if(banned > 0) {
			this.illegal_library = 'Contains banned cards'
		}
		else if (library.total < 60) {
			this.illegal_library = 'Library must contain at least 60 cards'
		}
		else if (library.total > 90) {
			this.illegal_library = 'Library must contain less than 90 cards'
		}
		else if (storyline_lib > 0) {
			this.illegal_library = 'Library contains storyline cards, and must be played with the relevant storyline'
		}
		else {
			this.illegal_library = false
		}

		if((max_group - min_group) > 1){
			this.illegal_crypt = 'Invalid Grouping'
		} 
		else if(crypt.total < 12) {
			this.illegal_crypt = 'Crypt must contain at least 12 cards'
		}
		else if(storyline_crypt > 0) {
			this.illegal_crypt = 'Crypt contains storyline cards, and must be played with the relevant storyline'
		}	
		else {
			this.illegal_crypt = false 
		}


		this.crypt        = crypt
		this.library      = library
		this.librarycards = librarycards
		this.cardtypes    = cardtypes 


	},

	togglefilter(e) {
		e.preventUpdate = true
		var id = $(e.target).data('filter') || e.target.getAttribute('id').toLowerCase().replace('_', '')
		var checked = e.target.checked
		this.filters[id] = (checked ? 1 : 0)
		this.filter()	
	},	

	setfilter(e) {
		e.preventUpdate = true
		this.filters[$(e.target).data('filter') || $(e.target).attr('id')] = $(e.target).val()		
		this.filter()	
	},

	toggledisciplines(e) {

		e.stopPropagation()

		if(!this.showdisciplines) {
			this.showdisciplines = true  
			$(this.disciplinesEl).addClass('is-focused').find('i').html('arrow_drop_up')	
			$(this.disciplinesEl).find('.card-filter-disciplines').focus()		
			this.hideselects(e)
		}

		e.preventUpdate = true
	
	},

	hideselects(e){
		e.preventUpdate = true
		$(this.root).find('.mdl-js-selectfield').removeClass('is-focused')
	},

	hidedisciplines(e){
		e.preventUpdate = true
		setTimeout(function(){this.showdisciplines = false}.bind(this),100)
		$(this.disciplinesEl).removeClass('is-focused').find('i').html('arrow_drop_down')	
	},


	find_cards: function(filters){

		console.log('filters', filters)

		var q           = filters.q           || ''
		var discipline  = []
		var path        = []
		var clan        = filters.clan        || null 
		var type        = filters.type        || null 
		var sect        = filters.sect        || null 
		var title       = filters.title       || null 
		var storyline   = filters.storyline   || null 
		var set         = parseInt(filters.set)   	   || null 
		var group       = filters.group       || null 
		var mincap      = filters.mincap      || null 
		var maxcap      = filters.maxcap      || null 
		var bleed       = filters.bleed       || null
		var strength    = filters.strength    || null
		var stealth     = filters.stealth     || null
		var intercept   = filters.intercept   || null
		var blackhand   = filters.blackhand   || null
		var anarch      = filters.anarch      || null
		var aggravated  = filters.aggravated  || null
		var entercombat = filters.entercombat || null
		var banned      = filters.banned      || null
		var infernal    = filters.infernal    || null
		var slave       = filters.slave       || null
		var flight      = filters.flight      || null
		var redlist     = filters.redlist     || null
		var titled      = filters.titled      || null
		var multi       = filters.multi       || null
		var nodisc      = filters.nodisc      || null
		var combo       = filters.combo       || null
		var pt          = filters.pt          || null
		var clanless    = filters.clanless    || null
		var burnable    = filters.burnable    || null
		var islibrary   = filters.islibrary   || null
		var iscrypt     = filters.iscrypt     || null
		var extragroup  = filters.extragroup

		// Copy discipline data
		if(filters.discipline) {
			filters.discipline.forEach(function(disc){
				discipline.push(disc)
			})
		}		

		// Copy path data
		if(filters.path) {
			filters.path.forEach(function(disc){
				path.push(disc)
			})
		}

		if(q) q.replace('thn','than')
		if(q) q.replace('THN','THAN')

		// Deal with clashing disciplines 
		if(~discipline.indexOf('tha')) discipline[discipline.indexOf('tha')] = 'thau'
		if(~discipline.indexOf('mal')) discipline[discipline.indexOf('mal')] = 'male'
		if(~discipline.indexOf('str')) discipline[discipline.indexOf('str')] = 'strig'

		// keyword search	
		var qt =[]
		if(q.length >= 1) {
			qt = q.toLowerCase().match(/\w+/g)
		}

		return cards.filter(function(card){ 

			if(islibrary && !card.islibrary) {
				return false 
			}

			if(iscrypt && !card.iscrypt) {
				return false 
			}

			var match 
			var keywords = (card.name + ' ' + (card.clan || '') + ' ' + (card.disc || '') + ' ' + (card.keywords || '') + ' ' + card.type).toLowerCase()

			if(card.storyline && !storyline) return false

			// When 					
			if(qt.length && card.storyline && card.storyline.toLowerCase() == qt){
				return 1
			}

			match = (
				~keywords.indexOf(qt[0] || '') && 
				~keywords.indexOf(qt[1] || '') && 
				~keywords.indexOf(qt[2] || '') && 
				~keywords.indexOf(qt[3] || '')
			)

			// Hide story line and play test cards by default
			if(match && storyline) {
				match = card.storyline == storyline
			} else if (card.storyline) {
				return false 
			}  		
			
			if(match && pt !== null) {
				match = card.pt == 1
			} else if (card.pt == 1) {
				return false 
			} 	


			if(match && discipline.length) {
				var disc = (card.disc || '')

				if(
					disc != 'defense' && 
					disc != 'innocence' && 
					disc != 'judgment' && 
					disc != 'martyrdom' && 
					disc != 'redemption' && 
					disc != 'vengeance' && 
					disc != 'vision' )
				{

					for(var c = 0; c < discipline.length; c++){
						var d = discipline[c]
						if(d && match) {
							// Inferior selected, so also include sup
							if(d[0].toUpperCase() != d[0]) {
								match = ~disc.toLowerCase().indexOf(d.toLowerCase())

							// Superior select, so only includ sup
							} else {
								match = ~disc.indexOf(d)
							}
						}
					}
				}

			}			

			if(match && path.length) {
				var p = (card.path || '')
				var m = false

				for(var c = 0; c < path.length; c++){
					var d = path[c]
					if(d && match) {
						// Match path
						if(~p.indexOf(d)) {
							m = true
						}
					}
				}

				match = m
		
			}			




			if(false && match && discipline.length) {
				var disc = (card.disc || '').toLowerCase()
				match = (
					~disc.indexOf(discipline[0] || '') && 
					~disc.indexOf(discipline[1] || '') && 
					~disc.indexOf(discipline[2] || '') && 
					~disc.indexOf(discipline[3] || '') && 
					~disc.indexOf(discipline[4] || '') &&

					disc != 'defense' && 
					disc != 'innocence' && 
					disc != 'judgment' && 
					disc != 'martyrdom' && 
					disc != 'redemption' && 
					disc != 'vengeance' && 
					disc != 'vision' 
				)
			}

			if(match && group !== null) {
				if(group == 'ANY') {
					match = card.group == group
				}

				else {					
					
					if(extragroup) {
						var grp = parseFloat(card.group)
						match =  grp >= Math.floor(group -1) && grp <= Math.floor(group + 1)
					} else {							
						var grp = parseFloat(card.group)
						match =  grp == Math.floor(group) || grp == Math.ceil(group)
					}

				}

			}

			if(match && sect) {
				match = card.sect == sect
			}			

			if(match && clan) {


				

				if(clan != 'Imbued'){

					// Assamite
					if(clan == 'Assamite' || clan == 'Banu Haqim'){
						match = (card.clan == 'Assamite' || card.clan == 'Banu Haqim')
					}
					else if(clan == 'Follower of Set' || clan == 'Ministry'){
						match = (card.clan == 'Follower of Set' || card.clan == 'Ministry')
					}
					else {
						match = (card.clan == clan)
					}
				} else {
					match = card.type == clan
				}
			}			

			if(match && title) {

				if(title == 'No Title') {
					match = !card.title 
				}
				else {
					match = card.title == title
				}

			}

			if(match && set) {
				match = ~card.sets.indexOf(set) 
			}

			if(match && mincap !== null) {
				match = parseFloat(card.capacity) >= mincap
			}

			if(match && maxcap !== null) {
				match = parseFloat(card.capacity) <= maxcap
			}

			if(match && storyline) {
				match = card.storyline == storyline
			}

			if(match && set) {
				match = ~card.sets.indexOf(set) 
			}

			if(match && type) {
				match = ~(card.type || '').split('/').indexOf(type) || (card.iscrypt && type == 'Crypt')

			}	

			if(match && bleed !== null) {
				match = card.bleed > 0
			}      

			if(match && strength !== null) {
				match = card.strength > 0
			}   

			if(match && stealth !== null) {
				match = card.stealth > 0
			}    

			if(match && intercept !== null) {
				match = card.intercept > 0
			}  

			if(match && blackhand !== null) {
				match = card.blackhand > 0
			}

			if(match && anarch !== null) {
				match = card.anarch > 0
			}     

			if(match && aggravated !== null) {
				match = card.aggravated > 0
			} 

			if(match && entercombat !== null) {
				match = card.entercombat > 0
			}

			if(match && redlist !== null) {
				match = card.redlist > 0
			} 
			
			if(match && infernal !== null) {
				match = card.infernal > 0
			}    					

			if(match && slave !== null) {
				match = card.slave > 0
			}    

			if(match && flight !== null) {
				match = ~card.keywords.indexOf('flight')
			}   

			if(match && titled !== null) {
				match = card.titled > 0
			}     

			if(match && pt !== null) {
				match = card.pt == 1
			}     

			if(match && multi !== null) {
				match = ~String(card.disc).indexOf('/') || ~String(card.disc).indexOf('&')
			}     

			if(match && nodisc !== null) {
				match = !card.disc
			}   

			if(match && clanless !== null) {
				match = !card.clan
			}  
			if(match && burnable !== null) {
				match = card.burnable
			}  

			if(match && banned !== null) {
				match = card.banned
			}  

			if(match && combo !== null) {
				match = ~String(card['type']).indexOf('/') || ~String( card['type']).indexOf('&')
			}     


			if(match && title) {
				match = card.title == title
			}

			if(match && mincap !== null) {
				match = parseFloat(card.capacity) >= mincap
			}

			if(match && maxcap !== null) {
				match = parseFloat(card.capacity) <= maxcap
			}

			return match 			
		})
	}
}
