//recommender per la popolarita assoluta locale
$('document').ready(function(){
	function popolarita_assoluta_locale(){
		var suggestedVideos = [];
		var url = "http://localhost/globpop";
		$.get(url, function(data) {
			for(let i = 0; i < data.recommended.length; i++) {
				var videoInfo = {};
				videoInfo.Id = data.recommended[i].videoId;
				videoInfo.reason = data.recommended[i].prevalentReason;
				videoInfo.image = "non ancora aggiornato";
				videoInfo.title = "non ancora aggiornato";
				suggestedVideos.push(videoInfo);
			}
		}).then(function(suggestedVideos) {
			var URL = "https://www.googleapis.com/youtube/v3/videos";
			for (let j = 0; j < suggestedVideos.length; j++) {
				var options = {
            				part: "snippet",
            				key: key,
            				id: suggestedVideos[j].videoId,
        			};
        			console.log("Video di cui prendo la thumbnail: " + videoToUpdate.videoId);
               			$.getJSON(URL, options, function(data) {
            				console.log("Dati restituti dall'API di youtube(popolarita' locale assoluta)");
            				console.log(data);
            				suggestedVideos[j].image = data.items[0].snippet.thumbnails.medium.url;
            				suggestedVideos[j].title = data.items[0].snippet.title;
            			});
			}
		}).then(function(){
			$('#pills-popular-tab-absloc').on('click', addYouTubeInformationsRefined(suggestedVideos));
		});

	}
});
