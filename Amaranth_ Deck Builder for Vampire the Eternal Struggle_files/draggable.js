/*
	jQuery tinyDraggable v1.0.2
	Copyright (c) 2014 Simon Steinberger / Pixabay
	GitHub: https://github.com/Pixabay/jQuery-tinyDraggable
	More info: http://pixabay.com/blog/posts/p-52/
	License: http://www.opensource.org/licenses/mit-license.php
*/
(function($){
	$.fn.draggable = function(options){
		var settings = $.extend({ handle: 0, exclude: 0 }, options);
		return this.each(function(){

			var dx, dy, el = $(this), handle = settings.handle || el, ex = settings.exclude;
			
			// boundries
			options.minx = options.minx === undefined ? -999999 : options.minx
			options.maxx = options.maxx === undefined ?  999999 : options.maxx
			options.miny = options.miny === undefined ? -999999 : options.miny
			options.maxy = options.maxy === undefined ?  999999 : options.maxy
			var oos =  el.offset()

			if(!el.data('draggable.init')){

				el.data('draggable.init',1)

				el.on('mousedown touchstart', handle, function(e){
					
					if(e.button == 2 || (ex && $(e.target).filter(ex).length)) return;

					e.preventDefault();
					el.addClass('notransition')

					var os = el.offset(); 
					dx = e.pageX-os.left, 
					dy = e.pageY-os.top;
					
					$(document).on('mousemove.drag touchmove.drag', function(e){
						el.offset({top: Math.min(options.maxy + oos.top,Math.max(options.miny + oos.top,e.pageY-dy)), left: Math.min(options.maxx + oos.left, Math.max(options.minx + oos.left,e.pageX-dx))}); 
					});
				}).on('mouseup touchend touchcancel', handle,   function(e){
					$(document).off('mousemove.drag touchmove.drag');
					if(options.onstop){
						options.onstop(e)
					}
					el.removeClass('notransition');
				});
			}
		});
	}
}(jQuery));


