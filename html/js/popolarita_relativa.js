var video_precedente;
var current_video_id;
var current_title;
var old_title;
var current_image;
var old_image;
var videos = []; //vettore dei video visualizzati nella sessione corrente
/* questa funzione determina se il video è stato visualizzato
(visto per più di x secondi) e quindi è utilizzabile per considerarlo
nella popolarità realativa
*/
function is_usable(id){
 return (videos.indexOf(id) >= 0); //il video è stato visualizzato nella sessione
}

function popolarita_relativa(){
  if (is_usable(video_precedente)){ // se il video è stato visualizzato nella sessione
    var url = "http://localhost/api/poprel";
    url += "?old=" + video_precedente + "&newid=" + current_video_id;
    url += "&old_title=" + old_title + "&current_title=" + current_title;
    url += "&old_image=" + old_image + "&current_image=" + current_image;
    $.get(url).then(function lemmeknow() {console.log("popolarita_relativa.js: poprel.json aggiornato");});
    } else {
      //do nothing; il vecchio non si può usare!
      //per debug, cancellare/modificare
      console.log("popolarita_relativa.js: correlazione non creata (video precedente non visualizzato!)");
  }
}

/**** funzione che serve per popolare il recommender con i video ****/

function carica_video_popolarita_relativa(){
  var reason = "Video related by relative popularity";
  var listOfSuggestedVideo = [];
  var currentVideo = video_info.videoId;
  var info = {}; //json associato ad un singolo video - va caricato con le informazioni id, thumbnail...

  let url = "http://localhost/api/poprel?old=" + currentVideo + "&newid=null";
  $.get(url, function(data) {
    //successo
    let x = 0;
    while(x < data.length){
      info = {};
      info.title = unescape(data[x].current_title);
      info.image = data[x].current_image;
      info.videoId = data[x].id_vid_rec;
      info.reason = reason;
      listOfSuggestedVideo.push(info);
      x=x+1;
    }
  }).fail(function(data) {
    //errore, nessun dato per la canzone corrente
    console.log("Errore nella gestione dei video - recommender popolarità relativa: " + JSON.stringify(data));
  }).then(function(){
    addYouTubeInformationsRefined(listOfSuggestedVideo);
  });
}
