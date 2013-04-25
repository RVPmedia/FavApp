
var touchEnabled = 'ontouchstart' in document.documentElement;
var clickEv = (touchEnabled) ? 'ontouchstart' : 'click';
var useSwipe = true;
var pageMode = 'h';
var multifile = false;
var arrowNav = false;
var nav;

function toggleAudio(btn){
	var elem = $(btn).siblings('audio')[0];
	if(elem == undefined) elem = $(btn).siblings().find('audio')[0];
	if(elem == undefined) return;
	try{
	var player = elem.player;
	var media = player.media;
	if(media.paused) player.play();
	else player.pause();
	} catch(e){}
}

function playMedia(dataID, from) {
	var elem = $('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
		elem.player.play();
		if(from != undefined && from != -1) try{ setTimeout(function(){elem.player.setCurrentTime(from);}, 500); }catch(e){}
	} catch(e){}
}

function pauseMedia(dataID, rewind) {
	var elem = $('[data-id=' + dataID + ']')[0];
	if(elem == undefined) return;
	try{
	if(rewind) try{elem.player.setCurrentTime(0);}catch(e){}
	elem.player.pause();
	} catch(e){}
}

function stopAllMedia(){
	$('video,audio').each(function() {
		  try{$(this)[0].player.pause();}catch(e){}
	});
}

function nextState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current+1 < states.length) {
		mso.each(function(index,elem) {
			if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').eq(current+1).addClass('active').fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current+1).addClass('active');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').first().addClass('active').fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').first().addClass('active');
	 	});
	}
}

function prevState(dataID, loop) {
	var mso = $('[data-id=' + dataID + ']');
	var states = mso.first().children('.state');
	var current = states.siblings('.active').index();
	if(current-1 > -1) {
		mso.each(function(index,elem) {
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').fadeOut(elem.crossfade, function() { $(this).removeClass('active'); });
				el.children('.state').eq(current-1).addClass('active').fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').eq(current-1).addClass('active');
		});
	} else if(loop) {
		mso.each(function(index,elem) {
			if(elem.hasOwnProperty('loopcount')) {
				elem.loopcount++;
				if(elem.loopmax != -1 && elem.loopcount >= elem.loopmax) {
					stopSlideShow(elem);
					return;	
				}
			}
	 		if(elem.crossfade > 0) {
				var el = $(elem).removeClass('hidden');
				el.children('.state.active').fadeOut(elem.crossfade, function() { $(this).removeClass('active');  });
				el.children('.state').last().addClass('active').fadeIn(elem.crossfade);
			} else $(elem).removeClass('hidden').children('.state').removeClass('active').last().addClass('active');
	 	});
	}
}

function toState(dataID, stateIndex, restoreOnRollOut, restoreTarg){
	if(restoreOnRollOut) {
		var current = $('[data-id=' + dataID + ']').children('.state.active').first().index();
		$(restoreTarg).mouseout(function() { toState(dataID, current); });
	}
	$('[data-id=' + dataID + ']').each(function(index,elem) {
		$(elem).children('.state').removeClass('active').eq(stateIndex).addClass('active').parent('.mso').removeClass('hidden');
	});
}

function startSlideShow(elem){
	if(elem.playing) return;
	if(elem.crossfade) $(elem).find('.state').fadeIn(0); //init crossfade
	elem.playing = true;
	elem.loopcount = 0;
	var func = (elem.reverse) ? prevState : nextState;
	elem.playint = setInterval(function(){ func($(elem).attr('data-id'), true ); }, elem.duration*1000);
}

function stopSlideShow(elem) {
	elem.playing = false;
	if(elem.hasOwnProperty('playint')) clearInterval(elem.playint);
}

function hide(dataID) { $('[data-id=' + dataID + ']').addClass('hidden'); }
function show(dataID) { $('[data-id=' + dataID + ']').removeClass('hidden'); }

$(function(){
		if($('ul.thumbs').length) $('#in5footer').hide();
	$('[data-click-show]').each(function(index,el) {
		$(el).bind(clickEv, function(e){ 
			$.each($(this).attr('data-click-show').split(','), function(i,val){ show(val); });
	}); });
	$('[data-click-hide]').each(function(index,el) {
		$(el).bind(clickEv, function(e){ 
			$.each($(this).attr('data-click-hide').split(','), function(i,val){ hide(val); });
	}); });
	$('[data-click-next]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  
			var loop = ($(this).attr('data-loop').indexOf('1') != -1);
			$.each($(this).attr('data-click-next').split(','), function(i,val){ nextState(val, loop); });
	}); });
	$('[data-click-prev]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  
			var loop = ($(this).attr('data-loop').indexOf('1') != -1);
			$.each($(this).attr('data-click-prev').split(','), function(i,val){ prevState(val, loop); });
	}); });
	$('[data-click-state]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  $.each($(this).attr('data-click-state').split(','), function(i,val){ 
			var targData = val.split(':');
			toState(targData[0], targData[1]); });
	}); });
	$('[data-click-play]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  $.each($(this).attr('data-click-play').split(','), function(i,val){ 
			var targData = val.split(':');
			playMedia(targData[0], targData[1]); });
	}); });
	$('[data-click-pause]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  $.each($(this).attr('data-click-pause').split(','), function(i,val){ 
			pauseMedia(val); });
	}); });
	$('[data-click-stop]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  $.each($(this).attr('data-click-stop').split(','), function(i,val){ 
			pauseMedia(val, true); });
	}); });
	$('[data-click-stopall]').each(function(index,el) {
		$(el).bind(clickEv, function(e){  $.each($(this).attr('data-click-stopall').split(','), function(i,val){ 
			stopAllMedia(); });
	}); });
	$('.mso.slideshow').each(function(index,el) {
		var mso = $(el);
		el.duration = parseFloat(mso.attr('data-duration'));
		el.loopmax = parseInt(mso.attr('data-loopmax'));
		el.crossfade = parseFloat(mso.attr('data-crossfade')) * 1000;
		el.reverse = mso.attr('data-reverse') == '1';
		mso.siblings('[data-tapstart=1]').bind(clickEv, function(e) {
			if(!this.playing) startSlideShow(this);
			else stopSlideShow(this);
		});
		mso.siblings("[data-autostart=1]").each(function(i,elem) {
			setTimeout(function(){ startSlideShow(elem); }, parseFloat($(elem).attr('data-autostartdelay'))*1000 );
		});
		mso.siblings('[data-useswipe=1]').each(function(i,elem) {
			var se = $(elem);
			se.swipe({
			swipe:function(event, direction, distance, duration, fingerCount) {
				switch(direction) {
					case "left":
						if(elem.reverse) prevState(se.attr('data-id'), se.attr('data-loopswipe') == '1');
						else nextState(se.attr('data-id'), se.attr('data-loopswipe') == '1');
						break;
					case "right":
						if(elem.reverse) nextState(se.attr('data-id'), se.attr('data-loopswipe') == '1');
						else prevState(se.attr('data-id'), se.attr('data-loopswipe') == '1');
						break;		
				}
			}
			});
		});
	});
	if($.colorbox) {
		$('.lightbox').colorbox({iframe:true, width:"80%", height:"80%"});
		$('.thumb').colorbox({maxWidth:"85%", maxHeight:"85%"});
	}
	$('img').bind('dragstart', function(event) { event.preventDefault(); });
	$('.pageItem').each(function(){
		if($(this).is('[onclick]')){
			if(touchEnabled) {
				//this.setAttribute('touchstart', this.getAttribute('onclick'));
				//this.removeAttribute('onclick');
			} else this.style.cursor = 'pointer';
		}
	});
	if(multifile){
		nav = { numPages:9,
		current:parseInt(location.href.split('/').pop().split('.html').join('')),
		back:function(ref){nav.to(nav.current-1);},
		next:function(ref){nav.to(nav.current+1);},
		to:function(n){
			if(n <= 0 || n > nav.numPages) return;
			var targPage = (n*.0001).toFixed(4).substr(2) + '.html';
			location.assign(targPage);
		} };
		$('nav #nextBtn').bind(clickEv, function(){ nav.next(); });
		$('nav #backBtn').bind(clickEv, function(){ nav.back(); });
		if(arrowNav){
			$('nav:hidden, nav #backBtn, nav #nextBtn').show();
			if(nav.current == 1) $('nav #backBtn').hide();
			if(nav.current == nav.numPages) $('nav #nextBtn').hide();
		}	
	} else if(pageMode.indexOf('liquid') != -1) {
		nav = { numPages:$('.pages .page').length,
		current:1,
		back:function(ref){nav.to(nav.current-1);},
		next:function(ref){nav.to(nav.current+1);},
		first:function(){nav.to(1);},
		last:function(){nav.to(nav.numPages);},
		to:function(n){
			if(n < 1 || n > nav.numPages) return;
			nav.current = n;
			$('.pages .page:visible').hide();
			$('.pages .page').eq(n-1).show();
			if(n < 2) $('nav #backBtn:visible').hide();
			else $('nav #backBtn:hidden').show();
			if(n >= nav.numPages) $('nav #nextBtn:visible').hide();
			else $('nav #nextBtn:hidden').show();
		} };
		$('nav #nextBtn').bind(clickEv, function(){ nav.next(); });
		$('nav #backBtn').bind(clickEv, function(){ nav.back(); });
		if(arrowNav) $('nav:hidden').show();
		nav.to(1); //init;
	} else if($.hasOwnProperty('scrollTo')){
		nav = { numPages:$('.pages .page').length,
		back:function(ref){var targ=$(ref).parent('.page').prev()[0]; if(targ!=undefined); $.scrollTo(targ, 500);},
		next:function(ref){var targ=$(ref).parent('.page').next()[0]; if(targ!=undefined); $.scrollTo(targ, 500);},
		first:function(){$.scrollTo($('.page')[0], 500)},
		last:function(){$.scrollTo($('.page')[nav.numPages-1], 500)},
		to:function(n){$.scrollTo($('.page')[n-1], 500)} };
	}
		var sliderSettings = {
		mode: pageMode,
		theme: 'minimalist-square',
		buildArrows: (!touchEnabled && arrowNav),
		buildNavigation: false,
		buildStartStop: false,
		hashTags: false,
		infiniteSlides: false,
		stopAtEnd: true,
		onInitialized: function(e, slider) {
			nav = {
				numPages:slider.pages,
				current:slider.currentPage,
				next:function(){slider.goForward();},
				back:function(){slider.goBack();},
				first:function(){this.to(1);},
				last:function(){this.to(this.numPages)},
				to:function(n){slider.gotoPage(n);}
			};
		},
		
	}
	$('#slider').anythingSlider(sliderSettings);
		if(useSwipe) {
		var container = $('#container');
		var vertMode = (pageMode.substr(0,1) == "v");
		container.swipe({
			swipe:function(event, direction, distance, duration, fingerCount) {
				switch(direction) {
					case "left":
						if(!vertMode) nav.next();
						break;
					case "right":
						if(!vertMode) nav.back();
						break;
					case "up":
						if(vertMode) nav.next();
						break;
					case "down":
						if(vertMode) nav.back();
						break;		
				}
			}
		});
	}
});

