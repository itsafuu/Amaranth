app.modal = function(url,callback){
	app.hidemodal()
	app.loadmodal(url, callback)	
}

app.replacemodal = function (data,callback) {
	var modal = $('.modal:visible:last')

	// Unmount current dom
	riot.vdom.forEach(function(mnt){
		if(mnt.root == modal.children()[0] ) {
			mnt.unmount()
		}
	})

	modal.html(data)
	app.bind()
	modal.show().addClass('visible').addClass('showModal')
	modal.find('.tabs li:first a').trigger('click')
	if(callback) callback(modal)
	componentHandler.upgradeDom();
}

app.setmodal = function(data,callback){

	var lz = parseInt($('.modal-overlay:last').css('z-index') || 1000)

	var body    = $('body:first')
	var overlay = $('<div class="modal-overlay"></div>').show()
	var modal   = $('<div class="modal" data-animation="pop"></div>')

	overlay.css('z-index',lz + 2)
	modal.css('z-index',lz + 3)

	overlay.on('click',function(){
		app.hidemodal(modal,overlay)
	})

	body.addClass('modal-stop-scrolling').append(overlay)
	body.append(modal)

	// Unmount current dom
	riot.vdom.forEach(function(mnt){
		if(mnt.root == modal.children()[0] ) {
			mnt.unmount()
		}
	})

	modal.html(data)
	overlay.prepend(
		$('<button class="mdl-button mdl-js-button modal-button"><i class="material-icons">&#xE5CD;</i></button>').on('click', function(){app.hidemodal() })
	)

	app.bind()



	if(callback) callback(modal)
	modal.show().addClass('visible').addClass('showModal')
	modal.find('.tabs li:first a').trigger('click')	
	componentHandler.upgradeDom();
}

app.loadmodal = function(url,callback){
	url += (url.indexOf('?') == -1 ? '?xhr' : '&xhr') + Math.random()
	if(app.xhr) {
		try{
		   app.xhr.abort()
		} catch(e){}
	}
	app.xhr = $.get(url,function(data){
		app.setmodal(data,callback)
	})
}


app.hidemodal = function(modal,overlay, skipback){
	
	var body    = $('body')
	var modal   = modal || $('.modal:last')
	var overlay = overlay || $('.modal-overlay:last')
 
 	$(document).off('keyup.card')

	overlay.remove()
	modal.removeClass('showModal').addClass('hideModal')

	if($('.modal-overlay:visible').length == 0){		
		body.removeClass('modal-stop-scrolling')
	}


	setTimeout(function(){
		// Unmount current dom
		riot.vdom.forEach(function(mnt){
			if(mnt.root == modal.children().last()[0] ) {
				mnt.unmount()
			}
		})
		modal.remove()
	},100)


	if(!skipback) {

		setTimeout(function(){
			if(~window.location.hash.indexOf('/card')) {
				history.go(-1)
			}

			else if(~window.location.hash.indexOf('deck') && ~window.location.hash.indexOf('/library')) {
				history.go(-1)
			}

			else if(~window.location.hash.indexOf('deck') && ~window.location.hash.indexOf('/crypt')) {
				history.go(-1)
			}
		}, 101)	
	}

}
