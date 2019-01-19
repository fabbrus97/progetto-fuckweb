$('document').ready(function(){
	window.alert(5 + 6);
	$('#exampleModalLong').modal('show');
	/*
	var URL = "http://site1825.tw.cs.unibo.it/video.json";
	var $videoInfo = '';
	$.getJSON(URL, function(result){  
		var result = JSON.parse(JSON.stringify(result));
		$(result).each(function(index, value){
			$videoInfo = $('<li>' +  'TITOLO: '+ value.title + ', ARTISTA: ' + value.artist + '</li>');
			$('.videoList').append($videoInfo);
			$videoInfo.css({"border":"2px solid black", "margin":"0 0 3px 0", "padding": "2px 0 2px 0"});
		});

		$('li').on("mouseover", function(event){
			$(event.target).css('background-color', 'yellow');
		});

		$('li').on("mouseout", function(event){
			$(event.target).css('background-color', 'transparent');
		});
	}); 

	$('#closeBtn').on('click', function(){
		$('#welcomeModal').modal('hide');
	});
	*/
});
