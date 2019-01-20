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
			//History Browser Manipulation
			var video2insertInHistory = {};
			video2insertInHistory.videoId = this.id;
			video2insertInHistory.image = this.image;
			video2insertInHistory.reason = this.reason;
			video2insertInHistory.title = this.title;
			history.pushState(video2insertInHistory, "", "#"+this.id);
			console.log("video nuovo: \n " + JSON.stringify(video2insertInHistory));
			console.log("video vecchio: \n " + JSON.stringify(video_info));
			//fine History Browser Manipulation
			closeModalShowVideo(this.id);
		});
	});
	var closeModalShowVideo = function(id){
		$('#exampleModalLong').modal('hide');
		changeVideo(id);
	}
});
