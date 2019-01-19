//RELATED

//suggested_video_related
$('document').ready(function(){

	$('#pills-related-tab').on('click', function(){

		var currentVideo = video_info.videoId;
		var URL = 'https://www.googleapis.com/youtube/v3/search';

		var options = {
			maxResults: 20,
          		part: 'snippet',
			key: key,
                	q: 'surfing',
                	type: 'video',
			relatedToVideoId: currentVideo,
			videoCategoryId: '10',
			regionCode: "IT"
		} 
 
		$.getJSON(URL, options, function(data){
			console.log("ECCO I VIDEO SIMILI A QUELLO IN ESECUZIONE: ");
			console.log(data);
                       	var reason = "Video related by Id(YouTube API)";
			var newSuggestedVideos = [];
                       	for(let i=0; i<10; i++) {
				var newInfos = {};
                               	newInfos.title = data.items[i].snippet.title;
                              	newInfos.image = data.items[i].snippet.thumbnails.medium.url;
                               	newInfos.videoId = data.items[i].snippet.id;
                               	newInfos.reason = reason;
                                newSuggestedVideos.push(newInfos);
                       	}
			console.log(newSuggestedVideos);
			addYouTubeInformationsRefined(newSuggestedVideos);
			suggested_videos_related = newSuggestedVideos;
      		 });
	});
});
