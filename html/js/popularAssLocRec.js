//recommender per la popolarita assoluta locale
var video_pop_locale = [];
function popolarita_assoluta_locale(){
    console.log("ho chiamato popolarita_assoluta_locale");
    var url = "http://localhost:8000/api/localpop";
    url += "?id=" + current_video_id;
    console.log(url);
    $.get(url, function(data) {
        console.log(data);
        var jsonData = JSON.parse(data);
        for(let i = 0; i < jsonData.recommended.length; i++) {
            var videoInfo = {};
            videoInfo.Id = jsonData.recommended[i].videoId;
            videoInfo.reason = jsonData.recommended[i].prevalentReason;
            videoInfo.image = "non ancora aggiornato";
            videoInfo.title = "non ancora aggiornato";
            videoInfo.timesWatched = jsonData.recommended[i].timesWatched;
            video_pop_locale.push(videoInfo);
        }
    }).done(function(){
        video_pop_locale.sort(function(a, b) { return b.timesWatched - a.timesWatched });
        for(let x = video_pop_locale.length; x != 10; x--) {
            video_pop_locale.pop();
        }
    });
}

    /*
        .done(function(suggestedVideos) {
        var URL = "https://www.googleapis.com/youtube/v3/videos";
        console.log("Video del recommender: " + suggestedVideos);
        for (let j = 0; j < suggestedVideos.length; j++) {
            var options = {
                part: "snippet",
                key: key,
                id: suggestedVideos[j].Id
            };
            //console.log("Video di cui prendo la thumbnail: " + suggestedVideos[j].videoId);
            $.getJSON(URL, options, function(data) {
                console.log("Dati restituti dall'API di youtube(popolarita' locale assoluta)");
                console.log(data);
            }).done(function(){
                //console.log("Dati restituti dall'API di youtube(popolarita' locale assoluta)");
                //console.log(data);
                suggestedVideos[j].image = data.items[0].snippet.thumbnails.medium.url;
                suggestedVideos[j].title = data.items[0].snippet.title;

            }).fail(function(err) {
                return console.log(err);
            });
        }
    }).fail(function(err) {
        return console.log(err);
    });
    */


$('#pills-popular-tab-absloc').on("click", function(){
    var URL = "https://www.googleapis.com/youtube/v3/videos";
    console.log("Video del recommender: " + JSON.stringify(video_pop_locale));
    //video_pop_locale.sort(function(a, b) { return b.timesWatched - a.timesWatched });
    for (let j = 0; j < video_pop_locale.length; j++) {
        var options = {
            part: "snippet",
            key: key,
            id: video_pop_locale[j].Id
        };
        //console.log("Video di cui prendo la thumbnail: " + suggestedVideos[j].videoId);
        $.getJSON(URL, options, function(data) {
            //console.log("Dati restituti dall'API di youtube(popolarita' locale assoluta)" + data);
            video_pop_locale[j].image = data.items[0].snippet.thumbnails.medium.url;
            video_pop_locale[j].title = data.items[0].snippet.title;
        }).done(function(){
            if(j == video_pop_locale.length-1) {
                addYouTubeInformationsRefined(video_pop_locale);
            }
        });
    }
});




