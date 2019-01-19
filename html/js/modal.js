$('document').ready(function(){
	$('#exampleModalLong').modal('show');
	var URL = "http://site1825.tw.cs.unibo.it/video.json";
	videoInfo = '';
	$.getJSON(URL, function(result){ 
		var result = JSON.parse(JSON.stringify(result));
		$(result).each(function(index, value){
			videoInfo += '<div class="container"><a id="'+value.videoID+'">'+value.artist+': '+value.title+'</a></div><hr>';
		});
		$('.modal-body').html(videoInfo);
	 	$('.modal-body a').on("click", function(){
			closeModalShowVideo(this.id);
		});
	});
	var closeModalShowVideo = function(id){
		$('#exampleModalLong').modal('hide');
		changeVideo(id);
	}
});
