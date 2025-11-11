var twda = function(opts) {
    this.data = opts || {}
}



twda.prototype = {


	ratecards: function() {
		// Rate all cards
		if(!app.cards_rated) {
			var cards    = this.recommend({all: 1})

			var max_crypt_score = 0
			var max_lib_score = 0

			var maxscore = cards.reduce(function(score, card){

				if( card.iscrypt && card.score > max_crypt_score) {
					max_crypt_score = card.score
				}
				else if( !card.iscrypt && card.score > max_lib_score) {
					max_lib_score = card.score
				}
				return score
			},0)


			var i = 0 
			var c = 0 
			var l = 0 
			var s = cards.length 
			

			cards.filter(function(card){
				
				if(card.iscrypt)  {
					var rank_rating = ((s - c++)/ s)
					var score_rating = card.score / max_crypt_score
				}

				else {
					var rank_rating = ((s - l++) / s)
					var score_rating = card.score / max_lib_score

				}

				card.rating = Math.floor(
					((rank_rating * 0.7) + (score_rating * 0.3)) * 100
				) 

				card.rank = i++

				// card.rating = card.score / maxscore

			})


			app.cards_rated = 1
		}
	},

	filterdecks: function(options) {
		return (options.decks || app.twda).filter( function(deck){ 

			var score     = 0
			var constrain = options.constrain
			var cards     = options.cards || []

			if(!deck.cards) return false 

			if(cards.length) {


				// Count matches
				for(var i = 0; i < cards.length; i++) {
					if(deck.cards[cards[i]]) {
						score++
					}
				} 

				// Score according to number of matches
				deck.score = score / cards.length

				if(constrain) {
					// Only return decks containing all cards
					return score == cards.length 
				}
				else {
					// Score according to percentage of matches
					return score / cards.length
				}
			}

			return true

		})
	},

	recommend: function(options) {

		// Allow for processing of subset of twda
		var options   = options || {}
		var twda      = options.decks || app.twda
		var cards     = options.cards || []
		var constrain = options.constrain || 0

		if(!cards.length && !options.all) {
			return []
		}

		// Match only crypt cards
		if(options.match_crypt_only) {
			cards = cards.filter(function(id){
				var card = cardindex[id]
				return(card.type == 'Vampire' || card.type == 'Imbued')
			})
		}

		// Match only library cards
		if(options.match_lib_only) {
			cards = cards.filter(function(id){
				var card = cardindex[id]
				return(card.type != 'Vampire' && card.type != 'Imbued')
			})
		}

		// Must match all cards
		if(options.match_crypt_constrain || options.match_lib_constrain) {
			constrain = 1
		}

		options.constrain = constrain

		// Filter decks by card hits
		if( cards.length ) {
			var decks = this.filterdecks(options)
		}

		else {
			var decks = twda
		}

		// Show matched decks
		/*
		if(cards.length) {
			console.log('matched.decks', decks.reduce(
				function(titles, deck){ 
					titles.push(deck.title) 
					return titles
				}, 
				[]
			))
		}*/

		var quantities  = {}
		var quantitiesi = {}

		// Score cards (sum of each cards deck score)
		var scores = decks.reduce( function( scores, deck ) {
			for(id in deck.cards) {
				
				// Sum scores
				scores[id] = ( scores[id] || 0 ) + ( deck.score || 0.1) 

				// Avg quantities 
				if(!quantities[id]) {
					quantitiesi[id] = 1
					quantities[id]  = deck.cards[id]
				}
				else {
					// Doing so in one run is fine
					quantitiesi[id]++
					quantities[id] = quantities[id] += (deck.cards[id] - quantities[id]) / quantitiesi[id] 
				}
			}
			return scores
		}, {})

		// Sort cards by scores
		var sorted = Object.keys(scores).sort(function(a, b) {
			return (
				scores[a] > scores[b] ? -1 : (scores[a] > scores[b] ? 1 : 0)
			)
		}).map(function(id) {
			return cardindex[id]
		})

		return sorted.filter(function(card) {
			card.score           = scores[card.id]
			card.recommended_qty = Math.round(quantities[card.id])
			
			return cards.indexOf(String(card.id)) == -1 && card.banned != 1
		})

	},

	recommend_crypt: function(options) {
		return this.recommend(options).filter( function(card) {
			return(card.type == 'Vampire' || card.type == 'Imbued')
		})
	},

	recommend_library: function(options) {
		return this.recommend(options).filter( function(card) {
			return(card.type != 'Vampire' && card.type != 'Imbued')
		})
	},

	recommend_clan: function(options){
		return this.groupby(
			this.recommend_crypt(options), 'clan'
		)
	},

	count: function(items, property) {
		// Count based on property
		return items.reduce( function( counts, item ) {
			if(typeof property == 'function') {
				var key = property(item)
			} else {
				var key = item[property]
			}
			if(key) counts[key] = ( counts[key] || 0 ) + 1
			return counts
		}, {})
	},

	groupby: function(cards, property) {
		var totals = this.count(cards, property)

		return Object.keys(totals).sort(function(a, b) {
			return (
				totals[a] > totals[b] ? -1 : (totals[a] > totals[b] ? 1 : 0)
			)
		}).map(function(item) {
			return {name: item, value: totals[item]}
		})
	},

	groupbyword: function(cards, property) {
		cards.reduce(function(card, tmp){
			if(card.property) {
				card.property.split(' ').foreach(function(word){
					var o = {}
					o[property] = word
					tmp.push(o)
				})
			}
			return tmp 
		},[])

		var totals = this.count(cards, property)
		return Object.keys(totals).sort(function(a, b) {
			return (
				totals[a] > totals[b] ? -1 : (totals[a] > totals[b] ? 1 : 0)
			)
		}).map(function(item) {
			return {name: item, value: totals[item]}
		})
	},

	sortbykeys: function(obj) {
		return Object.keys(obj).sort().map(function(key) {
			return {name: key, value: obj[key]}
		})
	},		

	ratebyvalues: function(obj) {
		var keys = Object.keys(obj)

		// Establish max value 
		var max = keys.reduce(function(key, max){
			if(obj[key] > max) {
				return obj[key]
			}
			else {
				return  max
			}
		}, 0)

		// Return new object with rating
		return keys.reduce.map(function(key, out) {
			out[key] = Math.round((obj[key] / max) * 100)
			return out
		}, {})

	}



}


